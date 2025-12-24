import React from "react";
import {
    Edit2, Trash2, ArrowDownFromLine
} from "lucide-react";
import SpoolSideView from "./roloFilamento";

const getFilamentColor = (item) => item?.colorHex || item?.color || "#3b82f6";
const getMaterialType = (item) => (item?.type || item?.material || "PLA").toUpperCase();

// --- SUB-COMPONENTE: BARRA SEGMENTADA ESTILO NEON ---
const SegmentedProgress = ({ pct, isCritical }) => {
    const segments = 24;
    const activeColor = isCritical ? '#f43f5e' : '#22d3ee';
    const safePct = Math.max(0, Math.min(100, Number(pct) || 0));
    
    return (
        <div className="h-3 w-full bg-[#050505] border border-white/5 rounded-full px-1.5 flex items-center gap-[2px] shadow-inner">
            {[...Array(segments)].map((_, i) => {
                const isActive = i < (safePct / (100 / segments));
                return (
                    <div 
                        key={i} 
                        className="h-[2px] flex-1 rounded-full transition-all duration-700"
                        style={{ 
                            backgroundColor: isActive ? activeColor : '#18181b',
                            boxShadow: isActive ? `0 0 8px ${activeColor}40` : 'none',
                            opacity: isActive ? 1 : 0.3
                        }} 
                    />
                );
            })}
        </div>
    );
};

// --- 1. COMPONENTE CARD (MODO GRADE) ---
export const FilamentCard = ({ item, onEdit, onDelete, onConsume }) => {
    const capacity = Math.max(0, Number(item?.weightTotal) || 0);
    const current = Math.max(0, Number(item?.weightCurrent) || 0);
    const pct = Math.round(capacity > 0 ? (current / capacity) * 100 : 0);
    
    const filamentColor = getFilamentColor(item);
    const materialType = getMaterialType(item);
    const ehCritico = pct <= 20;

    const valorNoRolo = capacity > 0 
        ? ((Number(item?.price || 0) / capacity) * current).toFixed(2) 
        : "0.00";

    return (
        <div className={`
            group relative bg-[#09090b] border rounded-xl overflow-hidden transition-all duration-500 shadow-2xl
            ${ehCritico ? 'border-rose-600/50 shadow-[0_0_20px_-10px_rgba(225,29,72,0.3)]' : 'border-white/5 hover:border-zinc-700'}
        `}>
            <div className="flex h-[220px]">
                {/* BARRA LATERAL */}
                <div className="w-[85px] border-r border-white/5 bg-zinc-950/40 flex flex-col items-center py-6 justify-between shrink-0">
                    <div className="p-2.5 rounded-2xl bg-zinc-900 border border-white/5 shadow-inner relative">
                        <SpoolSideView color={filamentColor} percent={pct} size={40} />
                        <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 border-[#09090b] ${ehCritico ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest leading-none">Código</span>
                        <span className={`text-[9px] font-mono font-bold tracking-tighter ${ehCritico ? 'text-rose-400' : 'text-zinc-400'}`}>
                            #{String(item?.id || 'FILAM').slice(-4).toUpperCase()}
                        </span>
                    </div>
                    <div className="rotate-180 [writing-mode:vertical-lr] flex items-center gap-2">
                        <span className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.4em]">{item?.brand || 'Marca'}</span>
                    </div>
                </div>

                {/* PAINEL CENTRAL */}
                <div className="flex-1 p-7 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <h3 className={`text-lg font-bold uppercase tracking-tighter leading-none ${ehCritico ? 'text-rose-500' : 'text-zinc-100'}`}>{item?.name || "Sem Nome"}</h3>
                        <div className={`px-2.5 py-1 rounded-lg border text-[8px] font-bold uppercase tracking-widest ${ehCritico ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-zinc-900/50 border-white/5 text-zinc-500'}`}>
                            {ehCritico ? 'Rolo no fim!' : 'Em estoque'}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] block">Peso no rolo</span>
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1.5">
                                <span className={`text-4xl font-mono font-bold tracking-tighter leading-none ${ehCritico ? 'text-rose-500' : 'text-white'}`}>{Math.round(current)}</span>
                                <span className={`text-[10px] font-bold uppercase ${ehCritico ? 'text-rose-700' : 'text-zinc-600'}`}>gramas</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-zinc-600">{pct}%</span>
                        </div>
                        
                        <SegmentedProgress pct={pct} isCritical={ehCritico} />
                        
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-white/5">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest">Tipo</span>
                            <span className={`text-[10px] font-mono font-bold uppercase ${ehCritico ? 'text-rose-400' : 'text-zinc-400'}`}>{materialType}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                            <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest">Valor no rolo</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-500">R$ {valorNoRolo}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BARRA DE AÇÕES */}
            <div className="grid grid-cols-[1fr_repeat(2,44px)] h-10 border-t border-white/5 bg-zinc-950/80">
                <button onClick={() => onConsume(item)} className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all group/btn">
                    <ArrowDownFromLine size={12} className={ehCritico ? 'text-rose-500' : ''} /> Dar baixa (Uso)
                </button>
                <button onClick={() => onEdit(item)} title="Editar informações" className="flex items-center justify-center border-l border-white/5 text-zinc-600 hover:text-amber-400 hover:bg-white/5 transition-all">
                    <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(item?.id)} title="Remover da prateleira" className="flex items-center justify-center border-l border-white/5 text-zinc-600 hover:text-rose-500 hover:bg-white/5 transition-all">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

