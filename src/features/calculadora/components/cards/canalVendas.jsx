// src/features/calculadora/components/cards/canalVendas.jsx

import React, { useMemo } from "react";
import { Percent, DollarSign, Info, Landmark } from "lucide-react";
import SearchSelect from "../../../../components/SearchSelect";

/* ---------- LABEL PADRONIZADO ---------- */
const Label = ({ children }) => (
  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block ml-1">
    {children}
  </label>
);

export default function CanalDeVenda({
  canalVenda,
  setCanalVenda,
  taxaMarketplace,
  setTaxaMarketplace,
  taxaMarketplaceFixa,
  setTaxaMarketplaceFixa,
}) {
  
  const presets = {
    loja: { label: "Venda Direta (Sem Taxas)", taxa: 0, fixo: 0 },
    shopee_padrao: { label: "Shopee Padrão (14% + R$4)", taxa: 14, fixo: 4 },
    shopee_frete: { label: "Shopee c/ Frete Grátis (20% + R$4)", taxa: 20, fixo: 4 },
    ml_classico: { label: "Mercado Livre Clássico (~13% + R$6)", taxa: 13, fixo: 6 },
    ml_premium: { label: "Mercado Livre Premium (~18% + R$6)", taxa: 18, fixo: 6 },
    custom: { label: "Taxa Manual / Outros", taxa: 0, fixo: 0 },
  };

  const options = useMemo(() => [
    {
      group: "Shopee",
      items: [
        { value: "shopee_padrao", label: presets.shopee_padrao.label },
        { value: "shopee_frete", label: presets.shopee_frete.label },
      ],
    },
    {
      group: "Mercado Livre",
      items: [
        { value: "ml_classico", label: presets.ml_classico.label },
        { value: "ml_premium", label: presets.ml_premium.label },
      ],
    },
    {
      group: "Direto",
      items: [
        { value: "loja", label: presets.loja.label },
        { value: "custom", label: presets.custom.label },
      ],
    },
  ], []);

  const handleChange = (value) => {
    setCanalVenda(value);
    if (presets[value]) {
      setTaxaMarketplace(presets[value].taxa);
      setTaxaMarketplaceFixa(presets[value].fixo);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      
      {/* SELETOR DE CANAL */}
      <div>
        <Label>Onde você vai vender?</Label>
        <SearchSelect
          value={canalVenda}
          onChange={handleChange}
          options={options}
          renderValue={(item) => item.label}
          renderOption={(item) => item.label}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        
        {/* COMISSÃO % */}
        <div className="space-y-1.5">
          <Label>Comissão do Site</Label>
          <div className="relative group">
            <Percent
              size={12}
              strokeWidth={2.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors"
            />
            <input
              type="number"
              value={taxaMarketplace}
              onChange={(e) => setTaxaMarketplace(e.target.value)}
              placeholder="0"
              className="no-spinner w-full h-11 rounded-xl pl-10 pr-3 bg-zinc-950 border border-zinc-800/60 text-zinc-300 text-xs font-mono font-bold outline-none transition-all hover:border-zinc-700 focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/10"
            />
          </div>
        </div>

        {/* TAXA FIXA R$ */}
        <div className="space-y-1.5">
          <Label>Taxa Fixa (por venda)</Label>
          <div className="relative group">
            <Landmark
              size={12}
              strokeWidth={2.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors"
            />
            <input
              type="number"
              value={taxaMarketplaceFixa}
              onChange={(e) => setTaxaMarketplaceFixa(e.target.value)}
              placeholder="0.00"
              className="no-spinner w-full h-11 rounded-xl pl-10 pr-10 bg-zinc-950 border border-zinc-800/60 text-zinc-300 text-xs font-mono font-bold outline-none transition-all hover:border-zinc-700 focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/10"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-700 uppercase">
              R$
            </span>
          </div>
        </div>

      </div>

      {/* FEEDBACK DE TAXA ATIVA */}
      {Number(taxaMarketplaceFixa) > 0 && (
          <div className="px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              <span className="text-[8px] font-black text-amber-500/80 uppercase tracking-widest leading-none">
                  Dica: a taxa fixa de R$ {taxaMarketplaceFixa} será descontada do lucro de cada peça vendida.
              </span>
          </div>
      )}
    </div>
  );
}