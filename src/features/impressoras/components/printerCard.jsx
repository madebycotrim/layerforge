// --- FILE: src/features/impressoras/components/PrinterCard.jsx ---
import React from "react";
import {
    Printer, Wrench, Zap, Edit2, Trash2,
    RotateCcw, WifiOff, CheckCircle2, PauseCircle,
    AlertOctagon, Power, Factory, History, Coins, TrendingUp
} from "lucide-react";

/* ---------- HELPERS ---------- */
const calculateHealth = (printer) => {
    const total = Number(printer.totalHours) || 0;
    const last = Number(printer.lastMaintenanceHour) || 0;
    const interval = Number(printer.maintenanceInterval) || 300;

    const used = total - last;
    const remaining = Math.max(0, interval - used);
    const pct = Math.max(0, Math.min(100, 100 - ((used / interval) * 100)));

    return { remaining, pct, used };
};

const calculateFinance = (printer) => {
    const price = Number(printer.price) || 0;
    const yieldTotal = Number(printer.yieldTotal) || 0;

    if (price <= 0) return { roiPct: 0, isPaid: false, profit: 0 };

    const roiPct = Math.min(100, (yieldTotal / price) * 100);
    const isPaid = yieldTotal >= price;
    const profit = yieldTotal - price;

    return { roiPct, isPaid, profit, price, yieldTotal };
};

