import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../auth/AuthContext';
import { limpiarSesion } from '../auth/authStorage';
import { server } from '../test/server';
import Login from './Login';

function renderLogin(rutaInicial = '/login') {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[rutaInicial]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<div>Panel privado</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>,
    );
}

describe('Login', () => {
    it('muestra el formulario cuando no hay sesión', () => {
        limpiarSesion();
        renderLogin();

        expect(screen.getByRole('heading', { name: /Iniciar sesión/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/^Usuario$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Contraseña$/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    });

    it('muestra errores de diseño si faltan campos al enviar', async () => {
        limpiarSesion();
        const user = userEvent.setup();
        renderLogin();

        await user.click(screen.getByRole('button', { name: /Entrar/i }));

        expect(screen.getByText('Ingresa tu usuario.')).toBeInTheDocument();
        expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument();
        expect(screen.getByLabelText(/^Usuario$/i)).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText(/^Contraseña$/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('inicia sesión con Enter desde usuario o contraseña', async () => {
        limpiarSesion();
        const user = userEvent.setup();
        renderLogin();

        await user.type(screen.getByLabelText(/^Usuario$/i), 'admin');
        await user.type(screen.getByLabelText(/^Contraseña$/i), 'Admin123!');
        await user.keyboard('{Enter}');

        expect(await screen.findByText('Panel privado')).toBeInTheDocument();
    });

    it('muestra el error del API si las credenciales fallan', async () => {
        limpiarSesion();
        const user = userEvent.setup();
        renderLogin();

        await user.type(screen.getByLabelText(/^Usuario$/i), 'admin');
        await user.type(screen.getByLabelText(/^Contraseña$/i), 'mala');
        await user.click(screen.getByRole('button', { name: /Entrar/i }));

        expect(await screen.findByText('Usuario o contraseña incorrectos.')).toBeInTheDocument();
    });

    it('muestra aviso claro si el back limita intentos (429)', async () => {
        limpiarSesion();
        server.use(
            http.post('http://api.test/auth/login', () => (
                HttpResponse.json(
                    { statusCode: 429, message: 'ThrottlerException: Too Many Requests' },
                    { status: 429 },
                )
            )),
        );
        const user = userEvent.setup();
        renderLogin();

        await user.type(screen.getByLabelText(/^Usuario$/i), 'admin');
        await user.type(screen.getByLabelText(/^Contraseña$/i), 'Admin123!');
        await user.click(screen.getByRole('button', { name: /Entrar/i }));

        expect(
            await screen.findByText('Demasiados intentos. Espera un minuto e inténtalo de nuevo.'),
        ).toBeInTheDocument();
    });

    it('valida con Enter si faltan campos', async () => {
        limpiarSesion();
        const user = userEvent.setup();
        renderLogin();

        await user.click(screen.getByLabelText(/^Usuario$/i));
        await user.keyboard('{Enter}');

        expect(screen.getByText('Ingresa tu usuario.')).toBeInTheDocument();
        expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument();
    });

    it('redirige al panel si ya hay sesión', async () => {
        renderLogin();

        await waitFor(() => {
            expect(screen.getByText('Panel privado')).toBeInTheDocument();
        });
    });
});
