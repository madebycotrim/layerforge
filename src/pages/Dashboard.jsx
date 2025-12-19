// --- START OF FILE src/pages/Home.jsx ---

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import {
    Calculator, Printer, History, TrendingUp, Zap,
    Package, Thermometer, Activity, Droplets, Wrench,
    Play, Pause, AlertTriangle, ChevronRight, DollarSign, Plus
} from "lucide-react";

// Layout & Logic
import MainSidebar from "../components/MainSidebar";
import { useLocalWeather } from "../hooks/useLocalWeather";
import { getFilaments } from "../features/filamentos/logic/filaments";

// Components
import SpoolSideView from "../features/filamentos/components/roloFilamento";

// --- COMPONENTES LOCAIS DA HOME ---

const StatCard = ({ label, value, icon: Icon, trend, colorClass }) => (
    <div className="bg-[#09090b]/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all group relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform scale-150 -translate-y-2 translate-x-2 ${colorClass}`}>
            <Icon size={80} />
        </div>

        <div className="flex justify-between items-start mb-2 relative z-10">
            <div className={`p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 ${colorClass}`}>
                <Icon size={18} />
            </div>
            {trend && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <TrendingUp size={10} /> {trend}
                </span>
            )}
        </div>
        <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white font-mono tracking-tight">{value}</h3>
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mt-1">{label}</p>
        </div>
    </div>
);

const ActionShortcut = ({ label, icon: Icon, to, subtext, color = "text-zinc-400" }) => (
    <Link href={to}>
        <div className="bg-[#09090b]/60 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer group h-full relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-${color.split('-')[1]}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:scale-110 transition-all shadow-inner">
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{label}</h4>
                <p className="text-[10px] text-zinc-600 group-hover:text-zinc-500 transition-colors">{subtext}</p>
            </div>
            <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-colors" />
        </div>
    </Link>
);

