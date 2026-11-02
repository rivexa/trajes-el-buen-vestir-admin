import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PRESETS_PERIODO, validarPeriodo } from '../../../utils/periodoEcuador';

export default function FiltroPeriodo({
    presetId,
    periodo,
    onPreset,
    onPersonalizado,
    onRecargar,
}) {
    const [desde, setDesde] = useState(periodo.desde);
    const [hasta, setHasta] = useState(periodo.hasta);
    const [errorLocal, setErrorLocal] = useState('');

    useEffect(() => {
        setDesde(periodo.desde);
        setHasta(periodo.hasta);
        setErrorLocal('');
    }, [periodo.desde, periodo.hasta]);

    const aplicarPersonalizado = () => {
        const error = validarPeriodo(desde, hasta);
        if (error) {
            setErrorLocal(error);
            return;
        }
        setErrorLocal('');
        onPersonalizado({ desde, hasta });
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                {PRESETS_PERIODO.map((opcion) => (
                    <button
                        key={opcion.id}
                        type="button"
                        onClick={() => onPreset(opcion.id)}
                        className={`px-3.5 py-2 rounded-xl text-[15px] font-semibold border transition ${
                            presetId === opcion.id
                                ? 'bg-rojoMarca text-white border-rojoMarca'
                                : 'bg-white text-negro border-negro/10 hover:border-rojoMarca/40'
                        }`}
                    >
                        {opcion.label}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={onRecargar}
                    className="btn-icono border border-negro/10 bg-white"
                    title="Actualizar"
                    aria-label="Actualizar dashboard"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1 min-w-[10rem]">
                    <label htmlFor="periodo-desde" className="block text-[15px] font-semibold text-negro mb-1.5">Desde</label>
                    <input
                        id="periodo-desde"
                        type="date"
                        value={desde}
                        onChange={(e) => setDesde(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-negro/10 bg-white text-base outline-none focus:border-rojoMarca"
                    />
                </div>
                <div className="flex-1 min-w-[10rem]">
                    <label htmlFor="periodo-hasta" className="block text-[15px] font-semibold text-negro mb-1.5">Hasta</label>
                    <input
                        id="periodo-hasta"
                        type="date"
                        value={hasta}
                        onChange={(e) => setHasta(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-negro/10 bg-white text-base outline-none focus:border-rojoMarca"
                    />
                </div>
                <button
                    type="button"
                    onClick={aplicarPersonalizado}
                    className={`px-5 py-2.5 rounded-xl text-[15px] font-semibold border transition whitespace-nowrap ${
                        presetId === 'personalizado'
                            ? 'bg-negro text-white border-negro'
                            : 'bg-white text-negro border-negro/10 hover:border-negro/40'
                    }`}
                >
                    Aplicar fechas
                </button>
            </div>
            {errorLocal ? <p className="text-[15px] text-rojoMarca font-medium">{errorLocal}</p> : null}
        </div>
    );
}
