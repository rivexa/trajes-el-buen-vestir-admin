import { http, HttpResponse } from 'msw';

export const CLIENTE_DEMO = {
    id: '4498a0eb-1f4b-4d3a-9b42-dde8e649df74',
    cedula_ruc: '1753329182',
    nombres: 'Néstor',
    apellidos: 'Sarmiento',
    telefono: '0961284734',
    correo: 'nesdav1005@gmail.com',
    direccion: 'El Beaterio',
};

const API = 'http://api.test/clientes';
const API_BASE = 'http://api.test';

const DASHBOARD_DEMO = {
    meta: { desde: '2026-03-01', hasta: '2026-03-14', hoy: '2026-03-14' },
    produccion: {
        ordenes_por_estado: {
            Pendiente: 1,
            'En Confección': 1,
            'Listo para Prueba': 0,
            Entregado: 1,
            Anulada: 0,
        },
        ordenes_nuevas_periodo: 2,
        entregas_proximas: 1,
        entregas_atrasadas: 1,
    },
    cobranza: {
        cartera_pendiente: 250,
        cobrado_ordenes_abiertas: 50,
        ordenes_abono_parcial: 1,
        cobros_periodo: {
            total: 70,
            por_dia: [{ fecha: '2026-03-12', total: 20, cantidad: 1 }],
        },
    },
    ventas: {
        total_facturado_autorizado: 200,
        facturas_autorizadas: 2,
        mix_metodo_pago: { Efectivo: 80, Transferencia: 120 },
    },
    clientes: {
        total: 2,
        altas_periodo: 1,
        con_saldo_pendiente: 2,
        top_por_facturacion: [{ cliente_id: 'b', nombre: 'Ana López', total: 120 }],
        top_por_pedidos: [{ cliente_id: 'a', nombre: 'Juan Pérez', pedidos: 2 }],
    },
};

export const handlers = [
    http.get(`${API_BASE}/dashboard`, () => HttpResponse.json(DASHBOARD_DEMO)),
    http.get(`${API}/crecimiento`, () => HttpResponse.json({
        total_general: 40,
        altas_periodo: 2,
        por_dia: [{ fecha: '2026-03-14', altas: 2 }],
        meta: { desde: '2026-03-01', hasta: '2026-03-31' },
    })),
    http.get(`${API_BASE}/ordenes/pagos/historial`, () => HttpResponse.json({
        data: [{
            id: 'pago-1',
            orden_id: 'o1',
            monto: 50,
            metodo_pago: 'Efectivo',
            fecha_pago: '2026-03-10T15:00:00.000Z',
            ordenes_pedido: { numero_orden: 5, cliente_id: 'a' },
        }],
        por_dia: [{ fecha: '2026-03-10', total: 50, cantidad: 1 }],
        meta: { total_movimientos: 1, total_cobrado: 50, desde: '2026-03-01', hasta: '2026-03-14' },
    })),
    http.get(API, ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search') ?? '';
        const data = CLIENTE_DEMO.nombres.toLowerCase().includes(search.toLowerCase())
            || CLIENTE_DEMO.cedula_ruc.includes(search)
            || CLIENTE_DEMO.apellidos.toLowerCase().includes(search.toLowerCase())
            ? [CLIENTE_DEMO]
            : [];
        return HttpResponse.json({
            data,
            meta: { total: data.length, page: 1, limit: 5, totalPages: data.length ? 1 : 0 },
        });
    }),
    http.post(API, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({ id: 'nuevo', ...body }, { status: 201 });
    }),
    http.patch(`${API}/:id`, async ({ request, params }) => {
        const body = await request.json();
        return HttpResponse.json({ id: params.id, ...CLIENTE_DEMO, ...body });
    }),
    http.delete(`${API}/:id`, () => new HttpResponse(null, { status: 204 })),
];
