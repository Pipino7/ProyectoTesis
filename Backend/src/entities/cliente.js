import { EntitySchema } from 'typeorm';

 const Cliente = new EntitySchema({
  name: 'Cliente',
  tableName: 'cliente',
  columns: {
    id:       { primary: true,   type: 'int', generated: true },
    nombre:   { type: 'varchar', length: 255, nullable: false },
    telefono: { type: 'varchar', length: 20,  nullable: false },
  },
  relations: {
    ventas: {
      type: 'one-to-many',
      target: 'venta',
      inverseSide: 'cliente',
    },
  },
});

export default Cliente;
