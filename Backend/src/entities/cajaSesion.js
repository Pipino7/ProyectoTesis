// src/entities/cajaSesion.js
import { EntitySchema } from 'typeorm';

const CajaSesion = new EntitySchema({
  name: 'caja_sesion',
  tableName: 'caja_sesion',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    fecha_apertura: {
      type: 'timestamp',
      createDate: true,
    },
    monto_inicial: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
    },
    fecha_cierre: {
      type: 'timestamp',
      nullable: true,
    },
    monto_final: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true,
    },
    observacion_cierre: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    resumen_final: {
      type: 'jsonb',
      nullable: true,
    },
  },
  relations: {
    usuario: {
      type: 'many-to-one',
      target: 'usuario',
      joinColumn: {
        name: 'usuario_id',
      },
      nullable: false,
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
    ventas: {
      type: 'one-to-many',
      target: 'venta',
      inverseSide: 'caja_sesion',
    },
    gastos: {
      type: 'one-to-many',
      target: 'gasto',
      inverseSide: 'caja_sesion',
    },
    cobros: {
      type: 'one-to-many',
      target: 'cobro',
      inverseSide: 'caja_sesion',
    },
  },
});

export default CajaSesion;
