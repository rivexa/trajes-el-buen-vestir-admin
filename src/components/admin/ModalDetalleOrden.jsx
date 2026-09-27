import React, { useState, useEffect } from 'react';
import { X, Package, User, Calendar, CreditCard, FileText, CheckCircle, Clock } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/ordenes`;

export default function ModalDetalleOrden({ isOpen, onClose, ordenId }) {
    const [orden, setOrden] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imagenAmpliada, setImagenAmpliada] = useState(null);

    useEffect(() => {
        if (isOpen && ordenId) {
            fetchDetalle();
        } else {
            setOrden(null);
        }
    }, [isOpen, ordenId]);

    const fetchDetalle = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/${ordenId}`);
            if (response.ok) {
                const data = await response.json();
                setOrden(data);
            } else {
                setError('No se pudo cargar el detalle de la orden.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-negro/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                    <h2 className="text-xl font-serif font-bold text-negro flex items-center gap-2">
                        <FileText className="text-rojoMarca" />
                        Detalle de Orden {orden && `ORD-${orden.numero_orden.toString().padStart(4, '0')}`}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-rojoMarca transition"><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    {loading ? (
                        <div className="flex justify-center items-center h-40 text-gray-500 font-medium">Cargando información...</div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm text-center">{error}</div>
                    ) : orden ? (
                        <div className="space-y-8">

                            {/* Información General */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1"><User size={14} /> Datos del Cliente</h3>
                                    <p className="font-bold text-negro text-lg">{orden.clientes?.nombres} {orden.clientes?.apellidos}</p>
                                    <p className="text-sm text-gray-600">C.I / RUC: {orden.clientes?.cedula_ruc}</p>
                                    <p className="text-sm text-gray-600">Tel: {orden.clientes?.telefono || 'No registrado'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1"><Calendar size={14} /> Fechas y Estado</h3>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Fecha de Creación:</span>
                                        <span className="font-medium">{new Date(orden.fecha_creacion).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Entrega Estimada:</span>
                                        <span className="font-medium">{orden.fecha_entrega_estimada ? new Date(orden.fecha_entrega_estimada).toLocaleDateString() : 'Por definir'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-bold mt-2 pt-2 border-t border-gray-200">
                                        Estado: {orden.estado === 'Pendiente' ? <Clock size={14} className="text-yellow-500" /> : <CheckCircle size={14} className="text-green-500" />}
                                        <span className={orden.estado === 'Pendiente' ? 'text-yellow-600' : 'text-green-600'}>{orden.estado}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles de Prendas */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1 border-b border-gray-100 pb-2"><Package size={16} /> Prendas y Servicios</h3>
                                <div className="border border-gray-100 rounded-lg overflow-hidden">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="p-3 font-semibold w-16">Foto</th>
                                                <th className="p-3 font-semibold">Descripción</th>
                                                <th className="p-3 font-semibold text-center">Cant.</th>
                                                <th className="p-3 font-semibold text-right">Precio Un.</th>
                                                <th className="p-3 font-semibold text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orden.orden_detalles?.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="p-3">
                                                        {item.imagen_referencia_url ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setImagenAmpliada(item.imagen_referencia_url)}
                                                                className="relative group cursor-pointer border border-gray-200 rounded-md overflow-hidden block"
                                                                title="Ver imagen ampliada"
                                                            >
                                                                <img src={item.imagen_referencia_url} alt="Referencia" className="w-12 h-12 object-cover group-hover:scale-110 transition-transform" />
                                                            </button>
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 text-xs">Sin foto</div>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="font-medium text-negro block">{item.descripcion}</span>
                                                        <span className="text-xs text-gray-500">{item.tipo_item}</span>
                                                    </td>
                                                    <td className="p-3 text-center">{item.cantidad}</td>
                                                    <td className="p-3 text-right">${item.precio_unitario}</td>
                                                    <td className="p-3 text-right font-medium">${item.subtotal_linea}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Resumen Financiero */}
                            <div className="flex justify-end">
                                <div className="w-full md:w-64 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1"><CreditCard size={14} /> Resumen Financiero</h3>
                                    <div className="flex justify-between mb-2 text-sm text-gray-600"><span>Total de Orden:</span> <span className="font-medium">${orden.subtotal}</span></div>
                                    <div className="flex justify-between mb-3 text-sm text-green-700"><span>Abono Acumulado:</span> <span className="font-medium">-${orden.abono}</span></div>
                                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                        <span className="font-bold text-negro uppercase tracking-wider text-sm">Saldo:</span>
                                        <span className={`text-xl font-bold ${orden.saldo <= 0 ? 'text-green-600' : 'text-rojoMarca'}`}>
                                            ${orden.saldo}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : null}
                </div>

                <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                    <button onClick={onClose} className="px-8 py-3 bg-negro text-white font-medium rounded-lg hover:bg-gray-800 transition">
                        Cerrar Detalle
                    </button>
                </div>
            </div>
            {/* Visor de Imagen Ampliada */}
            {imagenAmpliada && (
                <div className="fixed inset-0 z-[70] bg-negro/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setImagenAmpliada(null)}>
                    <button className="absolute top-6 right-6 text-white/70 hover:text-white transition bg-white/10 rounded-full p-2">
                        <X size={24} />
                    </button>
                    <img
                        src={imagenAmpliada}
                        alt="Referencia Ampliada"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}