import { FileText, LayoutDashboard, Menu, Receipt, Users, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const LINKS = [
    { to: '/', label: 'Inicio', icon: LayoutDashboard },
    { to: '/clientes', label: 'Clientes', icon: Users },
    { to: '/ordenes', label: 'Órdenes', icon: FileText },
    { to: '/facturas', label: 'Facturación', icon: Receipt },
];

export function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-negro/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={closeMenu}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-negro text-white flex flex-col h-screen transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-1 bg-rojoMarca shrink-0" />
                <div className="px-5 py-5 border-b border-white/10">
                    <div className="flex justify-end md:hidden mb-2">
                        <button type="button" onClick={closeMenu} className="text-white/60 hover:text-white transition" aria-label="Cerrar menú">
                            <X size={24} />
                        </button>
                    </div>
                    <Link to="/" onClick={closeMenu} className="block">
                        <img
                            src="/logo-dark.png"
                            alt="Trajes El Buen Vestir"
                            className="w-full h-auto object-contain"
                        />
                    </Link>
                    <p className="mt-3 text-lg font-medium tracking-wide text-white/70">Panel interno</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {LINKS.map(({ to, label, icon: Icon }) => {
                        const activo = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                onClick={closeMenu}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-lg transition-colors ${
                                    activo
                                        ? 'bg-rojoMarca text-white'
                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon size={20} strokeWidth={1.75} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-6 py-5 border-t border-white/10">
                    <p className="font-serif text-lg text-white/90">Distinción y elegancia</p>
                    <p className="text-base text-white/50 mt-1">Uso exclusivo del personal</p>
                </div>
            </aside>
        </>
    );
}

export function BarraMovil({ onOpen }) {
    return (
        <div className="md:hidden flex items-center justify-between bg-negro px-4 py-3 text-white z-30 border-b border-rojoMarca">
            <div className="flex items-center gap-3">
                <button type="button" onClick={onOpen} className="text-white/70 hover:text-white transition" aria-label="Abrir menú">
                    <Menu size={22} />
                </button>
                <Link to="/" className="inline-flex">
                    <img src="/logo-dark.png" alt="Trajes El Buen Vestir" className="h-18 w-auto object-contain" />
                </Link>
            </div>
        </div>
    );
}
