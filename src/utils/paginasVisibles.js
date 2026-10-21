export default function paginasVisibles(currentPage, totalPages, radio = 1) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const set = new Set([1, totalPages]);
    for (let i = currentPage - radio; i <= currentPage + radio; i += 1) {
        if (i >= 1 && i <= totalPages) set.add(i);
    }

    const ordenadas = [...set].sort((a, b) => a - b);
    const items = [];
    for (let i = 0; i < ordenadas.length; i += 1) {
        if (i > 0 && ordenadas[i] - ordenadas[i - 1] > 1) {
            items.push(`ellipsis-${ordenadas[i - 1]}`);
        }
        items.push(ordenadas[i]);
    }
    return items;
}
