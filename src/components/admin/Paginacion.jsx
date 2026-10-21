import { ChevronLeft, ChevronRight } from 'lucide-react';
import paginasVisibles from '../../utils/paginasVisibles';

export default function Paginacion({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="border-t border-gray-100 p-4 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm text-gray-500">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-center">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronLeft size={18} />
                </button>

                {paginasVisibles(currentPage, totalPages).map((item) => (
                    typeof item === 'string' ? (
                        <span key={item} className="w-9 h-9 flex items-center justify-center text-gray-400">…</span>
                    ) : (
                        <button
                            type="button"
                            key={item}
                            onClick={() => onPageChange(item)}
                            aria-current={currentPage === item ? 'page' : undefined}
                            className={`w-9 h-9 rounded-lg border text-sm font-medium transition ${currentPage === item
                                ? 'bg-rojoMarca text-white border-rojoMarca'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            {item}
                        </button>
                    )
                ))}

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
