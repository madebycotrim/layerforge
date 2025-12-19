// src/features/filamentos/components/FilamentGroup.jsx
import React, { useState, useMemo } from "react";
import { ChevronRight, Layers } from "lucide-react";
import { FilamentCard, FilamentRow } from "./cardFilamento";

export default function FilamentGroup({ tipo, items, viewMode, acoes, estilo }) {
    const [expandido, setExpandido] = useState(true);

    // Cálculo do peso total
    const pesoTotal = useMemo(() => {
        const total = items.reduce((acc, item) => acc + (Number(item.weightCurrent) || 0), 0);
        return total >= 1000 ? `${(total / 1000).toFixed(1)}kg` : `${Math.round(total)}g`;
    }, [items]);

    return (
        <div className="mb-6">
            {/* CABEÇALHO INTERATIVO */}
            <div 
                className="flex items-center gap-3 mb-3 group cursor-pointer select-none py-2 px-2 -ml-2 rounded-lg hover:bg-zinc-900/30 transition-colors duration-200" 
                onClick={() => setExpandido(!expandido)}
            >
                {/* Ícone Chevron com transição suave */}
                <div className={`text-zinc-600 group-hover:text-zinc-300 transition-transform duration-300 ${expandido ? 'rotate-90' : 'rotate-0'}`}>
                    <ChevronRight size={16} />
                </div>
                
                {/* Título */}
                <h2 className={`text-sm font-bold uppercase tracking-wider ${estilo.text} flex items-center gap-2`}>
                    <Layers size={14} className="opacity-60" />{tipo}
                </h2>
                
                {/* Linha Divisória */}
                <div className="h-px bg-zinc-800 flex-1 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Stats (Peso | Quantidade) */}
                <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-zinc-500 font-medium group-hover:text-zinc-300 transition-colors">
                        {pesoTotal}
                    </span>
                    
                    <div className="w-px h-3 bg-zinc-800"></div> {/* Separador Vertical */}

                    <span className="text-zinc-500 bg-zinc-900/50 border border-zinc-800 px-2 py-0.5 rounded-md group-hover:border-zinc-700 transition-colors">
                        {items.length} {items.length === 1 ? 'Rolo' : 'Rolos'}
                    </span>
                </div>
            </div>
            
            {/* LISTA DE ITENS (Com animação de entrada) */}
            {expandido && (
                <div className={`
                    pl-2 animate-in fade-in slide-in-from-top-1 duration-300
                    ${viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4" 
                        : "flex flex-col gap-2"
                    }
                `}>
                    {items.map(item => (
                        viewMode === 'grid'
                            ? <FilamentCard key={item.id} item={item} {...acoes} />
                            : <FilamentRow key={item.id} item={item} {...acoes} />
                    ))}
                </div>
            )}
        </div>
    );
}