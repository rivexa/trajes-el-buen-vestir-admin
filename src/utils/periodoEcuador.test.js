import { describe, expect, it } from 'vitest';
import {
    formatearFechaCorta,
    periodoDesdePreset,
    PRESETS_PERIODO,
    validarPeriodo,
} from './periodoEcuador';

describe('periodoEcuador', () => {
    it('expone presets útiles para el taller', () => {
        expect(PRESETS_PERIODO.map((p) => p.id)).toEqual([
            'hoy',
            '7d',
            '30d',
            'mes',
            'mes_anterior',
            'anio',
        ]);
    });

    it('arma el mes actual con desde el día 1', () => {
        const periodo = periodoDesdePreset('mes');
        expect(periodo.desde).toMatch(/^\d{4}-\d{2}-01$/);
        expect(periodo.hasta).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(periodo.desde <= periodo.hasta).toBe(true);
    });

    it('arma el mes anterior completo', () => {
        const periodo = periodoDesdePreset('mes_anterior');
        expect(periodo.desde).toMatch(/^\d{4}-\d{2}-01$/);
        expect(periodo.hasta).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(periodo.desde < periodo.hasta || periodo.desde === periodo.hasta).toBe(true);
    });

    it('valida rangos personalizados', () => {
        expect(validarPeriodo('2026-03-01', '2026-03-14')).toBe('');
        expect(validarPeriodo('2026-03-20', '2026-03-01')).toMatch(/desde/);
        expect(validarPeriodo('malo', '2026-03-01')).toMatch(/formato/);
    });

    it('formatea fechas ISO locales y con zona Ecuador', () => {
        expect(formatearFechaCorta('2026-03-14')).toBe('14/03/2026');
        expect(formatearFechaCorta('2026-03-14T20:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/2026/);
    });
});
