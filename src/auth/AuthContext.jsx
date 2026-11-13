import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginConCredenciales, obtenerPerfil } from '../lib/apiAuth';
import { guardarSesion, leerSesion, limpiarSesion } from './authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [sesion, setSesion] = useState(() => leerSesion());
    const [authListo, setAuthListo] = useState(() => !leerSesion()?.access_token);

    useEffect(() => {
        let cancelado = false;

        async function validarSesion() {
            const actual = leerSesion();
            if (!actual?.access_token) {
                if (!cancelado) setAuthListo(true);
                return;
            }

            try {
                const user = await obtenerPerfil();
                if (cancelado) return;
                const siguiente = {
                    ...actual,
                    user: {
                        id: user.id,
                        nombre: user.nombre,
                        rol: user.rol,
                        ...(user.usuario ? { usuario: user.usuario } : {}),
                    },
                };
                guardarSesion(siguiente);
                setSesion(siguiente);
            } catch {
                if (cancelado) return;
                limpiarSesion();
                setSesion(null);
            } finally {
                if (!cancelado) setAuthListo(true);
            }
        }

        validarSesion();
        return () => {
            cancelado = true;
        };
    }, []);

    const login = useCallback(async ({ usuario, password }) => {
        const data = await loginConCredenciales({ usuario, password });
        const nueva = {
            access_token: data.access_token,
            token_type: data.token_type || 'Bearer',
            user: data.user || { nombre: usuario },
        };
        guardarSesion(nueva);
        setSesion(nueva);
        setAuthListo(true);
        return nueva;
    }, []);

    const logout = useCallback(() => {
        limpiarSesion();
        setSesion(null);
        setAuthListo(true);
    }, []);

    const value = useMemo(() => ({
        sesion,
        usuario: sesion?.user || null,
        isAuthenticated: Boolean(sesion?.access_token),
        authListo,
        login,
        logout,
    }), [sesion, authListo, login, logout]);

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
