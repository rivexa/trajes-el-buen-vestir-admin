import { mensajeErrorHttp, urlApi } from './apiBase';

function conPeriodo(path, { desde, hasta } = {}) {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    const query = params.toString();
    return query ? `${path}?${query}` : path;
}

export async function fetchDashboard({ desde, hasta, signal } = {}) {
    const response = await fetch(urlApi(conPeriodo('/dashboard', { desde, hasta })), { signal });
    if (!response.ok) {
        throw new Error(await mensajeErrorHttp(response, 'No se pudo cargar el dashboard.'));
    }
    return response.json();
}

export async function fetchCrecimientoClientes({ desde, hasta, signal } = {}) {
    const response = await fetch(urlApi(conPeriodo('/clientes/crecimiento', { desde, hasta })), { signal });
    if (!response.ok) {
        throw new Error(await mensajeErrorHttp(response, 'No se pudo cargar el crecimiento de clientes.'));
    }
    return response.json();
}

export async function fetchHistorialPagos({ desde, hasta, signal } = {}) {
    const response = await fetch(urlApi(conPeriodo('/ordenes/pagos/historial', { desde, hasta })), { signal });
    if (!response.ok) {
        throw new Error(await mensajeErrorHttp(response, 'No se pudo cargar el historial de pagos.'));
    }
    return response.json();
}
