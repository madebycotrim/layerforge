import React, { useState } from "react";
import { ChevronLeft, Printer, History, Zap, Cpu, AlertTriangle, ArrowRight, Settings2, Box } from "lucide-react";

export default function Header({
  title,
  printers = [],
  selectedPrinterId,
  onCyclePrinter,
  onBack,
  onOpenHistory,
  onOpenSettings,
  needsConfig = false // <--- AGORA RECEBE VIA PROP
}) {
  const [printerError, setPrinterError] = useState(false);

  // --- LÓGICA DE DADOS DA IMPRESSORA ---
  const currentPrinter = printers.find(p => p.id === selectedPrinterId);

  // Normalização segura
  const printerName = currentPrinter ? (currentPrinter.name || currentPrinter.nome || "Sem Nome") : "Selecione";
  const printerPower = currentPrinter ? (Number(currentPrinter.power) || Number(currentPrinter.potencia) || 0) : 0;

  // --- ESTADO DA LISTA ---
  const hasPrinters = printers.length > 0;
  const hasMultiplePrinters = printers.length > 1;
  const printerState = !hasPrinters ? "none" : hasMultiplePrinters ? "multiple" : "single";

  const handlePrinterClick = () => {
    if (printerState !== "multiple") {
      setPrinterError(true);
      setTimeout(() => setPrinterError(false), 500);
      return;
    }
    onCyclePrinter();
  };

  return (
    <header className="flex items-center justify-between py-3 relative z-50">
      {/* Background Grid Sutil */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none -mx-8 mask-gradient" />

      {/* === ESQUERDA: VOLTAR + TÍTULO === */}
      <div className="flex items-center gap-4 relative z-10">
        <button
          onClick={onBack}
          title="Voltar"
          className="group flex items-center justify-center w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:bg-zinc-800 hover:border-zinc-700 hover:text-zinc-200 transition-all active:scale-95 shadow-sm"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="h-8 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />

        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 tracking-tight">
            {title}
          </h1>

          <span className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] font-bold text-sky-400 uppercase tracking-wide backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500" />
            </span>
            v1.0
          </span>
        </div>
      </div>

      {/* === DIREITA: BOTÕES === */}
      <div className="flex items-center gap-3 relative z-10">

        {/* 1. ALERTA CONFIG (Controlado pelo Pai agora) */}
        {needsConfig && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-3 px-3 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-xl hover:bg-amber-500/10 transition-all group mr-2 shadow-[0_0_15px_-5px_rgba(245,158,11,0.1)]"
          >
            <div className="relative">
              <Settings2 size={16} className="text-amber-500" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full animate-ping opacity-75" />
            </div>
            <div className="text-left flex flex-col leading-tight">
              <span className="text-[8px] font-bold text-amber-500/90 uppercase tracking-wide">
                Ajustes Pendentes
              </span>
              <span className="text-[10px] font-bold text-amber-200">
                Configurar Custos
              </span>
            </div>
            <ArrowRight size={14} className="text-amber-500/50 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {/* 2. SELETOR DE IMPRESSORA */}
        <button
          onClick={handlePrinterClick}
          title={printerState === "none" ? "Nenhuma impressora" : printerState === "single" ? "Impressora única" : "Trocar impressora"}
          className={`
                        group flex items-center gap-2 pl-2 pr-4 py-1.5 backdrop-blur-sm border rounded-xl transition-all relative overflow-hidden duration-300
                        ${printerError
              ? "bg-red-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)] shake-animation"
              : printerState === "multiple"
                ? "bg-zinc-900/80 border-zinc-800 hover:border-sky-500/30 hover:bg-zinc-900 active:scale-[0.98] cursor-pointer"
                : "bg-zinc-900/60 border-zinc-800 opacity-70 cursor-default"
            }
                    `}
        >
          <div className={`
                        w-9 h-9 rounded-lg border flex items-center justify-center shadow-inner transition-colors
                        ${printerError || printerState === "none"
              ? "bg-red-500/20 border-red-500/30 text-red-400"
              : "bg-zinc-950 border-zinc-800 text-zinc-500 group-hover:text-sky-400 group-hover:border-sky-500/20"
            }
                    `}>
            {printerState === "none" ? <AlertTriangle size={16} /> : <Printer size={16} />}
          </div>

          <div className="text-left flex flex-col z-10 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">
                {printerState === "multiple" ? "Impressora Ativa" : "Impressora"}
              </span>
              {printerState !== "none" && currentPrinter && (
                <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 rounded-[4px] border border-amber-500/20">
                  <Zap size={8} className="fill-amber-400" />
                  {printerPower}W
                </span>
              )}
            </div>

            <span className={`text-xs font-bold flex items-center gap-1 truncate max-w-[140px] ${printerState === "none" ? "text-red-300" : "text-zinc-200"}`}>
              {printerState === "none" ? "Nenhuma impressora" : printerName}
              {printerState === "multiple" && (
                <Box size={10} className="text-zinc-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </span>
          </div>
        </button>

        {/* 3. HISTÓRICO */}
        <button onClick={onOpenHistory} title="Histórico" className="w-11 h-11 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-sky-400 hover:border-sky-500/30 hover:bg-zinc-800 transition-all active:scale-95 shadow-sm">
          <History size={20} />
        </button>
      </div>

      <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-4px); }
                    40% { transform: translateX(4px); }
                    60% { transform: translateX(-2px); }
                    80% { transform: translateX(2px); }
                }
                .shake-animation {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                    border-color: rgba(239, 68, 68, 0.5);
                }
            `}</style>
    </header>
  );
}