import React, { useCallback, useEffect, useRef } from "react";
import { Search, LayoutGrid, List, Plus, X, Trash2 } from "lucide-react";

/**
 * Componente de cabeçalho com estilo técnico HUD.
 * Otimizado pra ser fácil de usar e bem acessível.
 */
export default function FilamentHeader({
    busca = "",
    setBusca,
    viewMode,
    setViewMode,

    onAddClick,
    onWasteClick
}) {
    const inputRef = useRef(null);
    const termoBusca = busca || "";

    // Limpa a busca e volta o foco pro campo de texto
    const handleClearBusca = useCallback(() => {
        setBusca?.("");
        inputRef.current?.focus();
    }, [setBusca]);

    // Atalhos globais (Dica: use 'Escape' pra limpar a busca se estiver no campo)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && document.activeElement === inputRef.current) {
                handleClearBusca();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleClearBusca]);

    return (
        <header
            className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl overflow-hidden"
            role="banner"
        >
            {/* 1. DETALHE VISUAL: LINHA EM GRADIENTE SKY (TOPO) */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-900 via-sky-500 to-indigo-900 opacity-40" />

            {/* TÍTULO E IDENTIFICAÇÃO DO MÓDULO */}
            <div className="flex flex-col relative select-none">
                <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                        Gestão de Materiais
                    </h1>
                </div>
                <span className="text-xl font-black uppercase tracking-tighter text-white">
                    Meus <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Filamentos</span>
                </span>
            </div>

            <div className="flex items-center gap-6">

                {/* BARRA DE BUSCA TÉCNICA (ESTILO SKY) */}
                <div className="relative group" role="search">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none ${termoBusca ? 'text-sky-400' : 'text-zinc-600'}`}>
                        <Search size={14} strokeWidth={3} />
                    </div>

                    <input ref={inputRef} type="text" aria-label="Buscar filamentos"
                        className="w-72 bg-zinc-900/40 border border-white/5 rounded-xl py-2.5 pl-11 pr-10 text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest focus:border-sky-500/50 focus:bg-zinc-900/80 focus:ring-4 focus:ring-sky-500/10 placeholder:text-zinc-700 placeholder:text-[9px]"
                        placeholder="Buscar material, marca ou cor..."
                        value={termoBusca}
                        onChange={(e) => setBusca?.(e.target.value)}
                    />

                    {termoBusca && (
                        <button
                            onClick={handleClearBusca}
                            aria-label="Limpar busca"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-rose-500 transition-colors p-1 rounded-md focus:outline-none focus:text-rose-500"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* SELETOR DE VISUALIZAÇÃO (ESTILO HUD) */}
                <div className="flex items-center bg-zinc-900/50 border border-white/5 p-1 rounded-xl" role="group" aria-label="Modo de visualização">
                    <button
                        onClick={() => setViewMode?.('grid')}
                        aria-pressed={viewMode === 'grid'}
                        className={`p-2 rounded-lg transition-all duration-300 focus:outline-none ${viewMode === 'grid'
                            ? 'bg-sky-500/20 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                            : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'
                            }`}
                        title="Visualização em Grade"
                    >
                        <LayoutGrid size={16} strokeWidth={viewMode === 'grid' ? 2.5 : 2} />
                    </button>
                    <button
                        onClick={() => setViewMode?.('list')}
                        aria-pressed={viewMode === 'list'}
                        className={`p-2 rounded-lg transition-all duration-300 focus:outline-none ${viewMode === 'list'
                            ? 'bg-sky-500/20 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                            : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'
                            }`}
                        title="Visualização em Lista"
                    >
                        <List size={16} strokeWidth={viewMode === 'list' ? 2.5 : 2} />
                    </button>
                </div>

                {/* BOTÃO DE DESPERDÍCIO (Ícone Quadrado) */}
                <button
                    onClick={() => onWasteClick?.()}
                    className="
                        group relative h-11 w-11 flex items-center justify-center rounded-xl 
                        bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40
                        transition-all duration-300 active:scale-95 mr-2
                    "
                    title="Registrar Desperdício"
                >
                    <Trash2 size={18} className="text-rose-500 group-hover:scale-110 transition-transform" />
                </button>

                {/* BOTÃO PRA ADICIONAR (SKY SOLID) */}
                <button
                    onClick={() => onAddClick?.()}
                    className="
                        group relative h-11 px-6 overflow-hidden rounded-xl 
                        bg-sky-500 hover:bg-sky-400 transition-all duration-300 
                        active:scale-95 shadow-lg shadow-sky-900/40
                        focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-zinc-950
                    "
                >
                    {/* Brilho interno ao passar o mouse */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="relative flex items-center gap-3 text-zinc-950">
                        <Plus size={16} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                            Novo Filamento
                        </span>
                    </div>
                </button>
            </div>

            {/* REFLEXO DE LUZ SKY (SUTIL NO FUNDO) */}
            <div className="absolute -bottom-10 right-20 w-40 h-20 bg-sky-500/10 blur-[60px] pointer-events-none" aria-hidden="true" />
        </header>
    );
}