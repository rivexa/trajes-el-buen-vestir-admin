import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Paginacion({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="border-t border-gray-100 p-4 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronLeft size={18} />
                </button>

                {[...Array(totalPages)].map((_, idx) => (
                    <button
                        key={idx + 1}
                        onClick={() => onPageChange(idx + 1)}
                        className={`w-9 h-9 rounded-lg border text-sm font-medium transition ${currentPage === idx + 1
                                ? 'bg-rojoMarca text-white border-rojoMarca'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                    >
                        {idx + 1}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}