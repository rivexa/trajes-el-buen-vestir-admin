export default function iniciales(nombres, apellidos) {
    const a = (nombres ?? '').trim().charAt(0);
    const b = (apellidos ?? '').trim().charAt(0);
    const texto = `${a}${b}`.toUpperCase();
    return texto || '—';
}
