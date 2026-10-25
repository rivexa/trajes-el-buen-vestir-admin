import { Plus } from 'lucide-react';

export default function EncabezadoPagina({ icon: Icon, title, subtitle, actionLabel, onAction }) {
    return (
        <div className="card-panel mb-6 overflow-hidden">
            <div className="h-1 bg-rojoMarca" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 md:p-7">
                <div className="flex items-center gap-4 md:gap-5">
                    <div className="bg-negro text-white p-3 rounded-xl">
                        <Icon size={28} strokeWidth={1.75} />
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-rojoMarca mb-1">
                            Trajes El Buen Vestir
                        </p>
                        <h1 className="text-[1.65rem] md:text-[1.9rem] font-serif font-bold text-negro leading-tight">{title}</h1>
                        <p className="text-grisMarca/80 mt-1 text-base">{subtitle}</p>
                    </div>
                </div>
                {actionLabel && (
                    <button type="button" onClick={onAction} className="btn-marca">
                        <Plus size={18} /> {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
