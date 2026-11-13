export function Skeleton({ className = '' }) {
    return (
        <div
            data-skeleton
            className={`animate-pulse rounded-lg bg-negro/10 ${className}`}
            aria-hidden="true"
        />
    );
}

function CeldaSkeleton({ variante, indice, etiqueta }) {
    const anuncio = etiqueta ? (
        <span className="sr-only" role="status" aria-label={etiqueta} />
    ) : null;

    if (variante === 'clientes') {
        if (indice === 0) {
            return (
                <td className="p-4">
                    {anuncio}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                        <div className="min-w-0 space-y-2">
                            <Skeleton className="h-4 w-36 max-w-full" />
                            <Skeleton className="h-3.5 w-28 max-w-full" />
                        </div>
                    </div>
                </td>
            );
        }
        if (indice === 1) {
            return (
                <td className="p-4">
                    <Skeleton className="h-4 w-28 max-w-full" />
                </td>
            );
        }
        if (indice === 2) {
            return (
                <td className="p-4">
                    <div className="space-y-2">
                        <Skeleton className="h-3.5 w-28 max-w-full" />
                        <Skeleton className="h-3.5 w-36 max-w-full" />
                    </div>
                </td>
            );
        }
        return (
            <td className="p-4">
                <div className="flex items-center justify-center gap-1">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            </td>
        );
    }

    if (variante === 'ordenes') {
        if (indice === 0 || indice === 1) {
            return (
                <td className="p-4 text-left">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28 max-w-full" />
                        <Skeleton className="h-3.5 w-24 max-w-full" />
                    </div>
                </td>
            );
        }
        if (indice === 2) {
            return (
                <td className="p-4">
                    <div className="mx-auto w-32 space-y-2">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-full" />
                    </div>
                </td>
            );
        }
        if (indice === 3) {
            return (
                <td className="p-4">
                    <div className="flex justify-center">
                        <Skeleton className="h-11 w-[14rem] rounded-xl" />
                    </div>
                </td>
            );
        }
        return (
            <td className="p-4">
                <div className="flex items-center justify-center gap-1">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            </td>
        );
    }

    if (variante === 'facturas') {
        if (indice === 0 || indice === 1) {
            return (
                <td className="p-4 text-left">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28 max-w-full" />
                        <Skeleton className="h-3.5 w-20 max-w-full" />
                    </div>
                </td>
            );
        }
        if (indice === 2) {
            return (
                <td className="p-4 text-left">
                    <Skeleton className="h-4 w-24 max-w-full" />
                </td>
            );
        }
        if (indice === 3) {
            return (
                <td className="p-4 text-left">
                    <Skeleton className="h-7 w-24 rounded-full" />
                </td>
            );
        }
        if (indice === 4) {
            return (
                <td className="p-4 text-center">
                    <div className="mx-auto w-28 space-y-2">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-full" />
                    </div>
                </td>
            );
        }
        if (indice === 5) {
            return (
                <td className="p-4 text-center">
                    <div className="inline-flex justify-center">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </td>
            );
        }
        return (
            <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            </td>
        );
    }

    return (
        <td className="p-4">
            <Skeleton className="h-4 w-24 max-w-full" />
        </td>
    );
}

export function FilasSkeletonTabla({
    filas = 6,
    celdas = 4,
    etiqueta = 'Cargando',
    variante = 'simple',
}) {
    return (
        <>
            {Array.from({ length: filas }, (_, fila) => (
                <tr key={fila} aria-label={fila === 0 ? etiqueta : undefined}>
                    {Array.from({ length: celdas }, (_, celda) => (
                        <CeldaSkeleton
                            key={celda}
                            variante={variante}
                            indice={celda}
                            etiqueta={fila === 0 && celda === 0 ? etiqueta : undefined}
                        />
                    ))}
                </tr>
            ))}
        </>
    );
}

export function SkeletonBloqueModal() {
    return (
        <div className="space-y-6 py-2" aria-busy="true">
            <span className="sr-only" role="status" aria-label="Cargando" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
            </div>
            <Skeleton className="h-5 w-40" />
            <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
            </div>
        </div>
    );
}

function SkeletonTarjetaKpi() {
    return (
        <article className="rounded-2xl border border-negro/5 bg-plomoSuave/40 p-5 shadow-panel">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-28 max-w-full" />
                    <Skeleton className="h-7 w-24 max-w-full" />
                    <Skeleton className="h-3 w-32 max-w-full" />
                </div>
            </div>
        </article>
    );
}

function SkeletonCabeceraPanel({ conTotal = false }) {
    return (
        <div className={`mb-4 ${conTotal ? 'flex items-start justify-between gap-3' : ''}`}>
            <div className="space-y-2">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-3.5 w-36" />
            </div>
            {conTotal ? <Skeleton className="h-4 w-16 shrink-0" /> : null}
        </div>
    );
}

function SkeletonDonut() {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <Skeleton className="h-44 w-44 rounded-full shrink-0" />
            <ul className="w-full space-y-2.5">
                {Array.from({ length: 4 }, (_, i) => (
                    <li key={i} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
                            <Skeleton className="h-3.5 w-28 max-w-full" />
                        </div>
                        <Skeleton className="h-3.5 w-16 shrink-0" />
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SkeletonLinea() {
    return (
        <div>
            <Skeleton className="h-52 w-full rounded-xl" />
            <div className="mt-1 flex justify-between gap-2 px-1">
                {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-2.5 w-8 max-w-full" />
                ))}
            </div>
        </div>
    );
}

function SkeletonListaPagos() {
    return (
        <ul className="divide-y divide-negro/5">
            {Array.from({ length: 5 }, (_, i) => (
                <li key={i} className="py-3 flex justify-between gap-3">
                    <div className="space-y-2 min-w-0">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3.5 w-36 max-w-full" />
                    </div>
                    <Skeleton className="h-4 w-16 shrink-0" />
                </li>
            ))}
        </ul>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-5" aria-busy="true">
            <span className="sr-only" role="status" aria-label="Cargando indicadores" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <SkeletonTarjetaKpi key={i} />
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <section className="card-panel p-5 xl:col-span-3">
                    <SkeletonCabeceraPanel conTotal />
                    <SkeletonLinea />
                </section>
                <section className="card-panel p-5 xl:col-span-2">
                    <SkeletonCabeceraPanel />
                    <SkeletonDonut />
                </section>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <section className="card-panel p-5">
                    <SkeletonCabeceraPanel />
                    <SkeletonDonut />
                </section>
                <section className="card-panel p-5">
                    <SkeletonCabeceraPanel />
                    <SkeletonListaPagos />
                </section>
            </div>
        </div>
    );
}
