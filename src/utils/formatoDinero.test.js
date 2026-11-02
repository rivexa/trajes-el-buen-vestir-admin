import { describe, expect, it } from 'vitest';
import formatoDinero from './formatoDinero';

describe('formatoDinero', () => {
    it('formatea montos en dólares', () => {
        expect(formatoDinero(1280.5)).toBe('$1,280.50');
        expect(formatoDinero('20')).toBe('$20.00');
        expect(formatoDinero(null)).toBe('$0.00');
    });
});
