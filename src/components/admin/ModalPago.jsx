import { useState } from 'react';
import { DollarSign, X } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/ordenes`;

export default function ModalPago({ isOpen, onClose, orden, onSuccess }) {
    const [monto, setMonto] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !orden) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const valorPago = parseFloat(monto);
        if (isNaN(valorPago) || valorPago <= 0) {
            return setError('Ingresa un monto válido mayor a $0.');
        }
        if (valorPago > orden.saldo) {
            return setError(`El pago no puede superar el saldo pendiente ($${orden.saldo}).`);
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/${orden.id}/pago`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ monto: valorPago })
            });

            if (response.ok) {
                onSuccess();
                onClose();
                setMonto('');
            } else {
                const errData = await response.json();
                setError(errData.message || 'Error al procesar el pago.');
            }
        } catch (error) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-negro/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-serif font-bold text-negro flex items-center gap-2">
                        <DollarSign className="text-green-600" /> Registrar Pago
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-rojoMarca transition"><X size={24} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Cliente: <span className="font-semibold text-negro">{orden.clientes?.nombres} {orden.clientes?.apellidos}</span></p>
                        <p className="text-sm text-gray-500 mb-1">Total de la Orden: <span className="font-semibold text-negro">${orden.subtotal}</span></p>
                        <p className="text-sm text-gray-500">Saldo Pendiente: <span className="font-bold text-rojoMarca text-lg">${orden.saldo}</span></p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-negro mb-2">Monto a abonar ($)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            min="0.01" 
                            max={orden.saldo} 
                            required 
                            value={monto} 
                            onChange={(e) => setMonto(e.target.value)} 
                            className="w-full p-4 text-2xl font-bold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition text-center" 
                            placeholder="0.00" 
                        />
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-negro font-medium rounded-lg hover:bg-gray-200 transition">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-md transition disabled:opacity-50">
                            {loading ? 'Procesando...' : 'Confirmar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}