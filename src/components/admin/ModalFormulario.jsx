import { useState } from 'react';
import { User, X } from 'lucide-react';
import useEscapeKey from '../../hooks/useEscapeKey';
import { mensajeErrorHttp, urlClientes } from '../../lib/apiClientes';
import { camposFormulario, mensajeValidacionCliente, payloadCambios } from '../../utils/validacionCliente';

const campoClase = 'w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rojoMarca/20 focus:border-rojoMarca transition';

export default function ModalFormulario({ isOpen, onClose, onSubmitSuccess, clienteEdicion }) {
    useEscapeKey(isOpen, onClose);

    if (!isOpen) return null;

    return (
        <FormularioCliente
            key={clienteEdicion?.id ?? 'nuevo'}
            clienteEdicion={clienteEdicion}
            onClose={onClose}
            onSubmitSuccess={onSubmitSuccess}
        />
    );
}

function FormularioCliente({ clienteEdicion, onClose, onSubmitSuccess }) {
    const [formData, setFormData] = useState(() => camposFormulario(clienteEdicion));
    const [errorValidacion, setErrorValidacion] = useState('');
    const [guardando, setGuardando] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const mensaje = mensajeValidacionCliente(formData);
        if (mensaje) {
            setErrorValidacion(mensaje);
            return;
        }

        setErrorValidacion('');
        setGuardando(true);

        try {
            let url = urlClientes();
            let method = 'POST';
            let payload = camposFormulario(formData);

            if (clienteEdicion) {
                url = urlClientes(`/${clienteEdicion.id}`);
                method = 'PATCH';
                payload = payloadCambios(formData, clienteEdicion);
                if (Object.keys(payload).length === 0) {
                    onClose();
                    return;
                }
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                onSubmitSuccess();
                onClose();
            } else {
                setErrorValidacion(await mensajeErrorHttp(response, 'Error al guardar el cliente.'));
            }
        } catch {
            setErrorValidacion('Error de conexión con el servidor.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-negro/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto" onClick={onClose} role="presentation">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-cliente-titulo"
                className="modal-panel w-full max-w-2xl my-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-1 bg-rojoMarca" />
                <div className="modal-cabecera">
                    <h2 id="modal-cliente-titulo" className="text-xl font-serif font-bold text-negro flex items-center gap-2">
                        <User className="text-rojoMarca" />
                        {clienteEdicion ? 'Editar Perfil del Cliente' : 'Registrar Nuevo Cliente'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-rojoMarca transition" aria-label="Cerrar">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {errorValidacion && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
                            {errorValidacion}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        <div>
                            <label htmlFor="cliente-nombres" className="block text-sm font-semibold text-negro mb-1">Nombres <span className="text-rojoMarca">*</span></label>
                            <input id="cliente-nombres" type="text" name="nombres" required value={formData.nombres} onChange={handleInputChange} className={campoClase} />
                        </div>
                        <div>
                            <label htmlFor="cliente-apellidos" className="block text-sm font-semibold text-negro mb-1">Apellidos <span className="text-rojoMarca">*</span></label>
                            <input id="cliente-apellidos" type="text" name="apellidos" required value={formData.apellidos} onChange={handleInputChange} className={campoClase} />
                        </div>
                        <div>
                            <label htmlFor="cliente-cedula" className="block text-sm font-semibold text-negro mb-1">Cédula / RUC <span className="text-rojoMarca">*</span></label>
                            <input id="cliente-cedula" type="text" name="cedula_ruc" required value={formData.cedula_ruc} onChange={handleInputChange} className={campoClase} />
                        </div>
                        <div>
                            <label htmlFor="cliente-telefono" className="block text-sm font-semibold text-negro mb-1">Teléfono</label>
                            <input id="cliente-telefono" type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} className={campoClase} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="cliente-correo" className="block text-sm font-semibold text-negro mb-1">Correo Electrónico <span className="text-rojoMarca">*</span></label>
                            <input id="cliente-correo" type="email" name="correo" required value={formData.correo} onChange={handleInputChange} className={campoClase} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="cliente-direccion" className="block text-sm font-semibold text-negro mb-1">Dirección</label>
                            <input id="cliente-direccion" type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className={campoClase} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-negro/5">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-negro font-medium hover:bg-grisClaro rounded-xl transition border border-negro/10">Cancelar</button>
                        <button type="submit" disabled={guardando} className="btn-marca disabled:opacity-50">
                            {guardando ? 'Guardando...' : clienteEdicion ? 'Actualizar Datos' : 'Guardar Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
