import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { guardarSesion, limpiarSesion } from '../auth/authStorage';
import { server } from './server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
    guardarSesion({
        access_token: 'test-token',
        token_type: 'Bearer',
        user: { id: 'test', nombre: 'Usuario prueba', rol: 'admin' },
    });
});
afterEach(() => {
    server.resetHandlers();
    cleanup();
    limpiarSesion();
});
afterAll(() => server.close());
