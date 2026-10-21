import { describe, expect, it } from 'vitest';
import {
    camposFormulario,
    mensajeValidacionCliente,
    payloadCambios,
    validarIdentificacionEcuatoriana,
    validarNombrePersona,
    validarTelefonoEcuador,
} from './validacionCliente';

function cedulaNatural(base9) {
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i += 1) {
        const valor = Number(base9[i]) * coeficientes[i];
        suma += valor > 9 ? valor - 9 : valor;
    }
    const dv = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    return `${base9}${dv}`;
}

function rucPublico(base8) {
    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 8; i += 1) suma += Number(base8[i]) * coeficientes[i];
    const residuo = suma % 11;
    if (residuo === 1) return null;
    const dv = residuo === 0 ? 0 : 11 - residuo;
    return `${base8}${dv}0` + '001';
}

const CEDULA_OK = cedulaNatural('171003406');
const RUC_PUBLICO = rucPublico('17600012');
const CEDULA_EXTRANJERO = cedulaNatural('301003406');

describe('validarIdentificacionEcuatoriana', () => {
    it('acepta cédula natural y RUC de persona natural', () => {
        expect(validarIdentificacionEcuatoriana(CEDULA_OK)).toBe(true);
        expect(validarIdentificacionEcuatoriana(`${CEDULA_OK}001`)).toBe(true);
    });

    it('rechaza sucursal distinta de 001, vacío, letras y longitudes incorrectas', () => {
        expect(validarIdentificacionEcuatoriana(`${CEDULA_OK}002`)).toBe(false);
        expect(validarIdentificacionEcuatoriana('')).toBe(false);
        expect(validarIdentificacionEcuatoriana('17100340a5')).toBe(false);
        expect(validarIdentificacionEcuatoriana(CEDULA_OK.slice(0, 9))).toBe(false);
        expect(validarIdentificacionEcuatoriana(`00${CEDULA_OK.slice(2)}`)).toBe(false);
    });

    it('acepta RUC de institución pública (tercer dígito 6) con establecimiento 001', () => {
        expect(RUC_PUBLICO).toMatch(/^\d{13}$/);
        expect(validarIdentificacionEcuatoriana(RUC_PUBLICO)).toBe(true);
    });

    it('acepta cédula de extranjero (provincia 30)', () => {
        expect(validarIdentificacionEcuatoriana(CEDULA_EXTRANJERO)).toBe(true);
    });
});

describe('validarNombrePersona', () => {
    it('acepta tildes, guion, apóstrofe y diéresis', () => {
        expect(validarNombrePersona('José Pérez')).toBe(true);
        expect(validarNombrePersona('María-José')).toBe(true);
        expect(validarNombrePersona("O'Connor")).toBe(true);
        expect(validarNombrePersona('Güemes')).toBe(true);
    });

    it('rechaza números y vacío', () => {
        expect(validarNombrePersona('Ana2')).toBe(false);
        expect(validarNombrePersona('   ')).toBe(false);
    });
});

describe('validarTelefonoEcuador', () => {
    it('acepta celular y convencionales 02 a 07', () => {
        expect(validarTelefonoEcuador('0993112096')).toBe(true);
        expect(validarTelefonoEcuador('022345678')).toBe(true);
        expect(validarTelefonoEcuador('042345678')).toBe(true);
        expect(validarTelefonoEcuador('072345678')).toBe(true);
        expect(validarTelefonoEcuador('')).toBe(true);
    });

    it('rechaza prefijos inválidos', () => {
        expect(validarTelefonoEcuador('012345678')).toBe(false);
        expect(validarTelefonoEcuador('099311209')).toBe(false);
    });
});

describe('mensajeValidacionCliente y payload', () => {
    it('arma el mensaje del primer error', () => {
        expect(mensajeValidacionCliente({
            nombres: 'María',
            apellidos: 'Pérez',
            cedula_ruc: '123',
            telefono: '',
        })).toBe('La cédula o RUC ingresado no es válido.');
    });

    it('solo envía campos de formulario que cambiaron', () => {
        const original = camposFormulario({
            id: '1',
            nombres: 'Néstor',
            apellidos: 'Sarmiento',
            cedula_ruc: CEDULA_OK,
            telefono: '0961284734',
            correo: 'a@b.com',
            direccion: 'Quito',
            fecha_registro: '2026-01-01',
        });
        expect(payloadCambios({ ...original, nombres: 'Nestor' }, original)).toEqual({ nombres: 'Nestor' });
        expect(Object.keys(payloadCambios(original, original))).toHaveLength(0);
    });
});
