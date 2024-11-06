// src/entities/usuario.js
import { EntitySchema } from 'typeorm';

const usuario = new EntitySchema({
  name: 'usuario',  // Nombre de la entidad
  tableName: 'usuario',  // Nombre de la tabla en la base de datos
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    nombre: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 255,
      nullable: false,
      unique: true,
    },
    contraseña: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    rol_usuario: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    reset_token: {
      type: 'varchar',
      nullable: true,
    },
    reset_token_expires: {
      type: 'timestamp',
      nullable: true,
    },
  },
});

export default usuario;
