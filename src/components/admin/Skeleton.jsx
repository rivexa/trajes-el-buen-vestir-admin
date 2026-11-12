export function Skeleton({ className = '' }) {
    return (
        <div
            data-skeleton
            className={`animate-pulse rounded-lg bg-negro/10 ${className}`}
            aria-hidden="true"
        />
    );
}

export function FilasSkeletonTabla({ filas = 6, celdas = 4, etiqueta = 'Cargando' }) {
    return (
        <>
            <tr className="border-0">
                <td colSpan={celdas} className="p-0 border-0">
                    <span className="sr-only" role="status" aria-label={etiqueta} />
                </td>
            </tr>
            {Array.from({ length: filas }, (_, fila) => (
                <tr key={fila}>
                    {Array.from({ length: celdas }, (_, celda) => (
                        <td key={celda} className="p-4">
                            <Skeleton className="h-4 w-28 max-w-full" />
                            {celda === 0 ? <Skeleton className="mt-2 h-3 w-20 max-w-full" /> : null}
                        </td>
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

function SkeletonPanelBarras() {
    return (
        <section className="card-panel p-5 space-y-4">
            <Skeleton className="h-6 w-48" />
            {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="space-y-2">
                    <div className="flex justify-between gap-3">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-full" />
                </div>
            ))}
        </section>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-5" aria-busy="true">
            <span className="sr-only" role="status" aria-label="Cargando indicadores" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="rounded-2xl bg-white border border-negro/5 p-5 space-y-3">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-3">
                    <SkeletonPanelBarras />
                </div>
                <div className="xl:col-span-2 card-panel p-5 space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-44 w-44 rounded-full mx-auto" />
                </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <SkeletonPanelBarras />
                <SkeletonPanelBarras />
            </div>
        </div>
    );
}
