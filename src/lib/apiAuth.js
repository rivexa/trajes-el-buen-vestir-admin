import { mensajeErrorHttp, urlApi } from './apiBase';

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

    const response = await fetch(urlApi('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioLimpio, password: clave }),
    });

    if (!response.ok) {
        throw new Error(await mensajeErrorHttp(response, 'No se pudo iniciar sesión.'));
    }

    return response.json();
}
