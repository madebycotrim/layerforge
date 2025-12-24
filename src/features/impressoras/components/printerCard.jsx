import React from "react";
import {
    Printer, Wrench, Zap, Edit2, Trash2,
    WifiOff, CheckCircle2, PauseCircle,
    AlertOctagon, Power, History, TrendingUp,
    Target, Activity
} from "lucide-react";

// Importando sua lógica avançada
import { calcularFinanceiroAvancado } from "../logic/diagnostics";

/* ---------- CÁLCULO DE SAÚDE (UI) ---------- */
const calculateHealthUI = (printer) => {
    const total = Number(printer.horas_totais) || 0;
    const last = Number(printer.ultima_manutencao_hora) || 0;
    // Pega o intervalo do banco ou usa 300 como padrão
    const interval = Number(printer.intervalo_manutencao) || 300;
    
    const usedSinceLast = Math.max(0, total - last);
    const remaining = Math.max(0, interval - usedSinceLast);
    const pct = Math.max(0, Math.min(100, (remaining / interval) * 100));
    
    return { remaining, pct };
};

const getStatusConfig = (status) => {
    const map = {
        idle: { label: "Livre", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20", icon: Power },
        printing: { label: "Imprimindo", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: Printer, animate: true },
        paused: { label: "Pausada", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: PauseCircle },
        completed: { label: "Pronta", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
        maintenance: { label: "Manutenção", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: Wrench },
        error: { label: "Erro na máquina", color: "text-rose-600", bg: "bg-rose-600/10", border: "border-rose-600/30", icon: AlertOctagon },
        offline: { label: "Desconectada", color: "text-zinc-600", bg: "bg-zinc-800/50", border: "border-zinc-700/50", icon: WifiOff }
    };
    return map[status] || map.idle;
};

export default function PrinterCard({ printer, onEdit, onDelete, onResetMaint, onToggleStatus, onViewHistory }) {
    if (!printer) return null;

    // 1. Usando sua nova lógica financeira (Rendimento - [Energia + Depreciação])
    const { roiPct, pago, custoOperacional } = calcularFinanceiroAvancado(printer);
    
    // 2. Cálculo de saúde para a barra de progresso
    const { remaining, pct } = calculateHealthUI(printer);
    
    const statusConfig = getStatusConfig(printer.status);
    const StatusIcon = statusConfig.icon;
    const isCritical = pct < 20 || printer.status === 'error' || printer.status === 'maintenance';

    // 3. Mapeamento direto dos campos do D1 (vinitos do Store adaptado)
    const printerHistory = Array.isArray(printer.historico) ? printer.historico : [];

    return (
        <div className={`group relative flex flex-col bg-[#0a0a0c] border ${isCritical ? 'border-rose-900/40 shadow-[0_0_25px_rgba(244,63,94,0.05)]' : 'border-zinc-800/50'} rounded-xl overflow-hidden transition-all duration-300 hover:border-zinc-600 hover:shadow-2xl`}>
            
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] z-0" />

            <div className="flex flex-1 relative z-10">
                {/* --- LADO ESQUERDO: ÍCONE E MARCA --- */}
                <div className="w-[80px] flex flex-col items-center pt-4 pb-4 bg-zinc-950/50 border-r border-white/5 relative">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-all duration-500 ${isCritical ? 'bg-rose-500/10 border-rose-500/40' : 'bg-zinc-900 border-zinc-800'}`}>
                        <StatusIcon size={24} className={`${isCritical ? 'text-rose-500' : statusConfig.color} ${statusConfig.animate ? 'animate-pulse' : ''}`} />
                    </div>
                    
                    <div className="mt-4 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">FARM ID</span>
                        <span className="text-[9px] font-mono text-zinc-400">#{printer.id?.slice(-4).toUpperCase()}</span>
                    </div>

                    <div className="mt-auto rotate-180 flex items-center" style={{ writingMode: 'vertical-rl' }}>
                        <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">{printer.marca}</span>
                    </div>
                </div>

                {/* --- CONTEÚDO PRINCIPAL --- */}
                <div className="flex-1 p-5 flex flex-col min-w-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className="min-w-0">
                            <h3 className="text-sm font-black text-zinc-100 uppercase truncate pr-2 tracking-tight">
                                {printer.nome}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-mono text-zinc-500 uppercase">{printer.modelo}</span>
                                <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                <div className="flex items-center gap-1">
                                    <Zap size={8} className="text-amber-500" />
                                    <span className="text-[9px] font-mono text-zinc-500">{printer.potencia}W</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => onToggleStatus && onToggleStatus(printer.id, printer.status)}
                            className={`px-2 py-1 rounded border text-[9px] font-black uppercase transition-all hover:scale-105 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
                        >
                            {statusConfig.label}
                        </button>
                    </div>

                    {/* BARRA DE MANUTENÇÃO */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-zinc-600 uppercase mb-1 flex items-center gap-1">
                                    <Activity size={8} /> Revisão em:
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl font-mono font-black tracking-tighter ${isCritical ? "text-rose-500" : "text-white"}`}>
                                        {Math.round(remaining).toString().padStart(3, '0')}
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-600">H</span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-[9px] font-mono font-bold text-zinc-500">{Math.round(pct)}% SAÚDE</span>
                            </div>
                        </div>

                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${pct}%` }} 
                            />
                        </div>
                    </div>

                    {/* FINANCEIRO AVANÇADO (DADOS DO D1) */}
                    <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-zinc-600 uppercase mb-1 flex items-center gap-1">
                                <History size={8} /> Produção
                            </span>
                            <span className="text-[10px] font-mono font-bold text-zinc-300">
                                {printerHistory.length} ODS CONCLUÍDAS
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-bold text-zinc-600 uppercase mb-1 flex items-center gap-1">
                                <TrendingUp size={8} className={pago ? "text-emerald-500" : "text-zinc-600"} /> ROI LÍQUIDO
                            </span>
                            <span className={`text-[10px] font-mono font-bold ${pago ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                {Math.round(roiPct)}% {pago ? '• PAGA' : ''}
                            </span>
                            <span className="text-[7px] text-zinc-700 font-bold uppercase">Custo: R$ {custoOperacional}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AÇÕES INFERIORES */}
            <div className="grid grid-cols-[1fr_repeat(3,44px)] h-10 border-t border-white/5 bg-zinc-950/80">
                <button
                    onClick={() => onResetMaint && onResetMaint(printer)}
                    className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all group/btn"
                >
                    <Target size={12} className="group-hover/btn:scale-110 transition-transform" />
                    Manutenção Preventiva
                </button>

                {[
                    { icon: History, action: () => onViewHistory && onViewHistory(printer), color: "hover:text-cyan-400", title: "Histórico" },
                    { icon: Edit2, action: () => onEdit && onEdit(printer), color: "hover:text-amber-400", title: "Editar" },
                    { icon: Trash2, action: () => onDelete && onDelete(printer.id), color: "hover:text-rose-500", title: "Excluir" }
                ].map((btn, i) => (
                    <button
                        key={i}
                        onClick={btn.action}
                        title={btn.title}
                        className={`flex items-center justify-center border-l border-white/5 text-zinc-600 ${btn.color} hover:bg-white/5 transition-all`}
                    >
                        <btn.icon size={14} />
                    </button>
                ))}
            </div>
        </div>
    );
}