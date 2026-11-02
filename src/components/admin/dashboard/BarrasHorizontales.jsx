export default function BarrasHorizontales({ items, emptyLabel = 'Sin datos en el período.' }) {
    if (!items?.length) {
        return <p className="text-[15px] text-gray-500 py-4">{emptyLabel}</p>;
    }

    const maximo = Math.max(...items.map((item) => Number(item.valor) || 0), 1);

    return (
        <ul className="space-y-3">
            {items.map((item) => {
                const valor = Number(item.valor) || 0;
                const ancho = `${Math.max((valor / maximo) * 100, valor > 0 ? 4 : 0)}%`;
                return (
                    <li key={item.id || item.etiqueta}>
                        <div className="flex items-center justify-between gap-3 mb-1">
                            <span className="text-[15px] font-medium text-negro">{item.etiqueta}</span>
                            <span className="text-[15px] font-semibold tabular-nums text-grisMarca">{item.texto ?? valor}</span>
                        </div>
                        <div className="h-3 rounded-full bg-grisClaro overflow-hidden">
                            <div className="h-full rounded-full bg-rojoMarca" style={{ width: ancho }} />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
