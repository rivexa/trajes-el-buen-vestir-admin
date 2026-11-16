import { useState, useEffect, useCallback } from 'react';
import { Eye, Edit2, DollarSign, Package, Trash2, Download, Loader2 } from 'lucide-react';
import { FilasSkeletonTabla } from '../components/admin/Skeleton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import BarraBusqueda from '../components/admin/BarraBusqueda';
import EncabezadoPagina from '../components/admin/EncabezadoPagina';
import FiltrosOrdenes from '../components/admin/FiltrosOrdenes';
import Paginacion from '../components/admin/Paginacion';
import ModalPago from '../components/admin/ModalPago';
import ModalNuevaOrden from '../components/admin/ModalNuevaOrden';
import ModalDetalleOrden from '../components/admin/ModalDetalleOrden';
import ModalEditarOrden from '../components/admin/ModalEditarOrden';
import ModalEliminar from '../components/admin/ModalEliminar';
import { fetchApi } from '../lib/apiBase';
import {
    claseEstadoDetalle,
    ordenAnulada,
    proximaFechaEntrega,
    resumenEstadosLineas,
} from '../utils/ordenDominio';

const API_URL = `${import.meta.env.VITE_API_URL}/ordenes`;

const FILTROS_INICIALES = {
    estado: '',
    desde: '',
    hasta: '',
    sort: 'fecha_creacion',
    order: 'desc',
};

