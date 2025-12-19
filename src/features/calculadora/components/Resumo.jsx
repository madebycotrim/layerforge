// --- FILE: src/features/calculadora/components/Resumo.jsx ---
import React, { useState, useMemo } from "react";
import { formatCurrency } from "../../../lib/format";
import { addHistoryEntry } from "../logic/localHistory";
import {
    Save, TrendingUp, AlertTriangle, CheckCircle2,
    Package, Zap, Clock, Truck, Layers, Wrench,
    Landmark, Store, Tag, FileText, Printer, Share2,
    CircleDashed, Calculator
} from "lucide-react";

// --- COMPONENTE AUXILIAR: LINHA DO RECIBO ---
const SummaryRow = ({ icon: Icon, label, value, total, color = "text-zinc-400" }) => {
    // Não renderiza valores insignificantes
    if (!value || value <= 0.01) return null;

    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    const barWidth = Math.min(Math.max(pct, 1), 100); // Garante entre 1% e 100% visualmente

    return (
        <div className="flex items-center justify-between py-2 px-3 -mx-2 rounded-lg group hover:bg-zinc-800/50 transition-all duration-300">
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-sky-400 group-hover:border-sky-500/20 transition-all shadow-sm">
                    <Icon size={14} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        {label}
                    </span>
                    {/* Barra de progresso mini */}
                    <div className="w-16 h-0.5 bg-zinc-800/50 mt-1 rounded-full overflow-hidden">
                        <div 
                            style={{ width: `${barWidth}%` }} 
                            className={`h-full rounded-full transition-all duration-500 ${pct > 30 ? 'bg-amber-500/70' : 'bg-zinc-600 group-hover:bg-sky-500'}`} 
                        />
                    </div>
                </div>
            </div>
            <div className="text-right">
                <span className={`block text-xs font-mono font-bold ${color === "text-zinc-400" ? "text-zinc-300" : color}`}>
                    {formatCurrency(value)}
                </span>
                <span className="block text-[9px] text-zinc-600 font-mono tracking-tight group-hover:text-zinc-500">
                    {pct}% do total
                </span>
            </div>
        </div>
    );
};

