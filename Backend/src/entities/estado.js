import { EntitySchema } from 'typeorm';

export const estado = new EntitySchema({
  name: 'estado',
  tableName: 'estado',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    nombre_estado: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
  },
});

export default estado;
