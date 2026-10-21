export default function etiquetaRegistro(registro) {
    if (!registro) return '';
    const nombre = `${registro.nombres ?? ''} ${registro.apellidos ?? ''}`.trim();
    if (nombre) return nombre;
    if (registro.numero_orden != null) return `ORD-${registro.numero_orden.toString().padStart(4, '0')}`;
    if (registro.secuencial_local != null) return `FAC-${registro.secuencial_local.toString().padStart(5, '0')}`;
    return '';
}
