import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ModalFormulario from './ModalFormulario';

describe('ModalFormulario', () => {
    it('rechaza un teléfono de prefijo inválido', async () => {
        const user = userEvent.setup();
        render(<ModalFormulario isOpen onClose={vi.fn()} onSubmitSuccess={vi.fn()} clienteEdicion={null} />);

        await user.type(screen.getByLabelText(/Nombres/), 'María-José');
        await user.type(screen.getByLabelText(/Apellidos/), 'Pérez');
        await user.type(screen.getByLabelText(/Cédula/), '1710034065');
        await user.type(screen.getByLabelText(/Teléfono/), '012345678');
        await user.type(screen.getByLabelText(/Correo/), 'maria@correo.com');
        await user.click(screen.getByRole('button', { name: 'Guardar Cliente' }));

        expect(await screen.findByText(/celular \(09\) o un convencional \(02 a 07\)/)).toBeInTheDocument();
    });

    it('prefills al editar y no pega al API si no hay cambios', async () => {
        const onClose = vi.fn();
        const onSubmitSuccess = vi.fn();
        const user = userEvent.setup();
        render(
            <ModalFormulario
                isOpen
                onClose={onClose}
                onSubmitSuccess={onSubmitSuccess}
                clienteEdicion={{
                    id: '1',
                    nombres: 'Néstor',
                    apellidos: 'Sarmiento',
                    cedula_ruc: '1753329182',
                    telefono: '0961284734',
                    correo: 'a@b.com',
                    direccion: 'Quito',
                }}
            />,
        );

        expect(screen.getByLabelText(/Nombres/)).toHaveValue('Néstor');
        await user.click(screen.getByRole('button', { name: 'Actualizar Datos' }));
        expect(onClose).toHaveBeenCalled();
        expect(onSubmitSuccess).not.toHaveBeenCalled();
    });
});
