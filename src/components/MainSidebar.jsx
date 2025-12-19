// --- FILE: src/components/layout/MainSidebar.jsx ---

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
    LayoutGrid, Calculator, Package, History, Settings,
    Printer, HelpCircle, LogOut, ChevronLeft, ChevronRight,
    AlertTriangle, Zap
} from "lucide-react";

import logo from "../assets/logo.png";
import logoBranca from "../assets/logo-branca.png";
    
// Dados
import { getFilaments } from "../features/filamentos/logic/filaments";
import { getPrinters } from "../features/impressoras/logic/printers";

/* ─────────────────────────────────────────────── */
/* ESTILOS EXTRAS (SCROLLBAR HIDDEN) */
/* ─────────────────────────────────────────────── */
const scrollbarStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

/* ─────────────────────────────────────────────── */
/* SUBCOMPONENTES */
/* ─────────────────────────────────────────────── */

const SidebarSection = ({ title, collapsed }) => (
    <div
        className={`px-6 mt-6 mb-2 transition-all duration-300 flex items-center
        ${collapsed ? "hidden" : "opacity-100"}`} // Oculta totalmente quando fechado para economizar espaço
    >
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono whitespace-nowrap">
            {title}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent ml-3 opacity-50" />
    </div>
);

const SidebarItem = ({
    href,
    icon: Icon,
    label,
    collapsed,
    badge
}) => {
    const [location] = useLocation();
    const isActive = location === href || (href !== "/" && location.startsWith(href));

    return (
        <Link href={href}>
            {/* Container Principal */}
            <div className={`relative group cursor-pointer my-1 transition-all duration-300 ${collapsed ? "px-0 flex justify-center" : "px-3"}`}>

                {/* --- FUNDO ATIVO --- */}
                <div
                    className={`
                        absolute inset-y-0 transition-all duration-300 ease-out border rounded-lg
                        ${collapsed
                            ? "left-2 right-2 rounded-xl"  // Quadrado arredondado no centro quando colapsado
                            : "left-3 right-2"             // Retângulo largo quando expandido
                        }
                        ${isActive
                            ? "bg-gradient-to-r from-sky-500/10 to-transparent border-sky-500/10"
                            : "bg-transparent border-transparent group-hover:bg-zinc-800/40"
                        }
                    `}
                />

                {/* --- INDICADOR GLOW (Só aparece expandido ou como ponto sutil colapsado) --- */}
                {!collapsed && (
                    <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full transition-all duration-300
                        ${isActive
                                ? "bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.8)] opacity-100"
                                : "bg-transparent opacity-0"
                            }`}
                    />
                )}

                {/* --- CONTEÚDO DO ITEM --- */}
                <div
                    className={`
                        relative flex items-center h-10 transition-all duration-200
                        ${collapsed ? "justify-center w-10" : "px-3 w-full"}
                    `}
                >

                    {/* ÍCONE WRAPPER */}
                    <div className="relative flex items-center justify-center">
                        <Icon
                            size={20}
                            strokeWidth={isActive ? 2 : 1.5}
                            className={`transition-colors duration-300 ${isActive ? "text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" : "text-zinc-500 group-hover:text-zinc-300"}`}
                        />

                        {/* --- BADGE (BOLINHA DE AVISO MELHORADA) --- */}
                        {badge && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                                {/* Animação de Ping */}
                                {!collapsed && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>}

                                {/* O Ponto Sólido com Borda (Cutout Effect) */}
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 ring-[3px] ring-[#050505]"></span>
                            </span>
                        )}
                    </div>

                    {/* TEXTO (EXPANDIDO) */}
                    <div
                        className={`ml-3 flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap transition-all duration-300
                        ${collapsed ? "w-0 opacity-0 translate-x-10 absolute pointer-events-none" : "w-auto opacity-100 translate-x-0"}`}
                    >
                        <span className={`text-[13px] ${isActive ? "font-bold text-zinc-100 tracking-wide" : "font-medium text-zinc-400 group-hover:text-zinc-200"}`}>
                            {label}
                        </span>
                    </div>
                </div>

                {/* TOOLTIP (APENAS QUANDO COLAPSADO) */}
                {collapsed && (
                    <div
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-[60] pointer-events-none
                        opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0"
                    >
                        <div className="bg-[#09090b] border border-zinc-700 text-zinc-200 text-xs font-bold px-3 py-1.5 rounded-md shadow-2xl whitespace-nowrap flex items-center gap-2">
                            {label}
                            {badge && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

/* ─────────────────────────────────────────────── */
/* MAIN SIDEBAR */
/* ─────────────────────────────────────────────── */

export default function MainSidebar({ onCollapseChange }) {
    const [collapsed, setCollapsed] = useState(false);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [maintAlertCount, setMaintAlertCount] = useState(0);

    useEffect(() => {
        if (onCollapseChange) onCollapseChange(collapsed);
    }, [collapsed, onCollapseChange]);

    useEffect(() => {
        const checkSystemStatus = () => {
            try {
                const filaments = getFilaments();
                setLowStockCount(filaments.filter(f => {
                    const total = Number(f.weightTotal) || 1000;
                    const current = Number(f.weightCurrent) || 0;
                    return current / total < 0.2;
                }).length);

                const printers = getPrinters();
                setMaintAlertCount(printers.filter(p => {
                    const total = Number(p.totalHours) || 0;
                    const last = Number(p.lastMaintenanceHour) || 0;
                    const interval = Number(p.maintenanceInterval) || 300;
                    return interval > 0 && (total - last) / interval >= 0.9;
                }).length);
            } catch (e) { console.error(e); }
        };
        checkSystemStatus();
        const i = setInterval(checkSystemStatus, 5000);
        return () => clearInterval(i);
    }, []);

    return (
        <>
            <style>{scrollbarStyles}</style>
            <aside
                className={`fixed left-0 top-0 h-screen bg-[#050505] border-r border-zinc-800/60 z-50
                flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                ${collapsed ? "w-[72px]" : "w-64"}`}
            >
                {/* --- HEADER --- */}
                <div className={`h-20 flex items-center shrink-0 relative mb-2 transition-all duration-300 ${collapsed ? "justify-center" : "px-6"}`}>

                    {/* Logo & Texto (Expandido) */}
                    <div className={`flex items-center gap-3 transition-all duration-300 absolute left-6 ${collapsed ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"}`}>
                        <div className="relative w-8 h-8 group">
                            <img src={logo} alt="LF" className="w-8 h-8 object-contain relative z-10" />
                            <div className="absolute inset-0 bg-sky-500/30 blur-md rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-tight leading-none">LayerForge</h1>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Zap size={8} className="text-sky-500 fill-current" />
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Control Center</span>
                            </div>
                        </div>
                    </div>

                    {/* Logo Central (Colapsado) */}
                    <div className={`transition-all duration-500 ${collapsed ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
                        <img src={logoBranca} alt="LF" className="w-8 h-8 object-contain" />
                    </div>

                    {/* BOTÃO TOGGLE */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#050505]
                        border border-zinc-700 rounded-full flex items-center justify-center
                        text-zinc-400 hover:text-white hover:border-sky-500 hover:shadow-[0_0_10px_rgba(14,165,233,0.4)]
                        transition-all z-50 group"
                    >
                        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                    </button>
                </div>

                {/* --- NAV (Com Scrollbar Oculta) --- */}
                <div className="flex-1 py-2 overflow-y-auto no-scrollbar space-y-1">
                    <SidebarItem href="/dashboard" icon={LayoutGrid} label="Dashboard" collapsed={collapsed} />
                    <SidebarItem href="/calculadora" icon={Calculator} label="Calculadora" collapsed={collapsed} />
                    <SidebarItem href="/historico" icon={History} label="Histórico" collapsed={collapsed} />

                    <SidebarSection title="Fábrica" collapsed={collapsed} />

                    <SidebarItem
                        href="/filamentos"
                        icon={Package}
                        label="Filamentos"
                        collapsed={collapsed}
                        badge={lowStockCount > 0}
                    />

                    <SidebarItem
                        href="/impressoras"
                        icon={Printer}
                        label="Impressoras"
                        collapsed={collapsed}
                        badge={maintAlertCount > 0}
                    />

                    <SidebarSection title="Sistema" collapsed={collapsed} />

                    <SidebarItem href="/configuracoes" icon={Settings} label="Configurações" collapsed={collapsed} />
                    <SidebarItem href="/ajuda" icon={HelpCircle} label="Ajuda / Wiki" collapsed={collapsed} />
                </div>

                {/* --- FOOTER --- */}
                <div className="p-4 border-t border-zinc-800/50 bg-[#08080a] shrink-0 mt-auto">
                    <div
                        className={`flex items-center gap-3 transition-all duration-300 rounded-xl p-2
                        ${collapsed ? "justify-center bg-transparent p-0" : "hover:bg-white/5 cursor-pointer group"}`}
                    >
                        <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shadow-sm">
                                MK
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#08080a]" />
                        </div>

                        {!collapsed && (
                            <div className="flex-1 overflow-hidden transition-all duration-300">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">Maker Pro</span>
                                        <span className="text-[9px] text-zinc-500">Sistema Online</span>
                                    </div>
                                    <button
                                        className="p-1.5 rounded-md text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Sair"
                                    >
                                        <LogOut size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}