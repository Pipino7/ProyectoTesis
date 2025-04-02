// src/entities/movimientoPrenda.js
import { EntitySchema } from 'typeorm';

const MovimientoPrenda = new EntitySchema({
  name: 'movimiento_prenda',
  tableName: 'movimiento_prenda',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    accion: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    cantidad: {
      type: 'int',
      nullable: false,
    },
    fecha: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    observacion: {
      type: 'text',
      nullable: true,
    },
  },
  relations: {
    fardo: {
      type: 'many-to-one',
      target: 'fardo',
      joinColumn: {
        name: 'fardo_id',
      },
      onDelete: 'CASCADE',
    },
    usuario: {
      type: 'many-to-one',
      target: 'usuario', // 👈 Corregido: minúsculas
      joinColumn: {
        name: 'usuario_id',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
    categoria: {
      type: 'many-to-one',
      target: 'categoria',
      joinColumn: {
        name: 'categoria_id',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
    prenda: {
      type: 'many-to-one',
      target: 'prenda',
      joinColumn: {
        name: 'prenda_id',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});

export default MovimientoPrenda;
