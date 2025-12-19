import React from "react";
import {
  DollarSign,
  Landmark,
  AlertTriangle,
  Tag
} from "lucide-react";

/* ---------- LABEL ---------- */
const Label = ({ children }) => (
  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block truncate ml-1">
    {children}
  </label>
);

/* ---------- INPUT % ---------- */
const PercentInput = ({
  label,
  valor,
  aoAlterar,
  highlight = false,
  Icon
}) => (
  <div>
    <Label>{label}</Label>

    {/* CONTAINER */}
    <div
      className={`
        relative
        transition-all
        focus-within:ring-1 focus-within:ring-sky-500/20
      `}
    >
      {/* ÍCONE (SEM HOVER) */}
      <span
        className={`
          absolute left-3 top-1/2 -translate-y-1/2 transition-colors
          ${highlight ? "text-sky-400" : "text-zinc-600"}
          focus-within:text-sky-500
        `}
      >
        <Icon size={14} />
      </span>

      <input
        type="number"
        placeholder="0"
        value={valor}
        onChange={(e) => aoAlterar(e.target.value)}
        className={`
          no-spinner w-full h-11 rounded-xl pl-10 pr-8
          border text-sm font-mono font-bold
          outline-none transition-all placeholder:text-zinc-800
          ${
            highlight
              ? "bg-sky-500/5 border-sky-500/30 text-sky-400 focus:border-sky-400 hover:bg-sky-500/10"
              : "bg-zinc-950 border-zinc-800 text-zinc-300 focus:border-sky-500 hover:border-zinc-700"
          }
        `}
      />

      {/* % */}
      <span
        className={`
          absolute right-3 top-1/2 -translate-y-1/2
          text-[10px] font-bold
          ${highlight ? "text-sky-500" : "text-zinc-600"}
        `}
      >
        %
      </span>
    </div>
  </div>
);

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function Precificacao({
  margemLucro,
  setMargemLucro,
  imposto,
  setImposto,
  taxaFalha,
  setTaxaFalha,
  desconto,
  setDesconto
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PercentInput
        label="Margem de Lucro"
        valor={margemLucro}
        aoAlterar={setMargemLucro}
        highlight
        Icon={DollarSign}
      />

      <PercentInput
        label="Imposto (DAS)"
        valor={imposto}
        aoAlterar={setImposto}
        Icon={Landmark}
      />

      <PercentInput
        label="Risco / Falha"
        valor={taxaFalha}
        aoAlterar={setTaxaFalha}
        Icon={AlertTriangle}
      />

      <PercentInput
        label="Desc. Máximo"
        valor={desconto}
        aoAlterar={setDesconto}
        Icon={Tag}
      />
    </div>
  );
}
