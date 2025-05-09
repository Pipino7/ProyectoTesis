import { EntitySchema } from 'typeorm';

const Cobro = new EntitySchema({
  name: 'cobro',  
  tableName: 'cobro',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    monto: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    fecha_cobro: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false,
    }
  },
  relations: {
    venta: {
      type: 'many-to-one',
      target: 'venta',
      joinColumn: { name: 'venta_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
    usuario: {
      type: 'many-to-one',
      target: 'usuario',
      joinColumn: { name: 'usuario_id' },
      nullable: true, 
      onDelete: 'SET NULL',
    },
    metodoPago: {
      type: 'many-to-one',
      target: 'metodo_pago',
      joinColumn: { name: 'metodo_pago_id' },
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

export default Cobro;
