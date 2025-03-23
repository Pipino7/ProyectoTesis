import { EntitySchema } from 'typeorm';

const HistorialClasificacion = new EntitySchema({
  name: 'historialclasificacion',
  tableName: 'historial_clasificacion',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    fecha_clasificacion: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false,
    },
    cantidad_clasificada: {
      type: 'int',
      nullable: false,
    },
    accion: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    descripcion: {
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
      onDelete: 'CASCADE',
    },
    categoria: { 
      type: 'many-to-one', 
      target: 'categoria', 
      joinColumn: { 
        name: 'categoria_id', 
      }, 
      nullable: true, 
    },
  },
});

export default HistorialClasificacion;
