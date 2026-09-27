import { useState } from 'react';
import { X, Search, Plus, Trash2, UserCheck, PackageOpen, DollarSign, AlertTriangle, Image as ImageIcon, Loader2 } from 'lucide-react';

const API_CLIENTES = `${import.meta.env.VITE_API_URL}/clientes`;
const API_ORDENES = `${import.meta.env.VITE_API_URL}/ordenes`;

export default function ModalNuevaOrden({ isOpen, onClose, onSuccess }) {
    // Estados del Cliente
    const [cedulaBusqueda, setCedulaBusqueda] = useState('');
    const [cliente, setCliente] = useState(null);
    const [buscandoCliente, setBuscandoCliente] = useState(false);
    const [errorCliente, setErrorCliente] = useState('');

    // Estados de la Orden
    const [detalles, setDetalles] = useState([]);
    const [fechaEntrega, setFechaEntrega] = useState('');
    const [abono, setAbono] = useState('');
    const [errorOrden, setErrorOrden] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [imagenAmpliada, setImagenAmpliada] = useState(null);

    // Estado del Formulario de Item
    const [nuevoItem, setNuevoItem] = useState({ tipo_item: 'Confección', descripcion: '', cantidad: 1, precio_unitario: '' });

    if (!isOpen) return null;

    const resetModal = () => {
        setCedulaBusqueda('');
        setCliente(null);
        setDetalles([]);
        setFechaEntrega('');
        setAbono('');
        setErrorCliente('');
        setErrorOrden('');
        setNuevoItem({ tipo_item: 'Confección', descripcion: '', cantidad: 1, precio_unitario: '' });
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    // ==========================================
    // 1. BUSCAR CLIENTE
    // ==========================================
    const buscarCliente = async (e) => {
        e.preventDefault();
        if (!cedulaBusqueda.trim()) return;

        setBuscandoCliente(true);
        setErrorCliente('');
        setCliente(null);

        try {
            const response = await fetch(`${API_CLIENTES}/buscar/${cedulaBusqueda}`);
            if (response.ok) {
                const data = await response.json();
                setCliente(data);
            } else {
                setErrorCliente('Cliente no encontrado. Verifica la cédula o regístralo primero.');
            }
        } catch (error) {
            setErrorCliente('Error de conexión al buscar cliente.');
        } finally {
            setBuscandoCliente(false);
        }
    };

    const handleSubirImagen = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSubiendoImagen(true);
        const formData = new FormData();
        formData.append('file', file);

        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.secure_url) {
                setNuevoItem({ ...nuevoItem, imagen_referencia_url: data.secure_url });
            } else {
                setErrorOrden('Error al procesar la imagen en Cloudinary.');
            }
        } catch (error) {
            setErrorOrden('Error de red al intentar subir la imagen.');
        } finally {
            setSubiendoImagen(false);
        }
    };

    // ==========================================
    // 2. GESTIÓN DEL CARRITO (DETALLES)
    // ==========================================
    const agregarDetalle = () => {
        if (!nuevoItem.descripcion.trim() || nuevoItem.precio_unitario <= 0 || nuevoItem.cantidad <= 0) {
            setErrorOrden('La descripción, cantidad y precio son obligatorios para añadir la prenda.');
            return;
        }
        setDetalles([...detalles, { ...nuevoItem, precio_unitario: parseFloat(nuevoItem.precio_unitario) }]);
        setNuevoItem({ tipo_item: 'Confección', descripcion: '', cantidad: 1, precio_unitario: '' });
        setErrorOrden('');
    };

    const eliminarDetalle = (index) => {
        const nuevosDetalles = detalles.filter((_, i) => i !== index);
        setDetalles(nuevosDetalles);
    };

    const subtotal = detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);
    const saldoCalculado = subtotal - (parseFloat(abono) || 0);

    // ==========================================
    // 3. ENVIAR ORDEN AL BACKEND
    // ==========================================
    const handleSubmitOrden = async () => {
        setErrorOrden('');

        if (!cliente) return setErrorOrden('Debes buscar y seleccionar un cliente primero.');
        if (detalles.length === 0) return setErrorOrden('Debes añadir al menos una prenda o servicio a la orden.');
        if (parseFloat(abono) > subtotal) return setErrorOrden('El abono no puede ser mayor al subtotal de la orden.');

        setGuardando(true);
        try {
            const payload = {
                cliente_id: cliente.id,
                fecha_entrega_estimada: fechaEntrega || undefined,
                abono: parseFloat(abono) || 0,
                detalles: detalles
            };

            const response = await fetch(`${API_ORDENES}/nueva`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                onSuccess();
                handleClose();
            } else {
                const errData = await response.json();
                const mensaje = Array.isArray(errData.message) ? errData.message[0] : errData.message;
                setErrorOrden(mensaje || 'Error al procesar la orden.');
            }
        } catch (error) {
            setErrorOrden('Error de conexión con el servidor.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-negro/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header Modal */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                    <h2 className="text-xl font-serif font-bold text-negro flex items-center gap-2">
                        <PackageOpen className="text-rojoMarca" /> Crear Nueva Orden de Pedido
                    </h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-rojoMarca transition"><X size={24} /></button>
                </div>

                {/* Body Scrolleable */}
                <div className="p-6 overflow-y-auto flex-1 bg-white">

                    {/* SECCIÓN 1: Buscar Cliente */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">1. Selección de Cliente</h3>
                        <div className="flex gap-3">
                            <form onSubmit={buscarCliente} className="flex-1 flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Cédula o RUC del cliente..."
                                        value={cedulaBusqueda}
                                        onChange={(e) => setCedulaBusqueda(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rojoMarca/20 focus:border-rojoMarca transition"
                                    />
                                </div>
                                <button type="submit" disabled={buscandoCliente} className="px-6 py-3 bg-negro text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 whitespace-nowrap">
                                    {buscandoCliente ? 'Buscando...' : 'Buscar'}
                                </button>
                            </form>
                        </div>

                        {errorCliente && <p className="text-rojoMarca text-sm mt-2 font-medium flex items-center gap-1"><AlertTriangle size={14} /> {errorCliente}</p>}

                        {cliente && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-full text-green-700"><UserCheck size={20} /></div>
                                    <div>
                                        <p className="font-bold text-negro">{cliente.nombres} {cliente.apellidos}</p>
                                        <p className="text-sm text-green-700">C.I: {cliente.cedula_ruc} {cliente.telefono && `• Tel: ${cliente.telefono}`}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN 2: Detalles de la Orden */}
                    <div className={`mb-8 transition-opacity duration-300 ${!cliente ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">2. Prendas y Servicios</h3>

                        {/* Formulario Inline para Detalles */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-3">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
                                <select value={nuevoItem.tipo_item} onChange={(e) => setNuevoItem({ ...nuevoItem, tipo_item: e.target.value })} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm">
                                    <option value="Confección">Confección a Medida</option>
                                    <option value="Arreglo">Arreglo / Ajuste</option>
                                    <option value="Uniforme">Uniforme Corporativo</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
                                <input type="text" placeholder="Ej: Terno azul 3 piezas..." value={nuevoItem.descripcion} onChange={(e) => setNuevoItem({ ...nuevoItem, descripcion: e.target.value })} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Cant.</label>
                                <input type="number" min="1" value={nuevoItem.cantidad} onChange={(e) => setNuevoItem({ ...nuevoItem, cantidad: parseInt(e.target.value) || 1 })} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Precio Un. ($)</label>
                                <input type="number" step="0.01" placeholder="0.00" value={nuevoItem.precio_unitario} onChange={(e) => setNuevoItem({ ...nuevoItem, precio_unitario: e.target.value })} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" />
                            </div>

                            {/* Botones de Acción e Imagen */}
                            <div className="md:col-span-12 flex flex-col sm:flex-row gap-3 mt-2 border-t border-gray-200 pt-3">
                                <div className="flex-1">
                                    <input type="file" id="upload-image" accept="image/*" className="hidden" onChange={handleSubirImagen} />
                                    <label htmlFor="upload-image" className={`cursor-pointer w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition ${nuevoItem.imagen_referencia_url ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                        {subiendoImagen ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                                        {subiendoImagen ? 'Subiendo a la nube...' : nuevoItem.imagen_referencia_url ? 'Imagen Adjuntada' : 'Añadir Foto de Referencia'}
                                    </label>
                                </div>
                                <button type="button" onClick={agregarDetalle} disabled={subiendoImagen} className="w-full sm:w-auto px-6 py-2.5 bg-negro text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2">
                                    <Plus size={18} /> Añadir a la Orden
                                </button>
                            </div>
                        </div>

                        {/* Tabla de Detalles Añadidos */}
                        {detalles.length > 0 && (
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="p-3 font-semibold w-16">Foto</th>
                                            <th className="p-3 font-semibold">Prenda/Servicio</th>
                                            <th className="p-3 font-semibold text-center">Cant.</th>
                                            <th className="p-3 font-semibold text-right">Subtotal</th>
                                            <th className="p-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {detalles.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
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
                                                    <span className="font-medium text-negro">{item.descripcion}</span>
                                                    <span className="block text-xs text-gray-500">{item.tipo_item}</span>
                                                </td>
                                                <td className="p-3 text-center">{item.cantidad}</td>
                                                <td className="p-3 text-right font-medium">${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                                                <td className="p-3 text-right">
                                                    <button onClick={() => eliminarDetalle(index)} className="text-red-400 hover:text-rojoMarca transition"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN 3: Totales y Finalización */}
                    <div className={`transition-opacity duration-300 ${detalles.length === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">3. Condiciones Comerciales</h3>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha de Entrega Estimada</label>
                                    <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-rojoMarca" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Abono Inicial ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="number" step="0.01" min="0" max={subtotal} placeholder="0.00" value={abono} onChange={(e) => setAbono(e.target.value)} className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-rojoMarca text-lg font-bold" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-72 bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col justify-center">
                                <div className="flex justify-between mb-2 text-sm text-gray-600"><span>Subtotal:</span> <span className="font-medium">${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between mb-3 text-sm text-green-700"><span>Abono:</span> <span className="font-medium">-${(parseFloat(abono) || 0).toFixed(2)}</span></div>
                                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span className="font-bold text-negro uppercase tracking-wider text-sm">Saldo:</span>
                                    <span className={`text-2xl font-bold ${saldoCalculado < 0 ? 'text-red-500' : 'text-rojoMarca'}`}>
                                        ${saldoCalculado.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {errorOrden && <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">{errorOrden}</div>}
                    </div>

                </div>

                {/* Footer Modal */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                    <button type="button" onClick={handleClose} className="px-6 py-3 text-negro font-medium hover:bg-gray-200 rounded-lg transition border border-gray-200">Cancelar</button>
                    <button
                        onClick={handleSubmitOrden}
                        disabled={guardando || !cliente || detalles.length === 0 || saldoCalculado < 0}
                        className="px-8 py-3 bg-rojoMarca text-white font-bold rounded-lg hover:bg-red-800 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {guardando ? 'Procesando...' : 'Confirmar Orden'}
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