// --- 2. COMPONENTE LINHA (MODO LISTA) ---
export const FilamentRow = ({ item, onEdit, onDelete, onConsume }) => {
    const capacity = Math.max(0, Number(item?.weightTotal) || 0);
    const current = Math.max(0, Number(item?.weightCurrent) || 0);
    const pct = Math.round(capacity > 0 ? (current / capacity) * 100 : 0);
    
    const filamentColor = getFilamentColor(item);
    const materialType = getMaterialType(item);
    const ehCritico = pct <= 20;

    const valorNoRolo = capacity > 0 
        ? ((Number(item?.price || 0) / capacity) * current).toFixed(2) 
        : "0.00";

    return (
        <div className={`
            grid grid-cols-[80px_1fr_repeat(3,44px)] h-14 bg-[#09090b] border rounded-xl overflow-hidden transition-all
            ${ehCritico ? 'border-rose-900/30' : 'border-white/5 hover:border-zinc-700'}
        `}>
            {/* MINI VISUALIZADOR */}
            <div className={`flex items-center justify-center border-r border-white/5 ${ehCritico ? 'bg-rose-950/10' : 'bg-zinc-950/40'}`}>
                <SpoolSideView color={filamentColor} percent={pct} size={32} />
            </div>

            {/* INFO CENTRAL */}
            <div className="flex items-center px-6 gap-8">
                <div className="w-48 shrink-0">
                    <h3 className={`text-[11px] font-bold uppercase truncate ${ehCritico ? 'text-rose-500' : 'text-zinc-100'}`}>{item?.name || "Sem Nome"}</h3>
                    <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{item?.brand || 'Marca'} | {materialType}</p>
                </div>

                {/* MINI BARRA E PESO */}
                <div className="flex-1 flex items-center gap-6">
                    <div className="flex flex-col gap-0.5 min-w-[80px]">
                        <span className="text-[7px] font-bold text-zinc-600 uppercase">Peso atual</span>
                        <span className={`text-[10px] font-mono font-bold ${ehCritico ? 'text-rose-500' : 'text-zinc-300'}`}>{Math.round(current)}g</span>
                    </div>
                    <div className="flex-1 max-w-[200px]">
                        <SegmentedProgress pct={pct} isCritical={ehCritico} />
                    </div>
                </div>

                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[7px] font-bold text-zinc-600 uppercase">Valor restante</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-500">R$ {valorNoRolo}</span>
                </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <button onClick={() => onConsume(item)} title="Dar baixa no peso" className="flex items-center justify-center border-l border-white/5 text-zinc-600 hover:text-white hover:bg-white/5 transition-all">
                <ArrowDownFromLine size={14} />
            </button>
            <button onClick={() => onEdit(item)} title="Editar filamento" className="flex items-center justify-center border-l border-white/5 text-zinc-600 hover:text-amber-400 hover:bg-white/5 transition-all">
                <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(item?.id)} title="Remover do estoque" className="flex items-center justify-center border-l border-white/5 text-zinc-600 hover:text-rose-500 hover:bg-white/5 transition-all">
                <Trash2 size={14} />
            </button>
        </div>
    );
};