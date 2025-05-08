import { EntitySchema } from 'typeorm';

const Cupon = new EntitySchema({
  name: 'cupon',
  tableName: 'cupon',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    codigo: {
      type: 'varchar',
      length: 20,
      unique: true, 
    },
    descripcion: {
      type: 'varchar',
      length: 255,
      nullable: true, 
    },
    tipo: {
      type: 'varchar',
      length: 20, 
    },
    valor: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true, 
    },
    fecha_inicio: {
      type: 'timestamp',
      nullable: true, 
    },
    fecha_expiracion: {
      type: 'timestamp',
      nullable: true, 
    },
    usos_disponibles: {
      type: 'int',
      nullable: true, 
    },
    activo: {
      type: 'boolean',
      default: true, 
    },
    creado_en: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    categoria: {
      type: 'many-to-one',
      target: 'categoria',
      joinColumn: { name: 'categoria_id' },
      nullable: true, 
      onDelete: 'SET NULL',
    },
  },
});

export default Cupon;
