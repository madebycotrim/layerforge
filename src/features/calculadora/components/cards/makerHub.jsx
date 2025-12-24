import React, { useState, useEffect, useMemo } from "react";
import { 
    Zap, Copy, Check, Package, CalendarClock, 
    Share2, PieChart, Printer, ArrowUpRight, 
    ChevronLeft, ChevronRight, Clock,
    Bot, Send, Weight, ArrowRightLeft, Boxes
} from "lucide-react";
import { formatCurrency } from "../../../../lib/format";
import { getFilaments } from "../../../filamentos/logic/filaments";

export default function MakersHubWidget({ resultados, entradas, nomeProjeto }) {
    const [slide, setSlide] = useState(0);
    const [copied, setCopied] = useState(false);
    const [inventory, setInventory] = useState([]);

    useEffect(() => { 
        setInventory(getFilaments() || []);
        setCopied(false); 
    }, [resultados]);

    // --- 1. CONSUMO DE MATERIAL ---
    const telemetryData = useMemo(() => {
        const slots = (entradas.materialSlots && entradas.materialSlots.length > 0) 
            ? entradas.materialSlots 
            : [{ id: entradas.selectedFilamentId, weight: entradas.pesoModelo }];

        return slots.map((slot, idx) => {
            const item = inventory.find(f => f.id === slot.id);
            const printWeight = Number(slot.weight) || 0;
            const stockBefore = item ? Number(item.weightCurrent) : 0;
            
            return {
                label: item ? item.name : (slot.id === 'manual' ? "Material Avulso" : `Slot 0${idx + 1}`),
                before: stockBefore,
                spend: printWeight,
                after: stockBefore - printWeight,
                active: printWeight > 0
            };
        }).filter(s => s.active);
    }, [entradas, inventory]);

    const totalWeight = telemetryData.reduce((acc, s) => acc + s.spend, 0);

    // --- 2. SCRIPT DE ORÇAMENTO (WHATSAPP) ---
    const getQuoteText = () => {
        const total = formatCurrency(resultados.precoComDesconto || resultados.precoSugerido || 0);
        const prazo = `${entradas.tempoImpressaoHoras || 0}h ${entradas.tempoImpressaoMinutos || 0}m`;
        return `*ORÇAMENTO: ${nomeProjeto || "Projeto 3D"}*\n\n` +
               `📦 *Peça:* Personalizada em 3D\n` +
               `⏱️ *Tempo de Produção:* ~${prazo}\n` +
               `💰 *Valor:* ${total}\n\n` +
               `_Podemos iniciar a produção?_ 🚀`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getQuoteText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- 3. ESTIMATIVA DE FINALIZAÇÃO ---
    const tempoTotalMinutos = (Number(entradas.tempoImpressaoHoras) * 60) + Number(entradas.tempoImpressaoMinutos);
    const horaFim = useMemo(() => {
        if (tempoTotalMinutos <= 0) return "--:--";
        return new Date(new Date().getTime() + tempoTotalMinutos * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, [tempoTotalMinutos]);

    const slides = [
        { id: 'quote', title: "Orçamento Rápido", icon: Share2, color: 'text-emerald-400', badge: 'WHATSAPP' },
        { id: 'telemetry', title: "Uso de Estoque", icon: Package, color: 'text-sky-400', badge: 'FILAMENTO' },
        { id: 'deadline', title: "Previsão de Entrega", icon: CalendarClock, color: 'text-amber-400', badge: 'HORÁRIO' },
        { id: 'analysis', title: "Divisão de Custos", icon: PieChart, color: 'text-purple-400', badge: 'RESUMO' },
    ];

    const currentSlide = slides[slide];

    return (
        <div className="h-full flex flex-col bg-zinc-950/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden group/hub relative shadow-2xl min-h-[280px]">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

            {/* HEADER */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/5 bg-zinc-900/20 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Bot size={12} className="text-sky-500" />
                    </div>
                    <span className="text-[9px] font-black text-zinc-400 tracking-[0.2em] uppercase">Assistente Maker</span>
                </div>
                <div className={`px-2 py-0.5 rounded-md border text-[8px] font-black tracking-widest ${currentSlide.color.replace('text-', 'border-').replace('400', '500/20')} ${currentSlide.color.replace('text-', 'bg-').replace('400', '500/5')}`}>
                    {currentSlide.badge}
                </div>
            </div>

            <div className="flex-1 p-5 relative z-10 min-h-0">
                
                {/* SLIDE 0: WHATSAPP QUOTE */}
                {slide === 0 && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 mb-3 font-mono text-[10px] text-zinc-500 leading-relaxed overflow-hidden relative">
                             {getQuoteText()}
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            <button onClick={handleCopy} className="col-span-4 h-9 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[9px] font-black uppercase text-zinc-300 transition-all flex items-center justify-center gap-2">
                                {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>} {copied ? "COPIADO" : "COPIAR MENSAGEM"}
                            </button>
                            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getQuoteText())}`)} className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                                <ArrowUpRight size={16}/>
                            </button>
                        </div>
                    </div>
                )}

                {/* SLIDE 1: CONSUMO DE MATERIAL */}
                {slide === 1 && (
                    <div className="h-full flex flex-col gap-3 animate-in fade-in duration-500 overflow-hidden">
                        <div className="flex justify-between items-end mb-1">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Peso total da impressão</span>
                                <span className="text-xl font-black text-white font-mono leading-none">{totalWeight}g</span>
                            </div>
                            <span className="text-[9px] font-black text-sky-500/50 uppercase tracking-widest">Consumo da Farm</span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                            {telemetryData.length > 0 ? telemetryData.map((data, i) => {
                                const spoolMax = 1000; 
                                const pctCurrent = Math.min((data.before / spoolMax) * 100, 100);
                                const pctAfter = Math.max(0, Math.min((data.after / spoolMax) * 100, 100));

                                return (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase">
                                            <span className="text-zinc-400 truncate max-w-[150px]">{data.label}</span>
                                            <span className={data.after < 0 ? 'text-rose-500' : 'text-zinc-600'}>
                                                {data.after < 0 ? 'FALTA FILAMENTO!' : `${data.after}g no rolo`}
                                            </span>
                                        </div>
                                        <div className="relative h-2 w-full bg-zinc-900 rounded-full border border-white/5 overflow-hidden">
                                            <div style={{ width: `${pctCurrent}%` }} className="absolute inset-y-0 left-0 bg-sky-500/10 rounded-full" />
                                            <div style={{ width: `${pctAfter}%` }} className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(14,165,233,0.3)] ${data.after < 100 ? 'bg-rose-500 shadow-rose-500/50' : 'bg-sky-500'}`} />
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20"><Boxes size={24}/><span className="text-[8px] font-black mt-2">SEM DADOS DE MATERIAL</span></div>
                            )}
                        </div>
                    </div>
                )}

                {/* SLIDE 2: PREVISÃO (ETA) */}
                {slide === 2 && (
                    <div className="h-full flex flex-col justify-center items-center animate-in zoom-in-95 duration-500">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2">Fica pronto às</span>
                        <div className="text-6xl font-black text-white font-mono tracking-tighter mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            {horaFim}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-amber-500 bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10 uppercase">
                            <Clock size={10} strokeWidth={3}/> Tempo de máquina: {tempoTotalMinutos} min
                        </div>
                    </div>
                )}

                {/* SLIDE 3: DIVISÃO DE CUSTOS */}
                {slide === 3 && (
                    <div className="h-full flex flex-col justify-center animate-in fade-in duration-500">
                         <div className="flex items-center gap-5">
                             <div className="w-24 h-24 rounded-full border-[6px] border-zinc-900 border-t-sky-500 border-r-purple-500 border-b-amber-500 flex items-center justify-center bg-zinc-950 shadow-inner relative">
                                <PieChart size={24} className="text-zinc-800"/>
                             </div>
                             <div className="flex-1 space-y-2.5">
                                <MiniRow label="Filamentos" color="bg-sky-500" pct={Math.round((resultados.custoMaterial/resultados.custoUnitario)*100)} />
                                <MiniRow label="Mão de Obra" color="bg-purple-500" pct={Math.round((resultados.custoMaoDeObra/resultados.custoUnitario)*100)} />
                                <MiniRow label="Máquina e Luz" color="bg-amber-500" pct={Math.round(((resultados.custoEnergia + resultados.custoMaquina)/resultados.custoUnitario)*100)} />
                             </div>
                         </div>
                    </div>
                )}
            </div>

            {/* NAVEGAÇÃO FOOTER */}
            <div className="h-10 border-t border-white/5 bg-zinc-900/40 flex items-center justify-between px-2 shrink-0 relative z-20">
                <button onClick={() => setSlide((s) => (s-1+4)%4)} className="p-1.5 text-zinc-700 hover:text-white transition-colors active:scale-90"><ChevronLeft size={18}/></button>
                <div className="flex gap-2">
                    {[0,1,2,3].map(i => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${slide === i ? 'w-5 bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'w-1 bg-zinc-800'}`} />
                    ))}
                </div>
                <button onClick={() => setSlide((s) => (s+1)%4)} className="p-1.5 text-zinc-700 hover:text-white transition-colors active:scale-90"><ChevronRight size={18}/></button>
            </div>
        </div>
    );
}

const MiniRow = ({ label, color, pct }) => (
    <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-zinc-400">{pct || 0}%</span>
    </div>
);