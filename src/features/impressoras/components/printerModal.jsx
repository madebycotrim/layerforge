import React, { useState, useEffect, useMemo } from "react";
import {
    Edit3, Plus, X, Save, Zap, Wrench, Timer, Fingerprint,
    DollarSign, Tag, Cpu, Activity, Gauge, Keyboard, List
} from "lucide-react";

import SearchSelect from "../../../components/SearchSelect";

/* ---------- STATE BASE ---------- */
const INITIAL_PRINTER_STATE = {
    name: "",
    brand: "",
    model: "",
    power: "",
    price: "",
    status: "idle",
    totalHours: 0,
    maintenanceInterval: 300,
};

const num = (v) => Number(v) || 0;

/* ---------- COMPONENTE DE INPUT ---------- */
const IconInput = ({ label, icon: Icon, value, onChange, placeholder, suffix, sectionColor, type = "text", mono = false }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase text-zinc-500">{label}</label>
            <div
                className={`relative rounded-xl border transition-all ${focused ? "ring-1" : ""}`}
                style={focused ? { borderColor: sectionColor, boxShadow: `0 0 0 1px ${sectionColor}55` } : {}}
            >
                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                    type={type} value={value} onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    className={`w-full bg-zinc-950 border-none rounded-xl pl-10 ${suffix ? "pr-14" : "pr-4"} py-3 text-xs text-white outline-none ${mono ? "font-mono" : ""}`}
                />
                {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">{suffix}</span>}
            </div>
        </div>
    );
};

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function PrinterModal({ aberto, aoFechar, aoSalvar, dadosIniciais }) {
    const [form, setForm] = useState(INITIAL_PRINTER_STATE);
    const [database, setDatabase] = useState([]);
    const [isLoadingDB, setIsLoadingDB] = useState(false);

    // Estado para controlar se o usuário quer digitar manualmente mesmo tendo opções
    const [manualEntry, setManualEntry] = useState({ brand: false, model: false });

    /* ---------- 1. CARREGAR DADOS ---------- */
    useEffect(() => {
        if (aberto && database.length === 0) {
            setIsLoadingDB(true);
            fetch('./printers.json')
                .then(res => res.json())
                .then(data => {
                    setDatabase(data);
                    setIsLoadingDB(false);
                })
                .catch(err => {
                    console.error("Erro ao carregar banco:", err);
                    setIsLoadingDB(false);
                });
        }
    }, [aberto, database.length]);

    /* ---------- 2. POPULAR FORMULÁRIO ---------- */
    useEffect(() => {
        if (!aberto) return;
        setForm(dadosIniciais ? { ...INITIAL_PRINTER_STATE, ...dadosIniciais } : INITIAL_PRINTER_STATE);
        setManualEntry({ brand: false, model: false }); // Reseta modo manual ao abrir
    }, [aberto, dadosIniciais]);

    /* ---------- 3. LÓGICA DE FILTRAGEM ---------- */

    const brandOptions = useMemo(() => {
        if (!database.length) return [];
        const brands = [...new Set(database.map(p => p.brand))].sort();
        return [{
            group: "Marcas Disponíveis",
            items: brands.map(b => ({ value: b, label: b }))
        }];
    }, [database]);

    const modelOptions = useMemo(() => {
        if (!form.brand || !database.length) return [];
        const models = database.filter(p => p.brand.toLowerCase() === form.brand.toLowerCase());
        if (models.length === 0) return [];

        return [{
            group: `Modelos ${form.brand}`,
            items: models.map(m => ({ value: m.model, label: m.model, data: m }))
        }];
    }, [database, form.brand]);

    // Handlers
    const handleModelSelect = (selectedModel) => {
        const novoForm = { ...form, model: selectedModel };
        const preset = database.find(p => p.brand === form.brand && p.model === selectedModel);

        if (preset) {
            if (!form.name) novoForm.name = preset.name;
            if (preset.consumoKw) novoForm.power = Math.round(preset.consumoKw * 1000);
        }
        setForm(novoForm);
    };

    const toggleManual = (field) => {
        setManualEntry(prev => ({ ...prev, [field]: !prev[field] }));
        // Se mudou para manual, limpa o campo para o usuário digitar
        if (!manualEntry[field]) {
            setForm(prev => ({ ...prev, [field]: "" }));
        }
    };

    const isValid = form.name.trim() && form.brand && num(form.power) > 0;

    const handleSalvar = () => {
        aoSalvar({
            ...form,
            price: num(form.price),
            power: num(form.power),
            totalHours: num(form.totalHours),
            maintenanceInterval: num(form.maintenanceInterval),
            id: dadosIniciais?.id
        });
        aoFechar();
    };

    if (!aberto) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={aoFechar}></div>

            <div className="relative bg-[#09090b] border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-5 border-b border-zinc-800 bg-zinc-900/20 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            {dadosIniciais ? <Edit3 size={18} /> : <Plus size={18} />}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                                {dadosIniciais ? "Editar Impressora" : "Nova Impressora"}
                            </h3>
                        </div>
                    </div>
                    <button onClick={aoFechar} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar flex-1">

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Fingerprint size={14} className="text-sky-500" />
                            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Identificação</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-5">

                            {/* MARCA: Select ou Input */}
                            <div className="space-y-1.5 relative z-20">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Fabricante / Marca</label>
                                    <button
                                        onClick={() => toggleManual('brand')}
                                        className="text-[9px] text-sky-500 hover:text-sky-400 font-bold flex items-center gap-1"
                                    >
                                        {manualEntry.brand ? <><List size={10} /> LISTAR</> : <><Keyboard size={10} /> DIGITAR</>}
                                    </button>
                                </div>
                                {manualEntry.brand ? (
                                    <input
                                        value={form.brand}
                                        onChange={e => setForm({ ...form, brand: e.target.value, model: "" })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-sky-500"
                                        placeholder="Digite a marca..."
                                    />
                                ) : (
                                    <SearchSelect
                                        value={form.brand}
                                        onChange={(v) => setForm({ ...form, brand: v, model: "" })}
                                        searchable
                                        options={brandOptions}
                                        placeholder={isLoadingDB ? "Carregando..." : "Selecione..."}
                                        renderValue={(i) => i.label}
                                        renderOption={(i) => i.label}
                                    />
                                )}
                            </div>

                            {/* MODELO: Select (se houver opções) ou Input */}
                            <div className="space-y-1.5 relative z-20">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Modelo</label>
                                    {/* Só mostra botão de alternar se existirem opções no JSON para essa marca */}
                                    {modelOptions.length > 0 && (
                                        <button
                                            onClick={() => toggleManual('model')}
                                            className="text-[9px] text-sky-500 hover:text-sky-400 font-bold flex items-center gap-1"
                                        >
                                            {manualEntry.model ? <><List size={10} /> LISTAR</> : <><Keyboard size={10} /> DIGITAR</>}
                                        </button>
                                    )}
                                </div>

                                {!manualEntry.model && modelOptions.length > 0 ? (
                                    <SearchSelect
                                        value={form.model}
                                        onChange={handleModelSelect}
                                        searchable
                                        options={modelOptions}
                                        placeholder="Selecione o modelo..."
                                        renderValue={(i) => i.label}
                                        renderOption={(i) => (
                                            <div className="flex justify-between items-center w-full">
                                                <span>{i.label}</span>
                                                <span className="text-[9px] bg-zinc-800 px-1.5 rounded text-zinc-400 font-mono">
                                                    {i.data.type}
                                                </span>
                                            </div>
                                        )}
                                    />
                                ) : (
                                    /* Fallback para Input Texto Livre */
                                    <div className="relative rounded-xl border border-zinc-800 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/20 transition-all">
                                        <Cpu size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input
                                            value={form.model}
                                            onChange={(e) => setForm({ ...form, model: e.target.value })}
                                            placeholder="Digite o modelo..."
                                            className="w-full bg-zinc-950 border-none rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <IconInput
                            label="Nome / Identificador" icon={Tag} value={form.name}
                            onChange={(v) => setForm({ ...form, name: v })}
                            placeholder="Ex: Ender 3 - 01" sectionColor="#0ea5e9"
                        />
                    </section>

                    <div className="h-px bg-zinc-900 border-t border-dashed border-zinc-800/50" />

                    {/* RESTO DO FORMULÁRIO (Mantido Igual) */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Gauge size={14} className="text-amber-500" />
                            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Especificações</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <IconInput
                                label="Potência Média" icon={Zap} value={form.power}
                                onChange={(v) => setForm({ ...form, power: v })}
                                suffix="W" mono placeholder="350" sectionColor="#f59e0b"
                            />
                            <IconInput
                                label="Valor de Aquisição" icon={DollarSign} value={form.price}
                                onChange={(v) => setForm({ ...form, price: v })}
                                suffix="R$" mono placeholder="0.00" sectionColor="#10b981"
                            />
                        </div>
                    </section>

                    <div className="h-px bg-zinc-900 border-t border-dashed border-zinc-800/50" />

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wrench size={14} className="text-orange-500" />
                            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Manutenção</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <IconInput
                                label="Horímetro Total" icon={Timer} value={form.totalHours}
                                onChange={(v) => setForm({ ...form, totalHours: v })}
                                suffix="h" mono placeholder="0" sectionColor="#f97316"
                            />
                            <IconInput
                                label="Intervalo de Revisão" icon={Activity} value={form.maintenanceInterval}
                                onChange={(v) => setForm({ ...form, maintenanceInterval: v })}
                                suffix="h" mono placeholder="300" sectionColor="#f97316"
                            />
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 flex gap-4 shrink-0">
                    <button onClick={aoFechar} className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold uppercase transition-colors">
                        Cancelar
                    </button>
                    <button
                        disabled={!isValid} onClick={handleSalvar}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all shadow-lg ${isValid ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}
                    >
                        <Save size={16} /> Salvar Impressora
                    </button>
                </div>
            </div>
        </div>
    );
}