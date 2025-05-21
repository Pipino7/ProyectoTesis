import { EntitySchema } from 'typeorm';

const Movimiento = new EntitySchema({
  name: 'movimiento',
  tableName: 'movimiento',
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
      target: 'usuario', 
      joinColumn: {
        name: 'usuario_id',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
    gasto: {
      type: 'one-to-one',
      target: 'gasto',
      joinColumn: { name: 'gasto_id' },
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
    caja_sesion: {
      type: 'many-to-one',
      target: 'caja_sesion',
      joinColumn: {
        name: 'caja_sesion_id',
      },
      nullable: true, 
      onDelete: 'SET NULL',
    },
    cobro: {
      type: 'many-to-one',
      target: 'cobro',
      joinColumn: {
        name: 'cobro_id',
      },
      nullable: true,
      onDelete: 'SET NULL',
    }
  },
});

export default Movimiento;
