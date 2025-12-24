import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    X, Save, Zap, Timer, DollarSign, Tag,
    Activity, Binary, Terminal, Cpu
} from "lucide-react";

import { UnifiedInput } from "../../../components/formInputs";
import { parseNumber } from "../../../hooks/useFormat";

/* ---------- CONFIGURAÇÃO DOS INPUTS (DADOS) ---------- */
const CONFIG = {
    marca: { label: "Marca / Fabricante", type: "select", placeholder: "Buscar marca...", searchable: true },
    modelo: { label: "Modelo", type: "select", placeholder: "Escolher modelo...", searchable: true },
    apelido: { label: "Nome ou Apelido da Máquina", icon: Tag, type: "text", placeholder: "Ex: Ender 3 do Canto" },
    potencia: { label: "Potência (Consumo)", icon: Zap, suffix: "Watts", type: "number", placeholder: "0" },
    preco: { label: "Valor pago nela", icon: DollarSign, suffix: "R$", type: "number", placeholder: "0.00" },
    horasUso: { label: "Horas totais de uso", icon: Timer, suffix: "Horas", type: "number", placeholder: "0" },
    manutencao: { label: "Manutenção a cada", icon: Activity, suffix: "Horas", type: "number", placeholder: "300" }
};

const INITIAL_PRINTER_STATE = {
    nome: "",
    marca: "",
    modelo: "",
    potencia: "",
    preco: "",
    status: "idle",
    horas_totais: 0,
    ultima_manutencao_hora: 0,
    intervalo_manutencao: 300,
    rendimento_total: 0,
    historico: []
};

