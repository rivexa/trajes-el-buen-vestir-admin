import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, RefreshCw } from 'lucide-react';
import { PRESETS_PERIODO, formatearFechaCorta, validarPeriodo } from '../../../utils/periodoEcuador';
import useEscapeKey from '../../../hooks/useEscapeKey';

export default function FiltroPeriodo({
    presetId,
    periodo,
    onPreset,
    onPersonalizado,
    onRecargar,
}) {
    const [abierto, setAbierto] = useState(false);
    const [desde, setDesde] = useState(periodo.desde);
    const [hasta, setHasta] = useState(periodo.hasta);
    const [errorLocal, setErrorLocal] = useState('');
    const contenedorRef = useRef(null);

    useEffect(() => {
        setDesde(periodo.desde);
        setHasta(periodo.hasta);
        setErrorLocal('');
    }, [periodo.desde, periodo.hasta]);

    useEscapeKey(abierto, () => setAbierto(false));

    useEffect(() => {
        if (!abierto) return undefined;
        const cerrarFuera = (evento) => {
            if (!contenedorRef.current?.contains(evento.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener('mousedown', cerrarFuera);
        return () => document.removeEventListener('mousedown', cerrarFuera);
    }, [abierto]);

    const aplicarPersonalizado = () => {
        const error = validarPeriodo(desde, hasta);
        if (error) {
            setErrorLocal(error);
            return;
        }
        setErrorLocal('');
        onPersonalizado({ desde, hasta });
        setAbierto(false);
    };

    const aplicarPreset = (id) => {
        onPreset(id);
        setAbierto(false);
    };

    const etiquetaPreset = PRESETS_PERIODO.find((opcion) => opcion.id === presetId)?.label;
    const resumen = `${formatearFechaCorta(periodo.desde)} — ${formatearFechaCorta(periodo.hasta)}`;

    return (
        <div className="flex items-center gap-2" ref={contenedorRef}>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setAbierto((valor) => !valor)}
                    className="inline-flex items-center gap-2 rounded-full bg-white border border-negro/10 px-3.5 py-2 text-[14px] font-medium text-negro shadow-sm hover:border-negro/20 transition"
                    aria-expanded={abierto}
                    aria-haspopup="dialog"
                >
                    <CalendarDays size={16} className="text-grisMarca shrink-0" />
                    <span className="tabular-nums">{resumen}</span>
                    <ChevronDown size={16} className={`text-grisMarca transition ${abierto ? 'rotate-180' : ''}`} />
                </button>

                {abierto ? (
                    <div
                        role="dialog"
                        aria-label="Seleccionar período"
                        className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl bg-white border border-negro/10 shadow-panel p-4"
                    >
                        {etiquetaPreset ? (
                            <p className="text-[13px] font-medium text-grisMarca mb-3">{etiquetaPreset}</p>
                        ) : null}

                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {PRESETS_PERIODO.map((opcion) => (
                                <button
                                    key={opcion.id}
                                    type="button"
                                    onClick={() => aplicarPreset(opcion.id)}
                                    className={`px-2.5 py-1.5 rounded-full text-[13px] font-semibold transition ${
                                        presetId === opcion.id
                                            ? 'bg-rojoMarca text-white'
                                            : 'bg-grisClaro text-negro hover:bg-negro/10'
                                    }`}
                                >
                                    {opcion.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="periodo-desde" className="block text-[13px] font-semibold text-negro mb-1">Desde</label>
                                <input
                                    id="periodo-desde"
                                    type="date"
                                    value={desde}
                                    onChange={(e) => setDesde(e.target.value)}
                                    className="w-full px-2.5 py-2 rounded-xl border border-negro/10 bg-white text-[14px] outline-none focus:border-rojoMarca"
                                />
                            </div>
                            <div>
                                <label htmlFor="periodo-hasta" className="block text-[13px] font-semibold text-negro mb-1">Hasta</label>
                                <input
                                    id="periodo-hasta"
                                    type="date"
                                    value={hasta}
                                    onChange={(e) => setHasta(e.target.value)}
                                    className="w-full px-2.5 py-2 rounded-xl border border-negro/10 bg-white text-[14px] outline-none focus:border-rojoMarca"
                                />
                            </div>
                        </div>

                        {errorLocal ? <p className="mt-2 text-[13px] text-rojoMarca font-medium">{errorLocal}</p> : null}

                        <button
                            type="button"
                            onClick={aplicarPersonalizado}
                            className="mt-3 w-full rounded-xl bg-negro text-white text-[14px] font-semibold py-2.5 hover:bg-grisMarca transition"
                        >
                            Aplicar fechas
                        </button>
                    </div>
                ) : null}
            </div>

            <button
                type="button"
                onClick={onRecargar}
                className="btn-icono border border-negro/10 bg-white rounded-full"
                title="Actualizar"
                aria-label="Actualizar dashboard"
            >
                <RefreshCw size={16} />
            </button>
        </div>
    );
}
