import React, { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import {
    Calculator, Printer, History, TrendingUp, Zap,
    Package, Activity, Wrench, ChevronRight, 
    DollarSign, Plus, Cpu, Box, 
    BarChart3, AlertCircle, Clock, LayoutDashboard,
    Thermometer, Droplets, ShieldCheck, Settings 
} from 'lucide-react';

// Layout & Lógica
import MainSidebar from "../components/MainSidebar";
import { useLocalWeather } from "../hooks/useLocalWeather";
import { usePrinterStore } from "../features/impressoras/logic/store";
import { useFilamentStore } from "../features/filamentos/logic/store"; // Assumindo que o store de filamentos segue o padrão D1
import { analisarSaudeImpressora } from "../features/impressoras/logic/diagnostics";
import { formatCurrency } from "../hooks/useFormat";

// Componentes Visuais
import SpoolSideView from "../features/filamentos/components/roloFilamento";

// --- COMPONENTE DE CARD DE STATUS ---
const TechStatCard = ({ title, value, icon: Icon, colorClass, secondaryLabel, secondaryValue }) => (
    <div className="group relative h-[140px] p-6 rounded-2xl bg-[#09090b] border border-zinc-800/50 overflow-hidden flex flex-col justify-between transition-all hover:border-sky-500/20 shadow-2xl">
        <div className="relative z-10 flex justify-between items-start">
            <div className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner ${colorClass}`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div className="text-right">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.15em] mb-1.5">{title}</p>
                <h3 className="text-2xl font-black text-zinc-100 font-mono tracking-tighter leading-none">{value}</h3>
            </div>
        </div>
        <div className="relative z-10 pt-4 border-t border-white/5 flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-none mb-1">{secondaryLabel}</span>
                <span className="text-[11px] font-bold text-zinc-400 font-mono leading-none">{secondaryValue}</span>
            </div>
            <div className="h-1 w-8 bg-zinc-900 rounded-full overflow-hidden">
                <div className={`h-full bg-current ${colorClass} opacity-30 animate-pulse`} style={{ width: '60%' }}></div>
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const [sidebarWidth, setSidebarWidth] = useState(72);
    const { temp, humidity, loading: weatherLoading } = useLocalWeather();

    // Consumo dos Stores Globais (D1)
    const { printers, fetchPrinters } = usePrinterStore();
    const { filamentos, fetchFilamentos } = useFilamentStore();

    useEffect(() => {
        fetchPrinters();
        if (fetchFilamentos) fetchFilamentos();
    }, [fetchPrinters, fetchFilamentos]);

    // Inteligência de Dados da Farm
    const stats = useMemo(() => {
        const listaPrinters = Array.isArray(printers) ? printers : [];
        const listaFilamentos = Array.isArray(filamentos) ? filamentos : [];

        const ativas = listaPrinters.filter(p => p.status === 'printing').length;
        const baixo = listaFilamentos.filter(f => (Number(f.peso_atual) / Number(f.peso_total)) < 0.2).length;
        
        const ganhos = listaPrinters.reduce((acc, p) => acc + (Number(p.yieldTotal) || 0), 0);
        
        // Estimativa de gasto elétrico (apenas máquinas rodando)
        const consumoWatts = listaPrinters
            .filter(p => p.status === 'printing')
            .reduce((acc, p) => acc + (Number(p.power) || 0), 0);
        const gastoEst = (consumoWatts / 1000) * 0.85; // Simulação simples por hora

        // Busca primeira impressora com manutenção crítica
        const maintPendente = listaPrinters.find(p => analisarSaudeImpressora(p).some(i => i.severidade === 'critical'));

        return { ativas, baixo, ganhos, gastoEst, maintPendente };
    }, [printers, filamentos]);

    return (
        <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setSidebarWidth(collapsed ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300" style={{ marginLeft: `${sidebarWidth}px` }}>
                
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {/* --- HEADER --- */}
                <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-40 relative">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 leading-none mb-1.5">Painel de Controle da Farm</h1>
                            <div className="flex items-center gap-4 text-[10px] font-bold">
                                <span className="flex items-center gap-1.5 text-emerald-500 uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Monitoramento Ativo
                                </span>
                                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                <span className="text-zinc-500 uppercase tracking-tighter">
                                    {weatherLoading ? "ATUALIZANDO..." : `${temp}°C na oficina • ${humidity}% de umidade (Bom para os rolos)`}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sky-500 shadow-inner">
                            <LayoutDashboard size={20} />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
                    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

                        {/* ROW 1: STATUS DA PRODUÇÃO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <TechStatCard title="Ganhos Totais" value={formatCurrency(stats.ganhos)} icon={DollarSign} colorClass="text-emerald-500" secondaryLabel="Acumulado Farm" secondaryValue="LUCRO BRUTO" />
                            <TechStatCard title="Impressoras Rodando" value={stats.ativas.toString().padStart(2, '0')} icon={Printer} colorClass="text-sky-500" secondaryLabel="Estado da Farm" secondaryValue="IMPRIMINDO" />
                            <TechStatCard title="Filamentos no Fim" value={stats.baixo.toString().padStart(2, '0')} icon={AlertCircle} colorClass="text-rose-500" secondaryLabel="Nível de Material" secondaryValue="REPOR ESTOQUE" />
                            <TechStatCard title="Gasto de Energia" value={formatCurrency(stats.gastoEst)} icon={Zap} colorClass="text-amber-500" secondaryLabel="Custo/Hora Ativa" secondaryValue="ESTIMATIVA" />
                        </div>

                        {/* ROW 2: MONITORAMENTO CENTRAL */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 py-2">
                                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sky-500 shadow-inner">
                                        <Activity size={16} />
                                    </div>
                                    <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-100">Fila de Impressão</h2>
                                    <div className="h-[1px] bg-gradient-to-r from-zinc-800 to-transparent flex-1 mx-4" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {printers.slice(0, 4).map(printer => (
                                        <div key={printer.id} className="p-5 bg-[#09090b] border border-zinc-800/50 rounded-2xl flex items-center gap-5 group hover:border-sky-500/30 transition-all">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${printer.status === 'printing' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                                                <Printer size={24} className={printer.status === 'printing' ? 'animate-pulse' : ''} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-black text-zinc-200 uppercase truncate">{printer.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${printer.status === 'printing' ? 'bg-sky-500/10 border-sky-500/20 text-sky-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                                        {printer.status === 'printing' ? 'TRABALHANDO' : 'LIVRE'}
                                                    </span>
                                                </div>
                                            </div>
                                            {printer.status === 'printing' && (
                                                <div className="text-right">
                                                    <span className="text-[10px] font-mono font-black text-sky-500">Ativa</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                    <Link href="/calculadora" className="p-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl flex items-center justify-between group transition-all shadow-lg shadow-sky-900/20">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase opacity-60">Novo</span>
                                            <span className="text-xs font-black uppercase tracking-widest">Orçar Peça</span>
                                        </div>
                                        <Calculator size={20} />
                                    </Link>
                                    <Link href="/historico" className="p-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-between group transition-all">
                                        <span className="text-xs font-black uppercase tracking-widest text-zinc-300">Pedidos Salvos</span>
                                        <History size={20} className="text-zinc-600" />
                                    </Link>
                                    <Link href="/configuracoes" className="p-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-between group transition-all">
                                        <span className="text-xs font-black uppercase tracking-widest text-zinc-300">Ajustes da Oficina</span>
                                        <Settings size={20} className="text-zinc-600" />
                                    </Link>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 py-2">
                                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-500 shadow-inner">
                                        <Box size={16} />
                                    </div>
                                    <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-100">Rack de Materiais</h2>
                                </div>

                                <div className="bg-[#09090b] border border-zinc-800/50 rounded-[2rem] p-6 space-y-4 shadow-2xl">
                                    {filamentos.slice(0, 5).map(f => {
                                        const pesoAtual = Number(f.peso_atual || 0);
                                        const pesoTotal = Number(f.peso_total || 1000);
                                        const pct = Math.round((pesoAtual / pesoTotal) * 100);
                                        return (
                                            <div key={f.id} className="flex items-center gap-4 group">
                                                <div className="scale-75 -ml-2">
                                                    <SpoolSideView color={f.cor_hex || f.cor} percent={pct} size={36} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[10px] font-bold text-zinc-300 truncate uppercase">{f.nome}</span>
                                                        <span className={`text-[9px] font-mono font-bold ${pct < 20 ? 'text-rose-500' : 'text-zinc-500'}`}>{pesoAtual}g</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                                                        <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: f.cor_hex || f.cor }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <Link href="/filamentos" className="block w-full">
                                        <button className="w-full mt-4 py-3 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl text-[9px] font-black text-zinc-500 uppercase hover:text-zinc-200 transition-all">
                                            Ver estoque completo
                                        </button>
                                    </Link>
                                </div>

                                {/* ALERTAS DE MANUTENÇÃO TÉCNICA DINÂMICO */}
                                {stats.maintPendente ? (
                                    <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3">
                                        <div className="flex items-center gap-2 text-rose-500">
                                            <Wrench size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Manutenção Necessária</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-zinc-400 uppercase">
                                            Revisão urgente na <span className="text-white">{stats.maintPendente.name}</span>
                                        </p>
                                        <div className="h-0.5 bg-zinc-800 w-full rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-500 w-full animate-pulse" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-500">
                                            <ShieldCheck size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Sistemas OK</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-zinc-400 uppercase">Todas as máquinas revisadas</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* FOOTER */}
                <footer className="h-10 px-8 flex items-center justify-between border-t border-white/5 bg-black/40 text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                    <span>Central PrintLog // Versão 2026.12</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><Zap size={10} /> Monitoramento de Energia Ativo</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck size={10} /> Dados Protegidos</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}