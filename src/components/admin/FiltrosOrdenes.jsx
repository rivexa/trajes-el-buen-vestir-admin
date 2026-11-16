import { useEffect, useId, useRef, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { ESTADOS_DETALLE_ORDEN } from '../../utils/ordenDominio';

const OPCIONES_ORDER = [
    { value: 'desc', label: 'Más reciente', Icon: ArrowDown },
    { value: 'asc', label: 'Más antiguo', Icon: ArrowUp },
];

export default function FiltrosOrdenes({
    estado,
    desde,
    hasta,
    sort,
    order,
    onChange,
    onLimpiar,
}) {
    const [menuOrderAbierto, setMenuOrderAbierto] = useState(false);
    const menuRef = useRef(null);
    const menuId = useId();

    const actualizar = (campo, valor) => {
        onChange({ estado, desde, hasta, sort, order, [campo]: valor });
    };

    useEffect(() => {
        if (!menuOrderAbierto) return undefined;
        const cerrar = (evento) => {
            if (!menuRef.current?.contains(evento.target)) {
                setMenuOrderAbierto(false);
            }
        };
        document.addEventListener('mousedown', cerrar);
        return () => document.removeEventListener('mousedown', cerrar);
    }, [menuOrderAbierto]);

    const opcionActiva = OPCIONES_ORDER.find((op) => op.value === order) || OPCIONES_ORDER[0];

    return (
        <div className="card-panel mb-6 p-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="min-w-[11rem] flex-1">
                <label htmlFor="filtro-estado" className="block text-[13px] font-semibold text-grisMarca mb-1.5">
                    Estado
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
                <div className="flex items-stretch gap-2">
                    <select
                        id="filtro-sort"
                        value={sort}
                        onChange={(e) => actualizar('sort', e.target.value)}
                        className="select-marca flex-1 min-w-0 bg-white border-negro/10 text-[15px]"
                    >
                        <option value="fecha_creacion">Fecha de creación</option>
                        <option value="fecha_entrega">Fecha de entrega</option>
                    </select>

                    <div className="relative shrink-0" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setMenuOrderAbierto((v) => !v)}
                            className="h-full min-h-[2.75rem] w-11 inline-flex flex-col items-center justify-center gap-0.5 rounded-xl border border-negro/10 bg-white text-grisMarca hover:bg-plomoSuave hover:text-negro transition"
                            aria-label={`Sentido del orden: ${opcionActiva.label}`}
                            aria-haspopup="listbox"
                            aria-expanded={menuOrderAbierto}
                            aria-controls={menuId}
                            title={opcionActiva.label}
                        >
                            <ArrowUp
                                size={14}
                                strokeWidth={2.5}
                                className={order === 'asc' ? 'text-rojoMarca' : 'text-grisMarca/35'}
                            />
                            <ArrowDown
                                size={14}
                                strokeWidth={2.5}
                                className={order === 'desc' ? 'text-rojoMarca' : 'text-grisMarca/35'}
                            />
                        </button>

                        {menuOrderAbierto ? (
                            <ul
                                id={menuId}
                                role="listbox"
                                aria-label="Sentido del orden"
                                className="absolute right-0 top-[calc(100%+0.35rem)] z-20 min-w-[11rem] overflow-hidden rounded-xl border border-negro/10 bg-white shadow-panel"
                            >
                                {OPCIONES_ORDER.map(({ value, label, Icon }) => {
                                    const activo = order === value;
                                    return (
                                        <li key={value} role="option" aria-selected={activo}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    actualizar('order', value);
                                                    setMenuOrderAbierto(false);
                                                }}
                                                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-[15px] transition ${
                                                    activo
                                                        ? 'bg-plomoSuave font-semibold text-negro'
                                                        : 'text-grisMarca hover:bg-plomoSuave/70 hover:text-negro'
                                                }`}
                                            >
                                                <Icon size={16} className={activo ? 'text-rojoMarca' : ''} />
                                                {label}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : null}
                    </div>
                </div>
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
