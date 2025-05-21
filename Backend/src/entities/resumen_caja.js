// src/entities/resumen_caja.js
import { EntitySchema } from 'typeorm';

const ResumenCaja = new EntitySchema({
  name: 'resumen_caja',
  tableName: 'resumen_caja',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    fecha_apertura: {
      type: 'timestamp',
      nullable: false,
    },
    fecha_cierre: {
      type: 'timestamp',
      nullable: false,
    },
    monto_inicial: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    monto_final_calculado: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    monto_final_declarado: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    diferencia: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    total_ventas: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    total_prendas: {
      type: 'int',
      default: 0,
    },
    prendas_devueltas: {
      type: 'int',
      default: 0,
    },
    devoluciones_realizadas: {
      type: 'int',
      default: 0,
    },
    total_cobros: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    total_cobros_del_dia: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    total_cobros_pendientes: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    total_gastos: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    total_descuentos: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    cobros_por_metodo: {
      type: 'jsonb',
      nullable: true,
    },
    cobros_del_dia_por_metodo: {
      type: 'jsonb',
      nullable: true,
    },
    cobros_pendientes_por_metodo: {
      type: 'jsonb',
      nullable: true,
    },
    pendientes_por_metodo: {
      type: 'jsonb',
      nullable: true,
    },
    gastos_por_metodo: {
      type: 'jsonb',
      nullable: true,
    },
    reembolsos_por_metodo: {
      type: 'jsonb',
      nullable: true,
    },
    balance_por_metodo: {
      type: 'jsonb',
      nullable: true,
    },
    ventas_con_cupon: {
      type: 'int',
      default: 0,
    },
    ventas_con_ticket_cambio: {
      type: 'int',
      default: 0,
    },
    observacion: {
      type: 'text',
      nullable: true,
    },
    cerrada_automaticamente: {
      type: 'boolean',
      default: false,
    },
    timestamp_cierre: {
      type: 'timestamp',
      nullable: false,
      default: () => 'CURRENT_TIMESTAMP',
    }
  },
  relations: {
    caja_sesion: {
      type: 'many-to-one',
      target: 'caja_sesion',
      joinColumn: {
        name: 'caja_sesion_id',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    usuario: {
      type: 'many-to-one',
      target: 'usuario',
      joinColumn: {
        name: 'usuario_id',
      },
      nullable: false,
      onDelete: 'SET NULL',
    },
  },
});

export default ResumenCaja;