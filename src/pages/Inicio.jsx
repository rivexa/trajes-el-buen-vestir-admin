import { FileText, Receipt, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const ACCESOS = [
    { to: '/clientes', icon: Users, title: 'Clientes' },
    { to: '/ordenes', icon: FileText, title: 'Órdenes' },
    { to: '/facturas', icon: Receipt, title: 'Facturación' },
];

export default function Inicio() {
    return (
        <div className="pagina-admin max-w-4xl">
            <h1 className="font-serif text-3xl font-bold text-negro mb-6">Inicio</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ACCESOS.map(({ to, icon: Icon, title }) => (
                    <Link
                        key={to}
                        to={to}
                        className="card-panel p-6 hover:border-rojoMarca/30 transition-colors flex flex-col items-center text-center gap-4"
                    >
                        <span className="bg-negro text-white w-14 h-14 rounded-xl flex items-center justify-center">
                            <Icon size={26} strokeWidth={1.75} />
                        </span>
                        <span className="font-serif text-xl font-bold text-negro">{title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
