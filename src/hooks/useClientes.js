import { useCallback, useEffect, useRef, useState } from 'react';
import { mensajeErrorHttp, urlClientes } from '../lib/apiClientes';

const LIMIT = 5;
const DEBOUNCE_MS = 300;

export default function useClientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const debounceRef = useRef(null);

    const recargar = useCallback(async (signal) => {
        const params = new URLSearchParams({
            page: String(currentPage),
            limit: String(LIMIT),
        });
        if (searchTerm) params.set('search', searchTerm);

        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${urlClientes()}?${params.toString()}`, { signal });
            if (!response.ok) {
                throw new Error(await mensajeErrorHttp(response, 'No se pudo cargar el directorio de clientes.'));
            }
            const result = await response.json();
            setClientes(Array.isArray(result.data) ? result.data : []);
            setTotalPages(result.meta?.totalPages || 1);
        } catch (err) {
            if (err.name === 'AbortError') return;
            setClientes([]);
            setTotalPages(1);
            setError(err.message || 'Error de conexión con el servidor.');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [currentPage, searchTerm]);

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

    const handleSearchChange = (valor) => {
        setSearchInput(valor);
        window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            setSearchTerm(valor.trim());
            setCurrentPage(1);
        }, DEBOUNCE_MS);
    };

    const eliminarCliente = async (id) => {
        const response = await fetch(urlClientes(`/${id}`), { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(await mensajeErrorHttp(response, 'No se pudo eliminar el cliente.'));
        }
        if (clientes.length === 1 && currentPage > 1) {
            setCurrentPage((page) => page - 1);
        } else {
            await recargar();
        }
    };

    return {
        clientes,
        loading,
        error,
        searchInput,
        currentPage,
        totalPages,
        handleSearchChange,
        setCurrentPage,
        recargar,
        eliminarCliente,
    };
}
