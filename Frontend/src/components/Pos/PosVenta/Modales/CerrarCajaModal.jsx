import React, { useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import { FaTimes, FaRegMoneyBillAlt, FaCalculator, FaExchangeAlt, FaRegCommentAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { cajaService } from '@/services';
import useCajaResumen from '@/hooks/useCajaResumen';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import cerrarCajaSchema from '@/Validation/cerrarCajaSchema';

/**
 * Modal que permite cerrar la caja mostrando el saldo calculado por el backend
 * y la diferencia contra el monto declarado por el cajero.
 * – Autocompleta el monto declarado con el saldo calculado para evitar errores
 * – Actualiza el resumen global al cerrar la caja
 * – Muestra la diferencia en tiempo real (color verde si sobra, rojo si falta)
 * – Valida un máximo de 2.000.000 para el monto contado
 * – Limita la observación a 250 caracteres
 */
const CerrarCajaModal = ({ isOpen, onClose, onSuccess }) => {
  /* ────────────────────────────────  Hooks  ─────────────────────────────── */
  const { resumen, refreshResumen } = useCajaResumen();

  const saldoCalculado = useMemo(() => {
    return Number(resumen?.totales?.saldo_calculado ?? 0);
  }, [resumen]);


  const initialValues = useMemo(() => ({
    monto_declarado: saldoCalculado.toString(),
    observacion: ''
  }), [saldoCalculado]);


  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen]);


  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);

      const cierre = await cajaService.cerrarCaja({
        monto_declarado: Number(values.monto_declarado),
        observacion: values.observacion || 'Sin observaciones'
      });
      toast.success('Caja cerrada correctamente');

      await refreshResumen();
      if (onSuccess) onSuccess(cierre);
      onClose();
    } catch (error) {
      console.error('Error al cerrar caja:', error);
      toast.error(error.response?.data?.message || 'Error al cerrar la caja');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-xl mx-auto my-12 max-w-xl shadow-2xl relative border border-gray-200"
      overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-5 rounded-t-xl flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <FaRegMoneyBillAlt className="mr-2" /> Cierre de Caja
        </h2>
        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
          <FaTimes size={22} />
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={cerrarCajaSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, isSubmitting, errors, touched, setFieldValue }) => {
          // Cálculo de diferencia
          const diferencia = Number(values.monto_declarado) - saldoCalculado;
          const diferenciaColor = diferencia === 0 ? 'text-gray-600' : diferencia > 0 ? 'text-green-600' : 'text-red-600';
          
          return (
            <Form className="p-6 space-y-6">
              {/* Saldo calculado */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaCalculator className="mr-2 text-blue-600" /> Saldo calculado por el sistema
                </label>
                <input
                  type="text"
                  value={saldoCalculado.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  readOnly
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-not-allowed text-lg font-bold text-gray-700 shadow-inner"
                />
              </div>

              {/* Monto declarado */}
              <div>
                <label htmlFor="monto_declarado" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaRegMoneyBillAlt className="mr-2 text-blue-600" /> Monto contado en caja <span className="text-red-500 ml-1">*</span>
                </label>
                <Field
                  id="monto_declarado"
                  name="monto_declarado"
                  type="number"
                  step="0.01"
                  min="0"
                  max="2000000"
                  className={`w-full border ${errors.monto_declarado && touched.monto_declarado ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm transition-all`}
                />
                <ErrorMessage name="monto_declarado" component="div" className="text-red-500 text-sm mt-1" />
                
                {Number(values.monto_declarado) > 2000000 && (
                  <div className="text-red-500 text-sm mt-1">
                    El monto máximo permitido es de $2.000.000
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1">Máximo permitido: $2.000.000</div>
              </div>

              {/* Diferencia */}
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaExchangeAlt className="mr-2 text-blue-600" /> Diferencia
                </label>
                <p className={`text-xl font-bold ${diferenciaColor} transition-colors`}>
                  {diferencia.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  <span className="text-sm ml-2 font-normal">
                    {diferencia === 0 ? '(No hay diferencia)' : diferencia > 0 ? '(Sobrante)' : '(Faltante)'}
                  </span>
                </p>
              </div>

              {/* Observación */}
              <div>
                <label htmlFor="observacion" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaRegCommentAlt className="mr-2 text-blue-600" /> Observación
                </label>
                <Field
                  as="textarea"
                  id="observacion"
                  name="observacion"
                  rows={4}
                  className={`w-full border ${errors.observacion && touched.observacion ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm`}
                  placeholder="Añadir comentario opcional sobre el cierre de caja"
                  maxLength={250}
                />
                <ErrorMessage name="observacion" component="div" className="text-red-500 text-sm mt-1" />
                <div className="flex justify-end text-xs text-gray-500 mt-1">
                  {values.observacion.length}/250 caracteres
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || Object.keys(errors).length > 0 || Number(values.monto_declarado) > 2000000}
                >
                  {isSubmitting ? 'Procesando…' : 'Cerrar Caja'}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default CerrarCajaModal;
