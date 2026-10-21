import { AlertTriangle, X } from 'lucide-react';
import useEscapeKey from '../../hooks/useEscapeKey';
import etiquetaRegistro from '../../utils/etiquetaRegistro';

export default function ModalEliminar({
    isOpen,
    onClose,
    onConfirm,
    cliente,
    children,
    title = 'Eliminar Registro',
    actionText = 'Sí, Eliminar',
    error = '',
    confirming = false,
}) {
    useEscapeKey(isOpen, onClose);

    if (!isOpen) return null;

    const etiqueta = etiquetaRegistro(cliente);

    return (
        <div className="fixed inset-0 bg-negro/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="presentation">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-eliminar-titulo"
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <h2 id="modal-eliminar-titulo" className="text-xl font-serif font-bold text-rojoMarca flex items-center gap-2">
                        <AlertTriangle size={24} /> {title}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-rojoMarca transition" aria-label="Cerrar">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    {children || (
                        <p className="text-gray-700 text-base">
                            {etiqueta
                                ? <>¿Estás seguro de eliminar a <strong>{etiqueta}</strong>? Esta acción no se puede deshacer.</>
                                : '¿Estás seguro de que deseas proceder? Esta acción afectará los registros del sistema.'}
                        </p>
                    )}
                    {error && (
                        <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>
                    )}
                </div>
                <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
                    <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-200 text-negro font-medium rounded-lg hover:bg-gray-300 transition">
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={confirming}
                        className="flex-1 py-3 bg-rojoMarca text-white font-medium rounded-lg hover:bg-red-800 transition disabled:opacity-50"
                    >
                        {confirming ? 'Procesando...' : actionText}
                    </button>
                </div>
            </div>
        </div>
    );
}
