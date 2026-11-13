import { leerSesion } from '../auth/authStorage';

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

    return fetch(url, {
        ...rest,
        headers: sinAuth ? { ...headers } : headersAuth(headers),
    });
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
