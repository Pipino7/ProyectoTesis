import { EntitySchema } from 'typeorm';

const Estado = new EntitySchema({
  name: 'Estado',
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

export default Estado;
