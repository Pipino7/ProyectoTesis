import { EntitySchema } from 'typeorm';

export const venta = new EntitySchema({
  name: 'venta',
  tableName: 'venta',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    fecha_venta: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false,
    },
    total_venta: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    metodo_pago: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
  },
  relations: {
    detallesVenta: {
      type: 'one-to-many',
      target: 'detalle_venta',
      inverseSide: 'venta',
      cascade: true,
      orphanRemoval: true,
    },
  },
});

export default venta;
