import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    Terminal, Zap, ChevronDown, X, Cpu,
    Box, Activity, AlertOctagon, 
    CheckCircle2, Network, Radio, Wrench, Play
} from "lucide-react";
import { analyzePrinterHealth } from "../logic/diagnostics";

// Nota: Importamos as funções lógicas reais para garantir funcionamento
import { updateStatus } from "../logic/printers";

const MakerCoreIA = ({ printers = [], onFixRequest, setPrinters }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState("monitor"); 
    const [logs, setLogs] = useState([]);

    // --- CÁLCULOS REAIS ---
    const farmStats = useMemo(() => {
        const diagnostics = printers.map(p => ({ 
            id: p.id, 
            issues: analyzePrinterHealth(p) 
        }));
        
        return {
            total: printers.length,
            critical: diagnostics.filter(d => d.issues.some(i => i.severity === 'critical')).length,
            printing: printers.filter(p => p.status === 'printing').length,
            idle: printers.filter(p => p.status === 'idle').length,
            maintenance: printers.filter(p => p.status === 'maintenance').length,
            diagnostics
        };
    }, [printers]);

    const s = useMemo(() => {
        if (farmStats.total === 0) return { mode: 'OFFLINE', color: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-800', title: "NÚCLEO INATIVO", msg: "Aguardando conexão..." };
        if (farmStats.critical > 0) return { mode: 'CRITICAL', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', title: "FALHA DETECTADA", msg: "Intervenção prioritária requerida." };
        return { mode: 'READY', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', title: "SISTEMA NOMINAL", msg: "Frota 100% operacional." };
    }, [farmStats]);

    // --- FUNÇÕES DE COMANDO REAL ---
    const addLog = (msg) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [{ id: Date.now(), time, msg }, ...prev].slice(0, 50));
    };

    const handleEmergencyStop = () => {
        if (window.confirm("⚠️ EXECUTAR PARADA DE EMERGÊNCIA GLOBAL?")) {
            const updated = printers.map(p => ({ ...p, status: 'maintenance' }));
            // Assumindo que setPrinters vem do pai para atualizar o estado global
            if (setPrinters) setPrinters(updated); 
            addLog("!! ALERTA: COMANDO DE EMERGÊNCIA EXECUTADO - TODAS AS UNIDADES EM MANUTENÇÃO");
        }
    };

    const handleGlobalIdle = () => {
        const updated = printers.map(p => ({ ...p, status: 'idle' }));
        if (setPrinters) setPrinters(updated);
        addLog("COMANDO: Todas as unidades retornaram ao estado Ocioso.");
    };

    // --- SUB-COMPONENTE: MAINFRAME ---
    const MainframeModal = () => (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsExpanded(false)} />
            
            <div className="relative w-full max-w-7xl h-full max-h-[800px] bg-[#050505] border border-zinc-800/50 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
                
                {/* Header Funcional */}
                <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/10">
                    <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-xl ${s.bg} border ${s.border}`}>
                            <Cpu size={24} className={s.color} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-zinc-100 uppercase tracking-tighter">MakerCore IA // Control</h2>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${s.color}`}>Status: {s.mode}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                            {['monitor', 'logs'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsExpanded(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar de Ações Reais */}
                    <aside className="w-72 border-r border-white/5 p-8 flex flex-col gap-8 bg-black/20">
                        <div className="space-y-4">
                            <h3 className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Controle Global</h3>
                            <button onClick={handleGlobalIdle} className="w-full py-3 px-4 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase text-zinc-300 flex items-center gap-3 hover:bg-zinc-800 transition-all">
                                <Play size={14} className="text-emerald-500" /> Resetar Frota
                            </button>
                            <button onClick={handleEmergencyStop} className="w-full py-3 px-4 bg-rose-600/10 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase text-rose-500 flex items-center gap-3 hover:bg-rose-600 hover:text-white transition-all">
                                <AlertOctagon size={14} /> Kill Switch
                            </button>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h3 className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Saúde da Rede</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex justify-between text-[11px] font-mono"><span className="text-zinc-500">Total:</span> <span className="text-zinc-200">{farmStats.total}</span></div>
                                <div className="flex justify-between text-[11px] font-mono"><span className="text-zinc-500">Printing:</span> <span className="text-emerald-500">{farmStats.printing}</span></div>
                                <div className="flex justify-between text-[11px] font-mono"><span className="text-zinc-500">Maintenance:</span> <span className="text-rose-500">{farmStats.maintenance}</span></div>
                            </div>
                        </div>
                    </aside>

                    {/* Conteúdo Dinâmico */}
                    <main className="flex-1 overflow-y-auto p-10 bg-zinc-950/20">
                        {activeTab === 'monitor' ? (
                            <div className="grid grid-cols-1 gap-3">
                                {printers.map(p => {
                                    const isCrit = farmStats.diagnostics.find(d => d.id === p.id)?.issues.some(i => i.severity === 'critical');
                                    return (
                                        <div key={p.id} className={`p-4 rounded-xl border ${isCrit ? 'border-rose-500/40 bg-rose-500/5' : 'border-zinc-800 bg-zinc-900/10'} flex items-center justify-between`}>
                                            <div className="flex items-center gap-4">
                                                <Box size={18} className={isCrit ? 'text-rose-500' : 'text-zinc-600'} />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-zinc-200 uppercase">{p.name}</span>
                                                    <span className="text-[9px] font-mono text-zinc-500">ST: {p.status} // SN: {p.id.slice(0,8)}</span>
                                                </div>
                                            </div>
                                            {isCrit && (
                                                <button 
                                                    onClick={() => { onFixRequest(p.id); addLog(`Comando: Reparo iniciado em ${p.name}`); }} 
                                                    className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-emerald-500 transition-all"
                                                >
                                                    Corrigir
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-black/40 rounded-xl border border-white/5 p-6 h-full font-mono text-[11px] overflow-y-auto">
                                {logs.length === 0 && <span className="text-zinc-700">Aguardando telemetria...</span>}
                                {logs.map(log => (
                                    <div key={log.id} className="mb-1">
                                        <span className="text-zinc-600">[{log.time}]</span> <span className="text-emerald-500">SYS_LOG:</span> <span className="text-zinc-300">{log.msg}</span>
                                    </div>
                                ))}
                                <div className="w-2 h-4 bg-emerald-500 inline-block animate-pulse ml-1" />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* CARD DO DASHBOARD */}
            <div
                onClick={() => setIsExpanded(true)}
                className={`group relative h-[180px] p-6 rounded-2xl bg-[#09090b] border border-zinc-800/50 overflow-hidden flex flex-col justify-between transition-all hover:border-zinc-700 shadow-lg cursor-pointer`}
            >
                <div className="relative z-10 flex justify-between items-start">
                    <div className={`p-2.5 rounded-xl ${s.bg} border ${s.border} ${s.color}`}>
                        <Terminal size={20} />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">MakerCore IA</p>
                        <h3 className={`text-base font-black tracking-tighter uppercase ${s.color}`}>{s.mode}</h3>
                    </div>
                </div>

                <div className="relative z-10 py-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={12} className={s.color} />
                        <span className="text-[10px] text-zinc-100 font-black uppercase tracking-tight truncate">{s.msg}</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 font-mono truncate opacity-60">
                        {farmStats.critical > 0 ? `DETECTADOS ${farmStats.critical} PONTOS DE FALHA` : `RODANDO EM ${farmStats.printing} UNIDADES`}
                    </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                        <span className="text-[9px] text-zinc-500 font-black uppercase">Link: OK</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-bold group-hover:text-emerald-500 transition-colors uppercase">
                        Gerenciar <ChevronDown size={14} />
                    </div>
                </div>
            </div>

            {isExpanded && createPortal(<MainframeModal />, document.body)}
        </>
    );
};

export default MakerCoreIA;