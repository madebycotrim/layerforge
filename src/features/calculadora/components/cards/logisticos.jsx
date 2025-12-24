import React from "react";
import { Box, Truck, Wrench, Info } from "lucide-react";

/* ---------- LABEL PADRONIZADO ---------- */
const Label = ({ children }) => (
  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block ml-1">
    {children}
  </label>
);

/* ---------- INPUT MONETÁRIO REFINADO ---------- */
const MoneyInput = ({ valor, aoAlterar, placeholder, icone: Icone }) => (
  <div className="relative group">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors">
      {Icone && <Icone size={14} strokeWidth={2.5} />}
    </span>

    <input
      type="number"
      value={valor}
      onChange={(e) => aoAlterar(e.target.value)}
      placeholder={placeholder}
      className="
        no-spinner w-full h-11 rounded-xl pl-10 pr-10
        bg-zinc-950 border border-zinc-800/60
        text-zinc-200 placeholder:text-zinc-800
        text-xs font-mono font-bold
        outline-none transition-all
        hover:border-zinc-700
        focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/10
      "
    />

    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-700 uppercase tracking-tighter">
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
    <div className="space-y-5 animate-in fade-in duration-500">
      
      {/* GRID DE LOGÍSTICA DIRETA */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Caixa e Embalagem</Label>
          <MoneyInput
            valor={custoEmbalagem}
            aoAlterar={setCustoEmbalagem}
            placeholder="0.00"
            icone={Box}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Frete e Envio</Label>
          <MoneyInput
            valor={custoFrete}
            aoAlterar={setCustoFrete}
            placeholder="0.00"
            icone={Truck}
          />
        </div>
      </div>

      {/* OUTROS CUSTOS / PÓS-PROCESSAMENTO */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between pr-1">
            <Label>Insumos e Peças Extras</Label>
            <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-1">
                <Info size={10} /> Parafusos / Tintas / Ímãs
            </div>
        </div>
        <MoneyInput
          valor={custosExtras}
          aoAlterar={setCustosExtras}
          placeholder="0.00"
          icone={Wrench}
        />
      </div>

      {/* FEEDBACK DE STATUS */}
      {(Number(custoEmbalagem) > 0 || Number(custoFrete) > 0) && (
          <div className="mt-2 p-2 bg-sky-500/5 border border-sky-500/10 rounded-lg flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
              <span className="text-[8px] font-black text-sky-500/80 uppercase tracking-widest">
                  Envio configurado: Os custos de entrega já estão somados ao valor final.
              </span>
          </div>
      )}
    </div>
  );
}