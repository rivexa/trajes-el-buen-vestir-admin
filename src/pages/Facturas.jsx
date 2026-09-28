import { useState, useEffect } from 'react';
import { Receipt, Search, Download, Plus, Trash2, Eye, Loader2, AlertCircle } from 'lucide-react';
import Paginacion from '../components/admin/Paginacion';
import ModalNuevaFactura from '../components/admin/ModalNuevaFactura';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = `${import.meta.env.VITE_API_URL}/facturacion`;

export default function Facturas() {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const limit = 10;

    const [isFacturaOpen, setIsFacturaOpen] = useState(false);
    const [procesandoAccion, setProcesandoAccion] = useState(null);

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

    useEffect(() => { fetchFacturas(); }, [currentPage, searchTerm]);

    const handleAnular = async (factura) => {
        if (!window.confirm(`¿Estás seguro de anular la factura FAC-${factura.secuencial_local?.toString().padStart(5, '0')}? Esto liberará la orden de pedido asociada.`)) return;

        setProcesandoAccion(factura.id);
        try {
            const response = await fetch(`${API_URL}/${factura.id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchFacturas();
            } else {
                alert('Error al anular la factura.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcesandoAccion(null);
        }
    };

    // GENERADOR OFICIAL DE RIDE SRI
    const generarRIDE = async (facturaResumen) => {
        setProcesandoAccion(`pdf-${facturaResumen.id}`);
        try {
            // 1. Obtener detalles completos
            const response = await fetch(`${API_URL}/${facturaResumen.id}`);
            const fac = await response.json();

            const doc = new jsPDF();
            const numFactura = `${fac.numero_factura_sri || fac.secuencial_local?.toString().padStart(9, '0')}`;
            const claveAcceso = fac.clave_acceso_sri || '1234567890123456789012345678901234567890123456789'; // Simulación si está en error

            const EMPRESA = {
                razonSocial: "SARMIENTO CAILLAGUA NESTOR DAVID",
                nombreComercial: "Trajes El Buen Vestir",
                ruc: "1753329182001",
                dirMatriz: "Quito, Ecuador",
                obligadoContabilidad: "NO"
            };

            // --- LADO IZQUIERDO (Logo y Datos Empresa) ---
            try {
                const logoImg = new Image();
                logoImg.src = '/logo.png';
                await new Promise((resolve, reject) => { logoImg.onload = resolve; logoImg.onerror = reject; });
                doc.addImage(logoImg, 'PNG', 14, 12, 60, 30);
            } catch (e) { console.warn("Sin logo"); }

            doc.setDrawColor(150);
            doc.roundedRect(14, 45, 90, 45, 2, 2);
            doc.setFontSize(9); doc.setFont("helvetica", "bold");
            doc.text(EMPRESA.razonSocial, 16, 51);
            doc.setFont("helvetica", "normal"); doc.setFontSize(8);
            doc.text(`Dir Matriz: ${EMPRESA.dirMatriz}`, 16, 57);
            doc.text(`OBLIGADO A LLEVAR CONTABILIDAD: ${EMPRESA.obligadoContabilidad}`, 16, 63);

            // --- LADO DERECHO (Datos SRI) ---
            doc.roundedRect(108, 12, 88, 78, 2, 2);
            doc.setFontSize(11); doc.setFont("helvetica", "bold");
            doc.text(`R.U.C.: ${EMPRESA.ruc}`, 112, 20);
            doc.setFontSize(14); doc.setTextColor(193, 18, 31);
            doc.text("F A C T U R A", 112, 28);
            doc.setTextColor(0); doc.setFontSize(10);
            doc.text(`No. 001-001-${numFactura}`, 112, 36);

            doc.setFontSize(8); doc.setFont("helvetica", "normal");
            doc.text("NÚMERO DE AUTORIZACIÓN", 112, 44);
            doc.setFont("helvetica", "bold");
            doc.text(claveAcceso, 112, 50);

            doc.setFont("helvetica", "normal");
            doc.text(`FECHA Y HORA DE AUTORIZACIÓN: ${new Date(fac.fecha_emision).toLocaleString()}`, 112, 58);
            doc.text(`AMBIENTE: ${import.meta.env.VITE_SRI_ENV === 'produccion' ? 'PRODUCCIÓN' : 'PRUEBAS'}`, 112, 64);
            doc.text("EMISIÓN: NORMAL", 112, 70);
            doc.text("CLAVE DE ACCESO", 112, 78);
            // Aquí iría el código de barras en un sistema real, por ahora imprimimos el texto
            doc.text(claveAcceso, 112, 84);

            // --- DATOS DEL CLIENTE ---
            doc.roundedRect(14, 95, 182, 20, 2, 2);
            doc.setFontSize(9); doc.setFont("helvetica", "bold");
            doc.text(`Razón Social / Nombres y Apellidos:`, 16, 101);
            doc.setFont("helvetica", "normal");
            doc.text(`${fac.clientes.nombres} ${fac.clientes.apellidos}`, 75, 101);

            doc.setFont("helvetica", "bold"); doc.text(`Identificación:`, 140, 101);
            doc.setFont("helvetica", "normal"); doc.text(fac.clientes.cedula_ruc, 165, 101);

            doc.setFont("helvetica", "bold"); doc.text(`Fecha Emisión:`, 16, 109);
            doc.setFont("helvetica", "normal"); doc.text(new Date(fac.fecha_emision).toLocaleDateString(), 45, 109);

            doc.setFont("helvetica", "bold"); doc.text(`Dirección:`, 140, 109);
            doc.setFont("helvetica", "normal"); doc.text(fac.clientes.direccion || 'N/A', 160, 109);

            // --- TABLA DE DETALLES ---
            const tableColumn = ["Cod. Principal", "Cant", "Descripción", "Precio Unitario", "Descuento", "Precio Total"];
            const tableRows = fac.factura_detalles.map((item, i) => [
                `P-${(i + 1).toString().padStart(3, '0')}`,
                item.cantidad,
                item.descripcion,
                item.precio_unitario,
                "0.00",
                (item.cantidad * item.precio_unitario).toFixed(2)
            ]);

            autoTable(doc, {
                startY: 120,
                head: [tableColumn],
                body: tableRows,
                theme: 'plain',
                styles: { fontSize: 8, cellPadding: 1, lineColor: [150, 150, 150], lineWidth: 0.1 },
                headStyles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
            });

            // --- TOTALES Y RESUMEN ---
            const finalY = doc.lastAutoTable.finalY + 5;

            // Información Adicional
            doc.roundedRect(14, finalY, 100, 30, 2, 2);
            doc.setFont("helvetica", "bold"); doc.text("Información Adicional", 16, finalY + 5);
            doc.setFont("helvetica", "normal");
            doc.text(`Email: ${fac.clientes.correo || 'N/A'}`, 16, finalY + 12);
            doc.text(`Teléfono: ${fac.clientes.telefono || 'N/A'}`, 16, finalY + 18);
            doc.text(`Forma de Pago: ${fac.metodo_pago}`, 16, finalY + 24);

            // Tabla de Totales
            autoTable(doc, {
                startY: finalY,
                margin: { left: 120 },
                theme: 'plain',
                styles: { fontSize: 8, cellPadding: 2, lineColor: [150, 150, 150], lineWidth: 0.1 },
                body: [
                    ['SUBTOTAL 15%', '0.00'],
                    ['SUBTOTAL 0%', fac.subtotal_factura],
                    ['SUBTOTAL No objeto de IVA', '0.00'],
                    ['SUBTOTAL Exento de IVA', '0.00'],
                    ['SUBTOTAL SIN IMPUESTOS', fac.subtotal_factura],
                    ['TOTAL Descuento', '0.00'],
                    ['IVA 15%', '0.00'],
                    ['VALOR TOTAL', fac.total_factura]
                ],
                columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
            });

            doc.save(`RIDE_${numFactura}.pdf`);
        } catch (err) {
            console.error(err); alert("Error al generar el RIDE.");
        } finally {
            setProcesandoAccion(null);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-5">
                    <div className="bg-negro p-3 rounded-lg text-white shadow-md"><Receipt size={32} /></div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-negro">Facturación</h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">Historial de facturas y gestión contable.</p>
                    </div>
                </div>
                <button onClick={() => setIsFacturaOpen(true)} className="w-full md:w-auto bg-rojoMarca hover:bg-red-800 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-md">
                    <Plus size={20} /> Nueva Factura
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
                <Search className="text-rojoMarca" size={20} />
                <input type="text" placeholder="Buscar por cédula o cliente..." className="w-full outline-none text-gray-700 bg-transparent" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
                <div className="overflow-x-auto flex-1 no-scrollbar">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-negro text-white uppercase tracking-wider">
                            <tr>
                                <th className="p-5 font-semibold text-center">N° Factura</th>
                                <th className="p-5 font-semibold text-center">Cliente</th>
                                <th className="p-5 font-semibold text-center">Orden</th>
                                <th className="p-5 font-semibold text-center">Método Pago</th>
                                <th className="p-5 font-semibold text-center">Finanzas</th>
                                <th className="p-5 font-semibold text-center">Estado SRI</th>
                                <th className="p-5 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {facturas.map((fac) => (
                                <tr key={fac.id} className={`transition-colors ${fac.estado_sri === 'ANULADA' ? 'bg-red-50/50 grayscale opacity-70' : 'hover:bg-gray-50'}`}>
                                    <td className="p-5 text-center font-bold text-negro">
                                        {fac.estado_sri === 'ANULADA' ? <span className="line-through text-gray-400">FAC-{fac.secuencial_local?.toString().padStart(5, '0')}</span> : `FAC-${fac.secuencial_local?.toString().padStart(5, '0')}`}
                                        <div className="text-xs text-gray-500 font-normal mt-1">{new Date(fac.fecha_emision).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="font-semibold text-gray-800">{fac.clientes?.nombres} {fac.clientes?.apellidos}</div>
                                        <div className="text-xs text-gray-500">{fac.clientes?.cedula_ruc}</div>
                                    </td>
                                    <td className="p-5 text-center font-medium text-gray-600">
                                        {fac.ordenes_pedido?.numero_orden ? `ORD-${fac.ordenes_pedido.numero_orden.toString().padStart(4, '0')}` : 'Venta Directa'}
                                    </td>
                                    <td className="p-5 text-center font-medium text-gray-700">
                                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs border border-gray-200">{fac.metodo_pago}</span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="flex flex-col gap-1 mx-auto w-24 text-xs">
                                            <span className="flex justify-between w-full"><span className="text-gray-500">Sub:</span> <span>${fac.subtotal_factura}</span></span>
                                            <span className="flex justify-between w-full font-bold text-rojoMarca border-t pt-1"><span className="text-gray-500">Total:</span> <span>${fac.total_factura}</span></span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="flex justify-center">
                                            {fac.estado_sri === 'AUTORIZADO' ? <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg">Autorizado</span>
                                                : fac.estado_sri === 'PROCESANDO' ? <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-lg">Procesando</span>
                                                    : fac.estado_sri === 'ANULADA' ? <span className="text-xs font-bold text-gray-700 bg-gray-200 px-3 py-1.5 rounded-lg">Anulada</span>
                                                        : <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><AlertCircle size={14} /> Error</span>}
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {fac.estado_sri !== 'ANULADA' && (
                                                <button onClick={() => generarRIDE(fac)} disabled={procesandoAccion === `pdf-${fac.id}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50" title="Descargar RIDE SRI">
                                                    {procesandoAccion === `pdf-${fac.id}` ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                                </button>
                                            )}
                                            {fac.estado_sri === 'ERROR_CONEXION' && (
                                                <button onClick={() => handleAnular(fac)} disabled={procesandoAccion === fac.id} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50" title="Anular Factura y Liberar Orden">
                                                    {procesandoAccion === fac.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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

            <ModalNuevaFactura isOpen={isFacturaOpen} onClose={() => setIsFacturaOpen(false)} onSuccess={fetchFacturas} />
        </div>
    );
}