export default function Home() {
    // --- ESTADO ---
    const [sidebarWidth, setSidebarWidth] = useState(72);
    const [filamentos, setFilamentos] = useState([]);

    // Hook externo (genérico)
    const { temp, humidity, loading } = useLocalWeather();

    // --- CARREGAMENTO DE DADOS ---
    useEffect(() => {
        const dados = getFilaments();
        setFilamentos(dados);
    }, []);

    // --- CÁLCULOS MEMOIZADOS ---

    // Lista para exibição (Top 4 mais vazios)
    const displayFilaments = useMemo(() => {
        return [...filamentos]
            .sort((a, b) => (a.weightCurrent / a.weightTotal) - (b.weightCurrent / b.weightTotal))
            .slice(0, 4);
    }, [filamentos]);

    // Contagem de estoque baixo
    const lowStockCount = useMemo(() => {
        return filamentos.filter(f => (f.weightCurrent / f.weightTotal) < 0.2).length;
    }, [filamentos]);

    return (
        <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden selection:bg-sky-500/30">

            <MainSidebar onCollapseChange={(collapsed) => setSidebarWidth(collapsed ? 72 : 256)} />

            <main
                className="flex-1 flex flex-col relative transition-all duration-300"
                style={{ marginLeft: `${sidebarWidth}px` }}
            >
                {/* Background Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                {/* --- HEADER --- */}
                <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-md z-20 sticky top-0">
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            Dashboard
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide">Sistema Online</span>
                            </div>
                        </h1>
                        <p className="text-xs text-zinc-500 mt-0.5">Visão geral da sua produção</p>
                    </div>

                    {/* WIDGET CLIMA */}
                    <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                            <Thermometer size={14} className="text-amber-500" />
                            {loading ? <span className="animate-pulse">--</span> : <span>{temp}°C</span>}
                        </div>
                        <div className="w-px h-3 bg-zinc-800"></div>
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                            <Droplets size={14} className="text-sky-500" />
                            {loading ? <span className="animate-pulse">--</span> : <span>{humidity}%</span>}
                        </div>
                    </div>
                </header>

                {/* --- CONTEÚDO --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 z-10">
                    <div className="max-w-[1600px] mx-auto space-y-8">

                        {/* 1. STATUS CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="Faturamento (Mês)" value="R$ 1.240" icon={DollarSign} trend="+12%" colorClass="text-emerald-500" />
                            <StatCard label="Projetos Ativos" value="03" icon={Printer} colorClass="text-sky-500" />
                            <StatCard label="Custo Energia" value="R$ 84,20" icon={Zap} colorClass="text-amber-500" />
                            <StatCard label="Estoque Baixo" value={lowStockCount} icon={AlertTriangle} colorClass="text-rose-500" />
                        </div>

                        {/* 2. MAIN GRID */}
                        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8">

                            {/* COLUNA ESQUERDA: AÇÕES & WORKSTATION */}
                            <div className="flex flex-col gap-6">

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ActionShortcut label="Novo Orçamento" subtext="Calcular preço e lucro" icon={Calculator} to="/calculadora" color="text-sky-500" />
                                    <ActionShortcut label="Registrar Impressão" subtext="Baixa automática de estoque" icon={Play} to="/filamentos" color="text-emerald-500" />
                                    <ActionShortcut label="Histórico Completo" subtext="Ver logs e falhas" icon={History} to="/historico" color="text-purple-500" />
                                </div>

                                {/* Workstation Status */}
                                <div className="bg-[#09090b]/60 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
                                    <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                                        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={14} className="text-sky-500" /> Fila de Produção
                                        </h3>
                                        <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-500">
                                            Farm Status: Ativa
                                        </span>
                                    </div>

                                    <div className="divide-y divide-zinc-800/50">
                                        {/* Máquina 1 - Ativa */}
                                        <div className="p-4 flex flex-col md:flex-row items-center gap-4 hover:bg-zinc-900/30 transition-colors group">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                                <Printer size={20} className="text-emerald-500" />
                                            </div>
                                            <div className="flex-1 min-w-0 text-center md:text-left">
                                                <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                                                    <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">Bambu Lab X1C</h4>
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                                                        Imprimindo
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-500 font-mono truncate">Job: suporte_headset_v2.gcode • ABS Cinza</p>
                                            </div>
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <div className="flex-1 md:w-32">
                                                    <div className="flex justify-between text-[10px] text-zinc-500 mb-1 font-bold">
                                                        <span>65%</span>
                                                        <span className="text-zinc-600">-32m</span>
                                                    </div>
                                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[65%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                                                    </div>
                                                </div>
                                                <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                                                    <Pause size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Máquina 2 - Livre */}
                                        <div className="p-4 flex flex-col md:flex-row items-center gap-4 hover:bg-zinc-900/30 transition-colors group">
                                            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-600">
                                                <Printer size={20} />
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                                                    <h4 className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300">Ender 3 V2</h4>
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800 text-zinc-500 border border-zinc-700 uppercase">
                                                        Ociosa
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-600">Aguardando novo projeto...</p>
                                            </div>
                                            <div className="w-full md:w-auto">
                                                <Link href="/calculadora">
                                                    <button className="w-full md:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2">
                                                        <Plus size={14} /> Iniciar Job
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* COLUNA DIREITA: ESTOQUE E MANUTENÇÃO */}
                            <div className="flex flex-col gap-6">

                                {/* INVENTÁRIO */}
                                <div className="bg-[#09090b]/60 border border-zinc-800 rounded-2xl flex flex-col flex-1 overflow-hidden min-h-[400px]">
                                    <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                                        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                            <Package size={14} className="text-sky-500" /> Resumo Estoque
                                        </h3>
                                        <Link href="/filamentos">
                                            <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-sky-500 hover:border-sky-500/50 transition-all cursor-pointer">
                                                <Plus size={12} />
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                        {displayFilaments.length > 0 ? (
                                            displayFilaments.map((item) => {
                                                const percent = Math.round((item.weightCurrent / item.weightTotal) * 100);
                                                const isBaixo = percent < 20;

                                                return (
                                                    <div key={item.id} className="group bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700 rounded-xl p-2.5 flex items-center gap-4 transition-all hover:bg-zinc-900">
                                                        <div className="scale-75 -ml-1">
                                                            <SpoolSideView color={item.color} percent={percent} type={item.type} />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-zinc-300 truncate group-hover:text-white transition-colors">{item.name}</h4>
                                                                    <p className="text-[9px] text-zinc-500 uppercase font-bold">{item.brand}</p>
                                                                </div>
                                                                {isBaixo && (
                                                                    <AlertTriangle size={12} className="text-rose-500 animate-pulse" />
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2 mt-2">
                                                                <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${isBaixo ? 'bg-rose-500' : 'bg-sky-500'}`}
                                                                        style={{ width: `${percent}%`, backgroundColor: isBaixo ? '#f43f5e' : item.color }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-[9px] font-mono text-zinc-500">{item.weightCurrent}g</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50 gap-2">
                                                <Package size={24} />
                                                <p className="text-xs">Estoque vazio</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* MANUTENÇÃO */}
                                <div className="bg-[#09090b]/60 border border-zinc-800 rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                        <Wrench size={14} /> Próximas Manutenções
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10 group cursor-pointer hover:bg-rose-500/10 transition-colors">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-rose-200 group-hover:text-white">Lubrificar Eixo Z</p>
                                                <p className="text-[9px] text-rose-400/70">Ender 3 V2 • Atrasado 10h</p>
                                            </div>
                                            <button className="text-[9px] font-bold text-rose-500 border border-rose-500/30 px-2 py-1 rounded hover:bg-rose-500 hover:text-white transition-colors">
                                                FEITO
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:bg-zinc-900 hover:border-zinc-800 transition-colors">
                                            <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-zinc-400">Limpeza Nozzle</p>
                                                <p className="text-[9px] text-zinc-600">Bambu X1C • Em 45h</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}