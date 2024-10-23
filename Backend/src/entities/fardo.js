// src/entities/fardo.js
import { EntitySchema } from 'typeorm';

const fardo = new EntitySchema({
  name: 'fardo',
  tableName: 'fardo',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    fecha_adquisicion: {
      type: 'date',
      nullable: false,  
    },
    costo_fardo: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,  
    },
    cantidad_prendas: {
      type: 'int',
      nullable: false,  
    },
    costo_unitario_por_prenda: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,  
    },
    codigo_fardo: {
      type: 'varchar',
      length: 255,
      nullable: false,
      unique: true,  
    },
    codigo_barra_fardos: {
      type: 'varchar',
      length: 255,
      nullable: false,
      unique: true,  
    },
    perdidas: {
      type: 'int',
      nullable: true,  
      default: 0,  
    },
    status: {  // Nuevo campo para manejar el estado del fardo
      type: 'varchar',
      length: 50,
      nullable: false,
      default: 'activo', 
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
    proveedor: {
      type: 'many-to-one',
      target: 'proveedor',
      joinColumn: {
        name: 'proveedor_id',
      },
      nullable: false,
      onDelete: 'SET NULL',
    },
    prendas: {
      type: 'one-to-many',
      target: 'prenda',  
      inverseSide: 'fardo',
      cascade: true,  
    },
  },
});

export default fardo;
