export default function TarjetaKpi({
    label,
    value,
    hint,
    icon: Icon,
    tone = 'neutro',
}) {
    const estilos = {
        positivo: {
            card: 'bg-emerald-50 border-emerald-100',
            label: 'text-emerald-800/70',
            value: 'text-emerald-900',
            hint: 'text-emerald-700',
            icon: 'bg-emerald-100 text-emerald-700',
        },
        info: {
            card: 'bg-sky-50 border-sky-100',
            label: 'text-sky-800/70',
            value: 'text-sky-950',
            hint: 'text-sky-700',
            icon: 'bg-sky-100 text-sky-700',
        },
        neutro: {
            card: 'bg-amber-50 border-amber-100',
            label: 'text-amber-900/70',
            value: 'text-amber-950',
            hint: 'text-amber-800',
            icon: 'bg-amber-100 text-amber-700',
        },
        alerta: {
            card: 'bg-rose-50 border-rose-100',
            label: 'text-rose-800/70',
            value: 'text-rose-900',
            hint: 'text-rose-700',
            icon: 'bg-rose-100 text-rose-700',
        },
    }[tone] || {
        card: 'bg-white border-negro/5',
        label: 'text-grisMarca/80',
        value: 'text-negro',
        hint: 'text-grisMarca/70',
        icon: 'bg-plomoSuave text-negro',
    };

    return (
        <article className={`rounded-2xl border p-5 shadow-panel ${estilos.card}`}>
            <div className="flex items-center gap-4">
                {Icon ? (
                    <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${estilos.icon}`}>
                        <Icon size={22} strokeWidth={1.75} />
                    </span>
                ) : null}
                <div className="min-w-0 flex-1">
                    <p className={`text-[14px] font-medium ${estilos.label}`}>{label}</p>
                    <p className={`mt-1 font-serif text-2xl md:text-[1.75rem] font-bold tabular-nums leading-none ${estilos.value}`}>
                        {value}
                    </p>
                    {hint ? <p className={`mt-2 text-[13px] font-medium ${estilos.hint}`}>{hint}</p> : null}
                </div>
            </div>
        </article>
    );
}
