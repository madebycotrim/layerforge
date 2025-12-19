// src/features/calculadora/components/cards/material.jsx

import React, { useEffect, useMemo, useState } from "react";
import { Coins, Weight, Layers, Check, AlertTriangle } from "lucide-react";
import { getFilaments } from "../../../filamentos/logic/filaments";
import SearchSelect from "../../../../components/SearchSelect";

/* ---------- LABEL ---------- */
const Label = ({ children }) => (
    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">
        {children}
    </label>
);

/* ---------- INPUT FIXO (ESTÁVEL) ---------- */
const FixedInput = ({
    icon: Icon,
    value,
    onChange,
    suffix,
    placeholder,
    maxDigits = 4,
}) => (
    <div className="relative w-full">
        <Icon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
        />

        <input
            type="number"
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
                const v = String(e.target.value).slice(0, maxDigits);
                onChange(v);
            }}
            className="
        no-spinner w-full h-11 pl-10 pr-8
        bg-zinc-950 border border-zinc-800 rounded-xl
        text-xs font-mono font-bold text-zinc-300
        outline-none transition-all
        hover:border-zinc-700
        focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20
      "
        />

        {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-600 pointer-events-none">
                {suffix}
            </span>
        )}
    </div>
);

export default function Material({
    custoRolo,
    setCustoRolo,
    pesoModelo,
    setPesoModelo,
    qtdPecas,
    setQtdPecas,
    selectedFilamentId,
    setSelectedFilamentId,
}) {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        setInventory(getFilaments());
    }, []);

    /* ---------- AGRUPAR ESTOQUE ---------- */
    const groupedInventory = useMemo(() => {
        const groups = {};
        inventory.forEach((item) => {
            if (!groups[item.type]) groups[item.type] = [];
            groups[item.type].push(item);
        });
        return groups;
    }, [inventory]);

    /* ---------- OPTIONS DO SELECT ---------- */
    const selectOptions = useMemo(() => {
        return [
            {
                group: "Manual",
                items: [{ value: "manual", label: "Entrada Manual" }],
            },
            ...Object.keys(groupedInventory).map((type) => ({
                group: type,
                items: groupedInventory[type].map((item) => ({
                    value: item.id,
                    label: `${item.name} (${item.brand})`,
                    raw: item,
                })),
            })),
        ];
    }, [groupedInventory]);

    /* ---------- SELEÇÃO ---------- */
    const handleSelect = (id) => {
        setSelectedFilamentId(id);
        if (id === "manual") return;

        const item = inventory.find((f) => f.id === id);
        if (item) {
            const priceKg = (item.price / item.weightTotal) * 1000;
            setCustoRolo(priceKg.toFixed(2));
        }
    };

    /* ---------- STATUS DE ESTOQUE ---------- */
    const pesoTotal = (Number(pesoModelo) || 0) * (Number(qtdPecas) || 1);
    const selectedItem = inventory.find((f) => f.id === selectedFilamentId);

    const stock = useMemo(() => {
        if (!selectedItem || pesoTotal <= 0) return null;
        const remaining = selectedItem.weightCurrent - pesoTotal;
        return {
            ok: remaining >= 0,
            remaining,
            pct: Math.min((pesoTotal / selectedItem.weightCurrent) * 100, 100),
            missing: Math.abs(remaining),
        };
    }, [selectedItem, pesoTotal]);

    return (
        <div className="flex flex-col gap-4">
            {/* SELECT */}
            <div>
                <Label>Filamento</Label>
                <SearchSelect
                    value={selectedFilamentId || "manual"}
                    onChange={handleSelect}
                    searchable
                    options={selectOptions}
                    renderValue={(item) => item.label}
                    renderOption={(item) => item.label}
                />
            </div>

            {/* INPUTS — TODOS FIXOS E IGUAIS */}
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <Label>Preço / Kg</Label>
                    <FixedInput
                        icon={Coins}
                        value={custoRolo}
                        onChange={(v) => {
                            setCustoRolo(v);
                            setSelectedFilamentId("manual");
                        }}
                        suffix="R$"
                        placeholder="0"
                        maxDigits={4} // até 1000
                    />
                </div>

                <div>
                    <Label>Peso</Label>
                    <FixedInput
                        icon={Weight}
                        value={pesoModelo}
                        onChange={setPesoModelo}
                        suffix="g"
                        placeholder="0"
                        maxDigits={4} // até 9999g
                    />
                </div>

                <div>
                    <Label className="opacity-60">Quantidade</Label>
                    <FixedInput
                        icon={Layers}
                        value={qtdPecas}
                        onChange={setQtdPecas}
                        placeholder="1"
                        maxDigits={3}
                    />
                </div>
            </div>

            {/* STATUS */}
            {stock && (
                <div
                    className={`rounded-lg border px-3 py-2 flex flex-col gap-1.5 ${stock.ok ? "bg-emerald-500/5 border-emerald-500/10" : "bg-rose-500/5 border-rose-500/20"}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {stock.ok ? (
                                <Check size={12} className="text-emerald-500" />
                            ) : (
                                <AlertTriangle size={12} className="text-rose-500" />
                            )}
                            <span
                                className={`text-[10px] font-bold uppercase ${stock.ok ? "text-emerald-500" : "text-rose-500"
                                    }`}
                            >
                                {stock.ok ? "Suficiente" : `Faltam ${stock.missing}g`}
                            </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">
                            Restam:{" "}
                            <strong className="text-zinc-300">
                                {stock.remaining}g
                            </strong>
                        </span>
                    </div>

                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${stock.ok ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                            style={{ width: `${stock.pct}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
