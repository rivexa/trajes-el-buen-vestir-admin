import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function RutaProtegida() {
    const { isAuthenticated, authListo } = useAuth();
    const location = useLocation();

    if (!authListo) {
        return (
            <div className="min-h-screen bg-plomoSuave flex items-center justify-center">
                <p className="text-grisMarca text-base" role="status">Validando sesión...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}
