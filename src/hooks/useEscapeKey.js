import { useEffect } from 'react';

export default function useEscapeKey(activo, onEscape) {
    useEffect(() => {
        if (!activo) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onEscape();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activo, onEscape]);
}
