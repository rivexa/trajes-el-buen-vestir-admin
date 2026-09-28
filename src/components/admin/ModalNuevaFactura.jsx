import { useState } from 'react';
import { X, Search, Plus, Trash2, Receipt, UserCheck, Package, ShoppingCart, ChevronDown, ChevronUp, Loader2, UserPlus } from 'lucide-react';

const API_CLIENTES = `${import.meta.env.VITE_API_URL}/clientes`;
const API_ORDENES = `${import.meta.env.VITE_API_URL}/ordenes`;
const API_FACTURAS = `${import.meta.env.VITE_API_URL}/facturacion`;

export default function ModalNuevaFactura({ isOpen, onClose, onSuccess }) {
    const [cedulaBusqueda, setCedulaBusqueda] = useState('');
    const [cliente, setCliente] = useState(null);
    const [buscandoCliente, setBuscandoCliente] = useState(false);
    const [ordenesPendientes, setOrdenesPendientes] = useState([]);

    const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
    const [creandoCliente, setCreandoCliente] = useState(false);
    const [datosNuevoCliente, setDatosNuevoCliente] = useState({ nombres: '', apellidos: '', cedula_ruc: '', telefono: '', direccion: '', correo: '' });

    const [origenFacturacion, setOrigenFacturacion] = useState(null);
    const [ordenExpandida, setOrdenExpandida] = useState(null);
    const [detallesCargados, setDetallesCargados] = useState({});

    const [ordenId, setOrdenId] = useState('');
    const [detalles, setDetalles] = useState([]);
    const [metodoPago, setMetodoPago] = useState('Efectivo');

    const [nuevoItem, setNuevoItem] = useState({ descripcion: '', cantidad: 1, precio_unitario: '' });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const resetModal = () => {
        setCedulaBusqueda(''); setCliente(null); setOrdenesPendientes([]);
        setMostrarFormCliente(false); setDatosNuevoCliente({ nombres: '', apellidos: '', cedula_ruc: '', telefono: '', direccion: '', correo: '' });
        setOrigenFacturacion(null); setOrdenExpandida(null); setDetallesCargados({});
        setOrdenId(''); setDetalles([]); setMetodoPago('Efectivo');
        setNuevoItem({ descripcion: '', cantidad: 1, precio_unitario: '' });
        setError('');
    };

    const handleClose = () => { resetModal(); onClose(); };

    const buscarCliente = async (e) => {
        e.preventDefault();
        if (!cedulaBusqueda.trim()) return;
        setBuscandoCliente(true); setError(''); setCliente(null); setOrdenesPendientes([]);
        setMostrarFormCliente(false); setOrigenFacturacion(null); setDetalles([]); setOrdenId('');

        try {
            const resCliente = await fetch(`${API_CLIENTES}/buscar/${cedulaBusqueda}`);
            if (resCliente.ok) {
                const dataCliente = await resCliente.json();
                setCliente(dataCliente);

                const resOrdenes = await fetch(`${API_ORDENES}?search=${dataCliente.cedula_ruc}&limit=20`);
                if (resOrdenes.ok) {
                    const dataOrdenes = await resOrdenes.json();
                    setOrdenesPendientes(dataOrdenes.data.filter(o => !o.factura_id && o.estado !== 'Anulada'));
                }
            } else {
                setMostrarFormCliente(true);
                setDatosNuevoCliente(prev => ({ ...prev, cedula_ruc: cedulaBusqueda }));
            }
        } catch (err) {
            setError('Error de conexión.');
        } finally {
            setBuscandoCliente(false);
        }
    };

    const crearCliente = async (e) => {
        e.preventDefault();
        setCreandoCliente(true); setError('');
        try {
            const res = await fetch(API_CLIENTES, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosNuevoCliente)
            });
            if (res.ok) {
                const newCli = await res.json();
                setCliente(newCli);
                setMostrarFormCliente(false);
                setOrdenesPendientes([]);
            } else {
                const errData = await res.json();
                setError(errData.message || 'Error al registrar cliente.');
            }
        } catch (err) {
            setError('Error de conexión al crear cliente.');
        } finally {
            setCreandoCliente(false);
        }
    };

    const toggleVerDetalles = async (id) => {
        if (ordenExpandida === id) return setOrdenExpandida(null);
        if (!detallesCargados[id]) {
            try {
                const res = await fetch(`${API_ORDENES}/${id}`);
                const data = await res.json();
                setDetallesCargados(prev => ({ ...prev, [id]: data.orden_detalles }));
            } catch (err) { console.error(err); }
        }
        setOrdenExpandida(id);
    };

    const seleccionarOrden = async (id) => {
        setOrdenId(id); setError('');
        if (!detallesCargados[id]) {
            try {
                const res = await fetch(`${API_ORDENES}/${id}`);
                const data = await res.json();
                setDetallesCargados(prev => ({ ...prev, [id]: data.orden_detalles }));
                setDetalles(data.orden_detalles.map(d => ({ descripcion: d.descripcion, cantidad: d.cantidad, precio_unitario: d.precio_unitario })));
            } catch (err) { setError('No se pudieron cargar detalles.'); }
        } else {
            setDetalles(detallesCargados[id].map(d => ({ descripcion: d.descripcion, cantidad: d.cantidad, precio_unitario: d.precio_unitario })));
        }
    };

    const agregarItem = () => {
        if (!nuevoItem.descripcion.trim() || nuevoItem.precio_unitario <= 0 || nuevoItem.cantidad <= 0) return;
        setDetalles([...detalles, { ...nuevoItem, precio_unitario: parseFloat(nuevoItem.precio_unitario) }]);
        setNuevoItem({ descripcion: '', cantidad: 1, precio_unitario: '' });
    };

    const eliminarItem = (index) => setDetalles(detalles.filter((_, i) => i !== index));
    const subtotal = detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);

    const handleSubmit = async () => {
        if (!cliente) return setError('Selecciona un cliente.');
        if (detalles.length === 0) return setError('La factura debe tener al menos un ítem.');

        setGuardando(true); setError('');
        try {
            const payload = {
                cliente_id: cliente.id,
                orden_id: origenFacturacion === 'orden' ? ordenId : undefined,
                metodo_pago: metodoPago,
                detalles: detalles
            };

            const response = await fetch(`${API_FACTURAS}/emitir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                onSuccess(); handleClose();
            } else {
                const errData = await response.json();
                setError(errData.message || 'Error al emitir factura.');
            }
        } catch (err) { setError('Error de conexión.'); }
        finally { setGuardando(false); }
    };

    return (
        <div className="fixed inset-0 bg-negro/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                    <h2 className="text-xl font-serif font-bold text-negro flex items-center gap-2">
                        <Receipt className="text-rojoMarca" /> Emitir Factura Electrónica
                    </h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-rojoMarca transition"><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-white space-y-8">

                    {/* SECCIÓN 1: Cliente y Formulario Rápido */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">1. Selección del Cliente</h3>
                        <form onSubmit={buscarCliente} className="flex gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" placeholder="Buscar por cédula o RUC..." value={cedulaBusqueda} onChange={(e) => setCedulaBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" />
                            </div>
                            <button type="submit" disabled={buscandoCliente} className="px-6 py-2.5 bg-negro text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
                                {buscandoCliente ? 'Buscando...' : 'Buscar'}
                            </button>
                        </form>

                        {mostrarFormCliente && !cliente && (
                            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-blue-800 font-bold mb-3 flex items-center gap-2"><UserPlus size={18} /> Cliente no encontrado. Regístralo rápidamente:</h4>
                                <form onSubmit={crearCliente} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-blue-900">Nombres *</label>
                                        <input required type="text" value={datosNuevoCliente.nombres} onChange={e => setDatosNuevoCliente({ ...datosNuevoCliente, nombres: e.target.value })} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-blue-900">Apellidos *</label>
                                        <input required type="text" value={datosNuevoCliente.apellidos} onChange={e => setDatosNuevoCliente({ ...datosNuevoCliente, apellidos: e.target.value })} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-blue-900">Cédula / RUC *</label>
                                        <input required type="text" value={datosNuevoCliente.cedula_ruc} onChange={e => setDatosNuevoCliente({ ...datosNuevoCliente, cedula_ruc: e.target.value })} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-blue-900">Teléfono</label>
                                        <input type="text" value={datosNuevoCliente.telefono} onChange={e => setDatosNuevoCliente({ ...datosNuevoCliente, telefono: e.target.value })} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-bold text-blue-900">Correo Electrónico</label>
                                        <input type="email" value={datosNuevoCliente.correo} onChange={e => setDatosNuevoCliente({ ...datosNuevoCliente, correo: e.target.value })} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="cliente@correo.com" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-bold text-blue-900">Dirección (Obligatorio para Facturación SRI) *</label>
                                        <input required type="text" value={datosNuevoCliente.direccion} onChange={e => setDatosNuevoCliente({ ...datosNuevoCliente, direccion: e.target.value })} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                                        <button type="button" onClick={() => setMostrarFormCliente(false)} className="px-4 py-2 text-sm text-blue-800 hover:bg-blue-100 rounded-lg transition">Cancelar</button>
                                        <button type="submit" disabled={creandoCliente} className="px-5 py-2 text-sm bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition flex items-center gap-2">
                                            {creandoCliente ? <Loader2 size={16} className="animate-spin" /> : 'Guardar y Continuar'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {cliente && (
                            <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 animate-in fade-in">
                                <div className="bg-green-100 p-2 rounded-full text-green-700"><UserCheck size={20} /></div>
                                <div>
                                    <p className="font-bold text-negro">{cliente.nombres} {cliente.apellidos}</p>
                                    <p className="text-sm text-green-700">C.I / RUC: {cliente.cedula_ruc}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN 2: Origen */}
                    {cliente && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">2. Origen de la Venta</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button type="button" onClick={() => { setOrigenFacturacion('directa'); setOrdenId(''); setDetalles([]); }} className={`flex-1 p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-3 cursor-pointer ${origenFacturacion === 'directa' ? 'border-rojoMarca bg-red-50 text-rojoMarca' : 'border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50/30'}`}>
                                    <ShoppingCart size={32} /> <span className="font-bold">Venta Directa de Mostrador</span>
                                </button>
                                <button type="button" onClick={() => { setOrigenFacturacion('orden'); setOrdenId(''); setDetalles([]); }} className={`flex-1 p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-3 cursor-pointer ${origenFacturacion === 'orden' ? 'border-rojoMarca bg-red-50 text-rojoMarca' : 'border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50/30'}`}>
                                    <Package size={32} /> <span className="font-bold">Facturar Orden de Pedido</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN 3A: Órdenes */}
                    {cliente && origenFacturacion === 'orden' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">Órdenes Pendientes</h3>
                            {ordenesPendientes.length === 0 ? (
                                <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">Este cliente no tiene órdenes de pedido pendientes.</div>
                            ) : (
                                <div className="space-y-3">
                                    {ordenesPendientes.map(ord => (
                                        <div key={ord.id} className={`border rounded-xl overflow-hidden transition-all ${ordenId === ord.id ? 'border-rojoMarca shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                            <div className={`p-4 flex flex-col sm:flex-row justify-between items-center gap-4 ${ordenId === ord.id ? 'bg-red-50/30' : ''}`}>
                                                <div>
                                                    <div className="font-bold text-negro text-lg">ORD-{ord.numero_orden.toString().padStart(4, '0')}</div>
                                                    <div className="text-sm text-gray-500">Subtotal registrado: <span className="font-bold text-gray-800">${ord.subtotal}</span></div>
                                                </div>
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <button onClick={() => toggleVerDetalles(ord.id)} className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-1 transition">
                                                        {ordenExpandida === ord.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Detalles
                                                    </button>
                                                    <button onClick={() => seleccionarOrden(ord.id)} className={`flex-1 sm:flex-none px-5 py-2 text-sm font-bold rounded-lg transition ${ordenId === ord.id ? 'bg-rojoMarca text-white' : 'bg-negro text-white hover:bg-gray-800'}`}>
                                                        {ordenId === ord.id ? 'Seleccionada' : 'Facturar'}
                                                    </button>
                                                </div>
                                            </div>
                                            {ordenExpandida === ord.id && (
                                                <div className="p-4 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2">
                                                    {detallesCargados[ord.id] ? (
                                                        <ul className="space-y-2">
                                                            {detallesCargados[ord.id].map((det, i) => (
                                                                <li key={i} className="flex justify-between items-center text-sm bg-white p-2 border border-gray-100 rounded">
                                                                    <span><span className="text-gray-400 font-bold mr-2">{det.cantidad}x</span> {det.descripcion}</span>
                                                                    <span className="font-bold text-negro">${det.precio_unitario}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <div className="flex justify-center py-2"><Loader2 className="animate-spin text-gray-400" size={18} /></div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECCIÓN 3B: Carrito */}
                    {cliente && (origenFacturacion === 'directa' || (origenFacturacion === 'orden' && ordenId)) && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">3. Ítems a Facturar</h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                <div className="md:col-span-6"><label className="block text-xs font-semibold text-gray-600 mb-1">Añadir Ítem</label><input type="text" value={nuevoItem.descripcion} onChange={(e) => setNuevoItem({ ...nuevoItem, descripcion: e.target.value })} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" /></div>
                                <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Cant.</label><input type="number" min="1" value={nuevoItem.cantidad} onChange={(e) => setNuevoItem({ ...nuevoItem, cantidad: parseInt(e.target.value) || 1 })} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" /></div>
                                <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Precio Un. ($)</label><input type="number" step="0.01" value={nuevoItem.precio_unitario} onChange={(e) => setNuevoItem({ ...nuevoItem, precio_unitario: e.target.value })} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" /></div>
                                <div className="md:col-span-2"><button type="button" onClick={agregarItem} className="w-full p-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-black transition flex items-center justify-center gap-1 text-sm"><Plus size={16} /> Añadir</button></div>
                            </div>

                            {detalles.length > 0 ? (
                                <div className="border border-gray-100 rounded-lg overflow-hidden">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-600"><tr><th className="p-3 font-semibold">Descripción</th><th className="p-3 font-semibold text-center">Cant.</th><th className="p-3 font-semibold text-right">Precio Un.</th><th className="p-3 font-semibold text-right">Total</th><th className="p-3"></th></tr></thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {detalles.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-negro">{item.descripcion}</td>
                                                    <td className="p-3 text-center">{item.cantidad}</td>
                                                    <td className="p-3 text-right">${item.precio_unitario}</td>
                                                    <td className="p-3 text-right font-bold">${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                                                    <td className="p-3 text-right text-red-400 hover:text-rojoMarca cursor-pointer" onClick={() => eliminarItem(index)}><Trash2 size={16} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">El carrito está vacío.</div>
                            )}
                        </div>
                    )}
                </div>

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
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Total a Facturar</p>
                            <p className="text-2xl font-bold text-rojoMarca">${subtotal.toFixed(2)}</p>
                        </div>
                        <button onClick={handleSubmit} disabled={guardando || detalles.length === 0 || !cliente} className="px-8 py-3 bg-rojoMarca text-white font-bold rounded-lg hover:bg-red-800 transition shadow-md disabled:opacity-50 flex items-center gap-2">
                            {guardando ? <Loader2 size={18} className="animate-spin" /> : <Receipt size={18} />} {guardando ? 'Emitiendo...' : 'Emitir Factura'}
                        </button>
                    </div>
                </div>
                {error && <div className="mx-6 mb-6 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg text-center border border-red-200">{error}</div>}
            </div>
        </div>
    );
}