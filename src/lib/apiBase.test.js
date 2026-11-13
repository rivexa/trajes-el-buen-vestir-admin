import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { guardarSesion, leerSesion, limpiarSesion } from '../auth/authStorage';
import { server } from '../test/server';
import { EVENTO_SESION_EXPIRADA, fetchApi, headersAuth } from './apiBase';

describe('headersAuth', () => {
    beforeEach(() => {
        limpiarSesion();
    });

    it('no agrega Authorization sin sesión', () => {
        expect(headersAuth({ 'Content-Type': 'application/json' })).toEqual({
            'Content-Type': 'application/json',
        });
    });

    it('agrega Bearer desde la sesión', () => {
        guardarSesion({
            access_token: 'abc.token',
            token_type: 'Bearer',
            user: { id: '1', nombre: 'Admin', rol: 'admin' },
        });

        expect(headersAuth()).toEqual({
            Authorization: 'Bearer abc.token',
        });
    });
});

describe('fetchApi y sesión expirada', () => {
    beforeEach(() => {
        limpiarSesion();
    });

    it('limpia la sesión y emite evento ante 401 autenticado', async () => {
        guardarSesion({
            access_token: 'token-viejo',
            token_type: 'Bearer',
            user: { id: '1', nombre: 'Admin', rol: 'admin' },
        });

        server.use(
            http.get('http://api.test/dashboard', () => (
                HttpResponse.json({ message: 'No autorizado.' }, { status: 401 })
            )),
        );

        const onExpirada = vi.fn();
        window.addEventListener(EVENTO_SESION_EXPIRADA, onExpirada);

        const response = await fetchApi('/dashboard');

        expect(response.status).toBe(401);
        expect(leerSesion()).toBeNull();
        expect(onExpirada).toHaveBeenCalledTimes(1);

        window.removeEventListener(EVENTO_SESION_EXPIRADA, onExpirada);
    });

    it('no limpia sesión en 401 de login (sinAuth)', async () => {
        guardarSesion({
            access_token: 'sigue-valido',
            token_type: 'Bearer',
            user: { id: '1', nombre: 'Admin', rol: 'admin' },
        });

        const response = await fetchApi('/auth/login', {
            method: 'POST',
            sinAuth: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: 'admin', password: 'mala' }),
        });

        expect(response.status).toBe(401);
        expect(leerSesion()?.access_token).toBe('sigue-valido');
    });
});
