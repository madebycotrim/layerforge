import React, { useEffect, useMemo, useState } from "react";
import {
    Coins, Weight, Check, Plus, Trash2, Boxes, Zap, 
    Settings2, Minus, Info
} from "lucide-react";
import { getFilaments } from "../../../filamentos/logic/filaments";
import SearchSelect from "../../../../components/SearchSelect";

/* ---------- LABEL PADRONIZADO ---------- */
const Label = ({ children, className = "" }) => (
    <label className={`text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block ml-1 ${className}`}>
        {children}
    </label>
);

/* ---------- COMPONENTE: LINHA DE FILAMENTO ---------- */
const FilamentRow = ({ index, slotData, inventory, selectOptions, onUpdate, onRemove, canRemove, zIndex }) => {
    const selectedItem = inventory.find(f => f.id === slotData.id);
    const isOk = !selectedItem || (selectedItem.weightCurrent >= (Number(slotData.weight) || 0));

    return (
        <div 
            style={{ zIndex: zIndex }} 
            className={`
                relative grid grid-cols-[44px_1fr_80px_80px_38px] items-stretch
                bg-zinc-950/50 border border-zinc-800/60 rounded-xl
                group/row transition-all hover:border-zinc-700 h-11 mb-2
                ${!isOk ? 'border-rose-500/30 bg-rose-500/5' : ''}
            `}
        >
            
            {/* 1. SLOT ID */}
            <div className={`flex flex-col items-center justify-center border-r border-zinc-800/60 transition-colors rounded-l-xl
                ${isOk ? 'bg-zinc-900/50 text-zinc-500' : 'bg-rose-500/20 text-rose-400 border-r-rose-500/20'}`}>
                <span className="text-[7px] font-black opacity-40 leading-none mb-0.5 tracking-tighter">SLOT</span>
                <span className="text-xs font-mono font-black leading-none">{index + 1}</span>
            </div>

            {/* 2. SELECT DE FILAMENTO */}
            <div className="min-w-0 flex items-center overflow-visible">
                <SearchSelect
                    value={slotData.id || "manual"}
                    onChange={(id) => onUpdate(index, { id })}
                    options={selectOptions}
                    variant="ghost" 
                />
            </div>

            {/* 3. MASSA (CONSUMO) */}
            <div className="border-l border-zinc-800/60 relative group/input bg-zinc-900/20">
                <input
                    type="number"
                    value={slotData.weight}
                    onChange={(e) => onUpdate(index, { weight: e.target.value })}
                    placeholder="0"
                    className="no-spinner w-full h-full bg-transparent pl-2 pr-6 text-[11px] font-mono font-bold text-zinc-200 outline-none focus:bg-sky-500/5 transition-all text-right placeholder:text-zinc-800"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[7px] font-black text-zinc-600 pointer-events-none uppercase">g</span>
            </div>

            {/* 4. PREÇO POR KG */}
            <div className="border-l border-zinc-800/60 relative group/input bg-zinc-900/20">
                <input
                    type="number"
                    value={slotData.priceKg}
                    onChange={(e) => onUpdate(index, { priceKg: e.target.value })}
                    placeholder="0"
                    className="no-spinner w-full h-full bg-transparent pl-2 pr-7 text-[11px] font-mono font-bold text-zinc-200 outline-none focus:bg-sky-500/5 transition-all text-right placeholder:text-zinc-800"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[7px] font-black text-zinc-600 pointer-events-none uppercase">R$/kg</span>
            </div>

            {/* 5. REMOVER SLOT */}
            <button 
                onClick={canRemove ? () => onRemove(index) : undefined}
                title="Remover este material"
                className={`flex items-center justify-center border-l border-zinc-800/60 transition-all rounded-r-xl
                    ${canRemove ? 'text-zinc-700 hover:text-rose-500 bg-zinc-900/10 hover:bg-rose-500/5' : 'text-zinc-800 bg-zinc-900/5 opacity-30 cursor-not-allowed'}`}
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};

export default function MaterialModule({
    custoRolo, setCustoRolo,
    pesoModelo, setPesoModelo,
    selectedFilamentId, setSelectedFilamentId,
    materialSlots = [],
    setMaterialSlots
}) {
    const [mode, setMode] = useState("single");
    const [inventory, setInventory] = useState([]);

    useEffect(() => { setInventory(getFilaments()); }, []);

    const groupedInventory = useMemo(() => {
        const groups = {};
        inventory.forEach((item) => {
            const type = item.type || "Outros";
            if (!groups[type]) groups[type] = [];
            groups[type].push(item);
        });
        return groups;
    }, [inventory]);

    const selectOptions = useMemo(() => [
        { group: "ENTRADA MANUAL", items: [{ value: "manual", label: "Digitar preço por kg" }] },
        ...Object.keys(groupedInventory).map((type) => ({
            group: `MEU ESTOQUE: ${type.toUpperCase()}`,
            items: groupedInventory[type].map((item) => ({
                value: item.id,
                label: `${item.name}`,
                raw: item,
            })),
        })),
    ], [groupedInventory]);

    const handleUpdateSlot = (index, newData) => {
        const newSlots = [...materialSlots];
        const updatedSlot = { ...newSlots[index], ...newData };
        if (newData.id && newData.id !== "manual") {
            const item = inventory.find(f => f.id === newData.id);
            if (item) updatedSlot.priceKg = ((item.price / item.weightTotal) * 1000).toFixed(2);
        }
        newSlots[index] = updatedSlot;
        setMaterialSlots(newSlots);
    };

    const selectedItem = useMemo(() => inventory.find(f => f.id === selectedFilamentId), [inventory, selectedFilamentId]);
    const stockStatus = useMemo(() => {
        if (!selectedItem || Number(pesoModelo) <= 0) return null;
        const remaining = selectedItem.weightCurrent - Number(pesoModelo);
        return {
            ok: remaining >= 0,
            remaining,
            pct: Math.min((Number(pesoModelo) / selectedItem.weightCurrent) * 100, 100),
            missing: Math.abs(remaining)
        };
    }, [selectedItem, pesoModelo]);

    const totalWeight = useMemo(() => {
        if (mode === "single") return Number(pesoModelo) || 0;
        return materialSlots.reduce((acc, s) => acc + (Number(s.weight) || 0), 0);
    }, [materialSlots, pesoModelo, mode]);

    return (
        <div className="flex flex-col gap-5 animate-in fade-in duration-500 overflow-visible">
            {/* TOGGLE MODO DE IMPRESSÃO */}
            <div className="flex bg-zinc-900/40 border border-zinc-800/60 p-1 rounded-xl shrink-0">
                <button
                    onClick={() => setMode("single")}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
                    ${mode === "single" ? "bg-zinc-800 text-sky-400 border border-white/5 shadow-lg" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                    Filamento Único
                </button>
                <button
                    onClick={() => setMode("multi")}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
                    ${mode === "multi" ? "bg-zinc-800 text-sky-400 border border-white/5 shadow-lg" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                    Multimaterial (AMS)
                </button>
            </div>

            {mode === "single" ? (
                <div className="space-y-4 animate-in slide-in-from-left-2 duration-300">
                    <Label>Qual filamento vai usar?</Label>
                    <SearchSelect
                        value={selectedFilamentId || "manual"}
                        onChange={(id) => {
                            setSelectedFilamentId(id);
                            if (id !== 'manual') {
                                const item = inventory.find(f => f.id === id);
                                if (item) setCustoRolo(((item.price / item.weightTotal) * 1000).toFixed(2));
                            }
                        }}
                        options={selectOptions}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative group/input bg-zinc-950 border border-zinc-800 rounded-xl h-11 overflow-hidden">
                            <input type="number" value={pesoModelo} onChange={(e) => setPesoModelo(e.target.value)} placeholder="Peso total (g)" className="no-spinner w-full h-full bg-transparent pl-3 pr-8 text-xs font-mono font-bold text-zinc-200 outline-none focus:bg-sky-500/5 transition-all" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-zinc-700 uppercase">g</span>
                        </div>
                        <div className="relative group/input bg-zinc-950 border border-zinc-800 rounded-xl h-11 overflow-hidden">
                            <input type="number" value={custoRolo} onChange={(e) => setCustoRolo(e.target.value)} placeholder="Preço do kg" className="no-spinner w-full h-full bg-transparent pl-3 pr-8 text-xs font-mono font-bold text-zinc-200 outline-none focus:bg-sky-500/5 transition-all" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-zinc-700 uppercase">R$/kg</span>
                        </div>
                    </div>

                    {stockStatus && (
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${stockStatus.ok ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse'}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${stockStatus.ok ? "text-emerald-500/80" : "text-rose-500/80"}`}>
                                    Disponibilidade: {stockStatus.ok ? "Tem material suficiente" : "Rolo no fim! Falta material"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3 animate-in slide-in-from-right-2 duration-300 overflow-visible">
                    <div className="flex items-center justify-between px-1 mb-1">
                        <div className="flex items-baseline gap-2">
                            <Label className="mb-0">Divisão de Materiais</Label>
                            <span className="text-[9px] font-mono text-sky-500 font-bold opacity-50">{totalWeight}g NO TOTAL</span>
                        </div>
                        <button onClick={() => setMaterialSlots([...materialSlots, { id: 'manual', weight: '', priceKg: '' }])} title="Adicionar novo slot" className="text-sky-500 hover:text-white transition-colors">
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="flex flex-col max-h-[300px] overflow-visible pr-1 custom-scrollbar">
                        {materialSlots.map((slot, idx) => (
                            <FilamentRow
                                key={idx} 
                                index={idx} 
                                slotData={slot} 
                                inventory={inventory} 
                                selectOptions={selectOptions}
                                onUpdate={handleUpdateSlot} 
                                onRemove={(i) => setMaterialSlots(materialSlots.filter((_, x) => x !== i))} 
                                canRemove={materialSlots.length > 1}
                                zIndex={materialSlots.length - idx} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}