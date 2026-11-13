import { FileText, Home, LogOut, Menu, Receipt, Users, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const LINKS = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/clientes', label: 'Clientes', icon: Users },
    { to: '/ordenes', label: 'Órdenes', icon: FileText },
    { to: '/facturas', label: 'Facturación', icon: Receipt },
];

export function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();
    const closeMenu = () => setIsOpen(false);

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate('/login', { replace: true });
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-negro/30 z-40 md:hidden backdrop-blur-sm"
                    onClick={closeMenu}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-plomoSuave text-negro flex flex-col h-screen shadow-sidebar transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-1 bg-rojoMarca shrink-0" />
                <div className="px-5 py-5 border-b border-negro/5">
                    <div className="flex justify-end md:hidden mb-2">
                        <button type="button" onClick={closeMenu} className="text-grisMarca hover:text-negro transition" aria-label="Cerrar menú">
                            <X size={24} />
                        </button>
                    </div>
                    <Link to="/" onClick={closeMenu} className="block">
                        <img
                            src="/logo.png"
                            alt="Trajes El Buen Vestir"
                            className="w-full h-auto object-contain"
                        />
                    </Link>
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
                                        ? 'bg-white text-rojoMarca shadow-panel font-semibold'
                                        : 'text-grisMarca hover:bg-white/70 hover:text-negro'
                                }`}
                            >
                                <Icon size={20} strokeWidth={1.75} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 py-5 border-t border-negro/5 space-y-3">
                    {usuario?.nombre ? (
                        <p className="px-2 text-[15px] text-grisMarca truncate" title={usuario.nombre}>
                            {usuario.nombre}
                        </p>
                    ) : null}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg text-grisMarca hover:bg-white/70 hover:text-negro transition-colors"
                    >
                        <LogOut size={20} strokeWidth={1.75} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>
        </>
    );
}

export function BarraMovil({ onOpen }) {
    return (
        <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 text-negro z-30 border-b border-negro/5 shadow-sm">
            <div className="flex items-center gap-3">
                <button type="button" onClick={onOpen} className="text-grisMarca hover:text-negro transition" aria-label="Abrir menú">
                    <Menu size={22} />
                </button>
                <Link to="/" className="inline-flex">
                    <img src="/logo.png" alt="Trajes El Buen Vestir" className="h-18 w-auto object-contain" />
                </Link>
            </div>
        </div>
    );
}
