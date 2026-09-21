import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import Paginacion from '../components/admin/Paginacion';
import ModalEliminar from '../components/admin/ModalEliminar';
import ModalFormulario from '../components/admin/ModalFormulario';

const API_URL = `${import.meta.env.VITE_API_URL}/clientes`;

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [clienteEdicion, setClienteEdicion] = useState(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState(null);

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}?page=${currentPage}&limit=${limit}&search=${searchTerm}`);
            if (response.ok) {
                const result = await response.json();
                setClientes(result.data);
                setTotalPages(result.meta.totalPages);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, [currentPage, searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleOpenForm = (cliente = null) => {
        setClienteEdicion(cliente);
        setIsFormOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`${API_URL}/${clienteToDelete.id}`, { method: 'DELETE' });
            if (response.ok) {
                setIsDeleteOpen(false);
                if (clientes.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
                else fetchClientes();
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col overflow-hidden">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-5">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-negro">Directorio de Clientes</h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">Gestión de facturación y toma de medidas.</p>
                    </div>
                </div>
                <button onClick={() => handleOpenForm()} className="w-full md:w-auto bg-rojoMarca hover:bg-red-800 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-md">
                    <Plus size={20} /> Nuevo Cliente
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
                <Search className="text-rojoMarca" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por cédula, RUC o nombre..."
                    className="w-full outline-none text-gray-700 bg-transparent"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
                <div className="overflow-x-auto flex-1 no-scrollbar">
                    <table className="min-w-full text-left border-collapse whitespace-nowrap table-fixed">
                        <thead>
                            <tr className="bg-negro text-white text-sm uppercase tracking-wider">
                                <th className="p-5 font-semibold w-[35%]">Cliente</th>
                                <th className="p-5 font-semibold w-[20%]">Identificación</th>
                                <th className="p-5 font-semibold w-[25%]">Contacto</th>
                                <th className="p-5 font-semibold text-right w-[20%]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-medium">Consultando base de datos...</td></tr>
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
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => handleOpenForm(cliente)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => { setClienteToDelete(cliente); setIsDeleteOpen(true); }} className="p-2 text-rojoMarca hover:bg-red-50 rounded-lg transition" title="Eliminar">
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

                {!loading && <Paginacion currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
            </div>

            <ModalFormulario isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmitSuccess={fetchClientes} clienteEdicion={clienteEdicion} />
            <ModalEliminar isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDeleteConfirm} cliente={clienteToDelete} />

        </div>
    );
}