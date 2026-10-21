export function urlClientes(path = '') {
    const base = import.meta.env.VITE_API_URL;
    if (!base) {
        throw new Error('Falta VITE_API_URL. Revisa el archivo .env.');
    }
    return `${String(base).replace(/\/$/, '')}/clientes${path}`;
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
