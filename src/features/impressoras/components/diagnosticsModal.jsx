import React from "react";
import { Wrench, X, Activity, Play, AlertTriangle, Terminal, Clock, CheckCircle2 } from "lucide-react";
import { analyzePrinterHealth } from "../logic/diagnostics"; 

const DiagnosticsModal = ({ printer, onClose, onResolve }) => {
    if (!printer) return null;
    
    const tasks = analyzePrinterHealth(printer);
    const hasIssues = tasks.length > 0;
    
    // Contadores
    const criticalCount = tasks.filter(t => t.severity === 'critical').length;
    const estimatedTimeMin = tasks.length * 15; 

    // Define a cor de destaque do modal baseado na gravidade
    const modalAccent = criticalCount > 0 ? 'rose' : hasIssues ? 'amber' : 'emerald';
    
    // Mapeamento de cores para Tailwind (safelist logic)
    const colors = {
        rose: { border: 'border-rose-900/50', text: 'text-rose-500', glow: 'shadow-[0_0_50px_-12px_rgba(244,63,94,0.3)]', bg: 'bg-rose-500/10' },
        amber: { border: 'border-amber-900/50', text: 'text-amber-500', glow: 'shadow-[0_0_50px_-12px_rgba(245,158,11,0.2)]', bg: 'bg-amber-500/10' },
        emerald: { border: 'border-emerald-900/50', text: 'text-emerald-500', glow: 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]', bg: 'bg-emerald-500/10' }
    };

    const style = colors[modalAccent];

    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'critical': return <span className="text-[10px] bg-rose-500 text-black font-bold px-1.5 py-0.5 rounded-sm">CRÍTICO</span>;
            case 'high': return <span className="text-[10px] bg-orange-500 text-black font-bold px-1.5 py-0.5 rounded-sm">ALTA</span>;
            case 'medium': return <span className="text-[10px] bg-amber-500 text-black font-bold px-1.5 py-0.5 rounded-sm">MÉDIA</span>;
            default: return <span className="text-[10px] bg-zinc-700 text-zinc-300 font-bold px-1.5 py-0.5 rounded-sm">ROTINA</span>;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className={`
                relative bg-black w-full max-w-3xl rounded-xl border-2 ${style.border} ${style.glow}
                shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all
            `}>
                
                {/* Background Scanlines (Igual ao MakerBot) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,6px_100%] pointer-events-none opacity-40"></div>

                {/* --- HEADER TIPO TERMINAL --- */}
                <div className="relative z-10 flex justify-between items-center p-3 border-b border-zinc-800 bg-zinc-900/90">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md border border-white/10 bg-black`}>
                            <Terminal size={16} className={style.text} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-100 font-mono tracking-wider">DIAGNOSTICS_PANEL // {printer.name.toUpperCase()}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">ID: {printer.id.slice(0,8)} | FW: 4.2.1</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors hover:bg-zinc-800 p-1.5 rounded">
                        <X size={18}/>
                    </button>
                </div>

                {/* --- CONTEÚDO PRINCIPAL --- */}
                <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-6">
                    
                    {/* Status Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {/* Box 1 */}
                        <div className="bg-zinc-950/50 border border-zinc-800 p-3 rounded-lg">
                            <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Status Geral</div>
                            <div className={`text-lg font-bold font-mono ${style.text} flex items-center gap-2`}>
                                {hasIssues ? <AlertTriangle size={18}/> : <CheckCircle2 size={18}/>}
                                {hasIssues ? "ATENÇÃO" : "NOMINAL"}
                            </div>
                        </div>
                        {/* Box 2 */}
                        <div className="bg-zinc-950/50 border border-zinc-800 p-3 rounded-lg">
                            <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Pendências</div>
                            <div className="text-lg font-bold text-white font-mono">{tasks.length} <span className="text-sm text-zinc-600">itens</span></div>
                        </div>
                        {/* Box 3 */}
                        <div className="bg-zinc-950/50 border border-zinc-800 p-3 rounded-lg">
                            <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Tempo Est.</div>
                            <div className="text-lg font-bold text-white font-mono">~{estimatedTimeMin}m</div>
                        </div>
                        {/* Box 4 */}
                        <div className="bg-zinc-950/50 border border-zinc-800 p-3 rounded-lg">
                            <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Horímetro</div>
                            <div className="text-lg font-bold text-white font-mono">{Math.floor(printer.totalHours)}h</div>
                        </div>
                    </div>

                    {/* Lista de Protocolos */}
                    {hasIssues ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                                <h4 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={14} /> Protocolos de Manutenção
                                </h4>
                                <span className="text-[10px] text-zinc-600 font-mono">PRIORIDADE ORDENADA</span>
                            </div>

                            {tasks.map((task, idx) => {
                                const Icon = task.icon;
                                const isCritical = task.severity === 'critical';
                                
                                return (
                                    <div key={idx} className={`
                                        group relative flex gap-4 p-4 rounded-lg border transition-all
                                        ${isCritical ? 'bg-rose-950/10 border-rose-900/40 hover:border-rose-700/50' : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'}
                                    `}>
                                        {/* Ícone Lateral */}
                                        <div className={`
                                            flex flex-col items-center justify-center w-12 h-12 rounded border shrink-0
                                            ${isCritical ? 'bg-rose-950/30 border-rose-900/50 text-rose-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}
                                        `}>
                                            <Icon size={20} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-3">
                                                    <h5 className={`text-sm font-bold ${isCritical ? 'text-rose-100' : 'text-zinc-200'}`}>
                                                        {task.label}
                                                    </h5>
                                                    {getSeverityBadge(task.severity)}
                                                </div>
                                                <span className={`text-xs font-mono font-bold ${isCritical ? 'text-rose-400' : 'text-zinc-500'}`}>
                                                    +{Math.floor(task.overdue)}h
                                                </span>
                                            </div>
                                            
                                            <p className="text-xs text-zinc-400 leading-relaxed font-mono border-l border-zinc-700 pl-3 py-1 mb-2">
                                                {task.action}
                                            </p>

                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className={`h-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} style={{width: '100%'}}></div>
                                                </div>
                                                <span className="text-[9px] text-zinc-600 font-mono uppercase">Vencido</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // Estado Vazio (Sucesso)
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-4 animate-pulse">
                                <CheckCircle2 size={40} className="text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white font-mono">SISTEMA 100% OPERACIONAL</h3>
                            <p className="text-zinc-500 text-xs mt-1 max-w-xs text-center">Nenhum protocolo de manutenção pendente. A unidade está pronta para produção.</p>
                        </div>
                    )}
                </div>

                {/* --- FOOTER DE AÇÃO --- */}
                <div className="relative z-10 p-4 border-t border-zinc-800 bg-black/80 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono">
                        <Clock size={12} />
                        <span>SESSÃO DIAGNÓSTICA ATIVA</span>
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            Cancelar
                        </button>
                        {hasIssues && (
                            <button 
                                onClick={() => { onResolve(printer.id); onClose(); }} 
                                className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all active:scale-95 group"
                            >
                                <Play size={12} fill="currentColor" className="group-hover:translate-x-0.5 transition-transform" />
                                Confirmar Reparo
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DiagnosticsModal;