export default function GraficaLinea({
    items,
    emptyLabel = 'Sin datos en el período.',
    formatearValor,
    color = '#059669',
}) {
    if (!items?.length) {
        return <p className="text-[15px] text-gray-500 py-10 text-center">{emptyLabel}</p>;
    }

    const valores = items.map((item) => Number(item.valor) || 0);
    const maximo = Math.max(...valores, 1);
    const ancho = 640;
    const alto = 220;
    const padX = 16;
    const padY = 24;
    const utilAncho = ancho - padX * 2;
    const utilAlto = alto - padY * 2;

    const puntos = items.map((item, index) => {
        const x = items.length === 1
            ? ancho / 2
            : padX + (index / (items.length - 1)) * utilAncho;
        const y = padY + utilAlto - ((Number(item.valor) || 0) / maximo) * utilAlto;
        return { x, y, ...item, valor: Number(item.valor) || 0 };
    });

    const linea = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const area = `${linea} L ${puntos[puntos.length - 1].x.toFixed(1)} ${(alto - padY).toFixed(1)} L ${puntos[0].x.toFixed(1)} ${(alto - padY).toFixed(1)} Z`;

    return (
        <div>
            <svg viewBox={`0 0 ${ancho} ${alto}`} className="w-full h-52" role="img" aria-label="Cobros del período">
                <defs>
                    <linearGradient id="gradienteCobros" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75, 1].map((frac) => {
                    const y = padY + utilAlto * (1 - frac);
                    return (
                        <line
                            key={frac}
                            x1={padX}
                            x2={ancho - padX}
                            y1={y}
                            y2={y}
                            stroke="#E5E7EB"
                            strokeWidth="1"
                        />
                    );
                })}
                <path d={area} fill="url(#gradienteCobros)" />
                <path d={linea} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {puntos.map((punto) => (
                    <g key={punto.id || punto.etiqueta}>
                        <circle cx={punto.x} cy={punto.y} r="4.5" fill="#fff" stroke={color} strokeWidth="2.5" />
                        <title>
                            {punto.etiqueta}: {formatearValor ? formatearValor(punto.valor) : punto.valor}
                        </title>
                    </g>
                ))}
            </svg>
            <div className="mt-1 flex justify-between gap-2 px-1">
                {puntos.map((punto) => (
                    <span key={punto.id || punto.etiqueta} className="min-w-0 flex-1 text-center text-[11px] text-grisMarca/80 truncate">
                        {punto.etiqueta}
                    </span>
                ))}
            </div>
        </div>
    );
}
