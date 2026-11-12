export default function TarjetaKpi({
    label,
    value,
    hint,
    icon: Icon,
    tone = 'claro',
}) {
    const estilos = {
        oscuro: {
            card: 'bg-negro text-white',
            label: 'text-white/65',
            hint: 'text-emerald-300',
            icon: 'bg-white/10 text-white',
        },
        crema: {
            card: 'bg-white text-negro border border-negro/5',
            label: 'text-grisMarca/80',
            hint: 'text-grisMarca/70',
            icon: 'bg-grisClaro text-negro',
        },
        vino: {
            card: 'bg-[#F3E8EA] text-negro border border-vino/10',
            label: 'text-vino/80',
            hint: 'text-vino/70',
            icon: 'bg-white/70 text-vino',
        },
        alerta: {
            card: 'bg-[#F8EEEE] text-negro border border-rojoMarca/10',
            label: 'text-rojoMarca/80',
            hint: 'text-rojoMarca/70',
            icon: 'bg-white/70 text-rojoMarca',
        },
    }[tone] || {
        card: 'bg-white text-negro border border-negro/5',
        label: 'text-grisMarca/80',
        hint: 'text-grisMarca/70',
        icon: 'bg-grisClaro text-negro',
    };

    return (
        <article className={`rounded-2xl p-5 shadow-panel ${estilos.card}`}>
            <div className="flex items-start justify-between gap-3">
                {Icon ? (
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${estilos.icon}`}>
                        <Icon size={18} strokeWidth={1.75} />
                    </span>
                ) : <span />}
            </div>
            <p className={`mt-4 text-[14px] font-medium ${estilos.label}`}>{label}</p>
            <p className="mt-2 font-serif text-3xl font-bold tabular-nums leading-none">{value}</p>
            {hint ? <p className={`mt-3 text-[13px] font-medium ${estilos.hint}`}>{hint}</p> : null}
        </article>
    );
}
