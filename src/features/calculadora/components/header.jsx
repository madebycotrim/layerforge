import React from "react";
import { Printer, History, Settings2, ChevronDown, Trash2 } from "lucide-react";

export default function Header({
    nomeProjeto,
    setNomeProjeto,
    printers = [],
    selectedPrinterId,
    onCyclePrinter,
    onOpenHistory,
    onOpenSettings,
    onOpenWaste, // New Prop
    needsConfig = false,
    hud
}) {
    // Busca a impressora selecionada na lista de equipamentos com comparação segura de tipo
    const impressoraAtual = printers.find(p => String(p.id) === String(selectedPrinterId));

    // Define o nome que aparece no botão
    const nomeExibicaoHardware = impressoraAtual?.nome || impressoraAtual?.name || (printers.length > 0 ? "Selecionar Impressora" : "Offline");

    // Organiza o valor da potência
    const potenciaHardware = Number(impressoraAtual?.potencia || impressoraAtual?.power || 0);

    /**
     * Lógica para renderizar o texto:
     * Tudo em BRANCO, exceto a ÚLTIMA palavra que ganha o GRADIENTE CYAN-SKY.
     */
    const renderTextoColorido = () => {
        if (!nomeProjeto) return <span className="text-zinc-800">NOME DO PROJETO...</span>;

        const palavras = nomeProjeto.split(" ");

        if (palavras.length === 1) {
            return (
                <span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
                    {palavras[0]}
                </span>
            );
        }

        const ultimaPalavra = palavras[palavras.length - 1];
        const restoDoTexto = palavras.slice(0, -1).join(" ");

        return (
            <>
                <span className="text-white">{restoDoTexto + " "}</span>
                <span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
                    {ultimaPalavra}
                </span>
            </>
        );
    };

    return (
        <header className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md shrink-0 gap-4">
            {/* 1. DETALHE VISUAL: LINHA EM GRADIENTE SKY (TOPO) */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-900 via-sky-500 to-indigo-900 opacity-40" />

            {/* LADO ESQUERDO: NOME DO PROJETO COM EFEITO DE DUAS CORES */}
            <div className="flex flex-col min-w-[200px] max-w-xl group">
                <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 leading-none mb-1.5">
                    Cálculo de Produção
                </h1>

                {/* CONTAINER DO INPUT COM OVERLAY DE CORES */}
                <div className="relative inline-grid items-center">
                    {/* Camada Visual: Onde o texto colorido/gradiente realmente aparece */}
                    <div className="pointer-events-none whitespace-pre text-xl font-black uppercase tracking-tight z-10">
                        {renderTextoColorido()}
                    </div>

                    {/* Input Real: Transparente por cima para capturar a digitação e manter o caret visível */}
                    <input
                        value={nomeProjeto}
                        onChange={(e) => setNomeProjeto(e.target.value)}
                        placeholder="NOME DO PROJETO..."
                        className="absolute inset-0 bg-transparent uppercase border-none outline-none text-xl font-black tracking-tight text-transparent caret-sky-500 selection:bg-sky-500/30 w-full z-20 placeholder:text-transparent"
                    />
                </div>
            </div>

            {/* CENTRO: HUD (Painel Flutuante com resultados rápidos) */}
            <div className="flex-1 flex justify-center px-4">
                {hud}
            </div>

            {/* LADO DIREITO: SELEÇÃO DE MÁQUINA E ATALHOS */}
            <div className="flex items-center gap-6 shrink-0">

                <button
                    type="button"
                    onClick={onCyclePrinter}
                    className="group relative flex items-center gap-3 pl-3 pr-4 py-1.5 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 rounded-2xl transition-all duration-300 active:scale-[0.98]"
                >
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 transition-colors shadow-inner">
                        <Printer size={15} className={`${impressoraAtual ? 'text-sky-400' : 'text-zinc-500'} transition-colors`} />
                        {impressoraAtual && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-zinc-950 animate-pulse" />
                        )}
                    </div>

                    <div className="flex flex-col items-start min-w-[120px] max-w-[180px]">
                        <div className="flex items-center gap-2 leading-none mb-1">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Máquina</span>
                            {impressoraAtual && potenciaHardware > 0 && (
                                <span className="flex items-center gap-0.5 text-[8px] font-mono font-bold text-emerald-500/80 bg-emerald-500/5 px-1 rounded border border-emerald-500/10">
                                    {potenciaHardware}W
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-zinc-200 uppercase tracking-tight truncate w-full text-left">
                            {nomeExibicaoHardware}
                        </span>
                    </div>

                    <div className="pl-2 border-l border-zinc-800 group-hover:border-zinc-700">
                        <ChevronDown size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                </button>

                <div className="h-8 w-px bg-zinc-800/60" />

                <div className="flex bg-zinc-900/50 border border-zinc-800/50 p-1 rounded-xl backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={onOpenWaste}
                        title="Registrar Falha / Desperdício"
                        className="p-2 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                    >
                        <Trash2 size={16} />
                    </button>
                    <div className="w-px h-4 bg-zinc-800 my-auto mx-1" />
                    <button
                        type="button"
                        onClick={onOpenSettings}
                        title="Configurações da Oficina"
                        className={`p-2 rounded-lg transition-all ${needsConfig ? 'text-amber-500 bg-amber-500/10 animate-pulse' : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800'}`}
                    >
                        <Settings2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={onOpenHistory}
                        title="Histórico de Orçamentos"
                        className="p-2 rounded-lg text-zinc-500 hover:text-sky-400 hover:bg-zinc-800 transition-all"
                    >
                        <History size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}