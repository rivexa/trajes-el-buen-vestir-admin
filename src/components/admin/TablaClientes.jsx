import { CreditCard, Edit2, Mail, MapPin, Phone, Trash2 } from 'lucide-react';
import Paginacion from './Paginacion';

export default function TablaClientes({
    clientes,
    loading,
    error,
    currentPage,
    totalPages,
    onPageChange,
    onEditar,
    onEliminar,
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
            <div className="overflow-x-auto flex-1 no-scrollbar">
                <table className="min-w-full text-left border-collapse whitespace-nowrap table-fixed">
                    <thead>
                        <tr className="bg-negro text-white text-sm uppercase tracking-wider">
                            <th className="p-5 font-semibold w-[35%]">Cliente</th>
                            <th className="p-5 font-semibold w-[20%]">Identificación</th>
                            <th className="p-5 font-semibold w-[25%]">Contacto</th>
                            <th className="p-5 font-semibold text-center w-[20%]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-medium">Consultando base de datos...</td></tr>
                        ) : error ? (
                            <tr><td colSpan="4" className="p-8 text-center text-red-600 font-medium">{error}</td></tr>
                        ) : clientes.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-medium">No se encontraron clientes.</td></tr>
                        ) : (
                            clientes.map((cliente) => (
                                <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-5">
                                        <div className="font-bold text-negro">{cliente.nombres} {cliente.apellidos}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14} className="text-rojoMarca" /> {cliente.direccion || 'Sin dirección'}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2"><CreditCard size={16} className="text-gray-400" /> {cliente.cedula_ruc}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-1 text-sm">
                                            <span className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {cliente.telefono || '-'}</span>
                                            <span className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {cliente.correo || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <button type="button" onClick={() => onEditar(cliente)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                                                <Edit2 size={18} />
                                            </button>
                                            <button type="button" onClick={() => onEliminar(cliente)} className="p-2 text-rojoMarca hover:bg-red-50 rounded-lg transition" title="Eliminar">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && !error && (
                <Paginacion currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
            )}
        </div>
    );
}
