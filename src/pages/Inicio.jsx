import { useState } from 'react';
import { AlertTriangle, ArrowRight, FileText, Receipt, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import BarrasHorizontales from '../components/admin/dashboard/BarrasHorizontales';
import FiltroPeriodo from '../components/admin/dashboard/FiltroPeriodo';
import GrupoKpis, { MetricaKpi } from '../components/admin/dashboard/GrupoKpis';
import { SkeletonDashboard } from '../components/admin/Skeleton';
import useDashboard from '../hooks/useDashboard';
import formatoDinero from '../utils/formatoDinero';
import { formatearFechaCorta, periodoDesdePreset } from '../utils/periodoEcuador';

const ACCESOS = [
    { to: '/clientes', icon: Users, title: 'Clientes', copy: 'Directorio y datos de contacto' },
    { to: '/ordenes', icon: FileText, title: 'Órdenes', copy: 'Pedidos, abonos y entregas' },
    { to: '/facturas', icon: Receipt, title: 'Facturación', copy: 'Comprobantes y estado SRI' },
];

const ORDEN_ESTADOS = ['Pendiente', 'En Confección', 'Listo para Prueba', 'Entregado', 'Anulada'];

export default function Inicio() {
    const [presetId, setPresetId] = useState('mes');
    const [periodo, setPeriodo] = useState(() => periodoDesdePreset('mes'));
    const { resumen, crecimiento, historialPagos, loading, error, avisos, recargar } = useDashboard(periodo);

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

    const aplicarPreset = (id) => {
        setPresetId(id);
        setPeriodo(periodoDesdePreset(id));
    };

    const aplicarPersonalizado = ({ desde, hasta }) => {
        setPresetId('personalizado');
        setPeriodo({ desde, hasta });
    };

    return (
        <div className="pagina-admin">
            <section className="mb-10">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-rojoMarca mb-2">Accesos</p>
                <h1 className="font-serif text-3xl font-bold text-negro mb-5">Módulos del taller</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {ACCESOS.map(({ to, icon: Icon, title, copy }) => (
                        <Link
                            key={to}
                            to={to}
                            className="group flex items-center gap-4 rounded-2xl bg-negro text-white px-5 py-5 hover:bg-vino transition-colors"
                        >
                            <span className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                                <Icon size={22} strokeWidth={1.75} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block font-serif text-xl font-bold">{title}</span>
                                <span className="block text-[15px] text-white/65 mt-0.5">{copy}</span>
                            </span>
                            <ArrowRight size={18} className="text-white/50 group-hover:text-white transition shrink-0" />
                        </Link>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5 mb-6">
                    <div>
                        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-rojoMarca mb-2">Dashboard</p>
                        <h2 className="font-serif text-3xl font-bold text-negro">Indicadores del negocio</h2>
                        <p className="mt-2 text-base text-grisMarca">
                            Período {formatearFechaCorta(periodo.desde)} — {formatearFechaCorta(periodo.hasta)}
                        </p>
                    </div>
                    <div className="xl:max-w-2xl w-full card-panel p-4">
                        <FiltroPeriodo
                            presetId={presetId}
                            periodo={periodo}
                            onPreset={aplicarPreset}
                            onPersonalizado={aplicarPersonalizado}
                            onRecargar={recargar}
                        />
                    </div>
                </div>

                {loading ? (
                    <SkeletonDashboard />
                ) : error ? (
                    <div className="card-panel p-8 text-center">
                        <AlertTriangle className="mx-auto text-rojoMarca mb-3" size={28} />
                        <p className="text-rojoMarca font-medium text-base">{error}</p>
                        <button type="button" onClick={recargar} className="btn-marca mt-5">
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {avisos.length > 0 && (
                            <div className="card-panel p-4 border-rojoMarca/20 bg-red-50/70">
                                <p className="font-semibold text-rojoMarca mb-1">Algunos indicadores no respondieron</p>
                                <ul className="text-[15px] text-rojoMarca/90 list-disc pl-5 space-y-1">
                                    {avisos.map((aviso) => <li key={aviso}>{aviso}</li>)}
                                </ul>
                            </div>
                        )}

                        {crecimiento && (
                            <GrupoKpis title="Clientes" columns={2}>
                                <MetricaKpi label="En el sistema" value={String(crecimiento.total_general ?? 0)} />
                                <MetricaKpi
                                    label="Nuevos en el período"
                                    value={String(crecimiento.altas_periodo ?? clientes?.altas_periodo ?? 0)}
                                    hint={clientes ? `${clientes.con_saldo_pendiente ?? 0} con saldo pendiente` : undefined}
                                />
                            </GrupoKpis>
                        )}

                        {resumen && (
                            <>
                                <GrupoKpis title="Finanzas" columns={3}>
                                    <MetricaKpi
                                        label="Cartera por cobrar"
                                        value={formatoDinero(cobranza?.cartera_pendiente)}
                                        hint={`${cobranza?.ordenes_abono_parcial ?? 0} con abono parcial`}
                                        tone="alerta"
                                    />
                                    <MetricaKpi
                                        label="Cobrado en el período"
                                        value={formatoDinero(cobranza?.cobros_periodo?.total)}
                                        hint={`${historialPagos?.meta?.total_movimientos ?? 0} movimientos`}
                                        tone="ok"
                                    />
                                    <MetricaKpi
                                        label="Facturado autorizado"
                                        value={formatoDinero(ventas?.total_facturado_autorizado)}
                                        hint={`${ventas?.facturas_autorizadas ?? 0} facturas SRI`}
                                    />
                                </GrupoKpis>

                                <GrupoKpis title="Producción y entregas" columns={4}>
                                    <MetricaKpi label="Órdenes nuevas" value={String(produccion?.ordenes_nuevas_periodo ?? 0)} />
                                    <MetricaKpi
                                        label="Entregas próximas"
                                        value={String(produccion?.entregas_proximas ?? 0)}
                                        hint="Próximos 7 días"
                                    />
                                    <MetricaKpi
                                        label="Entregas atrasadas"
                                        value={String(produccion?.entregas_atrasadas ?? 0)}
                                        tone={(produccion?.entregas_atrasadas ?? 0) > 0 ? 'alerta' : 'ok'}
                                    />
                                    <MetricaKpi
                                        label="Abonos en órdenes abiertas"
                                        value={formatoDinero(cobranza?.cobrado_ordenes_abiertas)}
                                    />
                                </GrupoKpis>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    <section className="card-panel p-5">
                                        <h3 className="font-serif text-xl font-bold text-negro mb-4">Órdenes por estado</h3>
                                        <BarrasHorizontales items={barrasEstados} />
                                    </section>
                                    <section className="card-panel p-5">
                                        <h3 className="font-serif text-xl font-bold text-negro mb-4">Ventas por método de pago</h3>
                                        <BarrasHorizontales items={barrasMetodos} emptyLabel="Sin facturas autorizadas en el período." />
                                    </section>
                                    <section className="card-panel p-5">
                                        <h3 className="font-serif text-xl font-bold text-negro mb-4">Cobros por día</h3>
                                        <BarrasHorizontales items={barrasCobros} emptyLabel="Sin cobros registrados en el período." />
                                    </section>
                                    <section className="card-panel p-5">
                                        <h3 className="font-serif text-xl font-bold text-negro mb-4">Top por facturación</h3>
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

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <section className="card-panel p-5">
                                <h3 className="font-serif text-xl font-bold text-negro mb-4">Altas de clientes</h3>
                                <BarrasHorizontales items={barrasAltas} emptyLabel="Sin clientes nuevos en el período." />
                            </section>
                            <section className="card-panel p-5">
                                <h3 className="font-serif text-xl font-bold text-negro mb-4">Últimos pagos</h3>
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
                    </div>
                )}
            </section>
        </div>
    );
}
