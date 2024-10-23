import { EntitySchema } from 'typeorm';

export const prenda = new EntitySchema({
  name: 'prenda',
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
      nullable: true,  // Puede ser nulo inicialmente
    },
    cantidad: {
      type: 'int',
      nullable: false,
    },
    codigo_barra_prenda: {
      type: 'varchar',
      length: 255,
      nullable: true,  // Puede ser nulo hasta que se clasifique
      unique: true,
    },
    estado_prenda: {
      type: 'varchar',
      length: 255,
      nullable: false,
      default: 'bodega',  // Estado inicial como 'bodega'
    },
    categoria_id: {
      type: 'int',
      nullable: false,
    },
    fardo_id: {
      type: 'int',
      nullable: true,
    },
  },
  relations: {
    categoria: {
      type: 'many-to-one',
      target: 'categoria',
      joinColumn: {
        name: 'categoria_id',
      },
      nullable: false,
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
    detallesVenta: {
      type: 'one-to-many',
      target: 'detalle_venta',
      inverseSide: 'prenda',
    },
  },
});

export default prenda;
