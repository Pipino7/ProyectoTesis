// src/entities/detalle_venta.js
import { EntitySchema } from 'typeorm';

const DetalleVenta = new EntitySchema({
  name: 'detalle_venta',
  tableName: 'detalle_venta',
  columns: {
    id:                   { primary: true, type: 'int', generated: true },
    cantidad:             { type: 'int', nullable: false, default: 1 },
    costo_unitario_venta: { type: 'decimal', precision: 10, scale: 2, nullable: false },
    descuento:            { type: 'decimal', precision: 10, scale: 2, nullable: false, default: 0 },
    motivo_descuento:     { type: 'varchar', length: 255, nullable: true },
  },
  relations: {
    venta: {
      type: 'many-to-one',
      target: 'venta',
      joinColumn: { name: 'venta_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
    prenda: {
      type: 'many-to-one',
      target: 'prenda',
      joinColumn: { name: 'prenda_id' },
      nullable: false,
      onDelete: 'RESTRICT',
    },
    estado: {
      type: 'many-to-one',
      target: 'estado',
      joinColumn: { name: 'estado_id' },
      nullable: false,
      onDelete: 'RESTRICT',
    },
  },
});

export default DetalleVenta;
