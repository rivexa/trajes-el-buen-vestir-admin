import { ESTADOS_DETALLE_ORDEN } from '../../utils/ordenDominio';

export default function FiltrosOrdenes({
    estado,
    desde,
    hasta,
    sort,
    order,
    onChange,
    onLimpiar,
}) {
    const actualizar = (campo, valor) => {
        onChange({ estado, desde, hasta, sort, order, [campo]: valor });
    };

    return (
        <div className="card-panel mb-6 p-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="min-w-[11rem] flex-1">
                <label htmlFor="filtro-estado" className="block text-[13px] font-semibold text-grisMarca mb-1.5">
                    Estado (línea)
                </label>
                <select
                    id="filtro-estado"
                    value={estado}
                    onChange={(e) => actualizar('estado', e.target.value)}
                    className="select-marca w-full bg-white border-negro/10 text-[15px]"
                >
                    <option value="">Todos</option>
                    {ESTADOS_DETALLE_ORDEN.map((op) => (
                        <option key={op} value={op}>{op}</option>
                    ))}
                </select>
            </div>

            <div className="min-w-[10rem]">
                <label htmlFor="filtro-desde" className="block text-[13px] font-semibold text-grisMarca mb-1.5">
                    Entrega desde
                </label>
                <input
                    id="filtro-desde"
                    type="date"
                    value={desde}
                    onChange={(e) => actualizar('desde', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-negro/10 bg-white text-[15px] outline-none focus:border-rojoMarca"
                />
            </div>

            <div className="min-w-[10rem]">
                <label htmlFor="filtro-hasta" className="block text-[13px] font-semibold text-grisMarca mb-1.5">
                    Entrega hasta
                </label>
                <input
                    id="filtro-hasta"
                    type="date"
                    value={hasta}
                    onChange={(e) => actualizar('hasta', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-negro/10 bg-white text-[15px] outline-none focus:border-rojoMarca"
                />
            </div>

            <div className="min-w-[11rem]">
                <label htmlFor="filtro-sort" className="block text-[13px] font-semibold text-grisMarca mb-1.5">
                    Ordenar por
                </label>
                <select
                    id="filtro-sort"
                    value={sort}
                    onChange={(e) => actualizar('sort', e.target.value)}
                    className="select-marca w-full bg-white border-negro/10 text-[15px]"
                >
                    <option value="fecha_creacion">Fecha de creación</option>
                    <option value="fecha_entrega">Fecha de entrega</option>
                </select>
            </div>

            <div className="min-w-[9rem]">
                <label htmlFor="filtro-order" className="block text-[13px] font-semibold text-grisMarca mb-1.5">
                    Dirección
                </label>
                <select
                    id="filtro-order"
                    value={order}
                    onChange={(e) => actualizar('order', e.target.value)}
                    className="select-marca w-full bg-white border-negro/10 text-[15px]"
                >
                    <option value="desc">Más reciente</option>
                    <option value="asc">Más antiguo</option>
                </select>
            </div>

            <button
                type="button"
                onClick={onLimpiar}
                className="px-4 py-2.5 rounded-xl border border-negro/10 text-[15px] font-semibold text-grisMarca hover:bg-plomoSuave transition"
            >
                Limpiar
            </button>
        </div>
    );
}
