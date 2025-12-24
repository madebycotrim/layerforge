import React, { useState, useEffect, useMemo } from "react";
import { 
    X, History, Printer, Package, 
    RotateCcw, Trash2, Search, Database 
} from "lucide-react";

import { getHistory, removeHistoryEntry, clearHistory } from "../logic/localHistory";
import { formatCurrency } from "../../../lib/format";

export default function GavetaHistorico({ open, onClose, onRestore }) {
    const [itens, setItens] = useState([]);
    const [busca, setBusca] = useState("");

    useEffect(() => {
        if (open) {
            const history = getHistory();
            setItens(Array.isArray(history) ? history : []);
        }
    }, [open]);

    const itensFiltrados = useMemo(() => {
        return itens.filter((item) => 
            (item.label || "").toLowerCase().includes(busca.toLowerCase())
        );
    }, [itens, busca]);

    const handleExcluir = (e, id) => {
        e.stopPropagation();
        if (window.confirm("Quer apagar este projeto da sua lista? Essa ação não pode ser desfeita.")) {
            removeHistoryEntry(id);
            setItens(getHistory() || []);
        }
    };

    const handleLimparTudo = () => {
        if (window.confirm("ATENÇÃO: Isso vai apagar TODOS os projetos salvos nesta máquina. Quer mesmo limpar tudo?")) {
            clearHistory();
            setItens([]);
        }
    };

    return (
        <>
            {/* BACKDROP (Overlay) */}
            <div 
                className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
                onClick={onClose} 
            />

            {/* DRAWER (Painel Lateral) */}
            <aside className={`fixed top-0 right-0 z-[101] h-screen w-[420px] bg-[#050505] border-l border-white/5 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}>
                
                {/* HEADER */}
                <div className="h-20 px-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                            <History size={20} />
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Projetos Salvos</h2>
                            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Histórico da sua Oficina</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-white/5 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* BUSCA */}
                <div className="p-5 border-b border-white/5 bg-zinc-900/10">
                    <div className="relative group">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" />
                        <input
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 h-11 text-[11px] font-mono text-zinc-300 outline-none focus:border-sky-500/30 transition-all placeholder:text-zinc-800"
                            placeholder="Procurar peça ou projeto..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                {/* LISTAGEM DE CARDS */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                    {itensFiltrados.length > 0 ? itensFiltrados.map((item) => {
                        const r = item.data?.resultados || {};
                        const e = item.data?.entradas || {};
                        const margem = Number(r.margemEfetivaPct || 0);
                        const temLucro = margem > 0;

                        return (
                            <div 
                                key={item.id} 
                                onClick={() => { onRestore(item); onClose(); }}
                                className="bg-zinc-900/30 border border-white/5 rounded-2xl p-5 hover:border-sky-500/30 transition-all group cursor-pointer relative overflow-hidden active:scale-[0.98]"
                            >
                                <div className="absolute -right-10 -top-10 w-24 h-24 bg-sky-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${temLucro ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse'}`} />
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                                                {item.timestamp || 'Data não disponível'}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-white text-base tracking-tighter uppercase leading-none truncate max-w-[200px]">
                                            {item.label || "Peça sem nome"}
                                        </h3>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className={`text-xs font-black font-mono ${temLucro ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {margem}% de Margem
                                        </div>
                                        <div className="text-[14px] font-black text-white font-mono mt-1">
                                            {formatCurrency(r.precoSugerido || 0)}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden mb-4 opacity-30">
                                    <div style={{ width: `${Math.max(0, Math.min(margem, 100))}%` }} className={`h-full ${temLucro ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                </div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-2 px-2 py-1 bg-black rounded-lg border border-zinc-800 text-[9px] font-bold text-zinc-500">
                                            <Printer size={10} /> {e.impressoraNome || "Máquina padrão"}
                                        </div>
                                        <div className="flex items-center gap-2 px-2 py-1 bg-black rounded-lg border border-zinc-800 text-[9px] font-bold text-zinc-500">
                                            <Package size={10} /> {e.pesoModelo || 0}g de filamento
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => handleExcluir(e, item.id)}
                                            title="Apagar"
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-rose-500 hover:border-rose-900 transition-all shadow-inner"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-600 text-white opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                                            <RotateCcw size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-10 py-20">
                            <Database size={48} strokeWidth={1} className="mb-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Nenhum projeto encontrado</span>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-white/5 bg-zinc-900/10">
                    <button 
                        onClick={handleLimparTudo}
                        className="w-full py-3.5 rounded-2xl border border-dashed border-zinc-800 text-zinc-600 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-500/5 text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                    >
                        Limpar todo o histórico
                    </button>
                </div>
            </aside>
        </>
    );
}