const COLORES = ['#0F766E', '#2563EB', '#D97706', '#E11D48', '#7C3AED', '#64748B'];

export default function GraficaDonut({
    items,
    emptyLabel = 'Sin datos en el período.',
    centroLabel = 'Total',
    formatearCentro,
    formatearValor,
}) {
    if (!items?.length) {
        return <p className="text-[15px] text-gray-500 py-10 text-center">{emptyLabel}</p>;
    }

    const total = items.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
    if (total <= 0) {
        return <p className="text-[15px] text-gray-500 py-10 text-center">{emptyLabel}</p>;
    }

    let acumulado = 0;
    const segmentos = items.map((item, index) => {
        const valor = Number(item.valor) || 0;
        const inicio = (acumulado / total) * 100;
        acumulado += valor;
        const fin = (acumulado / total) * 100;
        return {
            ...item,
            valor,
            porcentaje: Math.round((valor / total) * 100),
            color: item.color || COLORES[index % COLORES.length],
            inicio,
            fin,
        };
    });

    const degradado = segmentos
        .map((seg) => `${seg.color} ${seg.inicio}% ${seg.fin}%`)
        .join(', ');

    const textoCentro = formatearCentro ? formatearCentro(total) : String(total);

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div
                className="relative h-44 w-44 shrink-0 rounded-full"
                style={{ background: `conic-gradient(${degradado})` }}
                aria-hidden="true"
            >
                <div className="absolute inset-[18%] rounded-full bg-white flex flex-col items-center justify-center text-center px-3">
                    <span className="text-[12px] font-medium text-grisMarca/70">{centroLabel}</span>
                    <span className="font-serif text-xl font-bold text-negro tabular-nums leading-tight">{textoCentro}</span>
                </div>
            </div>
            <ul className="w-full space-y-2.5">
                {segmentos.map((seg) => (
                    <li key={seg.id || seg.etiqueta} className="flex items-center justify-between gap-3 text-[15px]">
                        <span className="flex items-center gap-2 min-w-0">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                            <span className="truncate text-negro">{seg.etiqueta}</span>
                        </span>
                        <span className="tabular-nums font-semibold text-grisMarca shrink-0">
                            {seg.porcentaje}%
                            {' · '}
                            {formatearValor ? formatearValor(seg.valor) : seg.valor}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
