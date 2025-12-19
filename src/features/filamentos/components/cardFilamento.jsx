// --- FILE: src/features/filamentos/components/cardFilamento.jsx ---
import React from "react";
import { Edit2, Trash2, ArrowDownFromLine, Factory, AlertTriangle, Scale } from "lucide-react";
import SpoolSideView from "./roloFilamento";

// --- HELPERS ---
const getFilamentColor = (item) => item.colorHex || item.color || item.hex || "#e4e4e7";
const getMaterialType = (item) => item.material || item.type || "PLA";

const calculateCurrentValue = (item) => {
    const price = Number(item.price) || 0;
    const capacity = Number(item.weightTotal) || 1000;
    const current = Number(item.weightCurrent) || 0;
    if (capacity <= 0) return 0;
    return (price / capacity) * current;
};

// --- COMPONENTE CARD ---
export function FilamentCard({ item, onEdit, onDelete, onConsume }) {
    const capacity = Number(item.weightTotal) || 1000;
    const current = Number(item.weightCurrent) || 0;
    const pct = capacity > 0 ? (current / capacity) * 100 : 0;

    const filamentColor = getFilamentColor(item);
    const isCritical = pct < 20;
    const materialType = getMaterialType(item);
    const currentValue = calculateCurrentValue(item);

    return (
        <div
            id={`filament-${item.id}`}
            className={`
                group relative flex flex-col 
                bg-[#09090b] border rounded-2xl overflow-hidden 
                transition-all duration-300 
                hover:-translate-y-1 hover:shadow-2xl
                ${isCritical 
                    ? 'border-rose-500/30 shadow-[0_0_20px_-10px_rgba(244,63,94,0.2)]' 
                    : 'border-zinc-800/60 hover:border-zinc-700'}
            `}
        >
            {/* Glow Ambiente (Sutil atrás do card) */}
            <div
                className="absolute -top-[100px] -right-[100px] w-[200px] h-[200px] rounded-full blur-[90px] opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none z-0"
                style={{ backgroundColor: filamentColor }}
            />

            <div className="flex flex-1 relative z-10">
                
                {/* --- COLUNA ESQUERDA: SLOT DO ROLO --- */}
                <div className="w-[88px] flex flex-col items-center pt-6 pb-0 bg-zinc-900/20 border-r border-zinc-800/50 relative shrink-0">
                    
                    {/* Visualização do Rolo */}
                    <div className="relative z-10 filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-105">
                        <SpoolSideView color={filamentColor} percent={pct} type={item.spoolType} size={64} />
                    </div>

                    {/* Fio conector decorativo */}
                    <div className="h-full w-px bg-gradient-to-b from-zinc-800/50 via-zinc-800/50 to-transparent my-1"></div>

                    {/* Tag Material (Melhorada a legibilidade) */}
                    <div className="mb-4 px-2.5 py-1 rounded bg-[#09090b] border border-zinc-800 shadow-lg z-20">
                        <span className="text-[10px] font-black text-zinc-300 block uppercase tracking-widest leading-none text-center">
                            {materialType}
                        </span>
                    </div>
                </div>

                {/* --- COLUNA DIREITA: DADOS --- */}
                <div className="flex-1 p-4 flex flex-col min-w-0 relative gap-3">
                    
                    {/* 1. Header: Nome + Marca + Preço */}
                    <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1 min-w-0">
                            <h3 className="text-sm font-bold text-zinc-100 leading-tight truncate pr-1" title={item.name}>
                                {item.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium uppercase tracking-wide">
                                <Factory size={10} className="text-zinc-600" />
                                <span className="truncate">{item.brand || 'Genérico'}</span>
                            </div>
                        </div>

                        {/* Tag de Preço (Mais sutil, menos neon) */}
                        <div className="flex flex-col items-end shrink-0">
                            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/10 shadow-sm">
                                <span>R$ {currentValue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Painel Digital (Peso) */}
                    {/* Fundo escuro para simular um display LCD/Tech */}
                    <div className="bg-[#050505] border border-zinc-800/50 rounded-xl p-3 relative overflow-hidden group/display">
                        
                        {/* Label do Painel */}
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider flex items-center gap-1.5">
                                <Scale size={10} /> Peso Atual
                            </span>
                            
                            {/* Alerta Crítico dentro do display */}
                            {isCritical && (
                                <span className="text-[9px] font-bold text-rose-500 animate-pulse flex items-center gap-1">
                                    <AlertTriangle size={10} /> BAIXO
                                </span>
                            )}
                        </div>

                        {/* Números Grandes */}
                        <div className="flex items-baseline gap-1 relative z-10">
                            <span className={`text-2xl font-mono font-bold tracking-tighter leading-none ${isCritical ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'text-white'}`}>
                                {Math.round(current)}
                            </span>
                            <span className="text-[10px] text-zinc-600 font-mono">/ {Math.round(capacity)}g</span>
                        </div>

                        {/* Barra de Progresso "Tech" */}
                        <div className="relative h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-2">
                            <div
                                style={{
                                    width: `${pct}%`,
                                    backgroundColor: filamentColor,
                                    boxShadow: `0 0 10px ${filamentColor}40`
                                }}
                                className="h-full relative transition-all duration-700 ease-out"
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* --- FOOTER (Hierarquia ajustada) --- */}
            <div className="grid grid-cols-[1fr_1px_44px_1px_44px] items-center border-t border-zinc-800 bg-zinc-900/30 h-10">
                
                {/* Botão Registrar Uso (Com hover mais evidente) */}
                <button 
                    onClick={() => onConsume(item)} 
                    className="h-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all group/btn"
                >
                    <ArrowDownFromLine size={13} className="text-zinc-500 group-hover/btn:text-white transition-colors" />
                    <span>Registrar Uso</span>
                </button>
                
                <div className="h-4 bg-zinc-800/50"></div>

                <button onClick={() => onEdit(item)} className="h-full flex items-center justify-center text-zinc-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors" title="Editar">
                    <Edit2 size={14} />
                </button>
                
                <div className="h-4 bg-zinc-800/50"></div>

                <button onClick={() => onDelete(item.id)} className="h-full flex items-center justify-center text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors" title="Excluir">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

// --- ROW (Lista) - Mantendo sincronia ---
export function FilamentRow({ item, onEdit, onDelete, onConsume }) {
    const capacity = Number(item.weightTotal) || 1000;
    const current = Number(item.weightCurrent) || 0;
    const pct = capacity > 0 ? (current / capacity) * 100 : 0;
    const filamentColor = getFilamentColor(item);
    const materialType = getMaterialType(item);
    const currentValue = calculateCurrentValue(item);
    const isCritical = pct < 20;

    return (
        <div
            id={`filament-${item.id}`}
            className={`
                group flex items-center bg-[#09090b] border rounded-xl p-2 transition-all mb-1 shadow-sm
                ${isCritical ? 'border-rose-500/20' : 'border-zinc-800 hover:border-zinc-700'}
            `}
        >
            <div className="shrink-0 px-3 py-1 relative">
                <div className="scale-95 drop-shadow-md">
                    <SpoolSideView color={filamentColor} percent={pct} type={item.spoolType} size={36} />
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-4 items-center ml-1">
                <div className="col-span-4 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                         <span className="text-[10px] font-black text-zinc-400 bg-[#121214] border border-zinc-800 px-1.5 rounded uppercase tracking-wider">
                            {materialType}
                         </span>
                         <span className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                            {item.name}
                         </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 uppercase">
                        {item.brand || 'Genérico'}
                    </span>
                </div>

                <div className="col-span-2 hidden md:flex flex-col justify-center pl-4 border-l border-zinc-800/50">
                    <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">Valor</span>
                    <span className="text-xs font-bold text-emerald-500 font-mono">R$ {currentValue.toFixed(2)}</span>
                </div>

                <div className="col-span-3 flex flex-col justify-center pr-4 pl-4 border-l border-zinc-800/50">
                    <div className="flex justify-between text-[10px] mb-1.5 font-mono items-end">
                        <span className={`font-bold ${isCritical ? 'text-rose-500' : 'text-zinc-300'}`}>
                            {Math.round(current)}<span className="text-zinc-600 font-normal">/</span><span className="text-zinc-500 font-normal">{Math.round(capacity)}g</span>
                        </span>
                        {isCritical && <span className="text-[8px] font-bold text-rose-500 animate-pulse">BAIXO</span>}
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div 
                            style={{ width: `${pct}%`, backgroundColor: filamentColor }} 
                            className="h-full opacity-90 shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all duration-500" 
                        />
                    </div>
                </div>

                <div className="col-span-3 flex justify-end gap-1">
                    <button onClick={() => onConsume(item)} className="p-2 bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-lg transition-all" title="Registrar Uso">
                        <ArrowDownFromLine size={14} />
                    </button>
                    <div className="w-px h-5 bg-zinc-800 my-auto mx-1"></div>
                    <button onClick={() => onEdit(item)} className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-sky-400 rounded-lg transition-colors">
                        <Edit2 size={14} />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-rose-500 rounded-lg transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}