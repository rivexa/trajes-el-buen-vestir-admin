const CLAVE_SESION = 'tbv_admin_sesion';

export function leerSesion() {
    try {
        const crudo = sessionStorage.getItem(CLAVE_SESION);
        if (!crudo) return null;
        const sesion = JSON.parse(crudo);
        if (!sesion?.access_token) return null;
        return sesion;
    } catch {
        return null;
    }
}

export function guardarSesion(sesion) {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export function limpiarSesion() {
    sessionStorage.removeItem(CLAVE_SESION);
}
