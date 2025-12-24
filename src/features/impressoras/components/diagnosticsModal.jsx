import React, { useMemo } from "react";
import { 
    X, Check, Wrench, Gauge
} from "lucide-react";
// Importação corrigida para o nome em Português
import { analisarSaudeImpressora } from "../logic/diagnostics"; 

const DiagnosticsModal = ({ printer, onClose, onResolve, completedTasks = new Set(), onToggleTask }) => {
    if (!printer) return null;
    
    // Garantindo tipagem numérica para as horas
    const horasTotaisSeguras = useMemo(() => Number(printer.horas_totais) || 0, [printer.horas_totais]);
    
    // Chamada da função com o novo nome
    const tarefas = useMemo(() => analisarSaudeImpressora(printer) || [], [printer]);
    
    const contagemCritica = useMemo(() => 
        tarefas.filter(t => t.severidade === 'critical').length, 
    [tarefas]);
    
    // Telemetria baseada nos campos PT-BR
    const telemetria = useMemo(() => [
        { name: "Bico e Hotend", atual: horasTotaisSeguras % 200, max: 200, unit: "h" },
        { name: "Eixos e Correias", atual: horasTotaisSeguras % 800, max: 800, unit: "h" },
        { name: "Coolers e Fans", atual: horasTotaisSeguras % 1500, max: 1500, unit: "h" },
    ], [horasTotaisSeguras]);

    const tema = contagemCritica > 0 ? 'rose' : tarefas.length > 0 ? 'amber' : 'emerald';
    const cores = {
        rose: { texto: 'text-rose-500', borda: 'border-rose-500/30', bg: 'bg-rose-500/10' },
        amber: { texto: 'text-amber-500', borda: 'border-amber-500/30', bg: 'bg-amber-500/10' },
        emerald: { texto: 'text-emerald-500', borda: 'border-emerald-500/30', bg: 'bg-emerald-500/10' }
    }[tema];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300 font-mono">
            <div className={`relative bg-[#050505] w-full max-w-5xl h-[85vh] rounded-xl border ${cores.borda} shadow-2xl flex flex-col overflow-hidden`}>
                
                <header className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded border ${cores.borda} ${cores.bg} ${cores.texto}`}>
                            <Wrench size={18} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Check-up de Manutenção</h2>
                            <p className="text-[11px] text-zinc-500 mt-0.5 tracking-tighter uppercase">Impressora: <span className="text-zinc-300">{printer.nome || "Sem nome"}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-600 hover:text-white transition-all"><X size={20} /></button>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <aside className="w-64 border-r border-white/5 p-6 space-y-8 bg-zinc-950/30">
                        <div className="space-y-6">
                            <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Gauge size={12} /> Saúde das Peças</h3>
                            {telemetria.map((t, i) => {
                                const percentual = Math.min(100, Math.max(0, (t.atual / t.max) * 100));
                                const restante = Math.max(0, t.max - t.atual);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-[8px] font-black mb-1.5 uppercase">
                                            <span className="text-zinc-500">{t.name}</span>
                                            <span className={percentual > 85 ? 'text-rose-500' : 'text-emerald-400'}>{restante.toFixed(0)}{t.unit} para revisão</span>
                                        </div>
                                        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${percentual > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                                style={{ width: `${100 - percentual}%` }} 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="pt-6 border-t border-white/5">
                            <span className="text-[8px] font-bold text-zinc-600 uppercase block mb-1">Tempo total de uso</span>
                            <span className="text-lg font-bold text-zinc-200">{Math.floor(horasTotaisSeguras)}h impressas</span>
                        </div>
                    </aside>

                    <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">O que precisa de atenção</h3>
                                <span className="text-[14px] font-black text-white">{completedTasks.size} de {tarefas.length} concluídos</span>
                            </div>

                            {tarefas.map((tarefa) => {
                                const concluida = completedTasks.has(tarefa.rotulo);
                                return (
                                    <div 
                                        key={tarefa.id} 
                                        onClick={() => onToggleTask && onToggleTask(tarefa.rotulo)} 
                                        className={`group flex items-center gap-5 p-5 rounded-lg border transition-all cursor-pointer ${concluida ? 'bg-emerald-500/5 border-emerald-500/10 opacity-40' : 'bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-500'}`}
                                    >
                                        <div className={`w-9 h-9 rounded border flex items-center justify-center transition-all ${concluida ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-zinc-800 bg-black text-zinc-700'}`}>
                                            {concluida ? <Check size={20} strokeWidth={4} /> : <span className="text-[10px] font-black">{tarefas.indexOf(tarefa) + 1}</span>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-[12px] font-black uppercase tracking-tight ${concluida ? 'text-emerald-500 line-through' : 'text-zinc-100'}`}>{tarefa.rotulo}</span>
                                                {tarefa.severidade === 'critical' && !concluida && <span className="text-[8px] font-black text-rose-500 uppercase px-2 py-0.5 rounded border border-rose-500/20 animate-pulse">Urgente</span>}
                                            </div>
                                            <p className="text-[10px] text-zinc-400 italic uppercase tracking-tighter">Ação: {tarefa.acao}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </main>
                </div>

                <footer className="px-8 py-5 border-t border-white/5 bg-black/60 flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {tarefas.map((t) => (
                            <div key={t.id} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${completedTasks.has(t.rotulo) ? 'bg-emerald-500' : 'bg-zinc-900'}`} />
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2.5 text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-all tracking-widest">CANCELAR</button>
                        <button 
                            disabled={tarefas.length > 0 && completedTasks.size < tarefas.length}
                            onClick={() => onResolve && onResolve(printer.id)} 
                            className={`px-10 py-3 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all ${completedTasks.size === tarefas.length && tarefas.length > 0 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-700 cursor-not-allowed border border-white/5'}`}
                        >
                            Finalizar manutenção e zerar horas
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DiagnosticsModal;