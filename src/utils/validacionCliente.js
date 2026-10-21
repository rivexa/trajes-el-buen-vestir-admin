const CAMPOS_CLIENTE = ['nombres', 'apellidos', 'cedula_ruc', 'telefono', 'correo', 'direccion'];

const NOMBRE_PERMITIDO = /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ'\-\s]+$/;
const TELEFONO_EC = /^09\d{8}$|^0[2-7]\d{7}$/;

export function camposFormulario(cliente) {
    return {
        nombres: cliente?.nombres ?? '',
        apellidos: cliente?.apellidos ?? '',
        cedula_ruc: cliente?.cedula_ruc ?? '',
        telefono: cliente?.telefono ?? '',
        correo: cliente?.correo ?? '',
        direccion: cliente?.direccion ?? '',
    };
}

export function payloadCambios(formData, clienteEdicion) {
    const payload = {};
    CAMPOS_CLIENTE.forEach((key) => {
        if (formData[key] !== (clienteEdicion?.[key] ?? '')) {
            payload[key] = formData[key];
        }
    });
    return payload;
}

export function validarNombrePersona(valor) {
    const texto = valor?.trim() ?? '';
    if (!texto) return false;
    return NOMBRE_PERMITIDO.test(texto);
}

export function validarTelefonoEcuador(valor) {
    if (!valor || valor.trim() === '') return true;
    return TELEFONO_EC.test(valor.trim());
}

export function validarIdentificacionEcuatoriana(val) {
    if (!val || (val.length !== 10 && val.length !== 13)) return false;
    if (!/^\d+$/.test(val)) return false;

    const provincia = parseInt(val.substring(0, 2), 10);
    const esExtranjero = provincia === 30;
    if ((provincia < 1 || provincia > 24) && !esExtranjero) return false;

    const tercerDigito = parseInt(val.charAt(2), 10);

    if (tercerDigito < 6) {
        if (val.length === 13 && val.substring(10, 13) !== '001') return false;
        const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        let suma = 0;
        for (let i = 0; i < 9; i++) {
            let valor = parseInt(val.charAt(i), 10) * coeficientes[i];
            suma += valor > 9 ? valor - 9 : valor;
        }
        const digito = suma % 10 === 0 ? 0 : 10 - (suma % 10);
        return digito === parseInt(val.charAt(9), 10);
    }

    if (tercerDigito === 9 && val.length === 13) {
        if (val.substring(10, 13) !== '001') return false;
        const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
        let suma = 0;
        for (let i = 0; i < 9; i++) suma += parseInt(val.charAt(i), 10) * coeficientes[i];
        const residuo = suma % 11;
        if (residuo === 1) return false;
        const digito = residuo === 0 ? 0 : 11 - residuo;
        return digito === parseInt(val.charAt(9), 10);
    }

    if (tercerDigito === 6 && val.length === 13) {
        if (val.substring(10, 13) !== '001') return false;
        const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
        let suma = 0;
        for (let i = 0; i < 8; i++) suma += parseInt(val.charAt(i), 10) * coeficientes[i];
        const residuo = suma % 11;
        if (residuo === 1) return false;
        const digito = residuo === 0 ? 0 : 11 - residuo;
        return digito === parseInt(val.charAt(8), 10);
    }

    return false;
}

export function mensajeValidacionCliente(formData) {
    if (!validarNombrePersona(formData.nombres) || !validarNombrePersona(formData.apellidos)) {
        return 'Los nombres y apellidos solo pueden contener letras, espacios, guion o apóstrofe.';
    }
    if (!validarTelefonoEcuador(formData.telefono)) {
        return 'El teléfono debe ser un celular (09) o un convencional (02 a 07).';
    }
    if (!validarIdentificacionEcuatoriana(formData.cedula_ruc)) {
        return 'La cédula o RUC ingresado no es válido.';
    }
    return '';
}
