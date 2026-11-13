import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import RutaProtegida from './components/auth/RutaProtegida';
import AdminLayout from './layouts/AdminLayout';
import Clientes from './pages/Clientes';
import Facturas from './pages/Facturas';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Ordenes from './pages/Ordenes';

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<RutaProtegida />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/" element={<Inicio />} />
                            <Route path="/clientes" element={<Clientes />} />
                            <Route path="/ordenes" element={<Ordenes />} />
                            <Route path="/facturas" element={<Facturas />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
