import axios from './api.js';

const cajaService = {

  abrirCaja: async (monto_inicial) => {
    try {
      console.log(`🔄 Enviando solicitud para abrir caja con monto inicial: $${monto_inicial}`);
      const response = await axios.post('/caja/abrir', { monto_inicial });
      console.log('📥 Respuesta recibida del servidor:', response.data);
  

      const responseData = response.data?.data || response.data;
      
      if (responseData?.activa !== undefined && (responseData?.caja || responseData?.cajaData)) {
        console.log('🎯 Respuesta contiene información directa de caja activa:', {
          activa: responseData.activa, 
          caja: responseData.caja || responseData.cajaData
        });
        

        return {
          ...responseData,
          data: responseData.data || responseData.caja || responseData.cajaData
        };
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error al abrir caja:', error);
      throw error;
    }
  },


  obtenerResumenCaja: async () => {
    const response = await axios.get('/caja/resumen');
    return response.data.data;
  },


  obtenerCajaPorFecha: async (fecha) => {
    const response = await axios.get(`/caja/por-fecha?fecha=${fecha}`);
    return response.data;
  },


  verificarCajaActiva: async () => {
    try {
      console.log('🔍 Enviando solicitud para verificar caja activa...');
      const response = await axios.get('/caja/activa');
      console.log('📥 Respuesta completa de verificación:', response.data);
      
      const responseData = response.data?.data || response.data;
      

      if (responseData?.usuarioInvalido) {
        console.log('⚠️ Usuario no existe en la base de datos actual:', responseData.mensaje);
        
        return {
          activa: false,
          usuarioInvalido: true,
          mensaje: responseData.mensaje || 'El usuario ya no existe. Por favor, inicie sesión nuevamente.'
        };
      }
      
      const activa = responseData?.activa || false;
      const cajaDetalle = responseData?.caja || responseData?.cajaData || null;
      
      console.log('📊 Respuesta de caja activa:', activa ? 'Sí hay caja activa' : 'No hay caja activa');
      if (cajaDetalle) {
        console.log(`💰 Detalles de caja activa:
          - ID: ${cajaDetalle.id}
          - Fecha apertura: ${cajaDetalle.fecha_apertura}
          - Monto inicial: $${cajaDetalle.monto_inicial}
          - Balance actual: $${cajaDetalle.totales?.balance_actual || cajaDetalle.monto_inicial}
        `);
      }
      

      return {
        activa: activa,
        cajaData: cajaDetalle,
        caja: cajaDetalle 
      };
    } catch (error) {
      console.error('Error al verificar caja activa:', error);
      return { 
        activa: false,
        cajaData: null,
        caja: null,
        error: error.message || 'Error al verificar el estado de la caja'
      };
    }
  },

  cerrarCaja: async ({ monto_declarado, observacion }) => {
    try {
      console.log('🔒 Enviando solicitud de cierre de caja con datos:', { monto_declarado, observacion });
      const response = await axios.post('/caja/cerrar', { 
        monto_declarado, 
        observacion 
      });
      console.log('✅ Respuesta de cierre de caja:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al cerrar caja:', error);
      
      throw error;
    }
  },


  obtenerResumenCajaActual: async () => {
    try {
      const response = await axios.get('/caja/resumen');
      
      if (response.data?.usuarioInvalido) {
        console.log('⚠️ Usuario no existe en la base de datos actual:', response.data.mensaje);
        
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        
        throw new Error('Usuario no encontrado en la base de datos actual');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener resumen de caja actual:', error);
      throw error;
    }
  },
  
  obtenerHistoricoCajas: async () => {
    try {
      console.log('🔍 Solicitando histórico de cajas...');
      const response = await axios.get('/caja/historico');
      
      if (response.data?.usuarioInvalido) {
        console.log('⚠️ Usuario no existe en la base de datos actual:', response.data.mensaje);
        return {
          error: true,
          usuarioInvalido: true,
          mensaje: response.data.mensaje || 'El usuario ya no existe. Por favor, inicie sesión nuevamente.'
        };
      }
      

      let historicos = [];
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        historicos = response.data.data.data;
        console.log('📊 Datos encontrados en estructura anidada response.data.data.data');
      } else {
        historicos = Array.isArray(response.data?.data) ? response.data.data : [];
        console.log('📊 Datos encontrados en estructura estándar response.data.data');
      }
      
      console.log(`📊 Se recibieron ${historicos.length} registros de históricos de caja`);
      
    
      const historicosConEstado = historicos.map(caja => ({
        ...caja,
        cerrada_automaticamente: caja.observacion?.includes('Cierre automático'),
        etiquetas: caja.observacion?.includes('Cierre automático') ? 
          [{ tipo: 'advertencia', texto: 'Caja cerrada automáticamente por el sistema' }] : []
      }));
      
      return {
        data: historicosConEstado,
        count: historicosConEstado.length
      };
    } catch (error) {
      console.error('❌ Error al obtener histórico de cajas:', error);
      return {
        error: true,
        mensaje: error.message || 'Error al obtener el histórico de cajas'
      };
    }
  }
};

export default cajaService;
