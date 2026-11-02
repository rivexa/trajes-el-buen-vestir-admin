import { useCallback, useEffect, useState } from 'react';
import {
    fetchCrecimientoClientes,
    fetchDashboard,
    fetchHistorialPagos,
} from '../lib/apiDashboard';
import { periodoDesdePreset } from '../utils/periodoEcuador';

async function seguro(promesa) {
    try {
        return { ok: true, data: await promesa };
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        return { ok: false, error };
    }
}

export default function useDashboard(presetId = 'mes') {
    const [resumen, setResumen] = useState(null);
    const [crecimiento, setCrecimiento] = useState(null);
    const [historialPagos, setHistorialPagos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [avisos, setAvisos] = useState([]);

    const periodo = periodoDesdePreset(presetId);

    const recargar = useCallback(async (signal) => {
        setError('');
        setAvisos([]);
        setLoading(true);
        try {
            const [dashboard, clientes, pagos] = await Promise.all([
                seguro(fetchDashboard({ ...periodo, signal })),
                seguro(fetchCrecimientoClientes({ ...periodo, signal })),
                seguro(fetchHistorialPagos({ ...periodo, signal })),
            ]);

            const nuevosAvisos = [];
            if (dashboard.ok) setResumen(dashboard.data);
            else {
                setResumen(null);
                nuevosAvisos.push(dashboard.error.message || 'No se pudo cargar el resumen.');
            }

            if (clientes.ok) setCrecimiento(clientes.data);
            else {
                setCrecimiento(null);
                nuevosAvisos.push(clientes.error.message || 'No se pudo cargar el crecimiento de clientes.');
            }

            if (pagos.ok) setHistorialPagos(pagos.data);
            else {
                setHistorialPagos(null);
                nuevosAvisos.push(pagos.error.message || 'No se pudo cargar el historial de pagos.');
            }

            setAvisos(nuevosAvisos);
            if (!dashboard.ok && !clientes.ok && !pagos.ok) {
                setError(nuevosAvisos[0] || 'Error de conexión con el servidor.');
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            setResumen(null);
            setCrecimiento(null);
            setHistorialPagos(null);
            setError(err.message || 'Error de conexión con el servidor.');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [periodo.desde, periodo.hasta]);

    useEffect(() => {
        const ac = new AbortController();
        const id = window.setTimeout(() => {
            recargar(ac.signal);
        }, 0);
        return () => {
            window.clearTimeout(id);
            ac.abort();
        };
    }, [recargar]);

    return {
        resumen,
        crecimiento,
        historialPagos,
        loading,
        error,
        avisos,
        periodo,
        recargar: () => recargar(),
    };
}
