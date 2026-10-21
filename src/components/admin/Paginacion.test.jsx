import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import paginasVisibles from '../../utils/paginasVisibles';
import Paginacion from './Paginacion';

describe('paginasVisibles', () => {
    it('lista todas las páginas si hay siete o menos', () => {
        expect(paginasVisibles(1, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('inserta elipsis cuando hay muchas páginas', () => {
        expect(paginasVisibles(1, 40)).toEqual([1, 2, 'ellipsis-2', 40]);
        expect(paginasVisibles(20, 40)).toEqual([1, 'ellipsis-1', 19, 20, 21, 'ellipsis-21', 40]);
    });
});

describe('Paginacion', () => {
    it('no renderiza si solo hay una página', () => {
        const { container } = render(<Paginacion currentPage={1} totalPages={1} onPageChange={vi.fn()} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('no pinta un botón por cada página cuando hay 40', async () => {
        const onPageChange = vi.fn();
        const user = userEvent.setup();
        render(<Paginacion currentPage={1} totalPages={40} onPageChange={onPageChange} />);
        expect(screen.getByRole('button', { name: '40' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '20' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Página siguiente' }));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });
});
