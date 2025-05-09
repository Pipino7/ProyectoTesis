import { EntitySchema } from 'typeorm';

export const MetodoPago = new EntitySchema({
  name: 'metodo_pago',
  tableName: 'metodo_pago',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    nombre_metodo: {
      type: 'varchar',
      length: 20,
      nullable: false,
      unique: true,   
    },
  },
  relations: {
    cobros: {
      type: 'one-to-many',
      target: 'cobro',
      inverseSide: 'metodoPago',
    },
  },
});

export default MetodoPago;
