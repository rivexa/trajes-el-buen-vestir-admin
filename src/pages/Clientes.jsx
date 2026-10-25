import { useState } from 'react';
import BarraBusqueda from '../components/admin/BarraBusqueda';
import EncabezadoClientes from '../components/admin/EncabezadoClientes';
import ModalEliminar from '../components/admin/ModalEliminar';
import ModalFormulario from '../components/admin/ModalFormulario';
import TablaClientes from '../components/admin/TablaClientes';
import useClientes from '../hooks/useClientes';

export default function Clientes() {
    const {
        clientes,
        loading,
        error,
        searchInput,
        currentPage,
        totalPages,
        handleSearchChange,
        setCurrentPage,
        recargar,
        eliminarCliente,
    } = useClientes();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [clienteEdicion, setClienteEdicion] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [eliminando, setEliminando] = useState(false);

    const handleOpenForm = (cliente = null) => {
        setClienteEdicion(cliente);
        setIsFormOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!clienteToDelete) return;
        setDeleteError('');
        setEliminando(true);
        try {
            await eliminarCliente(clienteToDelete.id);
            setIsDeleteOpen(false);
            setClienteToDelete(null);
        } catch (err) {
            setDeleteError(err.message || 'No se pudo eliminar el cliente.');
        } finally {
            setEliminando(false);
        }
    };

    return (
        <div className="pagina-admin">
            <EncabezadoClientes onNuevo={() => handleOpenForm()} />

            <BarraBusqueda
                label="Buscar clientes"
                placeholder="Buscar por cédula, RUC o nombre..."
                value={searchInput}
                onChange={handleSearchChange}
            />

            <TablaClientes
                clientes={clientes}
                loading={loading}
                error={error}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onEditar={handleOpenForm}
                onEliminar={(cliente) => {
                    setClienteToDelete(cliente);
                    setDeleteError('');
                    setIsDeleteOpen(true);
                }}
            />

            <ModalFormulario
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmitSuccess={recargar}
                clienteEdicion={clienteEdicion}
            />
            <ModalEliminar
                isOpen={isDeleteOpen}
                onClose={() => { setIsDeleteOpen(false); setDeleteError(''); }}
                onConfirm={handleDeleteConfirm}
                cliente={clienteToDelete}
                title="Eliminar Cliente"
                error={deleteError}
                confirming={eliminando}
            />
        </div>
    );
}
