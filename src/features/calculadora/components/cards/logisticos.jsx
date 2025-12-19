import React from "react";
import { PackageOpen, Truck, Wrench } from "lucide-react";

/* ---------- LABEL ---------- */
const Label = ({ children }) => (
  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">
    {children}
  </label>
);

/* ---------- INPUT MONETÁRIO ---------- */
const MoneyInput = ({ valor, aoAlterar, placeholder, icone: Icone }) => (
  <div className="relative">
    {/* ÍCONE FIXO */}
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
      {Icone && <Icone size={14} />}
    </span>

    <input
      type="number"
      value={valor}
      onChange={(e) => aoAlterar(e.target.value)}
      placeholder={placeholder}
      className="
        no-spinner w-full h-11 rounded-xl pl-10 pr-10
        bg-zinc-950 border border-zinc-800
        text-zinc-300 placeholder:text-zinc-700
        text-xs font-mono font-bold
        outline-none
        hover:border-zinc-700
        focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20
        transition-all
      "
    />

    {/* SUFIXO R$ */}
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-600">
      R$
    </span>
  </div>
);

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function CustosLogisticos({
  custoEmbalagem,
  setCustoEmbalagem,
  custoFrete,
  setCustoFrete,
  custosExtras,
  setCustosExtras
}) {
  return (
    /* 🔒 ISOLAMENTO DE STACKING CONTEXT (NÃO MUDA LAYOUT) */
    <div className="isolate">
      <div className="space-y-4">
        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Embalagem</Label>
            <MoneyInput
              valor={custoEmbalagem}
              aoAlterar={setCustoEmbalagem}
              placeholder="0.00"
              icone={PackageOpen}
            />
          </div>

          <div>
            <Label>Frete</Label>
            <MoneyInput
              valor={custoFrete}
              aoAlterar={setCustoFrete}
              placeholder="0.00"
              icone={Truck}
            />
          </div>
        </div>

        {/* OUTROS CUSTOS */}
        <div>
          <Label>Outros Custos (Ímãs, Tinta, Cola)</Label>
          <MoneyInput
            valor={custosExtras}
            aoAlterar={setCustosExtras}
            placeholder="0.00"
            icone={Wrench}
          />
        </div>
      </div>
    </div>
  );
}
