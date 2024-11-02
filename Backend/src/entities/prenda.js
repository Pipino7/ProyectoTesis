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
      nullable: true,  
    },
    cantidad: {
      type: 'int',
      nullable: false,
    },
    codigo_barra_prenda: {
      type: 'varchar',
      length: 255,
      nullable: true,  
      unique: true,
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
});

export default prenda;