/* ---------- CONFIG DE STATUS ---------- */
const getStatusConfig = (status) => {
    const map = {
        idle: { label: "Ociosa", color: "#a1a1aa", tw: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/10", icon: Power },
        printing: { label: "Imprimindo", color: "#22d3ee", tw: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/10", icon: Printer, animate: true },
        paused: { label: "Pausada", color: "#fbbf24", tw: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/10", icon: PauseCircle },
        completed: { label: "Concluído", color: "#34d399", tw: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/10", icon: CheckCircle2 },
        maintenance: { label: "Manutenção", color: "#f43f5e", tw: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/10", icon: Wrench },
        error: { label: "Erro", color: "#f43f5e", tw: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/10", icon: AlertOctagon },
        offline: { label: "Offline", color: "#52525b", tw: "text-zinc-600", bg: "bg-zinc-800", border: "border-zinc-700", icon: WifiOff }
    };
    return map[status] || map.idle;
};

/* ---------- CARD PRINCIPAL ---------- */
export default function PrinterCard({ printer, onEdit, onDelete, onResetMaint, onToggleStatus, onViewHistory }) {
    if (!printer) return null;

    const { remaining, pct } = calculateHealth(printer);
    const { roiPct, isPaid, price, yieldTotal } = calculateFinance(printer);

    const statusConfig = getStatusConfig(printer.status);
    const StatusIcon = statusConfig.icon;

    const isCritical = pct < 20 || printer.status === 'error' || printer.status === 'maintenance';
    const mainColor = isCritical ? "#f43f5e" : statusConfig.color;

    return (
        <div className="group relative flex flex-col bg-[#09090b]/80 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:-translate-y-1 hover:bg-[#09090b]">

            {/* GLOW DE FUNDO */}
            <div
                className="absolute -top-[120px] -right-[120px] w-[250px] h-[250px] rounded-full blur-[90px] opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
                style={{ backgroundColor: mainColor }}
            />

            <div className="flex flex-1 relative z-10">

                {/* --- SIDEBAR ESQUERDA --- */}
                <div className="min-w-[100px] flex flex-col items-center pt-5 pb-4 bg-black/20 border-r border-white/5 relative shrink-0 px-2">

                    <div className="relative z-10 filter drop-shadow-xl mb-1">
                        <div className={`w-[64px] h-[64px] rounded-2xl flex items-center justify-center border bg-gradient-to-br from-white/5 to-transparent transition-colors duration-500 ${isCritical ? 'border-rose-500/30 shadow-[0_0_15px_-5px_rgba(244,63,94,0.3)]' : 'border-white/10'}`}>
                            <StatusIcon
                                size={32}
                                className={`${isCritical ? 'text-rose-500' : 'text-zinc-400'} ${statusConfig.animate ? 'animate-pulse' : ''}`}
                                strokeWidth={1.5}
                            />
                        </div>
                    </div>

                    <div className="h-6 w-px bg-white/5 my-0.5" />

                    {/* BOX MODELO/MARCA */}
                    <div className="w-full flex flex-col rounded bg-black/40 border border-white/5 shadow-sm overflow-hidden">
                        <div className="bg-white/5 py-1 px-1 text-center">
                            <span className="text-[10px] font-black text-zinc-300 block leading-tight tracking-wider uppercase break-words whitespace-normal">
                                {printer.model || "Modelo"}
                            </span>
                        </div>
                        <div className="py-1 px-1 flex justify-center items-center">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase text-center leading-none break-words w-full">
                                {printer.brand || "Marca"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- CONTEÚDO DIREITA --- */}
                <div className="flex-1 p-4 flex flex-col min-w-0">

                    {/* HEADER: Nome + Potência + Status */}
                    <div className="flex justify-between items-start mb-3 gap-2">
                        <h3 className="text-sm font-bold text-zinc-100 leading-tight line-clamp-2" title={printer.name}>
                            {printer.name}
                        </h3>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* POTÊNCIA (MOVIDO PARA CÁ) */}
                            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900/50 border border-zinc-800 text-zinc-500">
                                <Zap size={8} className="text-amber-500/80" />
                                <span className="text-[9px] font-mono font-bold">{printer.power}W</span>
                            </div>

                            {/* STATUS PILL */}
                            <button
                                onClick={() => onToggleStatus && onToggleStatus(printer)}
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all hover:brightness-110 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.tw}`}
                            >
                                <StatusIcon size={10} className={statusConfig.animate ? "animate-spin-slow" : ""} />
                                <span className="text-[10px] font-bold font-mono tracking-tight uppercase">
                                    {statusConfig.label}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* MANUTENÇÃO (Big Numbers) */}
                    <div className="mt-auto mb-2">
                        <div className="flex items-baseline gap-1 select-none">
                            <span className={`text-3xl font-black tracking-tighter ${isCritical ? "text-rose-500" : "text-white"}`}>
                                {Math.round(remaining)}
                            </span>
                            <span className="text-xs font-bold text-zinc-600 mb-1">h</span>
                            <span className="text-[10px] text-zinc-700 ml-auto font-mono self-end mb-1">
                                / {printer.maintenanceInterval}h
                            </span>
                        </div>
                    </div>

                    {/* BARRA DE PROGRESSO */}
                    <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                        <div
                            className="h-full relative transition-all duration-700 ease-out opacity-90"
                            style={{
                                width: `${pct}%`,
                                backgroundColor: mainColor,
                                boxShadow: `0 0 10px ${mainColor}40`,
                            }}
                        />
                    </div>

                    {/* ÁREA FINANCEIRA ou SAÚDE */}
                    {price > 0 ? (
                        <div className="pt-2 border-t border-white/5">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[9px] text-zinc-500 font-bold uppercase flex items-center gap-1">
                                    {isPaid ? <TrendingUp size={10} className="text-emerald-500" /> : <Coins size={10} />}
                                    {isPaid ? "Lucro Puro" : "Payback"}
                                </span>
                                <span className={`text-[9px] font-mono ${isPaid ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                                    {Math.round(roiPct)}%
                                </span>
                            </div>

                            <div className="relative h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${isPaid ? 'bg-emerald-500' : 'bg-sky-600'}`}
                                    style={{ width: `${roiPct}%` }}
                                />
                            </div>

                            <div className="flex justify-between mt-1">
                                <span className="text-[8px] font-mono text-zinc-600">
                                    Gerado: R${yieldTotal.toLocaleString('pt-BR', { notation: 'compact' })}
                                </span>
                                <span className="text-[8px] font-mono text-zinc-600">
                                    Custo: R${price.toLocaleString('pt-BR', { notation: 'compact' })}
                                </span>
                            </div>
                        </div>
                    ) : (
                        // Se não tiver financeiro, mostra a Saúde alinhada à direita
                        <div className="flex justify-end mt-1.5">
                            <span className={`text-[9px] font-mono font-bold ${isCritical ? "text-rose-500" : "text-zinc-500"}`}>
                                {Math.round(pct)}% Saúde
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="grid grid-cols-[1fr_40px_40px_40px] border-t border-white/5 bg-white/[0.02]">
                <button
                    onClick={() => onResetMaint(printer.id)}
                    className="flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all group/btn"
                >
                    <Wrench size={12} className="group-hover/btn:rotate-45 transition-transform text-zinc-500 group-hover:text-white" />
                    <span>Revisar</span>
                </button>

                <button
                    onClick={() => onViewHistory(printer)}
                    className="flex items-center justify-center text-zinc-600 hover:text-sky-400 hover:bg-white/5 transition-colors border-l border-white/5"
                    title="Histórico"
                >
                    <History size={12} />
                </button>

                <button
                    onClick={() => onEdit(printer)}
                    className="flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-white/5 transition-colors border-l border-white/5"
                    title="Editar"
                >
                    <Edit2 size={12} />
                </button>

                <button
                    onClick={() => onDelete(printer.id)}
                    className="flex items-center justify-center text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border-l border-white/5"
                    title="Excluir"
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    );
}