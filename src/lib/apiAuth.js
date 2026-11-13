/**
 * Login de personal del taller.
 * Hoy: mock local para armar el frontend.
 * Luego: POST /auth/login en el backend Nest (ver comentarios).
 *
 * Contrato esperado del backend:
 * POST /auth/login
 * body: { usuario: string, password: string }
 * 200: { access_token: string, token_type?: 'Bearer', user: { id, nombre, rol } }
 * 401: { message: string }
 */
export async function loginConCredenciales({ usuario, password }) {
    const usuarioLimpio = String(usuario || '').trim();
    const clave = String(password || '');

    if (!usuarioLimpio || !clave) {
        throw new Error('Ingresa usuario y contraseña.');
    }

    // --- Conexión real (activar cuando exista el backend) ---
    // import { mensajeErrorHttp, urlApi } from './apiBase';
    // const response = await fetch(urlApi('/auth/login'), {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ usuario: usuarioLimpio, password: clave }),
    // });
    // if (!response.ok) {
    //     throw new Error(await mensajeErrorHttp(response, 'No se pudo iniciar sesión.'));
    // }
    // return response.json();

    await new Promise((resolve) => setTimeout(resolve, 450));

    return {
        access_token: `mock.${btoa(unescape(encodeURIComponent(usuarioLimpio)))}.local`,
        token_type: 'Bearer',
        user: {
            id: 'usuario-local',
            nombre: usuarioLimpio,
            rol: 'admin',
        },
    };
}
