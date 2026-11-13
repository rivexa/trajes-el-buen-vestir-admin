import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loginConCredenciales } from '../lib/apiAuth';
import { guardarSesion, leerSesion, limpiarSesion } from './authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [sesion, setSesion] = useState(() => leerSesion());

    const login = useCallback(async ({ usuario, password }) => {
        const data = await loginConCredenciales({ usuario, password });
        const nueva = {
            access_token: data.access_token,
            token_type: data.token_type || 'Bearer',
            user: data.user || { nombre: usuario },
        };
        guardarSesion(nueva);
        setSesion(nueva);
        return nueva;
    }, []);

    const logout = useCallback(() => {
        limpiarSesion();
        setSesion(null);
    }, []);

    const value = useMemo(() => ({
        sesion,
        usuario: sesion?.user || null,
        isAuthenticated: Boolean(sesion?.access_token),
        login,
        logout,
    }), [sesion, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de AuthProvider.');
    }
    return ctx;
}
