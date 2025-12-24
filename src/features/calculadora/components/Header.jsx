import React from "react";
import {
  Printer, History, Zap,
  Settings2, ChevronDown
} from "lucide-react";

export default function Header({
  nomeProjeto,       
  setNomeProjeto,
  qtdPecas,
  setQtdPecas,
  printers = [],
  selectedPrinterId,
  onCyclePrinter,
  onBack,
  onOpenHistory,
  onOpenSettings,
  needsConfig = false
}) {
  const currentPrinter = printers.find(p => p.id === selectedPrinterId);
  const printerName = currentPrinter?.name || (printers.length > 0 ? "Impressora sem nome" : "Selecionar...");
  const printerPower = Number(currentPrinter?.power || currentPrinter?.potencia || 0);

  return (
    <header className="h-20 px-8 flex items-center justify-between z-40 relative border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl shrink-0">

      <span className="flex flex-col flex-1 max-w-xl">
        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1 leading-none">Cálculo de Impressão</h1>
        <input 
            value={nomeProjeto}
            onChange={(e) => setNomeProjeto(e.target.value)}
            placeholder="Qual o nome do projeto ou da peça?"
            className="bg-transparent border-none outline-none text-2xl font-black text-white uppercase tracking-tighter focus:text-sky-400 transition-colors w-full placeholder:text-zinc-800"
        />
      </span>

      <div className="flex items-center gap-6">

        <div className="flex bg-zinc-900/30 border border-zinc-800/60 p-1.5 rounded-2xl backdrop-blur-md">
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-xl transition-all ${needsConfig ? 'text-amber-500 bg-amber-500/10' : 'text-zinc-600 hover:text-zinc-400'}`}
            title="Configurar custos da oficina (Luz, Valor da Hora, etc)"
          >
            <Settings2 size={16} />
          </button>
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-xl text-zinc-600 hover:text-sky-400 transition-all"
            title="Ver histórico de projetos salvos"
          >
            <History size={16} />
          </button>
        </div>

        <div
          onClick={onCyclePrinter}
          className="relative group cursor-pointer flex items-center gap-4 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl py-2 pl-4 pr-5 transition-all hover:border-sky-500/30 hover:bg-zinc-900/40 min-w-[280px]"
        >
          <Printer className="text-zinc-600 group-hover:text-sky-500 transition-colors" size={14} />

          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-0.5 leading-none">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Impressora em uso</span>
              {currentPrinter && (
                <span className="text-[8px] font-mono font-bold text-sky-400 bg-sky-500/10 px-1.5 rounded border border-sky-500/20">
                  {printerPower}W
                </span>
              )}
            </div>
            <div className="flex items-center justify-between leading-none">
              <span className="text-[11px] font-bold uppercase tracking-tight text-zinc-300 font-mono">
                {printers.length === 0 ? "Carregando máquinas..." : printerName}
              </span>
              <ChevronDown size={12} className="text-zinc-700" />
            </div>
          </div>
        </div>

        <button
          className="h-11 px-8 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all active:scale-95"
        >
          <Zap size={18} strokeWidth={3} /> Gerar Orçamento
        </button>
      </div>
    </header>
  );
}