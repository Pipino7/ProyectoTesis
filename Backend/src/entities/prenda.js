import { EntitySchema } from 'typeorm';

const Prenda = new EntitySchema({

  name: 'Prenda',
  tableName: 'prenda',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    precio: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true,
      transformer: {
        to: (value) => value,
        from: (value) => parseFloat(value)
      },
    },
    cantidad: {
      type: 'int',
      nullable: false,
    },
    codigo_barra_prenda: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    categoria_id: {
      type: 'int',
      nullable: true,
    },
    fardo_id: {
      type: 'int',
      nullable: true,
    },
    estado_id: {
      type: 'int',
      nullable: false,
    },
  },
  relations: {
    categoria: {
      type: 'many-to-one',
      target: 'categoria',
      joinColumn: {
        name: 'categoria_id',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
    fardo: {
      type: 'many-to-one',
      target: 'fardo',
      joinColumn: {
        name: 'fardo_id',
      },
      nullable: true,
      onDelete: 'CASCADE',
    },
    estado: {
      type: 'many-to-one',
      target: 'estado',
      joinColumn: {
        name: 'estado_id',
      },
      nullable: false,
      onDelete: 'SET NULL',
    },
    detallesVenta: {
      type: 'one-to-many',
      target: 'detalle_venta',
      inverseSide: 'prenda',
    },
  },
  indices: [
    {
      name: 'IDX_UNIQUE_CODIGO_ESTADO',
      columns: ['codigo_barra_prenda', 'estado_id'],
      unique: true,
    },
  ],
});
export default Prenda;