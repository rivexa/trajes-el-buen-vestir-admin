import { leerSesion, limpiarSesion } from '../auth/authStorage';

export const EVENTO_SESION_EXPIRADA = 'tbv:sesion-expirada';

export function urlApi(path = '') {
    const base = import.meta.env.VITE_API_URL;
    if (!base) {
        throw new Error('Falta VITE_API_URL. Revisa el archivo .env.');
    }
    const raiz = String(base).replace(/\/$/, '');
    const sufijo = path.startsWith('/') ? path : path ? `/${path}` : '';
    return `${raiz}${sufijo}`;
}

export function headersAuth(extras = {}) {
    const headers = { ...extras };
    const sesion = leerSesion();
    if (sesion?.access_token) {
        const tipo = sesion.token_type || 'Bearer';
        headers.Authorization = `${tipo} ${sesion.access_token}`;
    }
    return headers;
}

function notificarSesionExpirada() {
    if (!leerSesion()) return;
    limpiarSesion();
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA));
    }
}

/**
 * fetch hacia el API del taller.
 * @param {string} input URL absoluta o path relativo a VITE_API_URL
 * @param {{ sinAuth?: boolean } & RequestInit} [options]
 */
export async function fetchApi(input, options = {}) {
    const { sinAuth = false, headers, ...rest } = options;
    const url = typeof input === 'string' && /^https?:\/\//i.test(input)
        ? input
        : urlApi(input);

    const response = await fetch(url, {
        ...rest,
        headers: sinAuth ? { ...headers } : headersAuth(headers),
    });

    // Guard global del back: token inválido/expirado → salir al login.
    if (!sinAuth && response.status === 401) {
        notificarSesionExpirada();
    }

    return response;
}

export async function mensajeErrorHttp(response, respaldo) {
    try {
        const data = await response.json();
        if (data?.message) {
            return Array.isArray(data.message) ? data.message[0] : data.message;
        }
    } catch {
        // cuerpo no JSON
    }
    return respaldo;
}
