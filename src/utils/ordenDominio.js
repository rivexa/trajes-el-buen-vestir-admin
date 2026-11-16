/** Catálogo alineado al back (ordenes.dominio). */
export const TIPOS_ITEM_ORDEN = [
    'Confección a Medida',
    'Uniformes',
    'Arreglos',
    'Venta',
];

export const ESTADOS_DETALLE_ORDEN = [
    'Pendiente',
    'En Confección',
    'Listo para Prueba',
    'Terminado',
    'Entregado',
    'Anulada',
];

/** Estados productivos (sin Anulada) para selects de avance. */
export const ESTADOS_DETALLE_ACTIVOS = ESTADOS_DETALLE_ORDEN.filter((e) => e !== 'Anulada');

/** Al crear una Venta (entrega inmediata) solo tiene sentido Pendiente o Entregado. */
export const ESTADOS_VENTA_AL_CREAR = ['Pendiente', 'Entregado'];

const ALIAS_TIPO = {
    otro: 'Venta',
    otros: 'Venta',
    confección: 'Confección a Medida',
    confeccion: 'Confección a Medida',
    'confección a medida': 'Confección a Medida',
    arreglo: 'Arreglos',
    uniforme: 'Uniformes',
    uniformes: 'Uniformes',
};

export function normalizarTipoItem(valor) {
    const recortado = String(valor || '').trim();
    if (TIPOS_ITEM_ORDEN.includes(recortado)) return recortado;
    return ALIAS_TIPO[recortado.toLowerCase()] || 'Venta';
}

export function esTipoVenta(tipo) {
    return normalizarTipoItem(tipo) === 'Venta';
}

export function ordenAnulada(orden) {
    if (orden?.anulada === true) return true;
    const detalles = orden?.orden_detalles || [];
    if (!detalles.length) return orden?.estado === 'Anulada';
    return detalles.every((d) => d.estado === 'Anulada');
}

/** Resumen de estados de líneas para la tabla. */
export function resumenEstadosLineas(orden) {
    const detalles = orden?.orden_detalles || [];
    if (!detalles.length) {
        return { etiqueta: orden?.estado || '—', mixto: false, estados: [] };
    }
    const estados = [...new Set(detalles.map((d) => d.estado).filter(Boolean))];
    if (estados.length === 1) {
        return { etiqueta: estados[0], mixto: false, estados };
    }
    return {
        etiqueta: `${detalles.length} ítems`,
        mixto: true,
        estados,
    };
}

export function proximaFechaEntrega(orden) {
    const fechas = (orden?.orden_detalles || [])
        .map((d) => d.fecha_entrega)
        .filter(Boolean)
        .map((f) => String(f).slice(0, 10))
        .sort();
    return fechas[0] || null;
}

export function claseEstadoDetalle(estado) {
    switch (estado) {
        case 'Pendiente':
            return 'text-yellow-800 border-yellow-200 bg-yellow-50';
        case 'En Confección':
            return 'text-blue-800 border-blue-200 bg-blue-50';
        case 'Listo para Prueba':
            return 'text-purple-800 border-purple-200 bg-purple-50';
        case 'Terminado':
            return 'text-teal-800 border-teal-200 bg-teal-50';
        case 'Entregado':
            return 'text-green-800 border-green-200 bg-green-50';
        case 'Anulada':
            return 'text-red-700 border-red-200 bg-red-50';
        default:
            return 'text-grisMarca border-negro/10 bg-plomoSuave';
    }
}

export const ITEM_LINEA_VACIO = () => ({
    tipo_item: 'Confección a Medida',
    descripcion: '',
    cantidad: 1,
    precio_unitario: '',
    estado: 'Pendiente',
    fecha_entrega: '',
    imagen_referencia_url: '',
});
