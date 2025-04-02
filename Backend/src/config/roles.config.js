// src/config/roles.config.js

class RolesConfig {
    static ADMIN = 'admin';
    static VENDEDOR = 'vendedor';
  
    static get TODOS() {
      return [this.ADMIN, this.VENDEDOR];
    }
  }
  
  export default RolesConfig;
  