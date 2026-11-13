import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { server } from '../test/server';
import Inicio from './Inicio';

describe('Inicio dashboard', () => {
    it('muestra indicadores del taller desde el API', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <Inicio />
            </MemoryRouter>,
        );

        expect(screen.getByRole('status', { name: /Cargando indicadores/i })).toBeInTheDocument();
        expect(await screen.findByText('Vista general')).toBeInTheDocument();
        expect(screen.getByText('Cobrado en el período')).toBeInTheDocument();
        expect(screen.getAllByText('$70.00').length).toBeGreaterThan(0);
        expect(screen.getByText('Cobros del período')).toBeInTheDocument();
        expect(screen.getByText('Órdenes por estado')).toBeInTheDocument();
        expect(screen.getByText('Últimos pagos')).toBeInTheDocument();
        expect(screen.getByText('ORD-0005')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /\d{2}\/\d{2}\/\d{4}/i }));
        expect(screen.getByLabelText('Desde')).toBeInTheDocument();
        expect(screen.getByLabelText('Hasta')).toBeInTheDocument();
    });

    it('sigue mostrando crecimiento si el resumen falla parcialmente', async () => {
        server.use(
            http.get('http://api.test/dashboard', () => HttpResponse.json(
                { message: 'No se pudieron cargar los pagos del dashboard.' },
                { status: 500 },
            )),
            http.get('http://api.test/ordenes/pagos/historial', () => HttpResponse.json(
                { message: 'No se pudo consultar el historial de pagos.' },
                { status: 500 },
            )),
        );

        render(
            <MemoryRouter>
                <Inicio />
            </MemoryRouter>,
        );

        expect(await screen.findByText(/Algunos indicadores no respondieron/)).toBeInTheDocument();
        expect(screen.getByText('Clientes')).toBeInTheDocument();
    });
});
