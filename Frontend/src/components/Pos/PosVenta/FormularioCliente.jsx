import React, { useState } from "react";
import formularioClienteSchema from "@/Validation/Formulariocliente.schema.js";

const FormularioCliente = ({ cliente, setCliente }) => {
  const [errores, setErrores] = useState({});

  const validarCampo = (campo, valor) => {
    const validacionParcial = formularioClienteSchema.extract(campo).validateSyncAt(campo, { [campo]: valor }, { abortEarly: true });
    if (!validacionParcial) return;
  };

  const limpiarNombre = (valor) => {
    return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 100);
  };

  const limpiarTelefono = (valor) => {
    return valor.replace(/[^0-9]/g, '').slice(0, 8);
  };

  const handleChange = (campo, valor) => {
    let valorLimpio = valor;

    if (campo === "nombre") valorLimpio = limpiarNombre(valor);
    if (campo === "telefono") valorLimpio = limpiarTelefono(valor);

    setCliente(prev => ({ ...prev, [campo]: valorLimpio }));

    formularioClienteSchema
      .validateAt(campo, { [campo]: valorLimpio })
      .then(() => {
        setErrores(prev => {
          const nuevo = { ...prev };
          delete nuevo[campo];
          return nuevo;
        });
      })
      .catch((err) => {
        setErrores(prev => ({ ...prev, [campo]: err.message }));
      });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
        🧍 Datos del Cliente
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Nombre del Cliente
        </label>
        <input
          type="text"
          value={cliente.nombre}
          onChange={(e) => handleChange("nombre", e.target.value)}
          placeholder="Ej: Juan Pérez"
          className={`w-full border rounded px-3 py-2 focus:ring-2 ${
            errores.nombre ? "border-red-500 ring-red-400" : "focus:ring-blue-400"
          }`}
        />
        {errores.nombre && (
          <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          value={cliente.telefono}
          onChange={(e) => handleChange("telefono", e.target.value)}
          placeholder="Ej: 98765432"
          className={`w-full border rounded px-3 py-2 focus:ring-2 ${
            errores.telefono ? "border-red-500 ring-red-400" : "focus:ring-blue-400"
          }`}
        />
        {errores.telefono && (
          <p className="text-xs text-red-600 mt-1">{errores.telefono}</p>
        )}
      </div>
    </div>
  );
};

export default FormularioCliente;
