import { fetchApi, mensajeErrorHttp, urlApi } from './apiBase';

/**
 * Login de personal del taller.
 * POST /auth/login
 * body: { usuario, password }
 * 200: { access_token, token_type, user: { id, nombre, rol } }
 * 401: { message }
 */
export async function loginConCredenciales({ usuario, password }) {
    const usuarioLimpio = String(usuario || '').trim();
    const clave = String(password || '');

    if (!usuarioLimpio || !clave) {
        throw new Error('Ingresa usuario y contraseña.');
    }

    const response = await fetchApi(urlApi('/auth/login'), {
        method: 'POST',
        sinAuth: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioLimpio, password: clave }),
    });

    if (!response.ok) {
        throw new Error(await mensajeErrorHttp(response, 'No se pudo iniciar sesión.'));
    }

    return response.json();
}

/** GET /auth/me — valida el JWT y devuelve el usuario público. */
export async function obtenerPerfil() {
    const response = await fetchApi('/auth/me');
    if (!response.ok) {
        throw new Error(await mensajeErrorHttp(response, 'Sesión inválida o expirada.'));
    }
    return response.json();
}
