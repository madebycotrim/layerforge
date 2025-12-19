// src/features/filamentos/components/DistributionCard.jsx
import React, { useMemo } from "react";
import { PieChart, AlertCircle } from "lucide-react";

export default function DistributionCard({ stats = [] }) {
    
    // Processamento dos dados para exibição
    const { topStats, othersCount, materialDominante } = useMemo(() => {
        if (!stats.length) return { topStats: [], othersCount: 0, materialDominante: null };

        // Ordena por porcentagem (garantia)
        const sorted = [...stats].sort((a, b) => b.percent - a.percent);
        
        return {
            topStats: sorted.slice(0, 3), // Pega os top 3
            othersCount: Math.max(0, sorted.length - 3),
            materialDominante: sorted[0] // O primeiro é o dominante
        };
    }, [stats]);

    return (
        <div className="bg-[#0e0e11] border border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between h-full hover:border-zinc-700 transition-all relative overflow-hidden group shadow-lg">
            
            {/* Ícone de Fundo (Decorativo) */}
            <div className="absolute -right-6 -bottom-6 text-indigo-500 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none rotate-12">
                <PieChart size={100} />
            </div>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-indigo-500 group-hover:text-indigo-400 transition-colors shadow-sm">
                    <PieChart size={18} />
                </div>
                <div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">DNA do Estoque</p>
                    {materialDominante && (
                        <p className="text-xs text-zinc-300 font-medium">
                            Dominância: <span className="text-indigo-400 font-bold">{materialDominante.type}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Corpo do Gráfico */}
            <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
                
                {/* Texto Grande (Total de Tipos) */}
                <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-white tracking-tight">
                        {stats.length > 0 ? stats.length : 0} 
                        <span className="text-sm font-normal text-zinc-500 ml-1.5">Materiais</span>
                    </span>
                </div>

                {/* Barra de Progresso Segmentada */}
                <div className="h-3 w-full flex rounded-full overflow-hidden bg-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
                    {stats.length > 0 ? (
                        stats.map((stat, index) => (
                            <div 
                                key={stat.type} 
                                style={{ width: `${stat.percent}%` }} 
                                className={`${stat.bg} hover:brightness-110 transition-all relative group/segment first:pl-0.5 last:pr-0.5`}
                                title={`${stat.type}: ${stat.percent.toFixed(1)}%`}
                            >
                                {/* Separador visual entre segmentos */}
                                {index !== stats.length - 1 && (
                                    <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-black/40 z-10"></div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="w-full h-full bg-zinc-800/20 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-zinc-800/50 rotate-45 transform scale-150"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Legenda */}
            <div className="mt-3 relative z-10">
                {stats.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {topStats.map((stat) => (
                            <div key={stat.type} className="flex items-center gap-1.5 group/legend cursor-help" title={`${stat.percent.toFixed(1)}% do estoque`}>
                                <div className={`w-2 h-2 rounded-full ${stat.bg} shadow-[0_0_5px_rgba(0,0,0,0.5)] group-hover/legend:scale-125 transition-transform`}></div>
                                <span className="text-[10px] font-mono font-medium text-zinc-400 group-hover/legend:text-zinc-200 transition-colors">
                                    {stat.type} <span className="text-zinc-600 group-hover/legend:text-zinc-500">| {Math.round(stat.percent)}%</span>
                                </span>
                            </div>
                        ))}
                        
                        {/* Indicador de "+X Outros" */}
                        {othersCount > 0 && (
                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-zinc-900/50 border border-zinc-800">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">
                                    +{othersCount} Outros
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-zinc-600 text-xs">
                        <AlertCircle size={12} />
                        <span>Sem dados para exibir</span>
                    </div>
                )}
            </div>
        </div>
    );
}