import React from "react";
import { Clock, Hammer, Timer, Wrench } from "lucide-react";

/* ---------- LABEL PADRONIZADO ---------- */
const Label = ({ children }) => (
  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block ml-1">
    {children}
  </label>
);

/* ---------- TIME GROUP (ESTILO MÓDULO DE HARDWARE) ---------- */
const TimeGroup = ({
  label,
  icon: Icon,
  hours,
  setHours,
  minutes,
  setMinutes
}) => (
  <div className="space-y-1.5 group/time">
    <Label>{label}</Label>

    <div
      className="
        flex items-center h-11 rounded-xl 
        bg-zinc-950 border border-zinc-800/60
        transition-all duration-300
        hover:border-zinc-700
        focus-within:border-sky-500/40 
        focus-within:ring-1 focus-within:ring-sky-500/10
        relative overflow-hidden
      "
    >
      {/* ÍCONE DE MÓDULO */}
      <div className="pl-3.5 pr-1 flex items-center justify-center text-zinc-600 group-focus-within/time:text-sky-500 transition-colors">
        <Icon size={14} strokeWidth={2.5} />
      </div>

      {/* INPUT HORAS */}
      <div className="relative flex-1 h-full">
        <input
          type="number"
          min={0}
          placeholder="0"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="
            no-spinner w-full h-full bg-transparent
            text-center text-zinc-200 placeholder:text-zinc-800
            text-xs font-mono font-bold
            outline-none pl-2 pr-6
          "
        />
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[7px] font-black text-zinc-700 uppercase tracking-tighter pointer-events-none">
          H
        </span>
      </div>

      {/* DIVISOR TÉCNICO */}
      <div className="w-px h-4 bg-zinc-800 group-focus-within/time:bg-sky-500/20 transition-colors" />

      {/* INPUT MINUTOS */}
      <div className="relative flex-1 h-full">
        <input
          type="number"
          min={0}
          max={59}
          placeholder="0"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          className="
            no-spinner w-full h-full bg-transparent
            text-center text-zinc-200 placeholder:text-zinc-800
            text-xs font-mono font-bold
            outline-none pl-2 pr-6
          "
        />
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[7px] font-black text-zinc-700 uppercase tracking-tighter pointer-events-none">
          MIN
        </span>
      </div>
    </div>
  </div>
);

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function Tempo({
  tempoImpressaoHoras,
  setTempoImpressaoHoras,
  tempoImpressaoMinutos,
  setTempoImpressaoMinutos,
  tempoTrabalhoHoras,
  setTempoTrabalhoHoras,
  tempoTrabalhoMinutos,
  setTempoTrabalhoMinutos
}) {
  return (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
      <TimeGroup
        label="Duração da Impressão" // O que o fatiador estimou
        icon={Clock}
        hours={tempoImpressaoHoras}
        setHours={setTempoImpressaoHoras}
        minutes={tempoImpressaoMinutos}
        setMinutes={setTempoImpressaoMinutos}
      />

      <TimeGroup
        label="Trabalho Manual" // Remoção de suportes, acabamento e embalagem
        icon={Wrench}
        hours={tempoTrabalhoHoras}
        setHours={setTempoTrabalhoHoras}
        minutes={tempoTrabalhoMinutos}
        setMinutes={setTempoTrabalhoMinutos}
      />

      {/* AVISO DE CARGA HORÁRIA */}
      {(Number(tempoImpressaoHoras) > 12) && (
          <div className="col-span-2 mt-1 px-2 py-1.5 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-center gap-2">
              <Timer size={10} className="text-amber-500" />
              <span className="text-[8px] font-black text-amber-500/80 uppercase tracking-widest leading-none">
                  Atenção: Impressão longa. Garanta que a primeira camada colou bem e se o filamento é suficiente.
              </span>
          </div>
      )}
    </div>
  );
}