export default function Summary({ resultados = {}, entradas = {}, salvar = () => { } }) {
    // Destructuring seguro com valores padrão
    const {
        custoUnitario = 0, precoSugerido = 0, precoComDesconto = 0, margemEfetivaPct = 0, lucroBrutoUnitario = 0,
        custoMaterial = 0, custoEnergia = 0, custoMaquina = 0, custoMaoDeObra = 0,
        custoEmbalagemFrete = 0, custosExtras = 0, custoSetup = 0,
        valorRisco = 0, valorImpostos = 0, valorMarketplace = 0
    } = resultados;

    const [salvo, setSalvo] = useState(false);

    // --- CÁLCULOS E LÓGICA ---
    const totalBase = precoSugerido || 0;
    const isNeutral = totalBase <= 0.01;
    const margemNum = Number(margemEfetivaPct || 0);
    const temLucro = margemNum > 0;

    const custoTotalReal = custoUnitario + valorImpostos + valorMarketplace;
    const pctCusto = totalBase > 0 ? Math.min(100, Math.round((custoTotalReal / totalBase) * 100)) : 0;
    const pctLucro = totalBase > 0 ? Math.max(0, 100 - pctCusto) : 0;
    
    const temDesconto = precoComDesconto > 0 && precoComDesconto < precoSugerido;
    const pctDescontoOff = temDesconto ? Math.round(((precoSugerido - precoComDesconto) / precoSugerido) * 100) : 0;

    // --- CONFIGURAÇÃO VISUAL (MEMOIZED) ---
    const status = useMemo(() => {
        if (isNeutral) return {
            key: 'neutral',
            bg: "bg-zinc-900 border-zinc-800",
            iconBg: "bg-zinc-800 text-zinc-600",
            textTitle: "text-zinc-500",
            textValue: "text-zinc-700",
            borderBadge: "hidden",
            icon: CircleDashed,
            label: "Aguardando Dados",
            barColor: "bg-zinc-700",
            glow: ""
        };
        
        if (temLucro) return {
            key: 'profit',
            bg: "bg-gradient-to-br from-emerald-900/10 to-zinc-900 border-emerald-500/20",
            iconBg: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
            textTitle: "text-emerald-500",
            textValue: "text-zinc-100",
            borderBadge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
            icon: TrendingUp,
            label: "Lucro Estimado",
            barColor: "bg-emerald-500",
            glow: "shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)]"
        };

        return {
            key: 'loss',
            bg: "bg-gradient-to-br from-rose-900/10 to-zinc-900 border-rose-500/20",
            iconBg: "bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20",
            textTitle: "text-rose-500",
            textValue: "text-rose-100",
            borderBadge: "bg-rose-500/10 border-rose-500/20 text-rose-400",
            icon: AlertTriangle,
            label: "Prejuízo Previsto",
            barColor: "bg-rose-500",
            glow: "shadow-[0_0_30px_-10px_rgba(244,63,94,0.15)]"
        };
    }, [isNeutral, temLucro]);

    const StatusIcon = status.icon;

    // --- HANDLERS ---
    const handleSalvar = () => {
        try {
            // Tenta pegar o nome via prop 'entradas' primeiro, fallback para DOM
            let label = entradas.nomeProjeto || "Projeto sem nome";
            
            if (!entradas.nomeProjeto) {
                const nomeEl = document.getElementById("nomeProjeto");
                if (nomeEl && nomeEl.value) label = nomeEl.value;
            }

            addHistoryEntry({ label, entradas, resultados });
            
            setSalvo(true);
            setTimeout(() => setSalvo(false), 2500);
            
            if (typeof salvar === "function") salvar(resultados);
        } catch (e) { 
            console.error("Erro ao salvar histórico:", e); 
        }
    };

    const handlePrint = () => window.print();

    return (
        <div className="h-full flex flex-col gap-4 select-none">
            
            {/* === 1. CARD INDICADOR PRINCIPAL === */}
            <div className={`
                relative overflow-hidden rounded-2xl border p-5 flex-shrink-0 
                transition-all duration-500 ${status.bg} ${status.glow}
            `}>
                <div className="flex justify-between items-start relative z-10 mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${status.iconBg} transition-colors`}>
                            <StatusIcon size={18} strokeWidth={2} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${status.textTitle}`}>
                            {status.label}
                        </span>
                    </div>
                    {!isNeutral && (
                        <div className={`px-2.5 py-1 rounded-md text-xs font-bold border font-mono backdrop-blur-sm ${status.borderBadge}`}>
                            {margemNum}%
                        </div>
                    )}
                </div>

                <div className="mb-6 relative z-10">
                    <h2 className={`text-4xl font-bold font-mono tracking-tighter transition-colors ${status.textValue}`}>
                        {formatCurrency(lucroBrutoUnitario)}
                    </h2>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide mt-1 block">
                        {isNeutral ? "Aguardando cálculo..." : "Margem Líquida / Unidade"}
                    </span>
                </div>

                <div className="relative z-10">
                    {!isNeutral ? (
                        <>
                            <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-500 mb-2 px-0.5">
                                <span>Custo Operacional ({pctCusto}%)</span>
                                <span className={status.textTitle}>Lucro ({pctLucro}%)</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-950/50 rounded-full overflow-hidden flex ring-1 ring-white/5">
                                <div style={{ width: `${pctCusto}%` }} className="bg-zinc-700 h-full transition-all duration-700 ease-out" />
                                <div style={{ width: `${pctLucro}%` }} className={`${status.barColor} h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                            </div>
                        </>
                    ) : (
                        <div className="h-2 w-full bg-zinc-800/50 rounded-full overflow-hidden mt-2">
                            <div className="h-full w-1/3 bg-zinc-700/30 rounded-full animate-pulse"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* === 2. PREÇO FINAL === */}
            <div className={`
                bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 relative 
                overflow-hidden text-center group transition-all duration-500
                ${isNeutral ? 'opacity-60 grayscale' : 'opacity-100 hover:border-zinc-700 hover:bg-zinc-900/60'}
            `}>
                {temDesconto && <div className="absolute right-0 top-0 w-24 h-24 bg-sky-500/10 blur-3xl rounded-full pointer-events-none" />}

                <div className="flex items-center justify-center gap-2 mb-1">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Preço Sugerido</p>
                    {temDesconto && (
                        <span className="px-1.5 py-px rounded bg-sky-500/10 border border-sky-500/20 text-[9px] font-bold text-sky-400 flex items-center gap-1">
                            <Tag size={10} /> -{pctDescontoOff}%
                        </span>
                    )}
                </div>

                {temDesconto ? (
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-sky-400 font-mono tracking-tight drop-shadow-sm">
                            {formatCurrency(precoComDesconto)}
                        </span>
                        <span className="text-xs text-zinc-600 font-mono line-through decoration-zinc-600/50 mt-0.5">
                            de {formatCurrency(precoSugerido)}
                        </span>
                    </div>
                ) : (
                    <p className={`text-3xl font-bold font-mono tracking-tight ${isNeutral ? 'text-zinc-600' : 'text-zinc-200'}`}>
                        {formatCurrency(precoSugerido)}
                    </p>
                )}
            </div>

            {/* === 3. LISTA DETALHADA (Scrollable) === */}
            <div className="flex-1 bg-zinc-900/20 border border-zinc-800/60 rounded-xl flex flex-col overflow-hidden backdrop-blur-sm">
                <div className="p-3 border-b border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-zinc-500" />
                        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Composição de Custo</h3>
                    </div>
                    {!isNeutral && <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700/50">{pctCusto}%</span>}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
                    {isNeutral && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-700 gap-3 opacity-60">
                            <Calculator size={32} strokeWidth={1} />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Preencha os parâmetros</span>
                        </div>
                    )}

                    {/* Grupo A: Diretos */}
                    <SummaryRow icon={Package} label="Material" value={custoMaterial} total={totalBase} />
                    <SummaryRow icon={Zap} label="Energia" value={custoEnergia} total={totalBase} />
                    <SummaryRow icon={Clock} label="Tempo/Máquina" value={custoMaquina} total={totalBase} />
                    <SummaryRow icon={Share2} label="Setup Impressão" value={custoSetup} total={totalBase} />
                    
                    {/* Grupo B: Mão de Obra e Acabamento */}
                    {(custoMaoDeObra > 0 || custosExtras > 0) && <div className="h-px bg-zinc-800/50 my-1 mx-2" />}
                    <SummaryRow icon={Wrench} label="Mão de Obra" value={custoMaoDeObra} total={totalBase} />
                    <SummaryRow icon={CircleDashed} label="Pós-Processamento" value={custosExtras} total={totalBase} />

                    {/* Grupo C: Comercial e Logística */}
                    {(custoEmbalagemFrete > 0 || valorRisco > 0 || valorImpostos > 0 || valorMarketplace > 0) && 
                        <div className="h-px bg-zinc-800/50 my-1 mx-2" />
                    }
                    <SummaryRow icon={Truck} label="Embalagem/Frete" value={custoEmbalagemFrete} total={totalBase} />
                    <SummaryRow icon={AlertTriangle} label="Margem de Risco" value={valorRisco} total={totalBase} color="text-amber-500" />
                    <SummaryRow icon={Landmark} label="Impostos" value={valorImpostos} total={totalBase} color="text-rose-400" />
                    <SummaryRow icon={Store} label="Taxa Marketplace" value={valorMarketplace} total={totalBase} color="text-rose-400" />
                </div>

                <div className="p-3 bg-zinc-950/30 border-t border-zinc-800/60 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Custo Total</span>
                    <span className={`text-sm font-bold font-mono ${isNeutral ? 'text-zinc-700' : 'text-zinc-300'}`}>
                        {formatCurrency(custoTotalReal)}
                    </span>
                </div>
            </div>

            {/* === 4. AÇÕES (Hidden on Print) === */}
            <div className="space-y-2 pt-1 print:hidden">
                
                {/* Botão Principal: Imprimir */}
                <button
                    onClick={handlePrint}
                    disabled={isNeutral}
                    className={`
                        w-full h-11 rounded-xl text-[11px] font-bold uppercase tracking-wide
                        border transition-all flex items-center justify-center gap-2.5
                        shadow-lg active:scale-[0.98]
                        ${isNeutral
                            ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50"
                            : "bg-zinc-950 border-zinc-700 text-zinc-200 hover:border-sky-500/50 hover:text-sky-400 hover:shadow-[0_0_15px_-3px_rgba(56,189,248,0.15)]"
                        }
                    `}
                >
                    <Printer size={16} />
                    Imprimir Relatório
                </button>

                <div className="grid grid-cols-2 gap-2">
                    {/* Ficha Técnica (Reuso do print ou lógica específica) */}
                    <button
                        onClick={handlePrint} // Assumindo que a ficha técnica usa o layout de impressão
                        disabled={isNeutral}
                        className={`
                            h-10 rounded-xl text-[10px] font-bold uppercase tracking-wide
                            border transition-all flex items-center justify-center gap-2
                            active:scale-[0.98]
                            ${isNeutral
                                ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
                            }
                        `}
                    >
                        <FileText size={14} />
                        Ficha Técnica
                    </button>

                    {/* Salvar */}
                    <button
                        onClick={handleSalvar}
                        disabled={isNeutral}
                        className={`
                            h-10 rounded-xl text-[10px] font-bold uppercase tracking-wide
                            border transition-all flex items-center justify-center gap-2
                            active:scale-[0.98]
                            ${isNeutral
                                ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
                                : salvo
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
                            }
                        `}
                    >
                        {salvo ? <CheckCircle2 size={16} /> : <Save size={16} />}
                        {salvo ? "Salvo!" : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}