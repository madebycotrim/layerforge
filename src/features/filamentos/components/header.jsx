import React from "react";
import { Search, LayoutGrid, List, Plus, X } from "lucide-react";

/**
 * Componente de cabeçalho da seção de filamentos com estética técnica HUD.
 */
export default function FilamentHeader({
    busca = "",
    setBusca,
    viewMode,
    setViewMode,
    onAddClick
}) {

    const termoBusca = busca || "";

    const handleClearBusca = () => setBusca?.("");

    return (
        <header className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl overflow-hidden">

            {/* 1. ASSINATURA VISUAL: LINHA DE GRADIENTE SKY (TOP) */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-700 via-sky-500 to-indigo-400 opacity-60" />

            {/* TÍTULO E IDENTIFICAÇÃO DO MÓDULO */}
            <div className="flex flex-col relative">
                <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                        Gestão de Filamentos
                    </h1>
                </div>
                <span className="text-xl font-black uppercase tracking-tighter text-white">
                    Meus <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Filamentos</span>
                </span>
            </div>

            <div className="flex items-center gap-6">

                {/* BARRA DE PESQUISA TÉCNICA (FOCO SKY) */}
                <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${termoBusca ? 'text-sky-400' : 'text-zinc-600'}`}>
                        <Search size={14} strokeWidth={3} />
                    </div>

                    <input
                        className="
                            w-72 bg-zinc-900/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-10 
                            text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest
                            focus:border-sky-500/30 focus:bg-zinc-900/80 focus:ring-4 focus:ring-sky-500/5
                            placeholder:text-zinc-700 placeholder:text-[9px]
                        "
                        placeholder="Pesquisar polímero, marca ou cor..."
                        value={termoBusca}
                        onChange={(e) => setBusca?.(e.target.value)}
                    />

                    {termoBusca && (
                        <button
                            onClick={handleClearBusca}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-rose-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* SELETOR DE VISUALIZAÇÃO (HUD STYLE SKY) */}
                <div className="flex items-center bg-zinc-900/50 border border-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode?.('grid')}
                        className={`p-2 rounded-lg transition-all duration-500 ${viewMode === 'grid'
                            ? 'bg-sky-500/10 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]'
                            : 'text-zinc-600 hover:text-zinc-400'
                            }`}
                        title="Grade"
                    >
                        <LayoutGrid size={16} strokeWidth={viewMode === 'grid' ? 2.5 : 2} />
                    </button>
                    <button
                        onClick={() => setViewMode?.('list')}
                        className={`p-2 rounded-lg transition-all duration-500 ${viewMode === 'list'
                            ? 'bg-sky-500/10 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]'
                            : 'text-zinc-600 hover:text-zinc-400'
                            }`}
                        title="Lista"
                    >
                        <List size={16} strokeWidth={viewMode === 'list' ? 2.5 : 2} />
                    </button>
                </div>

                {/* DIVISOR DE FIBRA ÓTICA */}
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mx-1" />

                {/* BOTÃO DE ADIÇÃO (FULL SKY GRADIENT) */}
                <button
                    onClick={() => onAddClick?.()}
                    className="
                        group relative h-11 px-6 overflow-hidden rounded-xl 
                        transition-all duration-500 active:scale-95 shadow-lg shadow-sky-900/20
                    "
                >
                    {/* Background Gradiente Dinâmico */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 group-hover:scale-110 transition-transform duration-500" />

                    {/* Brilho Interno */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative flex items-center gap-3 text-white">
                        <Plus size={16} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                            Novo Filamento
                        </span>
                    </div>
                </button>
            </div>

            {/* REFLEXO DE LUZ SKY NO FUNDO */}
            <div className="absolute -bottom-10 right-20 w-40 h-20 bg-sky-500/5 blur-[50px] pointer-events-none" />
        </header>
    );
}