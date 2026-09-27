import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ModalEliminar({
    isOpen,
    onClose,
    onConfirm,
    cliente, // Se mantiene este nombre por compatibilidad con el módulo de clientes
    title = "Eliminar Registro",
    actionText = "Sí, Eliminar"
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-negro/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-serif font-bold text-rojoMarca flex items-center gap-2">
                        <AlertTriangle size={24} /> {title}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-rojoMarca transition"><X size={24} /></button>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 text-base">
                        ¿Estás seguro de que deseas proceder? Esta acción afectará los registros del sistema.
                    </p>
                </div>
                <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-200 text-negro font-medium rounded-lg hover:bg-gray-300 transition">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-rojoMarca text-white font-medium rounded-lg hover:bg-red-800 transition">
                        {actionText}
                    </button>
                </div>
            </div>
        </div>
    );
}