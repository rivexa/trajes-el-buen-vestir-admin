import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, Receipt, FileText, Menu, X } from 'lucide-react';
import Clientes from './pages/Clientes';
import Ordenes from './pages/Ordenes';

// Componente de la barra lateral responsiva
function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(path) ? 'bg-rojoMarca text-white' : 'text-gray-400 hover:bg-gray-800'}`;

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Fondo oscuro para móvil (Overlay) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={closeMenu}
        />
      )}
      
      {/* Barra Lateral */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-negro text-white flex flex-col h-screen transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center border-b border-gray-800 min-h-[90px]">
          <img 
            src="/logo-dark.png" 
            alt="Trajes El Buen Vestir" 
            className="h-18 w-auto object-contain"
          />
          <button onClick={closeMenu} className="md:hidden text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link to="/clientes" className={linkClass('/clientes')} onClick={closeMenu}>
            <Users size={20} /> Clientes
          </Link>
          <Link to="/ordenes" className={linkClass('/ordenes')} onClick={closeMenu}>
            <FileText size={20} /> Órdenes
          </Link>
          <Link to="/caja" className={linkClass('/caja')} onClick={closeMenu}>
            <Receipt size={20} /> Caja Rápida
          </Link>
        </nav>
      </aside>
    </>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex bg-gray-50 min-h-screen overflow-hidden">
        
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Barra superior exclusiva para móviles */}
          <div className="md:hidden flex items-center justify-between bg-negro p-4 text-white shadow-md z-30">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="text-gray-300 hover:text-white transition">
                <Menu size={24} />
              </button>
              <img src="/logo-dark.png" alt="Logo" className="h-8 w-auto object-contain" />
            </div>
          </div>
          
          {/* Área de contenido scrolleable */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <Routes>
              <Route path="/" element={<div className="p-6 md:p-10 text-2xl font-bold text-gray-800">Bienvenido al Panel de Control</div>} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/ordenes" element={<Ordenes />} />
              <Route path="/caja" element={<div className="p-6 md:p-10">Módulo de Caja Rápida en construcción...</div>} />
            </Routes>
          </div>
        </main>
        
      </div>
    </Router>
  );
}