import { EntitySchema } from 'typeorm';

export const proveedor = new EntitySchema({
  name: 'proveedor',
  tableName: 'proveedor',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    nombre_proveedor: {
      type: 'varchar',
      length: 255,
      nullable: false,
      unique: true,
    },
  },
  relations: {
    fardo: {
      type: 'one-to-many',
      target: 'fardo',
      inverseSide: 'proveedor',
      cascade: true,
      orphanRemoval: true,
    },
  },
});

export default proveedor;
