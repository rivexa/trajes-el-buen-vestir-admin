import { mensajeErrorHttp, urlApi } from './apiBase';

export { mensajeErrorHttp };

export function urlClientes(path = '') {
    return urlApi(`/clientes${path}`);
}
