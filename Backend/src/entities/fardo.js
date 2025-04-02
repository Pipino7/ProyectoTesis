// src/entities/fardo.js
import { EntitySchema } from 'typeorm';
import Categoria from './categoria.js';
import Proveedor from './proveedor.js';
import Prenda from './prenda.js';

const Fardo = new EntitySchema({
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
    codigo_barra_fardo: {
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
    status: {
      type: 'varchar',
      length: 50,
      nullable: false,
      default: 'activo',
    },
  },
  relations: {
    categoria: {
      type: 'many-to-one',
      target: Categoria, 
      joinColumn: { name: 'categoria_id' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    proveedor: {
      type: 'many-to-one',
      target: Proveedor, 
      joinColumn: { name: 'proveedor_id' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    prendas: {
      type: 'one-to-many',
      target: Prenda, 
      inverseSide: 'fardo',
      cascade: true,
    },
  },
});

export default Fardo;
