import { EntitySchema } from 'typeorm';

const Gasto = new EntitySchema({
  name: 'gasto',  
  tableName: 'gasto', 
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
    motivo: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    fuera_de_caja: {
      type: 'boolean',
      nullable: false,
      default: false,
    },
    
    tipo: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    fecha: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false,
    },
  },
  relations: {
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
      joinColumn: { name: 'caja_sesion_id' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    fardo: {
      type: 'many-to-one',
      target: 'fardo',
      joinColumn: { name: 'fardo_id' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    metodo_pago: {
      type: 'many-to-one',
      target: 'metodo_pago',
      joinColumn: { name: 'metodo_pago_id' },
      nullable: true
    },
  },
});

export default Gasto;
