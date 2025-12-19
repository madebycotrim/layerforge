// src/features/calculadora/components/cards/canalVendas.jsx

import React, { useMemo } from "react";
import { Percent, DollarSign } from "lucide-react";
import SearchSelect from "../../../../components/SearchSelect";

/* ---------- LABEL ---------- */
const Label = ({ children }) => (
  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">
    {children}
  </label>
);

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function CanalDeVenda({
  canalVenda,
  setCanalVenda,
  taxaMarketplace,
  setTaxaMarketplace,
  custoFixo,
  setCustoFixo,
}) {
  const presets = {
    loja: { label: "Venda Direta / Site Próprio", taxa: 0, fixo: 0 },
    shopee_padrao: { label: "Shopee Padrão (14% + R$4)", taxa: 14, fixo: 4 },
    shopee_frete: { label: "Shopee c/ Frete Grátis (20% + R$4)", taxa: 20, fixo: 4 },
    ml_classico: { label: "Mercado Livre Clássico (~13%)", taxa: 13, fixo: 6.25 },
    ml_premium: { label: "Mercado Livre Premium (~18%)", taxa: 18, fixo: 6.25 },
    custom: { label: "Outro / Personalizado", taxa: 0, fixo: 0 },
  };

  /* ---------- OPTIONS PARA O SELECT PADRÃO ---------- */
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
      group: "Outros",
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
      setCustoFixo(presets[value].fixo);
    }
  };

  return (
    <div className="space-y-4">
      {/* SELECT PADRÃO */}
      <div>
        <Label>Canal de Venda</Label>
        < SearchSelect
          value={canalVenda}
          onChange={handleChange}
          options={options}
          renderValue={(item) => item.label}
          renderOption={(item) => item.label}
        />
      </div>

      {/* INPUTS */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Comissão (%)</Label>
          <div className="relative">
            <Percent
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="number"
              value={taxaMarketplace}
              onChange={(e) => setTaxaMarketplace(Number(e.target.value))}
              className="
                no-spinner w-full h-11 rounded-xl pl-10 pr-3
                bg-zinc-950 border border-zinc-800
                text-zinc-300 text-xs font-mono font-bold
                outline-none transition-all
                hover:border-zinc-700
                focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20
              "
            />
          </div>
        </div>

        <div>
          <Label>Taxa Fixa (R$)</Label>
          <div className="relative">
            <DollarSign
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="number"
              value={custoFixo}
              onChange={(e) => setCustoFixo(Number(e.target.value))}
              className="
                no-spinner w-full h-11 rounded-xl pl-10 pr-3
                bg-zinc-950 border border-zinc-800
                text-zinc-300 text-xs font-mono font-bold
                outline-none transition-all
                hover:border-zinc-700
                focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
