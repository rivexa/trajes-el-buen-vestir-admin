import { describe, expect, it } from 'vitest';
import {
    normalizarTipoItem,
    ordenAnulada,
    proximaFechaEntrega,
    resumenEstadosLineas,
} from './ordenDominio';

describe('ordenDominio', () => {
    it('normaliza aliases legacy de tipo', () => {
        expect(normalizarTipoItem('Otro')).toBe('Venta');
        expect(normalizarTipoItem('Confección')).toBe('Confección a Medida');
        expect(normalizarTipoItem('Uniformes')).toBe('Uniformes');
    });

    it('detecta orden anulada por líneas', () => {
        expect(ordenAnulada({
            orden_detalles: [{ estado: 'Anulada' }, { estado: 'Anulada' }],
        })).toBe(true);
        expect(ordenAnulada({
            orden_detalles: [{ estado: 'Pendiente' }, { estado: 'Anulada' }],
        })).toBe(false);
    });

    it('resume estados mixtos', () => {
        expect(resumenEstadosLineas({
            orden_detalles: [
                { estado: 'Pendiente' },
                { estado: 'En Confección' },
            ],
        })).toEqual({
            etiqueta: '2 ítems',
            mixto: true,
            estados: ['Pendiente', 'En Confección'],
        });
    });

    it('toma la próxima fecha de entrega', () => {
        expect(proximaFechaEntrega({
            orden_detalles: [
                { fecha_entrega: '2026-04-10' },
                { fecha_entrega: '2026-04-02' },
            ],
        })).toBe('2026-04-02');
    });
});
