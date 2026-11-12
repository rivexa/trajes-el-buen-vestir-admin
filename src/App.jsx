import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { BarraMovil, Sidebar } from './components/admin/Sidebar';
import Clientes from './pages/Clientes';
import Facturas from './pages/Facturas';
import Inicio from './pages/Inicio';
import Ordenes from './pages/Ordenes';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex bg-white min-h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
          <BarraMovil onOpen={() => setIsSidebarOpen(true)} />
          <div className="flex-1 overflow-y-auto bg-white">
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/ordenes" element={<Ordenes />} />
              <Route path="/facturas" element={<Facturas />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
