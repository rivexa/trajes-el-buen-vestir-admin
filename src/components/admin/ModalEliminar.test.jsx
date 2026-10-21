import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import etiquetaRegistro from '../../utils/etiquetaRegistro';
import ModalEliminar from './ModalEliminar';

describe('etiquetaRegistro', () => {
    it('prioriza el nombre del cliente y cae a orden o factura', () => {
        expect(etiquetaRegistro({ nombres: 'Néstor', apellidos: 'Sarmiento' })).toBe('Néstor Sarmiento');
        expect(etiquetaRegistro({ numero_orden: 7 })).toBe('ORD-0007');
        expect(etiquetaRegistro({ secuencial_local: 12 })).toBe('FAC-00012');
    });
});

describe('ModalEliminar', () => {
    it('nombra al cliente en el aviso', () => {
        render(
            <ModalEliminar
                isOpen
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                cliente={{ nombres: 'Néstor', apellidos: 'Sarmiento' }}
            />,
        );
        expect(screen.getByText(/Néstor Sarmiento/)).toBeInTheDocument();
    });

    it('muestra children cuando se pasan', () => {
        render(
            <ModalEliminar isOpen onClose={vi.fn()} onConfirm={vi.fn()}>
                <p>Aviso del SRI</p>
            </ModalEliminar>,
        );
        expect(screen.getByText('Aviso del SRI')).toBeInTheDocument();
    });

    it('cierra con Escape', async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(<ModalEliminar isOpen onClose={onClose} onConfirm={vi.fn()} />);
        await user.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalled();
    });
});
