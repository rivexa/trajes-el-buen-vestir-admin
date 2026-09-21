import { AlertTriangle } from 'lucide-react';

export default function ModalEliminar({ isOpen, onClose, onConfirm, cliente }) {
    if (!isOpen || !cliente) return null;

    return (
        <div className="fixed inset-0 bg-negro/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 text-rojoMarca rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-negro mb-2">¿Eliminar cliente?</h3>
                    <p className="text-gray-500 mb-6">
                        Estás a punto de eliminar a <span className="font-semibold text-negro">{cliente.nombres} {cliente.apellidos}</span>.
                        Esta acción no se puede deshacer.
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button onClick={onClose} className="w-full px-5 py-3 text-negro font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancelar</button>
                        <button onClick={onConfirm} className="w-full px-5 py-3 bg-rojoMarca text-white font-medium hover:bg-red-800 rounded-lg shadow-md transition">Sí, Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}