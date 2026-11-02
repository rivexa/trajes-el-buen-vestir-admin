export function MetricaKpi({ label, value, hint, tone = 'normal' }) {
    const valorClase = tone === 'alerta'
        ? 'text-rojoMarca'
        : tone === 'ok'
            ? 'text-green-700'
            : 'text-negro';

    return (
        <div className="min-w-0">
            <p className="text-[15px] font-medium text-grisMarca/80">{label}</p>
            <p className={`mt-1.5 font-serif text-2xl md:text-3xl font-bold tabular-nums leading-none ${valorClase}`}>{value}</p>
            {hint ? <p className="mt-2 text-[14px] text-gray-500">{hint}</p> : null}
        </div>
    );
}

export default function GrupoKpis({ title, children, columns = 3 }) {
    const cols = {
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-2 xl:grid-cols-3',
        4: 'sm:grid-cols-2 xl:grid-cols-4',
    }[columns] || 'sm:grid-cols-2 xl:grid-cols-3';

    return (
        <section className="card-panel overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-negro/5">
                <h2 className="font-serif text-xl font-bold text-negro">{title}</h2>
            </div>
            <div className={`grid grid-cols-1 ${cols} gap-6 p-5`}>
                {children}
            </div>
        </section>
    );
}
