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
                className="modal-panel w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-1 bg-rojoMarca" />
                <div className="modal-cabecera">
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
                <div className="modal-pie">
                    <button type="button" onClick={onClose} className="flex-1 py-3 bg-white text-negro font-medium rounded-xl hover:bg-grisClaro transition border border-negro/10">
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={confirming}
                        className="flex-1 py-3 bg-rojoMarca text-white font-medium rounded-xl hover:bg-vino transition disabled:opacity-50"
                    >
                        {confirming ? 'Procesando...' : actionText}
                    </button>
                </div>
            </div>
        </div>
    );
}
