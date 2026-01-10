import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/numbers';

/**
 * Widget de Resumo Financeiro
 * Mostra receita, custos e lucro líquido
 */
export default function FinancialSummaryWidget({ projects = [], className = '' }) {
    const financial = useMemo(() => {
        if (!Array.isArray(projects) || projects.length === 0) {
            return {
                revenue: 0,
                costs: 0,
                profit: 0,
                margin: 0,
                projectCount: 0
            };
        }

        let totalRevenue = 0;
        let totalCosts = 0;

        projects.forEach(project => {
            const data = project.data || {};
            const results = data.resultados || {};

            // Receita (preço final de venda)
            const revenue = Number(results.precoComDesconto || results.precoSugerido || 0);
            totalRevenue += revenue;

            // Custos (custo total de produção)
            const costs = Number(results.custoTotalProducao || 0);
            totalCosts += costs;
        });

        const profit = totalRevenue - totalCosts;
        const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        return {
            revenue: totalRevenue,
            costs: totalCosts,
            profit,
            margin,
            projectCount: projects.length
        };
    }, [projects]);

    const isPositive = financial.profit >= 0;

    return (
        <div className={`
      relative bg-zinc-950/40 border border-zinc-800/50 rounded-[2rem] p-8
      hover-lift overflow-hidden
      ${className}
    `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
                        Resumo Financeiro
                    </h3>
                    <p className="text-xs text-zinc-600 mt-1">
                        {financial.projectCount} {financial.projectCount === 1 ? 'projeto' : 'projetos'}
                    </p>
                </div>
                <div className={`
          w-12 h-12 rounded-2xl flex items-center justify-center
          ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}
        `}>
                    <DollarSign size={24} />
                </div>
            </div>

            {financial.projectCount === 0 ? (
                // Estado vazio
                <div className="flex flex-col items-center justify-center py-12 opacity-40">
                    <AlertCircle size={40} strokeWidth={1} className="mb-3 text-zinc-600" />
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                        Nenhum projeto cadastrado
                    </p>
                </div>
            ) : (
                <>
                    {/* Grid de Métricas */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Receita */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Receita Total
                                </span>
                            </div>
                            <p className="text-2xl font-mono font-black text-emerald-400">
                                {formatCurrency(financial.revenue)}
                            </p>
                        </div>

                        {/* Custos */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Custos Totais
                                </span>
                            </div>
                            <p className="text-2xl font-mono font-black text-rose-400">
                                {formatCurrency(financial.costs)}
                            </p>
                        </div>
                    </div>

                    {/* Lucro Líquido */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-zinc-900/20 border border-zinc-800/30">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                                    Lucro Líquido
                                </span>
                                <div className="flex items-baseline gap-3">
                                    <p className={`text-3xl font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatCurrency(financial.profit)}
                                    </p>
                                    <div className={`
                    flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold
                    ${isPositive
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-rose-500/10 text-rose-400'
                                        }
                  `}>
                                        {isPositive ? (
                                            <><TrendingUp size={14} /> {financial.margin.toFixed(1)}%</>
                                        ) : (
                                            <><TrendingDown size={14} /> {financial.margin.toFixed(1)}%</>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Indicador Visual */}
                            <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center
                transition-all duration-300
                ${isPositive
                                    ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20'
                                    : 'bg-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/20'
                                }
              `}>
                                {isPositive ? (
                                    <TrendingUp size={32} strokeWidth={2.5} />
                                ) : (
                                    <TrendingDown size={32} strokeWidth={2.5} />
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Decoração */}
            <div className={`
        absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] pointer-events-none
        ${isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10'}
      `} />
        </div>
    );
}
