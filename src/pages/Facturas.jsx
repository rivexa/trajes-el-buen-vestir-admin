import { useState, useEffect } from 'react';
import { Receipt, Search, FileText, Download } from 'lucide-react';
import Paginacion from '../components/admin/Paginacion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = `${import.meta.env.VITE_API_URL}/facturas`;

export default function Facturas() {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const limit = 10;

    const fetchFacturas = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}?page=${currentPage}&limit=${limit}&search=${searchTerm}`);
            if (response.ok) {
                const result = await response.json();
                setFacturas(result.data);
                setTotalPages(result.meta.totalPages);
            }
        } catch (error) {
            console.error("Error al cargar facturas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFacturas();
    }, [currentPage, searchTerm]);

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-5">
                    <div className="bg-negro p-3 rounded-lg text-white shadow-md">
                        <Receipt size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-negro">Facturación</h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">Historial de facturas emitidas y gestión contable.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
                <Search className="text-rojoMarca" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por cédula o nombre del cliente..."
                    className="w-full outline-none text-gray-700 bg-transparent"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
                <div className="overflow-x-auto flex-1 no-scrollbar">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-negro text-white uppercase tracking-wider">
                            <tr>
                                <th className="p-5 font-semibold text-center">N° Factura</th>
                                <th className="p-5 font-semibold text-center">Cliente</th>
                                <th className="p-5 font-semibold text-center">Orden Asociada</th>
                                <th className="p-5 font-semibold text-center">Desglose Financiero</th>
                                <th className="p-5 font-semibold text-center">Total</th>
                                <th className="p-5 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {facturas.map((fac) => (
                                <tr key={fac.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-5 text-center font-bold text-negro">
                                        FAC-{fac.numero_factura?.toString().padStart(5, '0')}
                                        <div className="text-xs text-gray-500 font-normal mt-1">{new Date(fac.fecha_emision).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="font-semibold text-gray-800">{fac.clientes?.nombres} {fac.clientes?.apellidos}</div>
                                        <div className="text-xs text-gray-500">{fac.clientes?.cedula_ruc}</div>
                                    </td>
                                    <td className="p-5 text-center font-medium text-gray-600">
                                        ORD-{fac.ordenes_pedido?.numero_orden?.toString().padStart(4, '0')}
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="flex flex-col gap-1 mx-auto w-32 text-xs">
                                            <span className="flex justify-between w-full"><span className="text-gray-500">Subtotal:</span> <span>${fac.subtotal}</span></span>
                                            <span className="flex justify-between w-full"><span className="text-gray-500">IVA (15%):</span> <span>${fac.iva}</span></span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center font-bold text-rojoMarca text-base">
                                        ${fac.total}
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Descargar PDF (Próximamente)">
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && <Paginacion currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
            </div>
        </div>
    );
}