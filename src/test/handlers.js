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

export const handlers = [
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
