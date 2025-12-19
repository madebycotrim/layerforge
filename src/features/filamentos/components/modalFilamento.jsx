// --- FILE: src/features/filamentos/components/modalFilamento.jsx ---
import React, { useState, useEffect, useMemo } from "react";
import {
    Edit3, Plus, X, Save, Coins, Palette, Layers,
    FingerprintPattern, PaintbrushVertical, DollarSign
} from "lucide-react";

import SearchSelect from "../../../components/SearchSelect";
import SpoolSideView from "./roloFilamento";

/* ---------- STATE BASE ---------- */
const INITIAL_FILAMENT_STATE = {
    brand: "",
    name: "",
    type: "PLA",
    color: "#000000",
    price: "",
    weightTotal: 1000,
    weightCurrent: 1000,
    dateOpened: new Date().toISOString().split("T")[0],
};

/* ---------- HELPERS ---------- */
const num = (v) => Number(v) || 0;

/* ---------- TOP 17 CORES MAIS VENDIDAS NO BRASIL ---------- */
const CORES_POPULARES_BRASIL = [
    "#000000", "#ffffff", "#9ca3af", // Essenciais
    "#dc2626", "#2563eb", "#16a34a", // Primárias
    "#facc15", "#f97316", "#9333ea", // Secundárias
    "#db2777", "#e2cfae", "#854d0e", // Específicas
    "#FFD700", "#C0C0C0", "#B87333", // Metais
    "#22d3ee", "#84cc16"             // Neon/Vibrante
];

