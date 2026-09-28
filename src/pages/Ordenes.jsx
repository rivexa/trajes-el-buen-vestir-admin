import { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, DollarSign, Clock, CheckCircle, Package, Search, Trash2, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Paginacion from '../components/admin/Paginacion';
import ModalPago from '../components/admin/ModalPago';
import ModalNuevaOrden from '../components/admin/ModalNuevaOrden';
import ModalDetalleOrden from '../components/admin/ModalDetalleOrden';
import ModalEditarOrden from '../components/admin/ModalEditarOrden';
import ModalEliminar from '../components/admin/ModalEliminar';

const API_URL = `${import.meta.env.VITE_API_URL}/ordenes`;

export default function Ordenes() {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const limit = 5;

    const [isPagoOpen, setIsPagoOpen] = useState(false);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [isNuevaOrdenOpen, setIsNuevaOrdenOpen] = useState(false);

    const [isDetalleOpen, setIsDetalleOpen] = useState(false);
    const [ordenIdVer, setOrdenIdVer] = useState(null);

    const [isEditarOpen, setIsEditarOpen] = useState(false);
    const [ordenIdEditar, setOrdenIdEditar] = useState(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [ordenToDelete, setOrdenToDelete] = useState(null);

    const [descargandoPdf, setDescargandoPdf] = useState(null);

    const fetchOrdenes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}?page=${currentPage}&limit=${limit}&search=${searchTerm}`);
            if (response.ok) {
                const result = await response.json();
                setOrdenes(result.data);
                setTotalPages(result.meta.totalPages);
            }
        } catch (error) {
            console.error("Error al cargar órdenes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrdenes();
    }, [currentPage, searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleAbrirPago = (orden) => {
        setOrdenSeleccionada(orden);
        setIsPagoOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`${API_URL}/${ordenToDelete.id}`, { method: 'DELETE' });
            if (response.ok) {
                setIsDeleteOpen(false);
                // Si era el único registro de la página y no es la primera, retrocede
                if (ordenes.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
                else fetchOrdenes();
            } else {
                const err = await response.json();
                alert(err.message || 'Error al eliminar la orden.');
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    const handleCambiarEstadoLista = async (id, nuevoEstado) => {
        try {
            const response = await fetch(`${API_URL}/${id}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (response.ok) {
                fetchOrdenes(); // Refresca la tabla automáticamente
            } else {
                alert('Error al actualizar el estado en el servidor.');
            }
        } catch (error) {
            console.error("Error al cambiar estado:", error);
        }
    };

    const descargarPDFDirecto = async (ordenResumen) => {
        setDescargandoPdf(ordenResumen.id);
        try {
            const response = await fetch(`${API_URL}/${ordenResumen.id}`);
            const ordenFull = await response.json();

            const doc = new jsPDF();
            const numOrden = `ORD-${ordenFull.numero_orden.toString().padStart(4, '0')}`;

            // Datos fijos de la Empresa
            const EMPRESA = {
                ruc: "0501946875001",
                telefono: "099 311 2096",
                direccion: "Quito, Ecuador",
                email: "trajeselbuenvestir@gmail.com"
            };

            // ==========================================
            // 1. CABECERA: Lado Izquierdo (Logo)
            // ==========================================
            try {
                const logoImg = new Image();
                logoImg.src = '/logo.png';
                await new Promise((resolve, reject) => {
                    logoImg.onload = resolve;
                    logoImg.onerror = reject;
                });
                // Dimensiones controladas (Ancho: 45, Alto: 25). Si tu logo es más cuadrado, 
                // puedes probar con 30, 30. Esto evita que se deforme o se vea gigante.
                doc.addImage(logoImg, 'PNG', 14, 12, 45, 25);
            } catch (e) {
                console.warn("Logo no encontrado en /logo.png");
            }

            // ==========================================
            // 2. CABECERA: Lado Derecho (Cuadro de Información)
            // ==========================================
            // Dibujar un cuadro con fondo gris súper claro y bordes redondeados
            doc.setDrawColor(220, 220, 220);
            doc.setFillColor(252, 252, 252);
            doc.roundedRect(110, 12, 86, 25, 2, 2, 'FD'); // x, y, ancho, alto, radioX, radioY, 'Fill & Draw'

            // Número de Orden (Dentro del cuadro, alineado a la derecha)
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(193, 18, 31); // Rojo Marca
            doc.text(numOrden, 190, 20, { align: "right" });

            // Datos Comerciales (Debajo de la orden, alineados a la derecha)
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text(`RUC: ${EMPRESA.ruc}  |  Tel: ${EMPRESA.telefono}`, 190, 27, { align: "right" });
            doc.text(`${EMPRESA.direccion}  |  ${EMPRESA.email}`, 190, 32, { align: "right" });

            // ==========================================
            // 3. INFORMACIÓN GENERAL Y DEL CLIENTE
            // ==========================================
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Información General", 14, 48);

            doc.setDrawColor(220, 220, 220);
            doc.line(14, 50, 196, 50); // Línea separadora

            doc.setFontSize(10);

            // Columna Izquierda: Cliente
            doc.setFont("helvetica", "bold"); doc.text("Cliente:", 14, 58);
            doc.setFont("helvetica", "normal"); doc.text(`${ordenFull.clientes.nombres} ${ordenFull.clientes.apellidos}`, 32, 58);

            doc.setFont("helvetica", "bold"); doc.text("C.I / RUC:", 14, 64);
            doc.setFont("helvetica", "normal"); doc.text(`${ordenFull.clientes.cedula_ruc}`, 35, 64);

            doc.setFont("helvetica", "bold"); doc.text("Teléfono:", 14, 70);
            doc.setFont("helvetica", "normal"); doc.text(`${ordenFull.clientes.telefono || 'N/A'}`, 32, 70);

            // Columna Derecha: Fechas
            doc.setFont("helvetica", "bold"); doc.text("Emisión:", 125, 58);
            doc.setFont("helvetica", "normal"); doc.text(`${new Date(ordenFull.fecha_creacion).toLocaleDateString()}`, 150, 58);

            doc.setFont("helvetica", "bold"); doc.text("Entrega Estimada:", 125, 64);
            doc.setFont("helvetica", "normal"); doc.text(`${ordenFull.fecha_entrega_estimada ? new Date(ordenFull.fecha_entrega_estimada).toLocaleDateString() : 'Por definir'}`, 158, 64);

            // ==========================================
            // 4. TABLA DE PRENDAS
            // ==========================================
            const tableColumn = ["Cant.", "Descripción", "Tipo", "P. Unitario", "Subtotal"];
            const tableRows = ordenFull.orden_detalles.map(item => [
                item.cantidad, item.descripcion, item.tipo_item, `$${item.precio_unitario}`, `$${item.subtotal_linea}`
            ]);

            autoTable(doc, {
                startY: 80,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [20, 20, 20] },
            });

            // ==========================================
            // 5. RESUMEN FINANCIERO
            // ==========================================
            const finalY = doc.lastAutoTable.finalY + 15;
            doc.setFont("helvetica", "bold"); doc.text("RESUMEN FINANCIERO", 140, finalY);
            doc.setFont("helvetica", "normal"); doc.text(`Subtotal:`, 140, finalY + 8); doc.text(`$${ordenFull.subtotal}`, 180, finalY + 8);
            doc.text(`Abono:`, 140, finalY + 16); doc.text(`-$${ordenFull.abono}`, 180, finalY + 16);
            doc.setFont("helvetica", "bold"); doc.text(`SALDO PENDIENTE:`, 140, finalY + 26); doc.setTextColor(193, 18, 31); doc.text(`$${ordenFull.saldo}`, 180, finalY + 26);

            // Nota final en el pie de página
            doc.setTextColor(150, 150, 150); doc.setFontSize(9); doc.setFont("helvetica", "normal");
            doc.text("Gracias por confiar en nosotros. Este documento es un comprobante interno y no tiene validez tributaria.", 14, finalY + 40);

            doc.save(`Comprobante_${numOrden}.pdf`);
        } catch (err) {
            console.error("Error PDF:", err); alert("Error al generar el PDF de esta orden.");
        } finally {
            setDescargandoPdf(null);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col overflow-hidden">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-5">
                    <div className="bg-negro p-3 rounded-lg text-white shadow-md">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-negro">Órdenes de Pedido</h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">Historial de confecciones y pagos pendientes.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsNuevaOrdenOpen(true)}
                    className="w-full md:w-auto bg-rojoMarca hover:bg-red-800 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-md"
                >
                    <Plus size={20} /> Nueva Orden
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
                <Search className="text-rojoMarca" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por N° orden, cédula o cliente..."
                    className="w-full outline-none text-gray-700 bg-transparent"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
                <div className="overflow-x-auto flex-1 no-scrollbar">
                    <table className="min-w-full text-left">
                        <thead className="bg-negro text-white text-sm uppercase tracking-wider">
                            <tr>
                                <th className="p-5 font-semibold text-center">Orden</th>
                                <th className="p-5 font-semibold text-center">Cliente</th>
                                <th className="p-5 font-semibold text-center">Finanzas</th>
                                <th className="p-5 font-semibold text-center">Estado del Pedido</th>
                                <th className="p-5 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ordenes.map((orden) => (
                                <tr key={orden.id} className={`transition-colors ${orden.estado === 'Anulada' ? 'bg-red-50/50 opacity-60 grayscale' : 'hover:bg-gray-50'}`}>
                                    <td className="p-5">
                                        <div className={`font-bold ${orden.estado === 'Anulada' ? 'text-gray-500 line-through' : 'text-negro'}`}>
                                            ORD-{orden.numero_orden.toString().padStart(4, '0')}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{new Date(orden.fecha_creacion).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className={`font-semibold ${orden.estado === 'Anulada' ? 'text-gray-500' : 'text-gray-800'}`}>{orden.clientes?.nombres} {orden.clientes?.apellidos}</div>
                                        <div className="text-sm text-gray-500">{orden.clientes?.cedula_ruc}</div>
                                    </td>
                                    <td className="p-5">
                                        {orden.estado === 'Anulada' ? (
                                            <div className="flex justify-center">
                                                <span className="text-gray-400 font-bold text-lg">-</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1 text-sm mx-auto w-32">
                                                <span className="flex justify-between w-full"><span className="text-gray-500">Total:</span> <span>${orden.subtotal}</span></span>
                                                <span className="flex justify-between w-full font-bold text-rojoMarca"><span className="text-gray-500 font-normal">Saldo:</span> <span>${orden.saldo}</span></span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center">
                                            {orden.estado === 'Anulada' ? (
                                                <span className="text-xs font-bold text-red-500 bg-red-100 px-3 py-1.5 rounded-lg text-center w-full max-w-[160px]">
                                                    ANULADA
                                                </span>
                                            ) : (
                                                <select
                                                    value={orden.estado}
                                                    onChange={(e) => handleCambiarEstadoLista(orden.id, e.target.value)}
                                                    className={`text-sm font-bold border rounded-lg p-2 bg-transparent cursor-pointer outline-none transition w-full max-w-[160px] text-center
                                                        ${orden.estado === 'Pendiente' ? 'text-yellow-700 border-yellow-200 bg-yellow-50' :
                                                        orden.estado === 'En Confección' ? 'text-blue-700 border-blue-200 bg-blue-50' :
                                                        orden.estado === 'Listo para Prueba' ? 'text-purple-700 border-purple-200 bg-purple-50' :
                                                        'text-green-700 border-green-200 bg-green-50'}`}
                                                >
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="En Confección">En Confección</option>
                                                    <option value="Listo para Prueba">Listo para Prueba</option>
                                                    <option value="Entregado">Entregado</option>
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center justify-center gap-1">
                                            {orden.saldo > 0 && orden.estado !== 'Anulada' && (
                                                <button onClick={() => handleAbrirPago(orden)} className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition flex items-center gap-1 mr-2">
                                                    <DollarSign size={14} /> Abonar
                                                </button>
                                            )}

                                            {orden.estado !== 'Anulada' && (
                                                <button onClick={() => descargarPDFDirecto(orden)} disabled={descargandoPdf === orden.id} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Descargar PDF">
                                                    {descargandoPdf === orden.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                                </button>
                                            )}

                                            {orden.estado !== 'Anulada' && (
                                                <button onClick={() => { setOrdenIdEditar(orden.id); setIsEditarOpen(true); }} className="p-2 text-gray-500 hover:text-rojoMarca hover:bg-red-50 rounded-lg transition" title="Editar Orden">
                                                    <Edit2 size={18} />
                                                </button>
                                            )}

                                            <button onClick={() => { setOrdenIdVer(orden.id); setIsDetalleOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Ver Detalle">
                                                <Eye size={18} />
                                            </button>

                                            {orden.estado !== 'Anulada' && (
                                                <button onClick={() => { setOrdenToDelete(orden); setIsDeleteOpen(true); }} className="p-2 text-rojoMarca hover:bg-red-50 rounded-lg transition" title="Anular Orden">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && <Paginacion currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
            </div>

            <ModalPago isOpen={isPagoOpen} onClose={() => setIsPagoOpen(false)} orden={ordenSeleccionada} onSuccess={fetchOrdenes} />
            <ModalNuevaOrden isOpen={isNuevaOrdenOpen} onClose={() => setIsNuevaOrdenOpen(false)} onSuccess={fetchOrdenes} />
            <ModalDetalleOrden isOpen={isDetalleOpen} onClose={() => setIsDetalleOpen(false)} ordenId={ordenIdVer} onSuccess={fetchOrdenes} />
            <ModalEditarOrden isOpen={isEditarOpen} onClose={() => setIsEditarOpen(false)} ordenId={ordenIdEditar} onSuccess={fetchOrdenes} />
            <ModalEliminar isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDeleteConfirm} cliente={ordenToDelete} title="Anular Orden de Pedido" actionText="Sí, Anular Orden" />
        </div>
    );
}