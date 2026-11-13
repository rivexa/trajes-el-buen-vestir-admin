import { beforeEach, describe, expect, it } from 'vitest';
import { guardarSesion, limpiarSesion } from '../auth/authStorage';
import { headersAuth } from './apiBase';

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
