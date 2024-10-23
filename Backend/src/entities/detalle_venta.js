import { EntitySchema } from 'typeorm';

export const detalle_venta = new EntitySchema({
  name: 'detalle_venta',
  tableName: 'detalle_venta',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    cantidad: {
      type: 'int',
      nullable: false,
    },
    costo_unitario_venta: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    descuento: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
    },
  },
  relations: {
    venta: {
      type: 'many-to-one',
      target: 'venta',
      joinColumn: {
        name: 'venta_id',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    prenda: {
      type: 'many-to-one',
      target: 'prenda',
      joinColumn: {
        name: 'prenda_id',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
    cliente: {
      type: 'many-to-one',
      target: 'cliente',
      joinColumn: {
        name: 'cliente_id',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
    estado: {
      type: 'many-to-one',
      target: 'estado',
      joinColumn: {
        name: 'estado_id',
      },
      nullable: false,
      onDelete: 'RESTRICT',
    },
  },
});

export default detalle_venta;
