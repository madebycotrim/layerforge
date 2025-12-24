import React, { useState, useEffect, useMemo } from "react";
import { 
    Bot, Copy, Check, ChevronLeft, ChevronRight, ArrowUpRight
} from "lucide-react";
import { formatCurrency } from "../../../../lib/format";
import { getFilaments } from "../../../filamentos/logic/filaments";

export default function MakersHubWidget({ resultados = {}, entradas = {}, nomeProjeto }) {
    const [slide, setSlide] = useState(0);
    const [copied, setCopied] = useState(false);
    const [inventory, setInventory] = useState([]);

    useEffect(() => { 
        setInventory(getFilaments() || []);
        setCopied(false); 
    }, [resultados]);

    // --- 1. CÁLCULOS DE TEMPO E PESO ---
    const totalWeight = useMemo(() => {
        const slots = entradas.materialSlots;
        if (Array.isArray(slots) && slots.length > 0) {
            return slots.reduce((acc, s) => acc + (Number(s.weight) || 0), 0);
        }
        return Number(entradas.pesoModelo) || 0;
    }, [entradas]);

    const tempoTotalHoras = useMemo(() => {
        const h = Number(entradas.tempoImpressaoHoras) || 0;
        const m = Number(entradas.tempoImpressaoMinutos) || 0;
        const total = h + (m / 60);
        return isFinite(total) ? total : 0;
    }, [entradas]);

    // --- 2. PERFORMANCE E RENTABILIDADE ---
    const lucroPorHora = useMemo(() => {
        if (tempoTotalHoras <= 0) return 0;
        const preco = Number(resultados.precoSugerido) || 0;
        const custo = Number(resultados.custoTotal) || 0;
        const lucroTotal = preco - custo;
        return isFinite(lucroTotal / tempoTotalHoras) ? (lucroTotal / tempoTotalHoras) : 0;
    }, [resultados, tempoTotalHoras]);

    const roiPercent = useMemo(() => {
        const preco = Number(resultados.precoSugerido) || 0;
        const custo = Number(resultados.custoTotal) || 0;
        if (custo <= 0) return 0;
        const calc = ((preco / custo) - 1) * 100;
        return isFinite(calc) ? Math.round(calc) : 0;
    }, [resultados]);

    // --- 3. TELEMETRIA DE ESTOQUE ---
    const telemetryData = useMemo(() => {
        const slots = (Array.isArray(entradas.materialSlots) && entradas.materialSlots.length > 0) 
            ? entradas.materialSlots 
            : [{ id: entradas.selectedFilamentId || 'manual', weight: entradas.pesoModelo || 0 }];

        return slots.map((slot, idx) => {
            const item = inventory.find(f => f.id === slot.id);
            const spend = Number(slot.weight) || 0;
            const before = item ? Number(item.weightCurrent) : 0;
            return {
                label: item ? item.name : (slot.id === 'manual' ? "Manual" : `Slot ${idx + 1}`),
                after: before - spend,
                type: item ? item.type : "PLA",
                active: spend > 0 || (slots.length === 1 && !item)
            };
        }).filter(s => s.active);
    }, [entradas, inventory]);

    // --- 4. DICAS TÉCNICAS ---
    const techTips = useMemo(() => {
        const materialAtivo = telemetryData[0]?.type || "PLA";
        const database = {
            "PLA": { temp: "200°C", mesa: "60°C", vent: "100%", speed: "80mm/s" },
            "PETG": { temp: "240°C", mesa: "80°C", vent: "40%", speed: "50mm/s" },
            "ABS": { temp: "255°C", mesa: "110°C", vent: "0%", speed: "50mm/s" }
        };
        return database[materialAtivo] || database["PLA"];
    }, [telemetryData]);

    // --- 5. TEXTO DO WHATSAPP ---
    const quoteText = `*ORÇAMENTO: ${nomeProjeto || "Projeto 3D"}*\n\n` +
                      `📦 *Peça:* Personalizada em 3D\n` +
                      `⏱️ *Produção:* ~${Math.floor(tempoTotalHoras)}h ${Math.round((tempoTotalHoras % 1) * 60)}m\n` +
                      `💰 *Valor:* ${formatCurrency(resultados.precoSugerido || 0)}\n\n` +
                      `_Podemos iniciar?_ 🚀`;

    const slides = [
        { id: 'quote', title: "Orçamento", color: 'text-emerald-400', badge: 'WHATSAPP' },
        { id: 'telemetry', title: "Estoque", color: 'text-sky-400', badge: 'FILAMENTO' },
        { id: 'performance', title: "Performance", color: 'text-indigo-400', badge: 'LUCRO/H' },
        { id: 'tech', title: "Setup", color: 'text-rose-400', badge: 'TÉCNICO' },
        { id: 'checklist', title: "Checklist", color: 'text-amber-400', badge: 'SEGURANÇA' }
    ];

    const cur = slides[slide];

    return (
        <div className="h-fit flex flex-col bg-zinc-950/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden relative shadow-2xl">
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/5 bg-zinc-900/20">
                <div className="flex items-center gap-2">
                    <Bot size={14} className="text-sky-500" />
                    <span className="text-[9px] font-black text-zinc-400 tracking-widest uppercase">Assistente Maker</span>
                </div>
                <div className={`px-2 py-0.5 rounded border text-[8px] font-black ${cur.color.replace('text', 'border')}/20 ${cur.color} bg-white/5`}>
                    {cur.badge}
                </div>
            </div>

            <div className="p-5 min-h-[160px]">
                {cur.id === 'quote' && (
                    <div className="flex flex-col animate-in fade-in duration-500">
                        <div className="h-24 bg-black/40 border border-zinc-800 rounded-xl p-3 mb-3 font-mono text-[9px] text-zinc-500 overflow-y-auto">
                            {quoteText}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { navigator.clipboard.writeText(quoteText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                                className="flex-1 h-9 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black text-zinc-300 flex items-center justify-center gap-2">
                                {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>} {copied ? "COPIADO" : "COPIAR"}
                            </button>
                            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(quoteText)}`)} className="w-10 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white"><ArrowUpRight size={16}/></button>
                        </div>
                    </div>
                )}

                {cur.id === 'telemetry' && (
                    <div className="flex flex-col gap-3 animate-in slide-in-from-right-2">
                        <span className="text-[10px] font-black text-zinc-500 uppercase">Consumo Estimado: <span className="text-white">{totalWeight}g</span></span>
                        {telemetryData.map((d, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-[9px] font-bold uppercase">
                                    <span className="text-zinc-400">{d.label}</span>
                                    <span className={d.after < 0 ? "text-rose-500" : "text-zinc-500"}>{d.after < 0 ? "FALTA!" : `${Math.round(d.after)}g sobra`}</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                    <div className={`h-full transition-all duration-1000 ${d.after < 100 ? "bg-rose-500" : "bg-sky-500"}`} style={{ width: `${Math.max(0, Math.min(100, (d.after/1000)*100))}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {cur.id === 'performance' && (
                    <div className="flex flex-col justify-center py-2 animate-in zoom-in-95">
                        <span className="text-[9px] font-black text-zinc-600 uppercase mb-1">Rentabilidade</span>
                        <div className="text-3xl font-black text-indigo-400 font-mono mb-2">{formatCurrency(lucroPorHora)}<span className="text-[10px] text-zinc-500 ml-1">/H</span></div>
                        <div className="text-[8px] font-bold text-zinc-500 bg-white/5 p-2 rounded border border-white/5">
                            ROI: <span className="text-emerald-500">+{roiPercent}%</span> sobre o custo total de produção.
                        </div>
                    </div>
                )}

                {cur.id === 'tech' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                        <div className="col-span-2 text-[9px] font-black text-zinc-500 uppercase border-b border-white/5 pb-1">Setup Sugerido ({telemetryData[0]?.type || "PLA"})</div>
                        <div className="flex flex-col"><span className="text-[7px] text-zinc-600 uppercase font-black">Nozzle</span><span className="text-xs font-mono font-bold text-zinc-200">{techTips.temp}</span></div>
                        <div className="flex flex-col"><span className="text-[7px] text-zinc-600 uppercase font-black">Bed</span><span className="text-xs font-mono font-bold text-zinc-200">{techTips.mesa}</span></div>
                        <div className="flex flex-col"><span className="text-[7px] text-zinc-600 uppercase font-black">Cooling</span><span className="text-xs font-mono font-bold text-zinc-200">{techTips.vent}</span></div>
                        <div className="flex flex-col"><span className="text-[7px] text-zinc-600 uppercase font-black">Speed</span><span className="text-xs font-mono font-bold text-zinc-200">{techTips.speed}</span></div>
                    </div>
                )}

                {cur.id === 'checklist' && (
                    <div className="space-y-2 animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-400 uppercase"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Mesa limpa e nivelada?</div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-400 uppercase"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Filamento sem umidade?</div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-400 uppercase"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Primeira camada lenta?</div>
                    </div>
                )}
            </div>

            <div className="h-10 border-t border-white/5 bg-zinc-900/40 flex items-center justify-between px-2 shrink-0">
                <button onClick={() => setSlide(s => (s-1+5)%5)} className="p-1.5 text-zinc-700 hover:text-white transition-colors"><ChevronLeft size={16}/></button>
                <div className="flex gap-1">
                    {[0,1,2,3,4].map(i => <div key={i} className={`h-1 rounded-full transition-all duration-500 ${slide === i ? 'w-4 bg-sky-500' : 'w-1 bg-zinc-800'}`} />)}
                </div>
                <button onClick={() => setSlide(s => (s+1)%5)} className="p-1.5 text-zinc-700 hover:text-white transition-colors"><ChevronRight size={16}/></button>
            </div>
        </div>
    );
}