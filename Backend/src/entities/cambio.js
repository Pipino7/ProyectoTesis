import { EntitySchema } from 'typeorm';

const Cambio = new EntitySchema({
  name: 'cambio',
  tableName: 'cambio',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    motivo: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    fecha: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    venta: {
      type: 'many-to-one',
      target: 'venta',
      joinColumn: { name: 'venta_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
    detalle_original: {
      type: 'many-to-one',
      target: 'detalle_venta',
      joinColumn: { name: 'detalle_venta_id' },
      nullable: false,
      onDelete: 'RESTRICT',
    },
    prenda_entregada: {
      type: 'many-to-one',
      target: 'prenda',
      joinColumn: { name: 'prenda_entregada_id' },
      nullable: false,
      onDelete: 'RESTRICT',
    },
    usuario: {
      type: 'many-to-one',
      target: 'usuario',
      joinColumn: { name: 'usuario_id' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    
    caja_sesion: {
      type: 'many-to-one',
      target: 'caja_sesion',
      joinColumn: {
        name: 'caja_sesion_id',
      },
      nullable: true,
      onDelete: 'SET NULL',
    }
    
  },
});

export default Cambio;
