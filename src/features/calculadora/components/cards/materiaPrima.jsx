import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Package, DollarSign, Tag, Layers } from "lucide-react";
import { getFilaments } from "../../../filamentos/logic/filaments";
import { UnifiedInput } from "../../../../components/formInputs";

/* ---------- COMPONENTE: LINHA DE FILAMENTO (RACK) ---------- */
const FilamentRow = ({ index, total, slotData, selectOptions, onUpdate, onRemove, canRemove }) => {
    // Lógica para o dropdown não ficar atrás das linhas de baixo
    const zIndex = total - index;

    return (
        <div
            style={{ zIndex }}
            className="flex items-end gap-2 group animate-in slide-in-from-right-2 duration-300 mb-2 relative"
        >
            {/* SELEÇÃO DO MATERIAL (Ocupa o máximo de espaço) */}
            <div className="flex-1 min-w-0">
                <UnifiedInput
                    placeholder="MATERIAL..."
                    type="select"
                    icon={Tag}
                    options={selectOptions}
                    value={slotData.id || "manual"}
                    onChange={(id) => onUpdate(index, { id })}
                />
            </div>

            {/* PESO (Tamanho equalizado) */}
            <div className="w-[72px] shrink-0">
                <UnifiedInput
                    placeholder="0"
                    type="number"
                    suffix="G"
                    value={slotData.weight || ""}
                    onChange={(e) => onUpdate(index, { weight: e.target.value })}
                />
            </div>

            {/* PREÇO (Tamanho equalizado) */}
            <div className="w-[72px] shrink-0">
                <UnifiedInput
                    placeholder="0.00"
                    type="number"
                    suffix="R$"
                    value={slotData.priceKg || ""}
                    onChange={(e) => onUpdate(index, { priceKg: e.target.value })}
                />
            </div>

            {/* BOTÃO REMOVER */}
            <button
                type="button"
                onClick={() => canRemove && onRemove(index)}
                className="h-11 w-10 shrink-0 flex items-center justify-center rounded-xl border border-zinc-800/60 text-zinc-700 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function MaterialModule({
    custoRolo, setCustoRolo,
    pesoModelo, setPesoModelo,
    selectedFilamentId, setSelectedFilamentId,
    materialSlots = [],
    setMaterialSlots
}) {
    const [mode, setMode] = useState("single");
    const [inventory, setInventory] = useState([]);

    useEffect(() => { setInventory(getFilaments() || []); }, []);

    const selectOptions = useMemo(() => {
        const groups = {};
        inventory.forEach((item) => {
            const type = item.type || "Outros";
            if (!groups[type]) groups[type] = [];
            groups[type].push({ value: item.id, label: item.name });
        });
        return [
            { group: "ENTRADA MANUAL", items: [{ value: "manual", label: "Preço Manual" }] },
            ...Object.keys(groups).map(type => ({
                group: `ESTOQUE: ${type.toUpperCase()}`,
                items: groups[type]
            }))
        ];
    }, [inventory]);

    const handleUpdateSlot = (index, newData) => {
        const safeSlots = Array.isArray(materialSlots) ? materialSlots : [];
        const newSlots = [...safeSlots];
        const updatedSlot = { ...newSlots[index], ...newData };

        if (newData.id && newData.id !== "manual") {
            const item = inventory.find(f => f.id === newData.id);
            if (item && item.weightTotal > 0) {
                updatedSlot.priceKg = String(((Number(item.price) / Number(item.weightTotal)) * 1000).toFixed(2));
            }
        }
        newSlots[index] = updatedSlot;
        setMaterialSlots(newSlots);
    };

    const totalWeight = useMemo(() => {
        const safeSlots = Array.isArray(materialSlots) ? materialSlots : [];
        if (mode === "single") return Number(pesoModelo) || 0;
        return safeSlots.reduce((acc, s) => acc + (Number(s.weight) || 0), 0);
    }, [materialSlots, pesoModelo, mode]);

    return (
        <div className="flex flex-col gap-5 animate-in fade-in duration-500">

            <div className="flex bg-zinc-900/40 border border-zinc-800/60 p-1 rounded-xl">
                {["single", "multi"].map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
                        ${mode === m ? "bg-zinc-800 text-sky-400 border border-white/5 shadow-lg" : "text-zinc-600 hover:text-zinc-400"}`}
                    >
                        {m === "single" ? "Uma cor" : "Várias cores"}
                    </button>
                ))}
            </div>

            {mode === "single" ? (
                <div className="space-y-4 animate-in slide-in-from-left-2">
                    <UnifiedInput
                        label="Filamento"
                        type="select"
                        icon={Tag}
                        options={selectOptions}
                        value={selectedFilamentId || "manual"}
                        onChange={(id) => {
                            setSelectedFilamentId(id);
                            if (id !== 'manual') {
                                const item = inventory.find(f => f.id === id);
                                if (item && item.weightTotal > 0) {
                                    setCustoRolo(String(((Number(item.price) / Number(item.weightTotal)) * 1000).toFixed(2)));
                                }
                            }
                        }}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <UnifiedInput
                            label="Peso do Modelo"
                            suffix="G"
                            icon={Package}
                            type="number"
                            value={pesoModelo || ""}
                            onChange={(e) => setPesoModelo(e.target.value)}
                        />
                        <UnifiedInput
                            label="Preço por KG"
                            suffix="R$"
                            icon={DollarSign}
                            type="number"
                            value={custoRolo || ""}
                            onChange={(e) => setCustoRolo(e.target.value)}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-3 relative">
                    {/* Header com Contador de Slots */}
                    <div className="flex items-center justify-between px-1 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                            <Layers size={12} className="text-zinc-500" />
                            <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase">Rack de Materiais</span>
                            <span className="text-[7px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5 font-bold">
                                {String(materialSlots.length).padStart(2, '0')} SLOTS
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-mono font-bold text-sky-400">{totalWeight.toFixed(0)}g</span>
                                <span className="text-[7px] font-black text-zinc-700 uppercase tracking-tighter">Total</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMaterialSlots([...(Array.isArray(materialSlots) ? materialSlots : []), { id: 'manual', weight: '', priceKg: '' }])}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 hover:bg-sky-500 hover:text-white transition-all active:scale-90"
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {/* Lista de Slots - Removido overflow-hidden externo para permitir dropdown */}
                    <div className="flex flex-col min-h-0">
                        {(Array.isArray(materialSlots) ? materialSlots : []).map((slot, idx) => (
                            <FilamentRow
                                key={`slot-${idx}`}
                                index={idx}
                                total={materialSlots.length}
                                slotData={slot}
                                selectOptions={selectOptions}
                                onUpdate={handleUpdateSlot}
                                onRemove={(i) => setMaterialSlots(materialSlots.filter((_, x) => x !== i))}
                                canRemove={materialSlots.length > 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}