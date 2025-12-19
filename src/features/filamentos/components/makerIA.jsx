import React, { useState, useMemo } from "react";
import { 
    X, ThermometerSun, Droplets, AlertTriangle, CheckCircle2, 
    Zap, Activity, ShieldCheck, RefreshCw,
    Ruler, Box, ArrowUpRight, Beaker, Waves, Timer, Brain, Gauge
} from "lucide-react";
import { analyzeFilamentHealth } from "../logic/diagnostics";

// --- HELPERS TÉCNICOS ---
const calcularMetros = (peso, material) => {
    const densidades = { PLA: 1.24, ABS: 1.04, PETG: 1.27, TPU: 1.21, NYLON: 1.08 };
    const d = densidades[material?.toUpperCase()] || 1.24;
    return Math.round(peso / (d * 0.002405) / 1000);
};

const getMaterialSensibilidade = (material) => {
    const mat = material?.toUpperCase() || "";
    if (["NYLON", "TPU", "PVA"].includes(mat)) return { nivel: 3, label: "Extrema" };
    if (["PETG", "ABS", "ASA"].includes(mat)) return { nivel: 2, label: "Moderada" };
    return { nivel: 1, label: "Baixa" };
};

/**
 * COMPONENTE 1: MakerBotCard
 * Age como um Sentinela Ambiental.
 */
