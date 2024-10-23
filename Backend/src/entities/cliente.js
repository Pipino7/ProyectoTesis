import { EntitySchema } from 'typeorm';

export const cliente = new EntitySchema({
  name: 'cliente',
  tableName: 'cliente',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    nombre: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    telefono: {
      type: 'varchar',
      length: 20,
      nullable: false,
    },
  },
  relations: {
    detallesVenta: {
      type: 'one-to-many',
      target: 'detalle_venta',
      inverseSide: 'cliente',
    },
  },
});

export default cliente;
