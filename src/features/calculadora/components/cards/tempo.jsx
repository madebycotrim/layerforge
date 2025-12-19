import React from "react";
import { Clock, Hammer } from "lucide-react";

/* ---------- LABEL ---------- */
const Label = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 ml-1 mb-1.5">
    {Icon && <Icon size={12} className="text-zinc-500" />}
    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
      {children}
    </label>
  </div>
);

/* ---------- TIME GROUP ---------- */
const TimeGroup = ({
  label,
  icon,
  hours,
  setHours,
  minutes,
  setMinutes
}) => (
  <div>
    <Label icon={icon}>{label}</Label>

    <div
      className="
        flex items-center h-11 rounded-xl overflow-hidden
        bg-zinc-950 border border-zinc-800
        transition-all
        hover:border-zinc-700
        focus-within:border-sky-500
        focus-within:hover:border-sky-500
        focus-within:ring-1 focus-within:ring-sky-500/20
      "
    >
      {/* HORAS */}
      <div className="relative flex-1 h-full">
        <input
          type="number"
          min={0}
          placeholder="0"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="
            no-spinner w-full h-full bg-transparent
            text-center text-zinc-300 placeholder:text-zinc-700
            text-sm font-mono font-bold
            outline-none
          "
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-600 pointer-events-none">
          h
        </span>
      </div>

      {/* DIVISOR */}
      <div className="w-px h-1/2 bg-zinc-800" />

      {/* MINUTOS */}
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
            text-center text-zinc-300 placeholder:text-zinc-700
            text-sm font-mono font-bold
            outline-none
          "
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-600 pointer-events-none">
          m
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
    <div className="grid grid-cols-2 gap-4">
      <TimeGroup
        label="Impressão 3D"
        icon={Clock}
        hours={tempoImpressaoHoras}
        setHours={setTempoImpressaoHoras}
        minutes={tempoImpressaoMinutos}
        setMinutes={setTempoImpressaoMinutos}
      />

      <TimeGroup
        label="Pós-Processamento"
        icon={Hammer}
        hours={tempoTrabalhoHoras}
        setHours={setTempoTrabalhoHoras}
        minutes={tempoTrabalhoMinutos}
        setMinutes={setTempoTrabalhoMinutos}
      />
    </div>
  );
}
