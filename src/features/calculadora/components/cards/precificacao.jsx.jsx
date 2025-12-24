import React from "react";
import {
  DollarSign,
  Landmark,
  ShieldAlert,
  Tag,
  Info
} from "lucide-react";

/* ---------- LABEL PADRONIZADO ---------- */
const Label = ({ children }) => (
  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block ml-1">
    {children}
  </label>
);

/* ---------- PERCENT INPUT INDUSTRIAL ---------- */
const PercentInput = ({
  label,
  valor,
  aoAlterar,
  variant = "default", // 'default' | 'primary' | 'warning'
  Icon
}) => {
  // Configuração de cores baseada na variante
  const variants = {
    primary: {
      border: "border-sky-500/30 focus-within:border-sky-500/50",
      icon: "text-sky-500",
      bg: "bg-sky-500/5",
      glow: "shadow-[0_0_15px_-5px_rgba(14,165,233,0.1)]"
    },
    warning: {
      border: "border-amber-500/20 focus-within:border-amber-500/50",
      icon: "text-amber-600 group-focus-within:text-amber-500",
      bg: "bg-amber-500/5",
      glow: "shadow-[0_0_15px_-5px_rgba(245,158,11,0.1)]"
    },
    default: {
      border: "border-zinc-800/60 focus-within:border-zinc-700",
      icon: "text-zinc-600 group-focus-within:text-zinc-400",
      bg: "bg-zinc-950",
      glow: ""
    }
  };

  const style = variants[variant];

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>

      <div className={`
        group relative rounded-xl border transition-all duration-300
        ${style.border} ${style.bg} ${style.glow}
      `}>
        {/* ÍCONE COM STROKE PESADO */}
        <span className={`
          absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300
          ${style.icon}
        `}>
          <Icon size={14} strokeWidth={2.5} />
        </span>

        <input
          type="number"
          placeholder="0"
          value={valor}
          onChange={(e) => aoAlterar(e.target.value)}
          className="
            no-spinner w-full h-11 pl-10 pr-8
            bg-transparent
            text-zinc-200 text-xs font-mono font-bold
            outline-none transition-all placeholder:text-zinc-800
          "
        />

        {/* SUFIXO % */}
        <span className={`
          absolute right-3.5 top-1/2 -translate-y-1/2
          text-[10px] font-black uppercase tracking-tighter
          ${variant === 'default' ? 'text-zinc-700' : 'text-zinc-500'}
        `}>
          %
        </span>
      </div>
    </div>
  );
};

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
    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
      
      <PercentInput
        label="Lucro Desejado"
        valor={margemLucro}
        aoAlterar={setMargemLucro}
        variant="primary"
        Icon={DollarSign}
      />

      <PercentInput
        label="Impostos"
        valor={imposto}
        aoAlterar={setImposto}
        Icon={Landmark}
      />

      <PercentInput
        label="Reserva para Falhas"
        valor={taxaFalha}
        aoAlterar={setTaxaFalha}
        variant="warning"
        Icon={ShieldAlert}
      />

      <PercentInput
        label="Margem de Desconto"
        valor={desconto}
        aoAlterar={setDesconto}
        Icon={Tag}
      />
    </div>
  );
}