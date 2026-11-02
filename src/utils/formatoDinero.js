export default function formatoDinero(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(numero);
}
