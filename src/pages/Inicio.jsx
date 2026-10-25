import { ArrowRight, FileText, Receipt, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const MODULOS = [
    {
        to: '/clientes',
        icon: Users,
        title: 'Clientes',
        copy: 'Directorio, identificación y datos de contacto para facturar.',
    },
    {
        to: '/ordenes',
        icon: FileText,
        title: 'Órdenes',
        copy: 'Confecciones, arreglos, abonos y estado del pedido.',
    },
    {
        to: '/facturas',
        icon: Receipt,
        title: 'Facturación',
        copy: 'Emisión de comprobantes electrónicos y consulta SRI.',
    },
];

export default function Inicio() {
    return (
        <div className="pagina-admin max-w-5xl">
            <div className="card-panel overflow-hidden mb-8">
                <div className="h-1 bg-rojoMarca" />
                <div className="p-6 md:p-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rojoMarca mb-3">
                        Trajes El Buen Vestir
                    </p>
                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-negro">Panel de control</h1>
                    <p className="text-grisMarca mt-3 max-w-xl text-[15px] leading-relaxed">
                        Gestione el mostrador: clientes, órdenes de sastrería y facturación electrónica.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MODULOS.map(({ to, icon: Icon, title, copy }) => (
                    <Link key={to} to={to} className="card-panel p-6 group hover:border-rojoMarca/30 transition-colors flex flex-col">
                        <div className="bg-negro text-white w-11 h-11 rounded-xl flex items-center justify-center mb-5">
                            <Icon size={20} strokeWidth={1.75} />
                        </div>
                        <h2 className="font-serif text-xl font-bold text-negro">{title}</h2>
                        <p className="text-sm text-grisMarca/80 mt-2 leading-relaxed">{copy}</p>
                        <span className="mt-auto pt-5 inline-flex items-center gap-1 text-sm font-semibold text-rojoMarca">
                            Abrir <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
