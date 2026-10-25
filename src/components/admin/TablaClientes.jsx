import { CreditCard, Edit2, Mail, MapPin, Phone, Trash2, Users } from 'lucide-react';
import iniciales from '../../utils/iniciales';
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
        <div className="card-panel flex flex-col flex-1 overflow-hidden">
            <div className="overflow-x-auto flex-1">
                <table className="min-w-full text-left border-collapse whitespace-nowrap">
                    <thead className="thead-marca">
                        <tr>
                            <th className="w-[38%]">Cliente</th>
                            <th className="w-[20%]">Identificación</th>
                            <th className="w-[24%]">Contacto</th>
                            <th className="text-center w-[18%]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-negro/5 text-base text-grisMarca">
                        {loading ? (
                            <tr><td colSpan="4" className="p-12 text-center text-gray-500 font-medium">Consultando base de datos...</td></tr>
                        ) : error ? (
                            <tr><td colSpan="4" className="p-12 text-center text-rojoMarca font-medium">{error}</td></tr>
                        ) : clientes.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-12 text-center">
                                    <Users className="mx-auto mb-3 text-gray-300" size={28} />
                                    <p className="text-gray-500 font-medium">No se encontraron clientes.</p>
                                </td>
                            </tr>
                        ) : (
                            clientes.map((cliente) => (
                                <tr key={cliente.id} className="hover:bg-grisClaro/70 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-negro text-[13px] font-semibold tracking-wide text-white">
                                                {iniciales(cliente.nombres, cliente.apellidos)}
                                            </span>
                                            <div>
                                                <div className="font-semibold text-negro">{cliente.nombres} {cliente.apellidos}</div>
                                                <div className="text-[15px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <MapPin size={14} className="text-rojoMarca" /> {cliente.direccion || 'Sin dirección'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 tabular-nums"><CreditCard size={15} className="text-gray-400" /> {cliente.cedula_ruc}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 text-[15px]">
                                            <span className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {cliente.telefono || '-'}</span>
                                            <span className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {cliente.correo || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button type="button" onClick={() => onEditar(cliente)} className="btn-icono" title="Editar">
                                                <Edit2 size={17} />
                                            </button>
                                            <button type="button" onClick={() => onEliminar(cliente)} className="btn-icono-peligro" title="Eliminar">
                                                <Trash2 size={17} />
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
