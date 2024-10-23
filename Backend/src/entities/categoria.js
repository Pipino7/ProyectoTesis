import { EntitySchema } from 'typeorm';

export const categoria = new EntitySchema({
  name: 'categoria',
  tableName: 'categoria',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    nombre_categoria: {
      type: 'varchar',
      length: 255,
      nullable: false,
      unique: true,
    },
  },
  relations: {
    prendas: {
      type: 'one-to-many',
      target: 'prenda',
      inverseSide: 'categoria',
    },
    fardos: {
      type: 'one-to-many',
      target: 'fardo',
      inverseSide: 'categoria',
    },
  },
});

export default categoria;
