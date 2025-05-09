import React from 'react';

const ResumenPago = ({ pago, total, tipoVenta, setTipoVenta }) => {
    const suma = Object.values(pago).reduce((acc, v) => acc + (parseInt(v) || 0), 0);
    if (!suma) return null;

    return (
        <div className="bg-gray-50 p-3 rounded-md border text-sm mt-2 text-gray-700 font-sans">
            <p className="mb-1 font-semibold text-lg">Resumen de Pago:</p>
            {Object.entries(pago).map(([metodo, valor]) =>
                valor > 0 ? (
                    <div key={metodo} className="flex justify-between">
                        <span className="capitalize">{metodo}:</span>
                        <span>${valor.toLocaleString()}</span>
                    </div>
                ) : null
            )}
            {suma < total && (
                <>
                    <div className="flex justify-between text-red-600 font-semibold border-t pt-2 mt-2">
                        <span>SALDO PENDIENTE:</span>
                        <span>${(total - suma).toLocaleString()}</span>
                    </div>
                    <div className="mt-2 text-center">
                        <button
                            type="button"
                            onClick={() => setTipoVenta('credito')}
                            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition font-semibold uppercase tracking-wide"
                        >
                            Registrar deuda a cliente
                        </button>
                    </div>
                </>
            )}
            {suma === total && (
                <div className="flex justify-between font-semibold border-t mt-2 pt-2 text-green-600">
                    <span>TOTAL PAGADO:</span>
                    <span>${total.toLocaleString()}</span>
                </div>
            )}
        </div>
    );
};

export default ResumenPago;