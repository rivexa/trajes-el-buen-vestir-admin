import { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/clientes`;

export default function ModalFormulario({ isOpen, onClose, onSubmitSuccess, clienteEdicion }) {
    const [formData, setFormData] = useState({ nombres: '', apellidos: '', cedula_ruc: '', telefono: '', correo: '', direccion: '' });
    const [errorValidacion, setErrorValidacion] = useState('');

    useEffect(() => {
        if (clienteEdicion) setFormData(clienteEdicion);
        else setFormData({ nombres: '', apellidos: '', cedula_ruc: '', telefono: '', correo: '', direccion: '' });
        setErrorValidacion('');
    }, [clienteEdicion, isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validarIdentificacionEcuatoriana = (val) => {
        if (!val || (val.length !== 10 && val.length !== 13)) return false;
        if (!/^\d+$/.test(val)) return false;
        const provincia = parseInt(val.substring(0, 2), 10);
        if (provincia < 1 || provincia > 24) return false;
        const tercerDigito = parseInt(val.charAt(2), 10);

        if (tercerDigito < 6) {
            if (val.length === 13 && val.substring(10, 13) !== '001') return false;
            const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
            let suma = 0;
            for (let i = 0; i < 9; i++) {
                let valor = parseInt(val.charAt(i), 10) * coeficientes[i];
                suma += valor > 9 ? valor - 9 : valor;
            }
            return (suma % 10 === 0 ? 0 : 10 - (suma % 10)) === parseInt(val.charAt(9), 10);
        }

        if (tercerDigito === 9 && val.length === 13) {
            if (val.substring(10, 13) !== '001') return false;
            const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
            let suma = 0;
            for (let i = 0; i < 9; i++) suma += parseInt(val.charAt(i), 10) * coeficientes[i];
            return (suma % 11 === 0 ? 0 : 11 - (suma % 11)) === parseInt(val.charAt(9), 10);
        }

        if (tercerDigito === 6 && val.length === 13) {
            if (val.substring(10, 13) !== '0001') return false;
            const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
            let suma = 0;
            for (let i = 0; i < 8; i++) suma += parseInt(val.charAt(i), 10) * coeficientes[i];
            return (suma % 11 === 0 ? 0 : 11 - (suma % 11)) === parseInt(val.charAt(8), 10);
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorValidacion('');

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombres) || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidos)) {
            setErrorValidacion('Los nombres y apellidos solo pueden contener letras.');
            return;
        }

        if (formData.telefono && formData.telefono.trim() !== '') {
            if (!/^09\d{8}$|^02\d{7}$/.test(formData.telefono.trim())) {
                setErrorValidacion('El teléfono debe ser un celular válido o un convencional.');
                return;
            }
        }

        if (!validarIdentificacionEcuatoriana(formData.cedula_ruc)) {
            setErrorValidacion('La cédula o RUC ingresado no es válido.');
            return;
        }

        try {
            let url = API_URL;
            let method = 'POST';
            let payload = formData;

            if (clienteEdicion) {
                url = `${API_URL}/${clienteEdicion.id}`;
                method = 'PATCH';
                payload = {};
                Object.keys(formData).forEach(key => {
                    if (formData[key] !== clienteEdicion[key]) {
                        payload[key] = formData[key];
                    }
                });

                if (Object.keys(payload).length === 0) return onClose();
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                onSubmitSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                let errorMessage = 'Error al guardar el cliente.';
                if (errorData.message) {
                    errorMessage = Array.isArray(errorData.message) ? errorData.message[0] : errorData.message;
                }
                setErrorValidacion(errorMessage);
            }
        } catch (error) {
            setErrorValidacion('Error de conexión con el servidor.');
        }
    };

    return (
        <div className="fixed inset-0 bg-negro/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-serif font-bold text-negro flex items-center gap-2">
                        <User className="text-rojoMarca" />
                        {clienteEdicion ? 'Editar Perfil del Cliente' : 'Registrar Nuevo Cliente'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-rojoMarca transition"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {errorValidacion && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
                            {errorValidacion}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-negro mb-1">Nombres <span className="text-rojoMarca">*</span></label>
                            <input type="text" name="nombres" required value={formData.nombres} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rojoMarca/20 focus:border-rojoMarca transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-negro mb-1">Apellidos <span className="text-rojoMarca">*</span></label>
                            <input type="text" name="apellidos" required value={formData.apellidos} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rojoMarca/20 focus:border-rojoMarca transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-negro mb-1">Cédula / RUC <span className="text-rojoMarca">*</span></label>
                            <input type="text" name="cedula_ruc" required value={formData.cedula_ruc} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rojoMarca/20 focus:border-rojoMarca transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-negro mb-1">Teléfono</label>
                            <input type="text" name="telefono" value={formData.telefono || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rojoMarca/20 focus:border-rojoMarca transition" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-negro mb-1">Correo Electrónico <span className="text-rojoMarca">*</span></label>
                            <input type="email" name="correo" required value={formData.correo || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rojoMarca/20 focus:border-rojoMarca transition" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-negro mb-1">Dirección</label>
                            <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rojoMarca/20 focus:border-rojoMarca transition" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-negro font-medium hover:bg-gray-100 rounded-lg transition border border-gray-200">Cancelar</button>
                        <button type="submit" className="px-6 py-3 bg-rojoMarca text-white font-medium rounded-lg hover:bg-red-800 shadow-md transition">
                            {clienteEdicion ? 'Actualizar Datos' : 'Guardar Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}