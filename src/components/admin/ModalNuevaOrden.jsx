import React, { useState } from 'react';
import { X, Search, Plus, Trash2, UserCheck, PackagePlus, DollarSign, Image as ImageIcon, Loader2, UserPlus } from 'lucide-react';

const API_CLIENTES = `${import.meta.env.VITE_API_URL}/clientes`;
const API_ORDENES = `${import.meta.env.VITE_API_URL}/ordenes`;

export default function ModalNuevaOrden({ isOpen, onClose, onSuccess }) {
    const [cedulaBusqueda, setCedulaBusqueda] = useState('');
    const [cliente, setCliente] = useState(null);
    const [buscandoCliente, setBuscandoCliente] = useState(false);
    
    // Estados para nuevo cliente inline
    const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
    const [creandoCliente, setCreandoCliente] = useState(false);
    const [datosNuevoCliente, setDatosNuevoCliente] = useState({ nombres: '', apellidos: '', cedula_ruc: '', telefono: '', direccion: '', correo: '' });
    
    const [detalles, setDetalles] = useState([]);
    const [fechaEntrega, setFechaEntrega] = useState('');
    const [abono, setAbono] = useState('');
    
    const [nuevoItem, setNuevoItem] = useState({ tipo_item: 'Confección', descripcion: '', cantidad: 1, precio_unitario: '', imagen_referencia_url: '' });
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [imagenAmpliada, setImagenAmpliada] = useState(null);

    if (!isOpen) return null;

    const resetModal = () => {
        setCedulaBusqueda(''); setCliente(null); setDetalles([]);
        setMostrarFormCliente(false); setDatosNuevoCliente({ nombres: '', apellidos: '', cedula_ruc: '', telefono: '', direccion: '', correo: '' });
        setFechaEntrega(''); setAbono(''); setError('');
        setNuevoItem({ tipo_item: 'Confección', descripcion: '', cantidad: 1, precio_unitario: '', imagen_referencia_url: '' });
    };

    const handleClose = () => { resetModal(); onClose(); };

    const buscarCliente = async (e) => {
        e.preventDefault();
        if (!cedulaBusqueda.trim()) return;
        setBuscandoCliente(true); setError(''); setCliente(null); setMostrarFormCliente(false);

        try {
            const response = await fetch(`${API_CLIENTES}/buscar/${cedulaBusqueda}`);
            if (response.ok) {
                const data = await response.json();
                setCliente(data);
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
            } else {
                const errData = await res.json();
                setError(errData.message || 'Error al registrar cliente.');
            }
        } catch (err) { setError('Error de conexión.'); } 
        finally { setCreandoCliente(false); }
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
                setError('Error al procesar la imagen.');
            }
        } catch (error) { setError('Error de red al subir imagen.'); } 
        finally { setSubiendoImagen(false); }
    };

    const agregarDetalle = () => {
        if (!nuevoItem.descripcion.trim() || nuevoItem.precio_unitario <= 0 || nuevoItem.cantidad <= 0) return;
        setDetalles([...detalles, { ...nuevoItem, precio_unitario: parseFloat(nuevoItem.precio_unitario) }]);
        setNuevoItem({ tipo_item: 'Confección', descripcion: '', cantidad: 1, precio_unitario: '', imagen_referencia_url: '' });
    };

    const eliminarDetalle = (index) => setDetalles(detalles.filter((_, i) => i !== index));
    const subtotal = detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);
    const saldoCalculado = subtotal - (parseFloat(abono) || 0);

    const handleSubmit = async () => {
        if (!cliente) return setError('Selecciona un cliente.');
        if (detalles.length === 0) return setError('Añade al menos una prenda.');
        if (parseFloat(abono) > subtotal) return setError('El abono no puede superar el subtotal.');

        setGuardando(true); setError('');
        try {
            const payload = { cliente_id: cliente.id, fecha_entrega_estimada: fechaEntrega || undefined, abono: parseFloat(abono) || 0, detalles };
            const response = await fetch(API_ORDENES, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (response.ok) { onSuccess(); handleClose(); } 
            else {
                const errData = await response.json();
                setError(errData.message || 'Error al guardar.');
            }
        } catch (err) { setError('Error de conexión.'); } 
        finally { setGuardando(false); }
    };

    return (
        <div className="fixed inset-0 bg-negro/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                    <h2 className="text-xl font-serif font-bold text-negro flex items-center gap-2"><PackagePlus className="text-rojoMarca" /> Nueva Orden de Pedido</h2>
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
                                <h4 className="text-blue-800 font-bold mb-3 flex items-center gap-2"><UserPlus size={18}/> Cliente no encontrado. Regístralo rápidamente:</h4>
                                <form onSubmit={crearCliente} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div><label className="text-xs font-bold text-blue-900">Nombres *</label><input required type="text" value={datosNuevoCliente.nombres} onChange={e=>setDatosNuevoCliente({...datosNuevoCliente, nombres: e.target.value})} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500" /></div>
                                    <div><label className="text-xs font-bold text-blue-900">Apellidos *</label><input required type="text" value={datosNuevoCliente.apellidos} onChange={e=>setDatosNuevoCliente({...datosNuevoCliente, apellidos: e.target.value})} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500" /></div>
                                    <div><label className="text-xs font-bold text-blue-900">Cédula / RUC *</label><input required type="text" value={datosNuevoCliente.cedula_ruc} onChange={e=>setDatosNuevoCliente({...datosNuevoCliente, cedula_ruc: e.target.value})} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500" /></div>
                                    <div><label className="text-xs font-bold text-blue-900">Teléfono</label><input type="text" value={datosNuevoCliente.telefono} onChange={e=>setDatosNuevoCliente({...datosNuevoCliente, telefono: e.target.value})} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500" /></div>
                                    <div className="sm:col-span-2"><label className="text-xs font-bold text-blue-900">Dirección</label><input type="text" value={datosNuevoCliente.direccion} onChange={e=>setDatosNuevoCliente({...datosNuevoCliente, direccion: e.target.value})} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500" /></div>
                                    <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                                        <button type="button" onClick={() => setMostrarFormCliente(false)} className="px-4 py-2 text-sm text-blue-800 hover:bg-blue-100 rounded-lg transition">Cancelar</button>
                                        <button type="submit" disabled={creandoCliente} className="px-5 py-2 text-sm bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition flex items-center gap-2">
                                            {creandoCliente ? <Loader2 size={16} className="animate-spin"/> : 'Guardar y Continuar'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {cliente && (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3 animate-in fade-in">
                                <div className="bg-gray-200 p-2 rounded-full text-gray-600"><UserCheck size={20} /></div>
                                <div><p className="font-bold text-negro">{cliente.nombres} {cliente.apellidos}</p><p className="text-sm text-gray-600">C.I: {cliente.cedula_ruc}</p></div>
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN 2: Prendas */}
                    <div className={`transition-opacity ${!cliente ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">2. Prendas y Servicios</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-3"><label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label><select value={nuevoItem.tipo_item} onChange={(e) => setNuevoItem({...nuevoItem, tipo_item: e.target.value})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm"><option value="Confección">Confección a Medida</option><option value="Arreglo">Arreglo / Ajuste</option><option value="Uniforme">Uniforme Corporativo</option><option value="Otro">Otro</option></select></div>
                            <div className="md:col-span-4"><label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label><input type="text" value={nuevoItem.descripcion} onChange={(e) => setNuevoItem({...nuevoItem, descripcion: e.target.value})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" /></div>
                            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Cant.</label><input type="number" min="1" value={nuevoItem.cantidad} onChange={(e) => setNuevoItem({...nuevoItem, cantidad: parseInt(e.target.value) || 1})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" /></div>
                            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Precio Un. ($)</label><input type="number" step="0.01" value={nuevoItem.precio_unitario} onChange={(e) => setNuevoItem({...nuevoItem, precio_unitario: e.target.value})} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rojoMarca text-sm" /></div>
                            <div className="md:col-span-12 flex gap-3 mt-2 border-t border-gray-200 pt-3">
                                <div className="flex-1">
                                    <input type="file" id="upload-image" accept="image/*" className="hidden" onChange={handleSubirImagen} />
                                    <label htmlFor="upload-image" className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition ${nuevoItem.imagen_referencia_url ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                        {subiendoImagen ? <Loader2 size={18} className="animate-spin"/> : <ImageIcon size={18} />} {subiendoImagen ? 'Subiendo...' : nuevoItem.imagen_referencia_url ? 'Imagen Lista' : 'Añadir Foto'}
                                    </label>
                                </div>
                                <button type="button" onClick={agregarDetalle} disabled={subiendoImagen} className="px-6 py-2.5 bg-negro text-white font-medium rounded-lg hover:bg-gray-800 flex items-center gap-2"><Plus size={18} /> Añadir</button>
                            </div>
                        </div>

                        {detalles.length > 0 && (
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600"><tr><th className="p-3">Foto</th><th className="p-3">Prenda/Servicio</th><th className="p-3 text-center">Cant.</th><th className="p-3 text-right">Subtotal</th><th className="p-3"></th></tr></thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {detalles.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="p-3">
                                                    {item.imagen_referencia_url ? <img src={item.imagen_referencia_url} alt="Ref" className="w-10 h-10 object-cover rounded-md cursor-pointer hover:opacity-80" onClick={() => setImagenAmpliada(item.imagen_referencia_url)} /> : <div className="w-10 h-10 bg-gray-100 rounded-md border text-gray-400 text-xs flex items-center justify-center">N/A</div>}
                                                </td>
                                                <td className="p-3"><span className="font-medium text-negro block">{item.descripcion}</span><span className="text-xs text-gray-500">{item.tipo_item}</span></td>
                                                <td className="p-3 text-center">{item.cantidad}</td>
                                                <td className="p-3 text-right font-medium">${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                                                <td className="p-3 text-right"><button onClick={() => eliminarDetalle(index)} className="text-red-400 hover:text-rojoMarca"><Trash2 size={16} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN 3: Finanzas */}
                    <div className={`transition-opacity ${detalles.length === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-2">3. Condiciones Comerciales</h3>
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-4">
                                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Fecha de Entrega Estimada</label><input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-rojoMarca" /></div>
                                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Abono Inicial ($)</label><div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="number" step="0.01" min="0" value={abono} onChange={(e) => setAbono(e.target.value)} className="w-full pl-8 pr-4 py-3 bg-gray-50 border rounded-lg outline-none focus:border-rojoMarca font-bold" /></div></div>
                            </div>
                            <div className="w-full md:w-72 bg-gray-50 p-5 rounded-xl border flex flex-col justify-center">
                                <div className="flex justify-between mb-2 text-sm text-gray-600"><span>Subtotal:</span> <span className="font-medium">${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between mb-3 text-sm text-green-700"><span>Abono:</span> <span className="font-medium">-${(parseFloat(abono) || 0).toFixed(2)}</span></div>
                                <div className="pt-3 border-t flex justify-between items-center"><span className="font-bold text-negro uppercase text-sm">Saldo:</span><span className={`text-2xl font-bold ${saldoCalculado < 0 ? 'text-red-500' : 'text-rojoMarca'}`}>${saldoCalculado.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 bg-gray-50 shrink-0 gap-4">
                    <div className="w-full sm:w-auto text-center sm:text-left text-red-600 font-medium text-sm">{error}</div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={handleClose} className="flex-1 sm:flex-none px-6 py-3 text-negro font-medium hover:bg-gray-200 rounded-lg transition border">Cancelar</button>
                        <button onClick={handleSubmit} disabled={guardando || detalles.length === 0 || saldoCalculado < 0 || !cliente} className="flex-1 sm:flex-none px-8 py-3 bg-rojoMarca text-white font-bold rounded-lg hover:bg-red-800 disabled:opacity-50">
                            {guardando ? 'Guardando...' : 'Crear Orden'}
                        </button>
                    </div>
                </div>
            </div>

            {imagenAmpliada && (
                <div className="fixed inset-0 z-[70] bg-negro/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setImagenAmpliada(null)}>
                    <button className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 rounded-full p-2"><X size={24} /></button>
                    <img src={imagenAmpliada} alt="Ref Ampliada" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}