export default function TarjetaKpi({ label, value, hint, tone = 'normal' }) {
    const valorClase = tone === 'alerta'
        ? 'text-rojoMarca'
        : tone === 'ok'
            ? 'text-green-700'
            : 'text-negro';

    return (
        <div className="card-panel p-5">
            <p className="text-[15px] font-medium text-grisMarca/80">{label}</p>
            <p className={`mt-2 font-serif text-3xl font-bold tabular-nums ${valorClase}`}>{value}</p>
            {hint ? <p className="mt-2 text-[15px] text-gray-500">{hint}</p> : null}
        </div>
    );
}
