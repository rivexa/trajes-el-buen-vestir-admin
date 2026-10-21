import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../test/server';
import Clientes from './Clientes';

describe('Clientes', () => {
    it('muestra el directorio cuando el API responde', async () => {
        render(<Clientes />);
        expect(screen.getByText(/Consultando base de datos/)).toBeInTheDocument();
        expect(await screen.findByText('Néstor Sarmiento')).toBeInTheDocument();
        expect(screen.getByText('1753329182')).toBeInTheDocument();
    });

    it('muestra el error cuando el API falla', async () => {
        server.use(
            http.get('http://api.test/clientes', () => HttpResponse.json({ message: 'Caído' }, { status: 500 })),
        );
        render(<Clientes />);
        expect(await screen.findByText(/Caído|No se pudo cargar/)).toBeInTheDocument();
    });
});
