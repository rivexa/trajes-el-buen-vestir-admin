import { Search } from 'lucide-react';

export default function BarraBusqueda({ value, onChange, placeholder, label }) {
    return (
        <div className="card-panel mb-6 px-4 py-3.5 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rojoMarca/10 text-rojoMarca">
                <Search size={20} />
            </span>
            <input
                type="search"
                aria-label={label}
                placeholder={placeholder}
                className="w-full outline-none text-base text-negro bg-transparent placeholder:text-gray-400"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
