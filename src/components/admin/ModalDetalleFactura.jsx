import React, { useState, useEffect } from 'react';
import { X, Receipt, Loader2, Download } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/facturacion`;

export default function ModalDetalleFactura({ isOpen, onClose, facturaId }) {
    const [factura, setFactura] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && facturaId) {
            setLoading(true);
            fetch(`${API_URL}/${facturaId}`)
                .then(res => res.json())
                .then(data => setFactura(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, facturaId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50 shrink-0">
                    <h2 className="text-xl font-serif font-bold text-negro flex items-center gap-2">
                        <Receipt className="text-rojoMarca" /> Detalle de Factura
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-rojoMarca transition"><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
                    ) : factura ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase">Comprobante SRI</h3>
                                    <p className="text-xl font-bold text-negro mt-1">FAC-{factura.secuencial_local?.toString().padStart(9, '0')}</p>
                                    <p className="text-sm text-gray-600 mt-1">Clave: {factura.clave_acceso_sri || 'Pendiente'}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${factura.estado_sri === 'AUTORIZADO' ? 'bg-green-100 text-green-700' : factura.estado_sri === 'ANULADA' ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                                        {factura.estado_sri}
                                    </span>
                                    <p className="text-sm text-gray-500 mt-2">{new Date(factura.fecha_emision).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-1">Cliente</h3>
                                    <p className="font-semibold text-negro">{factura.clientes?.nombres} {factura.clientes?.apellidos}</p>
                                    <p className="text-sm text-gray-600">RUC/CI: {factura.clientes?.cedula_ruc}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-1">Comercial</h3>
                                    <p className="text-sm font-medium text-gray-700">Método Pago: {factura.metodo_pago}</p>
                                    <p className="text-sm text-gray-600">Origen: {factura.orden_id ? `Orden ORD-${factura.ordenes_pedido?.numero_orden.toString().padStart(4, '0')}` : 'Venta Directa'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Detalle de Ítems</h3>
                                <div className="border border-gray-100 rounded-lg overflow-hidden">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="p-3 font-semibold text-gray-600">Descripción</th>
                                                <th className="p-3 font-semibold text-gray-600 text-center">Cant</th>
                                                <th className="p-3 font-semibold text-gray-600 text-right">Precio Un.</th>
                                                <th className="p-3 font-semibold text-gray-600 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {factura.factura_detalles?.map(item => (
                                                <tr key={item.id}>
                                                    <td className="p-3 font-medium text-negro">{item.descripcion}</td>
                                                    <td className="p-3 text-center">{item.cantidad}</td>
                                                    <td className="p-3 text-right">${item.precio_unitario}</td>
                                                    <td className="p-3 text-right font-bold">${item.subtotal_linea}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-gray-100 pt-4">
                                <div className="text-right w-48">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1"><span>Subtotal (0%)</span><span>${factura.subtotal_factura}</span></div>
                                    <div className="flex justify-between text-lg font-bold text-rojoMarca mt-2 border-t pt-2"><span>Total</span><span>${factura.total_factura}</span></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-red-500 py-10">Factura no encontrada.</div>
                    )}
                </div>
            </div>
        </div>
    );
}