const ZONA = 'America/Guayaquil';

function partesHoy(fecha = new Date()) {
    const partes = new Intl.DateTimeFormat('en-CA', {
        timeZone: ZONA,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(fecha);

    const valor = (tipo) => partes.find((parte) => parte.type === tipo)?.value ?? '';
    return {
        anio: Number(valor('year')),
        mes: Number(valor('month')),
        dia: Number(valor('day')),
        iso: `${valor('year')}-${valor('month')}-${valor('day')}`,
    };
}

function isoDesdePartes(anio, mes, dia) {
    const m = String(mes).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    return `${anio}-${m}-${d}`;
}

function sumarDiasIso(iso, dias) {
    const [anio, mes, dia] = iso.split('-').map(Number);
    const utc = new Date(Date.UTC(anio, mes - 1, dia + dias));
    return isoDesdePartes(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
}

function ultimoDiaDelMes(anio, mes) {
    const utc = new Date(Date.UTC(anio, mes, 0));
    return utc.getUTCDate();
}

export const PRESETS_PERIODO = [
    { id: 'hoy', label: 'Hoy' },
    { id: '7d', label: 'Últimos 7 días' },
    { id: '30d', label: 'Últimos 30 días' },
    { id: 'mes', label: 'Este mes' },
    { id: 'mes_anterior', label: 'Mes anterior' },
    { id: 'anio', label: 'Este año' },
];

export function periodoDesdePreset(presetId = 'mes') {
    const hoy = partesHoy();
    if (presetId === 'hoy') {
        return { desde: hoy.iso, hasta: hoy.iso };
    }
    if (presetId === '7d') {
        return { desde: sumarDiasIso(hoy.iso, -6), hasta: hoy.iso };
    }
    if (presetId === '30d') {
        return { desde: sumarDiasIso(hoy.iso, -29), hasta: hoy.iso };
    }
    if (presetId === 'mes_anterior') {
        const mes = hoy.mes === 1 ? 12 : hoy.mes - 1;
        const anio = hoy.mes === 1 ? hoy.anio - 1 : hoy.anio;
        return {
            desde: isoDesdePartes(anio, mes, 1),
            hasta: isoDesdePartes(anio, mes, ultimoDiaDelMes(anio, mes)),
        };
    }
    if (presetId === 'anio') {
        return {
            desde: isoDesdePartes(hoy.anio, 1, 1),
            hasta: hoy.iso,
        };
    }
    return {
        desde: isoDesdePartes(hoy.anio, hoy.mes, 1),
        hasta: hoy.iso,
    };
}

export function validarPeriodo(desde, hasta) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(desde || '') || !/^\d{4}-\d{2}-\d{2}$/.test(hasta || '')) {
        return 'Las fechas deben tener formato válido.';
    }
    if (desde > hasta) {
        return 'La fecha desde no puede ser posterior a hasta.';
    }
    return '';
}

export function formatearFechaCorta(iso) {
    if (!iso) return '—';
    const soloDia = String(iso).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(soloDia) && String(iso).length === 10) {
        const [anio, mes, dia] = soloDia.split('-');
        return `${dia}/${mes}/${anio}`;
    }
    return new Intl.DateTimeFormat('es-EC', {
        timeZone: ZONA,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(iso));
}
