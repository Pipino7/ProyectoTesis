// src/components/pos/ModalAperturaCaja.jsx
import React, { useState } from 'react';
import Modal from 'react-modal';
import { aperturaCajaSchema } from '@/Validation/caja.schema';
import { FaExclamationCircle } from 'react-icons/fa';

const ModalAperturaCaja = ({ isOpen, closeModal, montoInicial, setMontoInicial, abrirCaja }) => {
    const [error, setError] = useState('');

    const handleValidarYEnviar = async () => {
        try {
            setError('');
            await aperturaCajaSchema.validate({ monto_inicial: montoInicial });
            abrirCaja();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Abrir Caja"
            className="max-w-lg mx-auto mt-20 bg-white p-8 rounded-lg shadow-lg relative"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            ariaHideApp={false}
        >
            <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Cerrar modal"
            >
                ✖
            </button>

            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                🔓 Abrir Caja
            </h2>

            <div className="mb-4">
                <label htmlFor="montoInicial" className="block text-sm font-medium text-gray-700 mb-1">
                    Monto Inicial
                </label>
                <input
                    id="montoInicial"
                    type="number"
                    value={montoInicial}
                    onChange={(e) => setMontoInicial(e.target.value)}
                    placeholder="Ingrese el monto inicial"
                    className={`w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        error ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {error && (
                    <div className="text-red-600 text-sm mt-2 flex items-center">
                        <FaExclamationCircle className="mr-2" />
                        {error}
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-4">
                <button
                    onClick={closeModal}
                    className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleValidarYEnviar}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Abrir Caja
                </button>
            </div>
        </Modal>
    );
};

export default ModalAperturaCaja;
