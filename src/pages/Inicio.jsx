import { useState } from 'react';
import { AlertTriangle, FileText, Receipt, RefreshCw, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import BarrasHorizontales from '../components/admin/dashboard/BarrasHorizontales';
import TarjetaKpi from '../components/admin/dashboard/TarjetaKpi';
import useDashboard from '../hooks/useDashboard';
import formatoDinero from '../utils/formatoDinero';
import { formatearFechaCorta, PRESETS_PERIODO } from '../utils/periodoEcuador';

const ACCESOS = [
    { to: '/clientes', icon: Users, title: 'Clientes' },
    { to: '/ordenes', icon: FileText, title: 'Órdenes' },
    { to: '/facturas', icon: Receipt, title: 'Facturación' },
];

const ORDEN_ESTADOS = ['Pendiente', 'En Confección', 'Listo para Prueba', 'Entregado', 'Anulada'];

export default function Inicio() {
    const [preset, setPreset] = useState('mes');
    const { resumen, crecimiento, historialPagos, loading, error, avisos, periodo, recargar } = useDashboard(preset);

    const produccion = resumen?.produccion;
    const cobranza = resumen?.cobranza;
    const ventas = resumen?.ventas;
    const clientes = resumen?.clientes;

    const barrasEstados = ORDEN_ESTADOS.map((estado) => ({
        id: estado,
        etiqueta: estado,
        valor: produccion?.ordenes_por_estado?.[estado] ?? 0,
    }));

    const barrasMetodos = Object.entries(ventas?.mix_metodo_pago || {}).map(([metodo, total]) => ({
        id: metodo,
        etiqueta: metodo,
        valor: total,
        texto: formatoDinero(total),
    }));

    const barrasCobros = (cobranza?.cobros_periodo?.por_dia || [])
        .slice(0, 10)
        .map((dia) => ({
            id: dia.fecha,
            etiqueta: formatearFechaCorta(dia.fecha),
            valor: dia.total,
            texto: formatoDinero(dia.total),
        }));

    const barrasAltas = (crecimiento?.por_dia || [])
        .slice(-10)
        .map((dia) => ({
            id: dia.fecha,
            etiqueta: formatearFechaCorta(dia.fecha),
            valor: dia.altas,
        }));

    const pagosRecientes = (historialPagos?.data || []).slice(0, 6);

    return (
        <div className="pagina-admin max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-negro">Inicio</h1>
                    <p className="mt-2 text-base text-grisMarca">
                        Período {formatearFechaCorta(periodo.desde)} — {formatearFechaCorta(periodo.hasta)}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {PRESETS_PERIODO.map((opcion) => (
                        <button
                            key={opcion.id}
                            type="button"
                            onClick={() => setPreset(opcion.id)}
                            className={`px-4 py-2.5 rounded-xl text-[15px] font-semibold border transition ${
                                preset === opcion.id
                                    ? 'bg-rojoMarca text-white border-rojoMarca'
                                    : 'bg-white text-negro border-negro/10 hover:border-rojoMarca/40'
                            }`}
                        >
                            {opcion.label}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={recargar}
                        className="btn-icono border border-negro/10 bg-white"
                        title="Actualizar"
                        aria-label="Actualizar dashboard"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {ACCESOS.map(({ to, icon: Icon, title }) => (
                    <Link
                        key={to}
                        to={to}
                        className="card-panel p-5 hover:border-rojoMarca/30 transition-colors flex items-center gap-4"
                    >
                        <span className="bg-negro text-white w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                            <Icon size={22} strokeWidth={1.75} />
                        </span>
                        <span className="font-serif text-xl font-bold text-negro">{title}</span>
                    </Link>
                ))}
            </div>

            {loading ? (
                <div className="card-panel p-10 text-center text-base text-gray-500">Cargando indicadores...</div>
            ) : error ? (
                <div className="card-panel p-8 text-center">
                    <AlertTriangle className="mx-auto text-rojoMarca mb-3" size={28} />
                    <p className="text-rojoMarca font-medium text-base">{error}</p>
                    <button type="button" onClick={recargar} className="btn-marca mt-5">
                        Reintentar
                    </button>
                </div>
            ) : (
                <>
                    {avisos.length > 0 && (
                        <div className="card-panel p-4 mb-6 border-rojoMarca/20 bg-red-50/70">
                            <p className="font-semibold text-rojoMarca mb-1">Algunos indicadores no respondieron</p>
                            <ul className="text-[15px] text-rojoMarca/90 list-disc pl-5 space-y-1">
                                {avisos.map((aviso) => <li key={aviso}>{aviso}</li>)}
                            </ul>
                        </div>
                    )}

                    {crecimiento && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <TarjetaKpi
                                label="Clientes en el sistema"
                                value={String(crecimiento.total_general ?? 0)}
                            />
                            <TarjetaKpi
                                label="Clientes nuevos en el período"
                                value={String(crecimiento.altas_periodo ?? clientes?.altas_periodo ?? 0)}
                            />
                        </div>
                    )}

                    {resumen && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                                <TarjetaKpi
                                    label="Cartera por cobrar"
                                    value={formatoDinero(cobranza?.cartera_pendiente)}
                                    hint={`${cobranza?.ordenes_abono_parcial ?? 0} con abono parcial`}
                                    tone="alerta"
                                />
                                <TarjetaKpi
                                    label="Cobrado en el período"
                                    value={formatoDinero(cobranza?.cobros_periodo?.total)}
                                    hint={`${historialPagos?.meta?.total_movimientos ?? 0} movimientos`}
                                    tone="ok"
                                />
                                <TarjetaKpi
                                    label="Facturado autorizado"
                                    value={formatoDinero(ventas?.total_facturado_autorizado)}
                                    hint={`${ventas?.facturas_autorizadas ?? 0} facturas SRI`}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                                <TarjetaKpi label="Órdenes nuevas" value={String(produccion?.ordenes_nuevas_periodo ?? 0)} />
                                <TarjetaKpi
                                    label="Entregas próximas"
                                    value={String(produccion?.entregas_proximas ?? 0)}
                                    hint="Próximos 7 días"
                                />
                                <TarjetaKpi
                                    label="Entregas atrasadas"
                                    value={String(produccion?.entregas_atrasadas ?? 0)}
                                    tone={(produccion?.entregas_atrasadas ?? 0) > 0 ? 'alerta' : 'ok'}
                                />
                                <TarjetaKpi
                                    label="Abonos en órdenes abiertas"
                                    value={formatoDinero(cobranza?.cobrado_ordenes_abiertas)}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                                <section className="card-panel p-5">
                                    <h2 className="font-serif text-xl font-bold text-negro mb-4">Órdenes por estado</h2>
                                    <BarrasHorizontales items={barrasEstados} />
                                </section>
                                <section className="card-panel p-5">
                                    <h2 className="font-serif text-xl font-bold text-negro mb-4">Ventas por método de pago</h2>
                                    <BarrasHorizontales items={barrasMetodos} emptyLabel="Sin facturas autorizadas en el período." />
                                </section>
                                <section className="card-panel p-5">
                                    <h2 className="font-serif text-xl font-bold text-negro mb-4">Cobros por día</h2>
                                    <BarrasHorizontales items={barrasCobros} emptyLabel="Sin cobros registrados en el período." />
                                </section>
                                <section className="card-panel p-5">
                                    <h2 className="font-serif text-xl font-bold text-negro mb-4">Top por facturación</h2>
                                    {(clientes?.top_por_facturacion || []).length === 0 ? (
                                        <p className="text-[15px] text-gray-500">Sin facturación en el período.</p>
                                    ) : (
                                        <ul className="divide-y divide-negro/5">
                                            {clientes.top_por_facturacion.map((item) => (
                                                <li key={item.cliente_id} className="py-3 flex justify-between gap-3 text-[15px]">
                                                    <span className="font-medium text-negro">{item.nombre}</span>
                                                    <span className="font-semibold tabular-nums">{formatoDinero(item.total)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </section>
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <section className="card-panel p-5">
                            <h2 className="font-serif text-xl font-bold text-negro mb-4">Altas de clientes</h2>
                            <BarrasHorizontales items={barrasAltas} emptyLabel="Sin clientes nuevos en el período." />
                        </section>
                        <section className="card-panel p-5">
                            <h2 className="font-serif text-xl font-bold text-negro mb-4">Últimos pagos</h2>
                            {!historialPagos ? (
                                <p className="text-[15px] text-gray-500">Historial de pagos no disponible por ahora.</p>
                            ) : pagosRecientes.length === 0 ? (
                                <p className="text-[15px] text-gray-500">Sin movimientos de pago en el período.</p>
                            ) : (
                                <ul className="divide-y divide-negro/5">
                                    {pagosRecientes.map((pago) => (
                                        <li key={pago.id} className="py-3 flex justify-between gap-3 text-[15px]">
                                            <div>
                                                <p className="font-medium text-negro">
                                                    ORD-{String(pago.ordenes_pedido?.numero_orden ?? '—').padStart(4, '0')}
                                                </p>
                                                <p className="text-gray-500">
                                                    {formatearFechaCorta(pago.fecha_pago)} · {pago.metodo_pago || 'Efectivo'}
                                                </p>
                                            </div>
                                            <span className="font-semibold tabular-nums text-green-700">{formatoDinero(pago.monto)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>
                </>
            )}
        </div>
    );
}
