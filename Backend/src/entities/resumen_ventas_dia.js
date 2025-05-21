import { EntitySchema } from 'typeorm';

const ResumenVentasDia = new EntitySchema({
  name: 'resumen_ventas_dia',
  tableName: 'resumen_ventas_dia',  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    fecha: {
      type: 'date',
      unique: true,
      nullable: false,
    },
    total_ventas: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    cantidad_ventas: {
      type: 'int',
      default: 0,
    },
    total_efectivo: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    total_tarjeta: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    total_transferencia: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    total_credito: {
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
    total_prendas: {
      type: 'int',
      default: 0,
    },
    categorias_json: {
      type: 'jsonb', 
      nullable: true,
      default: () => "'{}'"
    },
    creado_en: {
      type: 'timestamp',
      createDate: true,
    },
  },
  relations: {
    usuario: {
      type: 'many-to-one',
      target: 'usuario',
      joinColumn: {
        name: 'usuario_id',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});

export default ResumenVentasDia;