/* ---------- COMPONENTE DE INPUT ---------- */
const IconInput = ({ label, icon: Icon, value, onChange, placeholder, suffix, sectionColor, type = "text", mono = false }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1.5">
                {label}
            </label>
            <div
                className={`relative rounded-xl border transition-all bg-zinc-950/50 ${focused ? "ring-1" : ""}`}
                style={focused ? { borderColor: sectionColor, boxShadow: `0 0 0 1px ${sectionColor}55` } : { borderColor: 'rgba(39, 39, 42, 1)' }}
            >
                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                    type={type} value={value} onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    className={`w-full bg-transparent border-none rounded-xl pl-10 ${suffix ? "pr-10" : "pr-4"} py-2.5 text-xs text-white outline-none placeholder:text-zinc-700 ${mono ? "font-mono" : ""}`}
                />
                {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600">{suffix}</span>}
            </div>
        </div>
    );
};

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function ModalFilamento({ aberto, aoFechar, aoSalvar, dadosIniciais }) {
    const [form, setForm] = useState(INITIAL_FILAMENT_STATE);

    /* ---------- OPTIONS ---------- */
    const marcasOptions = useMemo(() => [{
        group: "Marcas Populares no Brasil",
        items: ["Voolt3D", "3D Lab", "F3D", "Creality", "Bambu Lab", "eSun", "Polymaker", "Flashforge", "Sunlu", "Overture", "Printalot", "Generic"].map(m => ({ value: m, label: m })),
    }], []);

    const tiposOptions = useMemo(() => [{
        group: "Materiais",
        items: ["PLA", "PETG", "ABS", "TPU", "ASA", "Nylon", "PC", "CF-PLA", "Silk", "Wood"].map(t => ({ value: t, label: t })),
    }], []);

    /* ---------- EFEITOS ---------- */
    useEffect(() => {
        if (!aberto) return;
        setForm(dadosIniciais ? {
            ...INITIAL_FILAMENT_STATE,
            ...dadosIniciais,
            color: dadosIniciais.colorHex || dadosIniciais.color || INITIAL_FILAMENT_STATE.color,
        } : INITIAL_FILAMENT_STATE);
    }, [aberto, dadosIniciais]);

    if (!aberto) return null;

    /* ---------- LÓGICA ---------- */
    const custoValor = num(form.price) && num(form.weightTotal) ? (num(form.price) / num(form.weightTotal)) : 0;
    const custoFormatado = custoValor.toFixed(4);
    const isValid = form.brand && form.type;

    // Verifica se a cor selecionada é uma das 17 padrão
    const isPresetColor = CORES_POPULARES_BRASIL.some(c => c.toLowerCase() === form.color.toLowerCase());

    const handleSalvar = () => {
        aoSalvar({
            ...form,
            price: num(form.price),
            weightTotal: num(form.weightTotal),
            weightCurrent: dadosIniciais ? num(form.weightCurrent) : num(form.weightTotal),
            colorHex: form.color,
            id: dadosIniciais?.id,
        });
        aoFechar();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            {/* BACKDROP */}
            <div className="absolute inset-0" onClick={aoFechar}></div>

            <div className="relative bg-[#09090b] border border-zinc-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* --- COLUNA ESQUERDA: PREVIEW VISUAL --- */}
                <div className="w-full md:w-[340px] bg-zinc-900/40 border-b md:border-b-0 md:border-r border-zinc-800 p-8 flex flex-col items-center justify-center relative shrink-0">

                    {/* Glow Ambiente */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none transition-colors duration-500"
                        style={{ backgroundColor: form.color }}
                    />

                    {/* Componente Visual do Rolo */}
                    <div className="relative z-10 scale-125 mb-8 drop-shadow-2xl transition-all duration-300">
                        <SpoolSideView
                            color={form.color}
                            percent={100}
                            size={150}
                        />
                    </div>

                    {/* Resumo Dinâmico */}
                    <div className="z-10 text-center w-full min-h-[60px] flex flex-col items-center mb-6">
                        <h3 className="text-white font-bold text-xl leading-tight break-words">
                            {form.name || <span className="text-zinc-700 italic">Sem nome...</span>}
                        </h3>

                        <div className="mt-2 flex items-center gap-2">
                            {form.brand && (
                                <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                                    {form.brand}
                                </span>
                            )}
                            {/* TAG BRANCA */}
                            <span className="text-xs font-bold text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded">
                                {form.type}
                            </span>
                        </div>
                    </div>

                    {/* Info de Custo */}
                    <div className={`transition-all duration-500 w-full ${custoValor > 0 ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                        <div className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800 flex justify-between items-center backdrop-blur-sm">
                            <span className="text-[10px] uppercase text-zinc-500 font-bold">Custo de Impressão</span>
                            <span className="text-emerald-400 font-mono font-bold text-sm">R$ {custoFormatado}/g</span>
                        </div>
                    </div>
                </div>

                {/* --- COLUNA DIREITA: FORMULÁRIO --- */}
                <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">

                    {/* Header */}
                    <div className="px-8 py-5 border-b border-zinc-800 bg-zinc-900/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                                {dadosIniciais ? <Edit3 size={18} /> : <Plus size={18} />}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                                    {dadosIniciais ? "Editar Detalhes" : "Novo Filamento"}
                                </h3>
                                <p className="text-[10px] text-zinc-500 font-mono">Adicione à sua biblioteca de filamentos</p>
                            </div>
                        </div>
                        <button onClick={aoFechar} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body Scrollável */}
                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                        {/* SEÇÃO 1: O BÁSICO */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FingerprintPattern size={14} className="text-sky-500" />
                                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Identificação</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Fabricante / Marca</label>
                                    <SearchSelect
                                        value={form.brand} onChange={(v) => setForm({ ...form, brand: v })}
                                        searchable options={marcasOptions} placeholder="Ex: Voolt3D"
                                        renderValue={(i) => i.label} renderOption={(i) => i.label}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Material</label>
                                    <SearchSelect
                                        value={form.type} onChange={(v) => setForm({ ...form, type: v })}
                                        options={tiposOptions} renderValue={(i) => i.label} renderOption={(i) => i.label}
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-zinc-900 border-t border-dashed border-zinc-800/50" />

                        {/* SEÇÃO 2: ESTÉTICA E CORES (17 + 1 Custom) */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Palette size={14} className="text-purple-500" />
                                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Estética & Cor</h4>
                            </div>

                            <div className="w-full space-y-3">
                                {/* Flex Wrap para linha única (ou quebra suave se necessário) */}
                                <div className="flex flex-wrap gap-2">
                                    {CORES_POPULARES_BRASIL.map(c => (
                                        <button
                                            key={c} onClick={() => setForm(prev => ({ ...prev, color: c }))}
                                            className={`
                                                w-6 h-6 rounded-md border transition-all hover:scale-110 shadow-sm
                                                ${c.toLowerCase() === form.color.toLowerCase()
                                                    ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110 z-10 border-white/50"
                                                    : "border-zinc-800 opacity-60 hover:opacity-100"
                                                }
                                            `}
                                            style={{ backgroundColor: c }}
                                            title={c}
                                        />
                                    ))}

                                    {/* BOTÃO CUSTOM INTELIGENTE */}
                                    <div className="relative group">
                                        <button
                                            className={`
                                                w-6 h-6 rounded-md border transition-all flex items-center justify-center overflow-hidden
                                                ${!isPresetColor
                                                    ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110 z-10 border-white/50"
                                                    : "border-zinc-700 hover:border-zinc-400 opacity-60 hover:opacity-100"
                                                }
                                            `}
                                            style={{
                                                // Se for preset, mostra arco-íris. Se for custom, mostra a cor escolhida.
                                                background: !isPresetColor
                                                    ? form.color
                                                    : 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)'
                                            }}
                                        >
                                            {/* Ícone de + se for preset */}
                                            {isPresetColor && (
                                                <Plus size={10} className="text-black/70 drop-shadow-md mix-blend-hard-light" strokeWidth={3} />
                                            )}
                                        </button>

                                        <input
                                            type="color"
                                            value={form.color}
                                            onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            title="Misturar cor personalizada"
                                        />
                                    </div>
                                </div>

                                <IconInput
                                    label="Nome da Cor" icon={PaintbrushVertical} mono placeholder="Ex: Vermelho Ferrari"
                                    value={form.name} onChange={(v) => setForm({ ...form, name: v })}
                                    sectionColor="#a855f7"
                                />
                            </div>
                        </section>

                        <div className="h-px bg-zinc-900 border-t border-dashed border-zinc-800/50" />

                        {/* SEÇÃO 3: DADOS DE COMPRA */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Coins size={14} className="text-emerald-500" />
                                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Dados da Compra</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <IconInput
                                    label="Valor Pago" icon={DollarSign} value={form.price}
                                    onChange={(v) => setForm({ ...form, price: v.replace(",", ".") })}
                                    mono placeholder="0,00" sectionColor="#22c55e"
                                />
                                <IconInput
                                    label="Peso do Carretel (Líquido)" icon={Layers} value={form.weightTotal}
                                    onChange={(v) => setForm({ ...form, weightTotal: v })}
                                    suffix="g" mono placeholder="1000" sectionColor="#22c55e"
                                />
                            </div>
                        </section>

                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 flex gap-4">
                        <button onClick={aoFechar} className="px-6 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold uppercase transition-colors">
                            Cancelar
                        </button>
                        <button
                            disabled={!isValid} onClick={handleSalvar}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all shadow-lg ${isValid ? "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/20" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}
                        >
                            <Save size={16} />
                            {dadosIniciais ? "Salvar Alterações" : "Adicionar à Coleção"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}