export default function Ordenes() {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtros, setFiltros] = useState(FILTROS_INICIALES);
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

    const fetchOrdenes = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(limit),
                sort: filtros.sort,
                order: filtros.order,
            });
            if (searchTerm) params.set('search', searchTerm);
            if (filtros.estado) params.set('estado', filtros.estado);
            if (filtros.desde) params.set('desde', filtros.desde);
            if (filtros.hasta) params.set('hasta', filtros.hasta);

            const response = await fetchApi(`${API_URL}?${params.toString()}`);
            if (response.ok) {
                const result = await response.json();
                setOrdenes(result.data || []);
                setTotalPages(result.meta?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filtros]);

    useEffect(() => {
        fetchOrdenes();
    }, [fetchOrdenes]);

    const handleSearchChange = (valor) => {
        setSearchTerm(valor);
        setCurrentPage(1);
    };

    const handleFiltrosChange = (siguiente) => {
        setFiltros(siguiente);
        setCurrentPage(1);
    };

    const handleAbrirPago = (orden) => {
        setOrdenSeleccionada(orden);
        setIsPagoOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetchApi(`${API_URL}/${ordenToDelete.id}`, { method: 'DELETE' });
            if (response.ok) {
                setIsDeleteOpen(false);
                if (ordenes.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
                else fetchOrdenes();
            } else {
                const err = await response.json();
                alert(err.message || 'Error al anular la orden.');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
        }
    };

    const descargarPDFDirecto = async (ordenResumen) => {
        setDescargandoPdf(ordenResumen.id);
        try {
            const response = await fetchApi(`${API_URL}/${ordenResumen.id}`);
            const ordenFull = await response.json();

            const doc = new jsPDF();
            const numOrden = `ORD-${ordenFull.numero_orden.toString().padStart(4, '0')}`;
            const EMPRESA = {
                ruc: '0501946875001',
                telefono: '099 311 2096',
                direccion: 'Quito, Ecuador',
                email: 'trajeselbuenvestir@gmail.com',
            };

            try {
                const logoImg = new Image();
                logoImg.src = '/logo.png';
                await new Promise((resolve, reject) => {
                    logoImg.onload = resolve;
                    logoImg.onerror = reject;
                });
                doc.addImage(logoImg, 'PNG', 14, 12, 45, 25);
            } catch {
                console.warn('Logo no encontrado en /logo.png');
            }

            doc.setDrawColor(220, 220, 220);
            doc.setFillColor(252, 252, 252);
            doc.roundedRect(110, 12, 86, 25, 2, 2, 'FD');

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(193, 18, 31);
            doc.text(numOrden, 190, 20, { align: 'right' });

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(`RUC: ${EMPRESA.ruc}  |  Tel: ${EMPRESA.telefono}`, 190, 27, { align: 'right' });
            doc.text(`${EMPRESA.direccion}  |  ${EMPRESA.email}`, 190, 32, { align: 'right' });

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Información General', 14, 48);
            doc.setDrawColor(220, 220, 220);
            doc.line(14, 50, 196, 50);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold'); doc.text('Cliente:', 14, 58);
            doc.setFont('helvetica', 'normal'); doc.text(`${ordenFull.clientes.nombres} ${ordenFull.clientes.apellidos}`, 32, 58);
            doc.setFont('helvetica', 'bold'); doc.text('C.I / RUC:', 14, 64);
            doc.setFont('helvetica', 'normal'); doc.text(`${ordenFull.clientes.cedula_ruc}`, 35, 64);
            doc.setFont('helvetica', 'bold'); doc.text('Teléfono:', 14, 70);
            doc.setFont('helvetica', 'normal'); doc.text(`${ordenFull.clientes.telefono || 'N/A'}`, 32, 70);

            doc.setFont('helvetica', 'bold'); doc.text('Emisión:', 125, 58);
            doc.setFont('helvetica', 'normal'); doc.text(`${new Date(ordenFull.fecha_creacion).toLocaleDateString()}`, 150, 58);

            const tableColumn = ['Cant.', 'Descripción', 'Tipo', 'Estado', 'Entrega', 'Subtotal'];
            const tableRows = (ordenFull.orden_detalles || []).map((item) => [
                item.cantidad,
                item.descripcion,
                item.tipo_item,
                item.estado || '—',
                item.fecha_entrega
                    ? new Date(`${String(item.fecha_entrega).slice(0, 10)}T12:00:00`).toLocaleDateString()
                    : '—',
                `$${item.subtotal_linea ?? (item.cantidad * item.precio_unitario).toFixed(2)}`,
            ]);

            autoTable(doc, {
                startY: 80,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [20, 20, 20] },
            });

            const finalY = doc.lastAutoTable.finalY + 15;
            doc.setFont('helvetica', 'bold'); doc.text('RESUMEN FINANCIERO', 140, finalY);
            doc.setFont('helvetica', 'normal'); doc.text('Subtotal:', 140, finalY + 8); doc.text(`$${ordenFull.subtotal}`, 180, finalY + 8);
            doc.text('Abono:', 140, finalY + 16); doc.text(`-$${ordenFull.abono}`, 180, finalY + 16);
            doc.setFont('helvetica', 'bold'); doc.text('SALDO PENDIENTE:', 140, finalY + 26);
            doc.setTextColor(193, 18, 31); doc.text(`$${ordenFull.saldo}`, 180, finalY + 26);

            doc.setTextColor(150, 150, 150); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
            doc.text('Gracias por confiar en nosotros. Este documento es un comprobante interno y no tiene validez tributaria.', 14, finalY + 40);

            doc.save(`Comprobante_${numOrden}.pdf`);
        } catch (err) {
            console.error('Error PDF:', err);
            alert('Error al generar el PDF de esta orden.');
        } finally {
            setDescargandoPdf(null);
        }
    };

    return (
        <div className="pagina-admin">
            <EncabezadoPagina
                icon={Package}
                title="Órdenes de Pedido"
                subtitle="Productos y servicios con estado y entrega por línea."
                actionLabel="Nueva Orden"
                onAction={() => setIsNuevaOrdenOpen(true)}
            />

            <BarraBusqueda
                label="Buscar órdenes"
                placeholder="Buscar por N° orden, cédula o cliente..."
                value={searchTerm}
                onChange={handleSearchChange}
            />

            <FiltrosOrdenes
                {...filtros}
                onChange={handleFiltrosChange}
                onLimpiar={() => handleFiltrosChange(FILTROS_INICIALES)}
            />

            <div className="card-panel flex flex-col flex-1 overflow-hidden">
                <div className="overflow-x-auto flex-1">
                    <table className="min-w-[1040px] w-full table-fixed text-left whitespace-nowrap">
                        <colgroup>
                            <col className="w-[14%]" />
                            <col className="w-[20%]" />
                            <col className="w-[14%]" />
                            <col className="w-[14%]" />
                            <col className="w-[18%]" />
                            <col className="w-[20%]" />
                        </colgroup>
                        <thead className="thead-marca">
                            <tr>
                                <th>Orden</th>
                                <th>Cliente</th>
                                <th className="text-center">Finanzas</th>
                                <th className="text-center">Próx. entrega</th>
                                <th className="text-center">Estados</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-negro/5">
                            {loading ? (
                                <FilasSkeletonTabla filas={5} celdas={6} variante="ordenes" etiqueta="Cargando órdenes" />
                            ) : ordenes.length === 0 ? (
                                <tr><td colSpan="6" className="p-12 text-center text-gray-500 font-medium">No se encontraron órdenes.</td></tr>
                            ) : ordenes.map((orden) => {
                                const anulada = ordenAnulada(orden);
                                const resumen = resumenEstadosLineas(orden);
                                const proxima = proximaFechaEntrega(orden);

                                return (
                                    <tr key={orden.id} className={`${anulada ? 'bg-red-50/50 opacity-60 grayscale' : 'fila-tabla'}`}>
                                        <td className="p-4">
                                            <div className={`font-bold ${anulada ? 'text-gray-500 line-through' : 'text-negro'}`}>
                                                ORD-{orden.numero_orden.toString().padStart(4, '0')}
                                            </div>
                                            <div className="text-[15px] text-gray-500 mt-1">{new Date(orden.fecha_creacion).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`font-semibold ${anulada ? 'text-gray-500' : 'text-gray-800'}`}>{orden.clientes?.nombres} {orden.clientes?.apellidos}</div>
                                            <div className="text-[15px] text-gray-500">{orden.clientes?.cedula_ruc}</div>
                                        </td>
                                        <td className="p-4">
                                            {anulada ? (
                                                <div className="flex justify-center"><span className="text-gray-400 font-bold text-lg">-</span></div>
                                            ) : (
                                                <div className="flex flex-col gap-1 text-[15px] mx-auto w-32">
                                                    <span className="flex justify-between w-full"><span className="text-gray-500">Total:</span> <span>${orden.subtotal}</span></span>
                                                    <span className="flex justify-between w-full font-bold text-rojoMarca"><span className="text-gray-500 font-normal">Saldo:</span> <span>${orden.saldo}</span></span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center text-[15px] text-grisMarca">
                                            {proxima
                                                ? new Date(`${proxima}T12:00:00`).toLocaleDateString()
                                                : '—'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center">
                                                {anulada ? (
                                                    <span className={`text-[15px] font-bold px-4 py-2.5 rounded-xl border ${claseEstadoDetalle('Anulada')}`}>
                                                        ANULADA
                                                    </span>
                                                ) : resumen.mixto ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => { setOrdenIdVer(orden.id); setIsDetalleOpen(true); }}
                                                        className="text-[14px] font-semibold text-grisMarca bg-plomoSuave px-3 py-2 rounded-xl border border-negro/10 hover:border-rojoMarca/30"
                                                        title={resumen.estados.join(', ')}
                                                    >
                                                        {resumen.etiqueta}
                                                        <span className="block text-[12px] font-normal text-grisMarca/70 mt-0.5">
                                                            Ver líneas
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <span className={`text-[14px] font-semibold px-3 py-2 rounded-xl border ${claseEstadoDetalle(resumen.etiqueta)}`}>
                                                        {resumen.etiqueta}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className="w-[6.75rem] shrink-0 mr-1 flex items-center">
                                                    {orden.saldo > 0 && !anulada ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAbrirPago(orden)}
                                                            className="w-full justify-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-[15px] font-medium transition inline-flex items-center gap-1"
                                                        >
                                                            <DollarSign size={14} /> Abonar
                                                        </button>
                                                    ) : (
                                                        <span className="block w-full h-[2.125rem]" aria-hidden="true" />
                                                    )}
                                                </div>

                                                {!anulada && (
                                                    <button type="button" onClick={() => descargarPDFDirecto(orden)} disabled={descargandoPdf === orden.id} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Descargar PDF">
                                                        {descargandoPdf === orden.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                                    </button>
                                                )}

                                                {!anulada && (
                                                    <button type="button" onClick={() => { setOrdenIdEditar(orden.id); setIsEditarOpen(true); }} className="p-2 text-gray-500 hover:text-rojoMarca hover:bg-red-50 rounded-lg transition" title="Editar Orden">
                                                        <Edit2 size={18} />
                                                    </button>
                                                )}

                                                <button type="button" onClick={() => { setOrdenIdVer(orden.id); setIsDetalleOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Ver Detalle">
                                                    <Eye size={18} />
                                                </button>

                                                {!anulada && (
                                                    <button type="button" onClick={() => { setOrdenToDelete(orden); setIsDeleteOpen(true); }} className="p-2 text-rojoMarca hover:bg-red-50 rounded-lg transition" title="Anular Orden">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
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
