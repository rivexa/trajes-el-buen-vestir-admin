import { describe, expect, it } from 'vitest';
import { formatearFechaCorta, periodoDesdePreset, PRESETS_PERIODO } from './periodoEcuador';

describe('periodoEcuador', () => {
    it('expone presets útiles para el taller', () => {
        expect(PRESETS_PERIODO.map((p) => p.id)).toEqual(['mes', 'hoy', '7d', '30d']);
    });

    it('arma el mes actual con desde el día 1', () => {
        const periodo = periodoDesdePreset('mes');
        expect(periodo.desde).toMatch(/^\d{4}-\d{2}-01$/);
        expect(periodo.hasta).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(periodo.desde <= periodo.hasta).toBe(true);
    });

    it('formatea fechas ISO locales y con zona Ecuador', () => {
        expect(formatearFechaCorta('2026-03-14')).toBe('14/03/2026');
        expect(formatearFechaCorta('2026-03-14T20:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/2026/);
    });
});
