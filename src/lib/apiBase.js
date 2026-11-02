export function urlApi(path = '') {
    const base = import.meta.env.VITE_API_URL;
    if (!base) {
        throw new Error('Falta VITE_API_URL. Revisa el archivo .env.');
    }
    const raiz = String(base).replace(/\/$/, '');
    const sufijo = path.startsWith('/') ? path : path ? `/${path}` : '';
    return `${raiz}${sufijo}`;
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
