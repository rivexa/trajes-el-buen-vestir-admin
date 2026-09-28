import { useState } from 'react';
import { X, Search, Plus, Trash2, Receipt, UserCheck, Package, Loader2 } from 'lucide-react';

const API_CLIENTES = `${import.meta.env.VITE_API_URL}/clientes`;
const API_ORDENES = `${import.meta.env.VITE_API_URL}/ordenes`;
const API_FACTURAS = `${import.meta.env.VITE_API_URL}/facturacion`;

export default function ModalNuevaFactura({ isOpen, onClose, onSuccess }) {
    const [cedulaBusqueda, setCedulaBusqueda] = useState('');
    const [cliente, setCliente] = useState(null);
    const [buscandoCliente, setBuscandoCliente] = useState(false);
    const [ordenesPendientes, setOrdenesPendientes] = useState([]);
    
    const [ordenId, setOrdenId] = useState('');
    const [detalles, setDetalles] = useState([]);
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    
    const [nuevoItem, setNuevoItem] = useState({ descripcion: '', cantidad: 1, precio_unitario: '' });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const resetModal = () => {
        setCedulaBusqueda(''); setCliente(null); setOrdenesPendientes([]);
        setOrdenId(''); setDetalles([]); setMetodoPago('Efectivo');
        setNuevoItem({ descripcion: '', cantidad: 1, precio_unitario: '' });
        setError('');
    };

    const handleClose = () => { resetModal(); onClose(); };

    const buscarCliente = async (e) => {
        e.preventDefault();
        if (!cedulaBusqueda.trim()) return;
        setBuscandoCliente(true); setError(''); setCliente(null); setOrdenesPendientes([]);

        try {
            const resCliente = await fetch(`${API_CLIENTES}/buscar/${cedulaBusqueda}`);
            if (resCliente.ok) {
                const dataCliente = await resCliente.json();
                setCliente(dataCliente);
                
                const resOrdenes = await fetch(`${API_ORDENES}?search=${dataCliente.cedula_ruc}&limit=20`);
                if (resOrdenes.ok) {
                    const dataOrdenes = await resOrdenes.json();
                    const pendientes = dataOrdenes.data.filter(o => !o.factura_id && o.estado !== 'Anulada');
                    setOrdenesPendientes(pendientes);
                }
            } else {
                setError('Cliente no encontrado.');
            }
        } catch (err) {
            setError('Error de conexión.');
        } finally {
            setBuscandoCliente(false);
        }
    };

    const cargarOrdenAlCarrito = async (id) => {
        setOrdenId(id);
        if (!id) return;
        
        try {
            const response = await fetch(`${API_ORDENES}/${id}`);
            if (response.ok) {
                const data = await response.json();
                const itemsFormateados = data.orden_detalles.map(d => ({
                    descripcion: d.descripcion,
                    cantidad: d.cantidad,
                    precio_unitario: d.precio_unitario
                }));
                setDetalles(itemsFormateados);
            }
        } catch (err) {
            setError('No se pudieron cargar los detalles de la orden.');
        }
    };

    const agregarItem = () => {
        if (!nuevoItem.descripcion.trim() || nuevoItem.precio_unitario <= 0 || nuevoItem.cantidad <= 0) return;
        setDetalles([...detalles, { ...nuevoItem, precio_unitario: parseFloat(nuevoItem.precio_unitario) }]);
        setNuevoItem({ descripcion: '', cantidad: 1, precio_unitario: '' });
    };

    const eliminarItem = (index) => {
        setDetalles(detalles.filter((_, i) => i !== index));
    };

    const subtotal = detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);

    const handleSubmit = async () => {
        if (!cliente) return setError('Selecciona un cliente.');
        if (detalles.length === 0) return setError('La factura debe tener al menos un ítem.');

        setGuardando(true); setError('');
        try {
            const payload = {
                cliente_id: cliente.id,
                orden_id: ordenId || undefined,
                metodo_pago: metodoPago,
                detalles: detalles
            };

            const response = await fetch(`${API_FACTURAS}/emitir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                onSuccess();
                handleClose();
            } else {
                const errData = await response.json();
                setError(errData.message || 'Error al emitir factura.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-negro/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                    <h2 className="text-xl font-serif font-bold text-negro flex items-center gap-2">
                        <Receipt className="text-rojoMarca" /> Emitir Nueva Factura Electrónica
                    </h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-rojoMarca transition"><X size={24} /></button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 bg-white space-y-8">
                    
                    {/* Sección 1: Cliente */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">1. Datos del Cliente</h3>
                        <form onSubmit={buscarCliente} className="flex gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" placeholder="Buscar cédula o RUC..." value={cedulaBusqueda} onChange={(e) => setCedulaBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" />
                            </div>
                            <button type="submit" disabled={buscandoCliente} className="px-6 py-2.5 bg-negro text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
                                {buscandoCliente ? 'Buscando...' : 'Buscar'}
                            </button>
                        </form>
                        {cliente && (
                            <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-full text-green-700"><UserCheck size={20} /></div>
                                <div>
                                    <p className="font-bold text-negro">{cliente.nombres} {cliente.apellidos}</p>
                                    <p className="text-sm text-green-700">C.I / RUC: {cliente.cedula_ruc}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sección 2: Carga Rápida desde Orden */}
                    <div className={`transition-opacity ${!cliente ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">2. Origen de la Facturación</h3>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center gap-4">
                            <Package className="text-blue-500 shrink-0" size={24} />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900 mb-1">¿Deseas facturar una orden de pedido existente?</p>
                                <select value={ordenId} onChange={(e) => cargarOrdenAlCarrito(e.target.value)} className="w-full p-2 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500 text-blue-800">
                                    <option value="">No, es una venta directa / facturar en blanco</option>
                                    {ordenesPendientes.map(ord => (
                                        <option key={ord.id} value={ord.id}>ORD-{ord.numero_orden.toString().padStart(4, '0')} - Subtotal: ${ord.subtotal}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sección 3: Carrito de Facturación */}
                    <div className={`transition-opacity ${!cliente ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">3. Detalle de Ítems a Facturar</h3>
                        
                        {/* Formulario para agregar ítems extra */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-6">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción del Ítem</label>
                                <input type="text" placeholder="Ej: Corbata de seda azul..." value={nuevoItem.descripcion} onChange={(e) => setNuevoItem({...nuevoItem, descripcion: e.target.value})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad</label>
                                <input type="number" min="1" value={nuevoItem.cantidad} onChange={(e) => setNuevoItem({...nuevoItem, cantidad: parseInt(e.target.value) || 1})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Precio Un. ($)</label>
                                <input type="number" step="0.01" value={nuevoItem.precio_unitario} onChange={(e) => setNuevoItem({...nuevoItem, precio_unitario: e.target.value})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <button type="button" onClick={agregarItem} className="w-full p-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-black transition flex items-center justify-center gap-1 text-sm">
                                    <Plus size={16} /> Añadir
                                </button>
                            </div>
                        </div>

                        {/* Tabla del Carrito */}
                        {detalles.length > 0 ? (
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="p-3 font-semibold">Descripción</th>
                                            <th className="p-3 font-semibold text-center">Cant.</th>
                                            <th className="p-3 font-semibold text-right">Precio Un.</th>
                                            <th className="p-3 font-semibold text-right">Total</th>
                                            <th className="p-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {detalles.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="p-3 font-medium text-negro">{item.descripcion}</td>
                                                <td className="p-3 text-center">{item.cantidad}</td>
                                                <td className="p-3 text-right">${item.precio_unitario}</td>
                                                <td className="p-3 text-right font-bold">${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                                                <td className="p-3 text-right text-red-400 hover:text-rojoMarca cursor-pointer" onClick={() => eliminarItem(index)}><Trash2 size={16}/></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                                El carrito está vacío. Carga una orden o añade ítems manualmente.
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer: Finanzas y Botón */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <label className="text-sm font-semibold text-gray-600">Método de Pago:</label>
                        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-rojoMarca bg-white font-medium">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Total a Facturar (IVA 0%)</p>
                            <p className="text-2xl font-bold text-rojoMarca">${subtotal.toFixed(2)}</p>
                        </div>
                        <button onClick={handleSubmit} disabled={guardando || detalles.length === 0 || !cliente} className="px-8 py-3 bg-rojoMarca text-white font-bold rounded-lg hover:bg-red-800 transition shadow-md disabled:opacity-50 flex items-center gap-2">
                            {guardando ? <Loader2 size={18} className="animate-spin" /> : <Receipt size={18} />}
                            {guardando ? 'Emitiendo SRI...' : 'Emitir Factura'}
                        </button>
                    </div>
                </div>
                {error && <div className="mx-6 mb-6 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg text-center border border-red-200">{error}</div>}

            </div>
        </div>
    );
}