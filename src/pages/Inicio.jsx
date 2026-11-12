import { useState } from 'react';
import { AlertTriangle, DollarSign, FileText, Users, Wallet } from 'lucide-react';
import BarrasHorizontales from '../components/admin/dashboard/BarrasHorizontales';
import BarrasVerticales from '../components/admin/dashboard/BarrasVerticales';
import FiltroPeriodo from '../components/admin/dashboard/FiltroPeriodo';
import GraficaDonut from '../components/admin/dashboard/GraficaDonut';
import TarjetaKpi from '../components/admin/dashboard/TarjetaKpi';
import { SkeletonDashboard } from '../components/admin/Skeleton';
import useDashboard from '../hooks/useDashboard';
import formatoDinero from '../utils/formatoDinero';
import { formatearFechaCorta, periodoDesdePreset } from '../utils/periodoEcuador';

const ORDEN_ESTADOS = ['Pendiente', 'En Confección', 'Listo para Prueba', 'Entregado', 'Anulada'];

function dineroCorto(valor) {
    const numero = Number(valor) || 0;
    if (numero >= 1000) return `$${(numero / 1000).toFixed(1)}k`;
    return `$${numero.toFixed(0)}`;
}

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
    })).filter((item) => item.valor > 0);

    const barrasMetodos = Object.entries(ventas?.mix_metodo_pago || {}).map(([metodo, total]) => ({
        id: metodo,
        etiqueta: metodo,
        valor: total,
        texto: formatoDinero(total),
    }));

    const barrasCobros = (cobranza?.cobros_periodo?.por_dia || [])
        .slice()
        .reverse()
        .slice(0, 12)
        .reverse()
        .map((dia) => ({
            id: dia.fecha,
            etiqueta: formatearFechaCorta(dia.fecha).slice(0, 5),
            valor: dia.total,
        }));

    const pagosRecientes = (historialPagos?.data || []).slice(0, 5);

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-negro">Resumen del taller</h1>
                    <p className="mt-1 text-[15px] text-grisMarca">
                        Visión rápida de cobros, órdenes y clientes
                    </p>
                </div>
                <FiltroPeriodo
                    presetId={presetId}
                    periodo={periodo}
                    onPreset={aplicarPreset}
                    onPersonalizado={aplicarPersonalizado}
                    onRecargar={recargar}
                />
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
                <div className="space-y-5">
                    {avisos.length > 0 && (
                        <div className="card-panel p-4 border-rojoMarca/20 bg-red-50/70">
                            <p className="font-semibold text-rojoMarca mb-1">Algunos indicadores no respondieron</p>
                            <ul className="text-[15px] text-rojoMarca/90 list-disc pl-5 space-y-1">
                                {avisos.map((aviso) => <li key={aviso}>{aviso}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        <TarjetaKpi
                            label="Cobrado en el período"
                            value={formatoDinero(cobranza?.cobros_periodo?.total ?? 0)}
                            hint={`${historialPagos?.meta?.total_movimientos ?? 0} movimientos`}
                            icon={DollarSign}
                            tone="oscuro"
                        />
                        <TarjetaKpi
                            label="Órdenes nuevas"
                            value={String(produccion?.ordenes_nuevas_periodo ?? 0)}
                            hint={
                                (produccion?.entregas_atrasadas ?? 0) > 0
                                    ? `${produccion.entregas_atrasadas} entrega(s) atrasada(s)`
                                    : `${produccion?.entregas_proximas ?? 0} entregas próximas`
                            }
                            icon={FileText}
                            tone="crema"
                        />
                        <TarjetaKpi
                            label="Clientes"
                            value={String(crecimiento?.total_general ?? clientes?.total ?? 0)}
                            hint={`${crecimiento?.altas_periodo ?? clientes?.altas_periodo ?? 0} nuevos en el período`}
                            icon={Users}
                            tone="vino"
                        />
                        <TarjetaKpi
                            label="Cartera por cobrar"
                            value={formatoDinero(cobranza?.cartera_pendiente ?? 0)}
                            hint={`${cobranza?.ordenes_abono_parcial ?? 0} con abono parcial`}
                            icon={Wallet}
                            tone="alerta"
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                        <section className="card-panel p-5 xl:col-span-3">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                    <h2 className="font-serif text-xl font-bold text-negro">Cobros del período</h2>
                                    <p className="text-[14px] text-grisMarca mt-1">Ingresos registrados día a día</p>
                                </div>
                                <p className="text-[14px] font-semibold tabular-nums text-negro">
                                    {formatoDinero(cobranza?.cobros_periodo?.total ?? 0)}
                                </p>
                            </div>
                            <BarrasVerticales
                                items={barrasCobros}
                                emptyLabel="Sin cobros registrados en el período."
                                formatearValor={dineroCorto}
                            />
                        </section>

                        <section className="card-panel p-5 xl:col-span-2">
                            <h2 className="font-serif text-xl font-bold text-negro mb-1">Órdenes por estado</h2>
                            <p className="text-[14px] text-grisMarca mb-4">Distribución actual del taller</p>
                            <GraficaDonut
                                items={barrasEstados}
                                emptyLabel="Sin órdenes para graficar."
                                centroLabel="Órdenes"
                            />
                        </section>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <section className="card-panel p-5">
                            <h2 className="font-serif text-xl font-bold text-negro mb-1">Métodos de pago</h2>
                            <p className="text-[14px] text-grisMarca mb-4">
                                Facturado autorizado: {formatoDinero(ventas?.total_facturado_autorizado ?? 0)}
                            </p>
                            <BarrasHorizontales
                                items={barrasMetodos}
                                emptyLabel="Sin facturas autorizadas en el período."
                            />
                        </section>

                        <section className="card-panel p-5">
                            <h2 className="font-serif text-xl font-bold text-negro mb-1">Últimos pagos</h2>
                            <p className="text-[14px] text-grisMarca mb-4">Movimientos más recientes</p>
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
                                            <span className="font-semibold tabular-nums text-green-700">
                                                {formatoDinero(pago.monto)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}
