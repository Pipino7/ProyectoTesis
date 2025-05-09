import { EntitySchema } from 'typeorm';

export const Venta = new EntitySchema({
  name: 'venta',
  tableName: 'venta',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    fecha_venta: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false,
    },
    total_venta: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    codigo_cambio: {
      type: 'varchar',
      length: 20,
      nullable: true,
      unique: true,
    },
    saldo_pendiente: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
    },
    tipo_venta: {
      type: 'varchar',
      length: 20,
      nullable: false,
    },
  },
  relations: {
    detallesVenta: {
      type: 'one-to-many',
      target: 'detalle_venta',
      inverseSide: 'venta',
      cascade: true,
      orphanRemoval: true,
    },
    cliente: {
      type: 'many-to-one',
      target: 'cliente',
      joinColumn: { name: 'cliente_id' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    usuario: {
      type: 'many-to-one',
      target: 'usuario',
      joinColumn: { name: 'usuario_id' },
      nullable: false,
      onDelete: 'RESTRICT',
    },
    cupon: {
      type: 'many-to-one',
      target: 'cupon',
      joinColumn: { name: 'cupon_id' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    cobros: {
      type: 'one-to-many',
      target: 'cobro',
      inverseSide: 'venta',
      cascade: true,
    },
    estado_pago: {
      type: 'many-to-one',
      target: 'estado',
      joinColumn: { name: 'estado_pago_id' },
      nullable: false,
      onDelete: 'RESTRICT',
    },
    caja_sesion: {
      type: 'many-to-one',
      target: 'caja_sesion',
      joinColumn: {
        name: 'caja_sesion_id',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});

export default Venta;
