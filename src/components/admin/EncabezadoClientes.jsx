import { Users } from 'lucide-react';
import EncabezadoPagina from './EncabezadoPagina';

export default function EncabezadoClientes({ onNuevo }) {
    return (
        <EncabezadoPagina
            icon={Users}
            title="Directorio de Clientes"
            subtitle="Identificación, contacto y datos para facturar en el mostrador."
            actionLabel="Nuevo Cliente"
            onAction={onNuevo}
        />
    );
}
