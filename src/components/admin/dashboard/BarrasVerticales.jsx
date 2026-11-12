export default function BarrasVerticales({
    items,
    emptyLabel = 'Sin datos en el período.',
    formatearValor,
}) {
    if (!items?.length) {
        return <p className="text-[15px] text-gray-500 py-10 text-center">{emptyLabel}</p>;
    }

    const maximo = Math.max(...items.map((item) => Number(item.valor) || 0), 1);

    return (
        <div className="flex items-end gap-2 sm:gap-3 h-52 pt-2">
            {items.map((item) => {
                const valor = Number(item.valor) || 0;
                const alto = `${Math.max((valor / maximo) * 100, valor > 0 ? 6 : 0)}%`;
                return (
                    <div key={item.id || item.etiqueta} className="min-w-0 flex-1 h-full flex flex-col justify-end items-center gap-2">
                        <span className="text-[11px] font-semibold tabular-nums text-grisMarca">
                            {formatearValor ? formatearValor(valor) : valor}
                        </span>
                        <div className="w-full max-w-10 flex-1 flex items-end">
                            <div
                                className="w-full rounded-t-lg bg-rojoMarca/85 hover:bg-rojoMarca transition-colors"
                                style={{ height: alto }}
                                title={`${item.etiqueta}: ${formatearValor ? formatearValor(valor) : valor}`}
                            />
                        </div>
                        <span className="text-[11px] text-grisMarca/80 text-center leading-tight truncate w-full">
                            {item.etiqueta}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