export const MakerBotCard = ({ itemSugerido, humidity, onClick }) => {
    const health = useMemo(() => itemSugerido ? analyzeFilamentHealth(itemSugerido) : null, [itemSugerido]);
    
    // Insight de IA baseado no clima local
    const climaInsight = useMemo(() => {
        const h = humidity || 50;
        if (h > 70) return { msg: "Risco de Hidrólise Alto", color: "text-rose-500", bg: "bg-rose-500/10" };
        if (h < 45) return { msg: "Ambiente de Cura Ideal", color: "text-emerald-500", bg: "bg-emerald-500/10" };
        return { msg: "Clima Estável", color: "text-sky-500", bg: "bg-sky-500/10" };
    }, [humidity]);

    if (!itemSugerido) return (
        <div className="h-full border border-dashed border-zinc-800 rounded-3xl flex items-center justify-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest p-8 text-center">
            Selecione um material para análise preditiva
        </div>
    );

    return (
        <div onClick={() => onClick(itemSugerido)} className="group cursor-pointer h-full relative">
            <div className="bg-[#080808] border border-white/5 rounded-3xl p-5 h-full flex flex-col justify-between hover:border-sky-500/40 transition-all duration-500 overflow-hidden relative z-10">
                
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Brain size={14} className="text-sky-500" />
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">MakerBot AI</span>
                        </div>
                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Análise Ativa</h3>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-lg font-mono font-bold text-white leading-none">{humidity || "--"}%</span>
                        <span className="text-[8px] text-zinc-600 font-bold uppercase">Umidade Local</span>
                    </div>
                </div>

                <div className={`mt-4 p-3 rounded-2xl ${climaInsight.bg} border border-white/5`}>
                    <p className={`text-[10px] font-black uppercase tracking-tight ${climaInsight.color}`}>
                        {climaInsight.msg}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-tight font-medium">
                        {itemSugerido.material} detectado. Recomendado manter em dry-box.
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-zinc-500 uppercase">Consultar Viabilidade</span>
                    </div>
                    <ArrowUpRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
                </div>
            </div>
            <div className="absolute inset-0 bg-sky-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

/**
 * COMPONENTE 2: MakerBotModal
 * Um dashboard de laboratório para tomada de decisão.
 */
export const MakerBotModal = ({ item, onClose, onResetDrying, humidity }) => {
    const [isDrying, setIsDrying] = useState(false);
    
    if (!item) return null;

    const health = analyzeFilamentHealth(item);
    const metros = calcularMetros(item.weightCurrent, item.material);
    const sensibilidade = getMaterialSensibilidade(item.material);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#050505] w-full max-w-4xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh]">
                
                {/* SIDEBAR: INFO DO MATERIAL */}
                <div className="w-full md:w-80 bg-zinc-900/30 p-8 border-r border-white/5 flex flex-col">
                    <div className="mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 mb-4">
                            <Box size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">{item.name}</h2>
                        <p className="text-zinc-500 text-[10px] font-mono mt-2 uppercase tracking-widest">{item.brand} // {item.material}</p>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Capacidade Linear</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-mono font-bold text-sky-400">~{metros}m</span>
                            </div>
                            <p className="text-[9px] text-zinc-600 mt-2 font-mono uppercase italic">Ideal para peças de até {Math.round(item.weightCurrent * 0.95)}g</p>
                        </div>

                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Sensibilidade à Umidade</span>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`w-3 h-1.5 rounded-full ${i <= sensibilidade.nivel ? 'bg-amber-500' : 'bg-zinc-800'}`} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold text-white uppercase">{sensibilidade.label}</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={onClose} className="mt-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Fechar Relatório
                    </button>
                </div>

                {/* DASHBOARD: LOGICA DA IA */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-black relative">
                    <header className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-xs font-black text-sky-500 uppercase tracking-[0.3em] mb-1">Estratégia Maker // Preditiva</h3>
                            <p className="text-zinc-500 text-[10px] font-mono">ESTADO DO AMBIENTE: {humidity > 60 ? "CRÍTICO" : "ESTÁVEL"}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[9px] font-black text-zinc-600 uppercase block">Análise de Risco</span>
                            <span className={`text-sm font-black uppercase ${humidity > 60 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {humidity > 60 ? '⚠️ Hidrólise Provável' : '✅ Impressão Segura'}
                            </span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {/* BOX: DICA TÉCNICA CLIMÁTICA */}
                        <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
                            <Waves className="absolute -right-2 -top-2 text-white/5" size={80} />
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-4 flex items-center gap-2">
                                <Zap size={14} className="text-amber-500" /> Insight do Slicer
                            </h4>
                            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                                "Com a umidade em <span className="text-white">{humidity}%</span>, se notar fios (stringing), 
                                aumente a retração em <span className="text-white">0.4mm</span> e reduza a temperatura do bico em <span className="text-white">5°C</span>."
                            </p>
                        </div>

                        {/* BOX: SETUP DE CURA */}
                        <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-4 flex items-center gap-2">
                                <ThermometerSun size={14} className="text-orange-500" /> Ciclo de Secagem
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[8px] text-zinc-600 block uppercase">Temperatura</span>
                                    <span className="text-lg font-mono font-bold text-white">{health.specs.dryTemp}°C</span>
                                </div>
                                <div>
                                    <span className="text-[8px] text-zinc-600 block uppercase">Tempo Mínimo</span>
                                    <span className="text-lg font-mono font-bold text-white">{health.specs.dryTime}h</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MANUTENÇÃO MANUAL */}
                    <div className="bg-sky-500/5 border border-sky-500/10 rounded-[2.5rem] p-8 text-center">
                        <h4 className="text-white font-black text-sm uppercase mb-2">Protocolo de Restauração</h4>
                        <p className="text-xs text-zinc-500 max-w-md mx-auto mb-8 font-medium">
                            Como o sistema não possui sensores no rolo, você deve confirmar manualmente quando realizar 
                            a secagem do material. Isso "limpa" o histórico de exposição acumulado.
                        </p>
                        
                        <button 
                            disabled={isDrying}
                            onClick={() => {
                                setIsDrying(true);
                                setTimeout(() => {
                                    onResetDrying(item.id);
                                    setIsDrying(false);
                                    onClose();
                                }, 1500);
                            }}
                            className={`
                                group px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 mx-auto
                                ${isDrying ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:bg-sky-400 shadow-xl'}
                            `}
                        >
                            {isDrying ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : (
                                <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />
                            )}
                            {isDrying ? "Processando..." : "Confirmar Ciclo de Secagem"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};