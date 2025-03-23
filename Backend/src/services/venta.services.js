// src/services/VentasService.js
import { Venta, DetalleVenta, Prenda, Estado, Cliente } from '../entities/index.js';
import AppDataSource from '../config/ConfigDB.js';
import { In } from 'typeorm';

const VentasService = {
  registrarVenta: async (datosVenta) => {
    const { metodo_pago, cliente, codigos_prendas, descuento } = datosVenta;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // **Validar método de pago**
      const metodosPagoValidos = ['efectivo', 'tarjeta', 'transferencia', 'mixto', 'pendiente'];
      if (!metodosPagoValidos.includes(metodo_pago)) {
        throw new Error(
          "Método de pago no válido. Métodos aceptados: efectivo, tarjeta, transferencia, mixto, pendiente."
        );
      }

      // **Validar datos del cliente si el método de pago es 'pendiente'**
      let clienteRegistrado = null;
      if (metodo_pago === 'pendiente') {
        if (!cliente || !cliente.nombre || !cliente.telefono) {
          throw new Error(
            "Los datos del cliente son obligatorios para ventas pendientes. Debe incluir 'nombre' y 'telefono'."
          );
        }

        // Buscar cliente existente o registrar uno nuevo
        clienteRegistrado = await queryRunner.manager.findOne(Cliente, {
          where: { telefono: cliente.telefono },
        });

        if (!clienteRegistrado) {
          clienteRegistrado = queryRunner.manager.create(Cliente, cliente);
          await queryRunner.manager.save(Cliente, clienteRegistrado);
        }
      }

      // **Obtener todos los estados necesarios**
      const estados = await queryRunner.manager.find(Estado, {
        where: [
          { nombre_estado: 'pendiente' },
          { nombre_estado: 'vendido' },
          { nombre_estado: 'disponible' },
        ],
      });

      const estadoPrendaPendiente = estados.find((e) => e.nombre_estado === 'pendiente');
      const estadoPrendaVendido = estados.find((e) => e.nombre_estado === 'vendido');
      const estadoPrendaDisponible = estados.find((e) => e.nombre_estado === 'disponible');

      if (!estadoPrendaPendiente || !estadoPrendaVendido || !estadoPrendaDisponible) {
        throw new Error('No se encontraron los estados requeridos: disponible, pendiente o vendido.');
      }

      // **Agrupar códigos de barra para calcular cantidades**
      const agrupacion = codigos_prendas.reduce((acumulador, codigo) => {
        acumulador[codigo] = (acumulador[codigo] || 0) + 1;
        return acumulador;
      }, {});

      const codigosBarra = Object.keys(agrupacion);

      // **Obtener todas las prendas necesarias**
      const prendas = await queryRunner.manager.find(Prenda, {
        where: { codigo_barra_prenda: In(codigosBarra), estado: { nombre_estado: 'disponible' } },
      });

      // **Validar existencia y stock**
      for (const [codigoBarra, cantidad] of Object.entries(agrupacion)) {
        const prenda = prendas.find((p) => p.codigo_barra_prenda === codigoBarra);
        if (!prenda || prenda.cantidad <= 0) {
          throw new Error(
              `No hay suficiente stock para la prenda con código de barra ${codigoBarra}. ` +
              `Stock disponible: ${prenda ? prenda.cantidad : 0}, solicitado: ${cantidad}.`
          );
      }
      }

      // **Determinar el estado de la venta**
      const estado_venta = metodo_pago === 'pendiente' ? 'pendiente' : 'vendido';

      const estadoVenta = metodo_pago === 'pendiente' ? estadoPrendaPendiente : estadoPrendaVendido;

      // **Crear registro de la venta**
      const venta = queryRunner.manager.create(Venta, {
        fecha_venta: new Date(),
        metodo_pago: metodo_pago !== 'pendiente' ? metodo_pago : null, // No incluir método de pago si es pendiente
        total_venta: 0, // Se calculará después
        cliente: clienteRegistrado ? { id: clienteRegistrado.id } : null, // Cliente solo para pendientes
        estado: estadoVenta.id, // Estado de la venta
      });

      const ventaGuardada = await queryRunner.manager.save(Venta, venta);

      // **Generar detalles de venta**
      const detallesVenta = prendas.map((prenda) => {
        const cantidad = agrupacion[prenda.codigo_barra_prenda];
        const descuentoAplicado =
          descuento?.find((d) => d.codigo_barra_prenda === prenda.codigo_barra_prenda)?.descuento || 0;
        const costoUnitario = prenda.precio - descuentoAplicado;

        return {
          cantidad,
          costo_unitario_venta: costoUnitario,
          descuento: descuentoAplicado,
          venta: ventaGuardada,
          prenda: prenda.id, // Asociar con el ID de la prenda
          cliente: clienteRegistrado ? clienteRegistrado.id : null, // Asociar con el ID del cliente si es pendiente
          estado: estadoVenta.id, // Estado actual (pendiente o vendido)
        };
      });

      const detallesVentaEntidades = queryRunner.manager.create(DetalleVenta, detallesVenta);
      await queryRunner.manager.save(DetalleVenta, detallesVentaEntidades);

      // **Actualizar stock y estado de las prendas**
      prendas.forEach((prenda) => {
        const cantidad = agrupacion[prenda.codigo_barra_prenda];
        prenda.cantidad -= cantidad; // Descontar del stock
      
        // Cambiar estado según la cantidad
        prenda.estado = prenda.cantidad === 0 ? estadoPrendaVendido : estadoPrendaDisponible;
      });
      
      // Guardar las actualizaciones sin eliminar las prendas
      await queryRunner.manager.save(Prenda, prendas);

      // **Calcular total de la venta**
      const totalVenta = detallesVentaEntidades.reduce(
        (total, detalle) => total + detalle.costo_unitario_venta * detalle.cantidad,
        0
      );

      // **Actualizar total en la venta**
      ventaGuardada.total_venta = totalVenta;
      await queryRunner.manager.save(Venta, ventaGuardada);

      await queryRunner.commitTransaction();

      return {
        message: 'Venta registrada con éxito.',
        venta: ventaGuardada,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('No se pudo registrar la venta. ' + error.message);
    } finally {
      await queryRunner.release();
    }
  },
};

export default VentasService;