export default function PrinterModal({ aberto, aoFechar, aoSalvar, dadosIniciais }) {
    const [form, setForm] = useState(INITIAL_PRINTER_STATE);
    const [database, setDatabase] = useState([]);
    const [manualEntry, setManualEntry] = useState({ brand: false, model: false });

    // Carregar banco de dados de impressoras (mantido compatibilidade com JSON original)
    useEffect(() => {
        if (aberto && database.length === 0) {
            fetch('/printers.json')
                .then(res => res.json())
                .then(data => setDatabase(Array.isArray(data) ? data : []))
                .catch(err => console.error("Erro ao carregar DB de impressoras", err));
        }
    }, [aberto, database.length]);

    // Resetar ou carregar dados ao abrir (Mapeando EN -> PT se necessário)
    useEffect(() => {
        if (aberto) {
            if (dadosIniciais) {
                setForm({
                    ...INITIAL_PRINTER_STATE,
                    ...dadosIniciais,
                    nome: dadosIniciais.nome || dadosIniciais.name || "",
                    marca: dadosIniciais.marca || dadosIniciais.brand || "",
                    modelo: dadosIniciais.modelo || dadosIniciais.model || "",
                    potencia: dadosIniciais.potencia || dadosIniciais.power || "",
                    preco: dadosIniciais.preco || dadosIniciais.price || "",
                    horas_totais: parseNumber(dadosIniciais.horas_totais || dadosIniciais.totalHours),
                    intervalo_manutencao: parseNumber(dadosIniciais.intervalo_manutencao || dadosIniciais.maintenanceInterval || 300)
                });
                setManualEntry({ brand: false, model: false });
            } else {
                setForm(INITIAL_PRINTER_STATE);
                setManualEntry({ brand: false, model: false });
            }
        }
    }, [aberto, dadosIniciais]);

    const brandOptions = useMemo(() => {
        const brands = [...new Set(database.map(p => p.brand))].filter(Boolean).sort();
        return [{ group: "Marcas conhecidas", items: brands.map(b => ({ value: b, label: b })) }];
    }, [database]);

    const modelOptions = useMemo(() => {
        if (!form.marca) return [];
        const models = database.filter(p => String(p.brand).toLowerCase() === String(form.marca).toLowerCase());
        return [{
            group: `Modelos da ${form.marca}`,
            items: models.map(m => ({ value: m.model, label: m.model, data: m }))
        }];
    }, [database, form.marca]);

    const handleModelChange = (val, item) => {
        const printerInfo = item?.data || database.find(p => p.model === val && p.brand === form.marca);
        setForm(prev => ({
            ...prev,
            modelo: val,
            potencia: printerInfo?.consumoKw ? (printerInfo.consumoKw * 1000).toString() : prev.potencia,
            nome: prev.nome || `${prev.marca} ${val}`.trim()
        }));
    };

    const custoHora = useMemo(() => {
        const precoVal = parseNumber(form.preco);
        const intervaloVal = parseNumber(form.intervalo_manutencao);
        if (intervaloVal <= 0) return "0.00";
        return (precoVal / intervaloVal).toFixed(2);
    }, [form.preco, form.intervalo_manutencao]);

    const handleSalvar = useCallback(() => {
        const payload = {
            ...form,
            nome: form.nome.trim() || `${form.marca} ${form.modelo}`.trim(),
            potencia: parseNumber(form.potencia),
            preco: parseNumber(form.preco),
            horas_totais: parseNumber(form.horas_totais),
            intervalo_manutencao: parseNumber(form.intervalo_manutencao) || 300
        };
        aoSalvar(payload);
    }, [form, aoSalvar]);

    const isValid = form.nome.trim() !== "" && form.marca && form.modelo && parseNumber(form.potencia) > 0;

    if (!aberto) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={aoFechar} />

            <div className="relative bg-[#080808] border border-zinc-800 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">

                {/* LADO ESQUERDO: STATUS */}
                <div className="w-full md:w-[280px] bg-black/40 border-r border-zinc-800/60 p-6 flex flex-col items-center justify-between shrink-0">
                    <div className="relative z-10 w-full text-center">
                        <div className="flex items-center gap-2 mb-6 justify-center">
                            <Activity size={12} className="text-emerald-500" />
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Status da Farm</span>
                        </div>
                        <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 mb-4">
                            <Cpu size={60} className="mx-auto text-zinc-700" />
                        </div>
                        <h3 className="text-base font-bold text-white uppercase truncate px-2">{form.nome || "Nova Máquina"}</h3>
                        <span className="text-[7px] font-bold text-zinc-500 uppercase">{form.marca} {form.modelo}</span>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 w-full backdrop-blur-md">
                        <span className="text-[7px] font-bold text-zinc-600 uppercase block mb-1">Custo de Desgaste</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-mono font-bold text-emerald-500">R$ {custoHora}</span>
                            <span className="text-[8px] font-bold text-zinc-700 uppercase">/h</span>
                        </div>
                    </div>
                </div>

                {/* LADO DIREITO: FORMULÁRIO */}
                <div className="flex-1 flex flex-col">
                    <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Binary size={16} className="text-sky-500" />
                            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Hardware / Configuração</h3>
                        </div>
                        <button onClick={aoFechar} className="text-zinc-600 hover:text-white transition-colors"><X size={18} /></button>
                    </header>

                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sky-500 font-mono text-[10px]">[01]</span>
                                <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Identificação</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between px-1">
                                        <label className="text-[8px] font-bold text-zinc-500 uppercase">Marca</label>
                                        <button onClick={() => setManualEntry(p => ({ ...p, brand: !p.brand }))} className="text-[7px] text-sky-500 uppercase hover:underline">
                                            {manualEntry.brand ? "Listar Marcas" : "Digitar Nome"}
                                        </button>
                                    </div>
                                    <UnifiedInput
                                        {...CONFIG.marca}
                                        type={manualEntry.brand ? "text" : "select"}
                                        options={brandOptions}
                                        value={form.marca}
                                        onChange={val => {
                                            const newVal = manualEntry.brand ? val.target.value : val;
                                            setForm(f => ({ ...f, marca: newVal, modelo: "" }));
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between px-1">
                                        <label className="text-[8px] font-bold text-zinc-500 uppercase">Modelo</label>
                                        <button onClick={() => setManualEntry(p => ({ ...p, model: !p.model }))} className="text-[7px] text-sky-500 uppercase hover:underline">
                                            {manualEntry.model ? "Listar Modelos" : "Digitar Nome"}
                                        </button>
                                    </div>
                                    <UnifiedInput
                                        {...CONFIG.modelo}
                                        type={manualEntry.model ? "text" : "select"}
                                        options={modelOptions}
                                        value={form.modelo}
                                        disabled={!form.marca && !manualEntry.model}
                                        onChange={(val, item) => {
                                            if (manualEntry.model) {
                                                setForm(f => ({ ...f, modelo: val.target.value }));
                                            } else {
                                                handleModelChange(val, item);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <UnifiedInput 
                                {...CONFIG.apelido} 
                                value={form.nome} 
                                onChange={e => setForm({ ...form, nome: e.target.value })} 
                            />
                        </section>

                        <section className="grid grid-cols-2 gap-x-4 gap-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-amber-500 font-mono text-[10px]">[02]</span>
                                    <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Energia / Preço</h4>
                                </div>
                                <UnifiedInput {...CONFIG.potencia} value={form.potencia} onChange={e => setForm({ ...form, potencia: e.target.value })} />
                                <UnifiedInput {...CONFIG.preco} value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-orange-500 font-mono text-[10px]">[03]</span>
                                    <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Vida Útil</h4>
                                </div>
                                <UnifiedInput {...CONFIG.horasUso} value={form.horas_totais} onChange={e => setForm({ ...form, horas_totais: e.target.value })} />
                                <UnifiedInput {...CONFIG.manutencao} value={form.intervalo_manutencao} onChange={e => setForm({ ...form, intervalo_manutencao: e.target.value })} />
                            </div>
                        </section>
                    </div>

                    <footer className="p-6 border-t border-white/5 bg-zinc-950/50 flex gap-3">
                        <button onClick={aoFechar} className="flex-1 py-2.5 rounded-lg border border-zinc-800 text-[9px] font-bold uppercase text-zinc-600 hover:text-white transition-all">Cancelar</button>
                        <button 
                            disabled={!isValid} 
                            onClick={handleSalvar} 
                            className={`flex-[2] py-2.5 rounded-lg text-[9px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${isValid ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800"}`}
                        >
                            <Terminal size={14} /> {dadosIniciais ? "Salvar alterações" : "Salvar na Farm"}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}