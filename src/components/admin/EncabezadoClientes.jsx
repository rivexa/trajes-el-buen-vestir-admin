import { Plus, Users } from 'lucide-react';

export default function EncabezadoClientes({ onNuevo }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-5">
                <div className="bg-negro p-3 rounded-lg text-white shadow-md">
                    <Users size={32} />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-negro">Directorio de Clientes</h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Directorio para facturación y órdenes de pedido.</p>
                </div>
            </div>
            <button
                type="button"
                onClick={onNuevo}
                className="w-full md:w-auto bg-rojoMarca hover:bg-red-800 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-md"
            >
                <Plus size={20} /> Nuevo Cliente
            </button>
        </div>
    );
}
