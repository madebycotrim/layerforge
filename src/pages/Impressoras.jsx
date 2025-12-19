import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "wouter";
import {
    ChevronLeft, Plus, Search, Printer, Wrench,
    CheckCircle2, AlertTriangle, Timer, Crosshair,
    Activity, MousePointer2, Database, Zap, Scan, Cpu,
    Radio, Network
} from "lucide-react";

// --- COMPONENTES ---
import MainSidebar from "../components/MainSidebar";
import PrinterCard from "../features/impressoras/components/printerCard";
import PrinterModal from "../features/impressoras/components/printerModal";
import MakerCoreIA from "../features/impressoras/components/makerIA"; // Sua IA funcional
import DiagnosticsModal from "../features/impressoras/components/diagnosticsModal";

// --- LÓGICA ---
import { analyzePrinterHealth } from "../features/impressoras/logic/diagnostics";
import { getPrinters, savePrinter, deletePrinter, resetMaintenance, updateStatus } from "../features/impressoras/logic/printers";

// --- UTILITÁRIOS ---
const formatBigNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    if (num > 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num > 1000) return (num / 1000).toFixed(1) + "k";
    return Math.floor(num).toString();
};

// --- COMPONENTE: TECH STAT CARD (Industrial v4) ---
const TechStatCard = ({ title, value, icon: Icon, colorClass, subtext, alertMode = false, secondaryLabel, secondaryValue }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="group relative h-[180px] p-6 rounded-2xl bg-[#09090b] border border-zinc-800/50 overflow-hidden flex flex-col justify-between transition-all hover:border-zinc-700/60 shadow-lg"
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-500"
                style={{
                    background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.04), transparent 40%)`,
                }}
            />

            <div className="relative z-10 flex justify-between items-start">
                <div className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner ${colorClass}`}>
                    <Icon size={20} />
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">{title}</p>
                    <div className="flex items-center justify-end gap-2">
                        <h3 className="text-2xl font-black text-zinc-100 font-mono tracking-tighter">{value}</h3>
                        {alertMode && <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
                    </div>
                </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/5 flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">{secondaryLabel}</span>
                    <span className="text-xs font-bold text-zinc-300">{secondaryValue}</span>
                </div>
                <p className="text-[10px] text-zinc-600 font-medium italic max-w-[100px] text-right leading-tight">
                    {subtext}
                </p>
            </div>
        </div>
    );
};

export default function ImpressorasPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(72);
    const [printers, setPrinters] = useState([]);
    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("all");
    const [modalAberto, setModalAberto] = useState(false);
    const [itemEdicao, setItemEdicao] = useState(null);
    const [printerEmDiagnostico, setPrinterEmDiagnostico] = useState(null);
    const [hoverManutencao, setHoverManutencao] = useState(false);
    const [highlightedId, setHighlightedId] = useState(null);

    useEffect(() => { setPrinters(getPrinters()); }, []);

    // --- LÓGICA ---
    const abrirDiagnostico = (id) => { const p = printers.find(p => p.id === id); if (p) setPrinterEmDiagnostico(p); };
    const resolverManutencao = (id) => { setPrinters(resetMaintenance(id)); setPrinterEmDiagnostico(null); };
    const aoSalvar = (dados) => { setPrinters(savePrinter(dados)); setItemEdicao(null); setModalAberto(false); };
    const aoDeletar = (id) => { if (window.confirm("Remover Ativo?")) setPrinters(deletePrinter(id)); };

    const handleToggleStatus = (printer) => {
        const flow = { 'idle': 'printing', 'printing': 'maintenance', 'maintenance': 'idle' };
        setPrinters(updateStatus(printer.id, flow[printer.status || 'idle']));
    };

    const focarNaImpressora = (id) => {
        const element = document.getElementById(`printer-card-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedId(id);
            setTimeout(() => setHighlightedId(null), 3000);
            setHoverManutencao(false);
        }
    };

    const filteredPrinters = useMemo(() => {
        return printers.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(busca.toLowerCase());
            const matchesStatus = filtroStatus === "all" || p.status === filtroStatus;
            return matchesSearch && matchesStatus;
        });
    }, [printers, busca, filtroStatus]);

    const criticalPrinters = printers.filter(p => analyzePrinterHealth(p).length > 0);
    const totalPrints = printers.reduce((acc, curr) => acc + (curr.history?.length || 0), 0);
    const totalHoursFarm = printers.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    const totalFilament = (totalHoursFarm * 0.012).toFixed(2);

    return (
        <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(c) => setLarguraSidebar(c ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300" style={{ marginLeft: `${larguraSidebar}px` }}>
                <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* HEADER */}
                <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#050505]/95 backdrop-blur-3xl z-40 sticky top-0">
                    <div className="flex items-center gap-6">
                        <Link href="/"><button className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all active:scale-95 shadow-lg"><ChevronLeft size={18} /></button></Link>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-black text-white uppercase tracking-tighter font-mono flex items-center gap-3">
                                <span className="text-zinc-600">/</span> DASHBOARD <span className="text-emerald-500 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 tracking-widest font-bold">FARM_PRO_V3</span>
                            </h1>
                            <span className="text-[10px] text-zinc-500 font-bold font-mono tracking-[0.2em] flex items-center gap-2 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> SISTEMA OPERACIONAL
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-emerald-500 transition-colors" size={14} />
                            <input
                                className="w-80 bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 text-[11px] text-white focus:border-emerald-500/40 outline-none font-mono placeholder:text-zinc-700 transition-all"
                                placeholder="LOCALIZAR_SERIAL_ID..."
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>
                        <button onClick={() => { setItemEdicao(null); setModalAberto(true); }} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-3 shadow-xl shadow-emerald-900/20 active:scale-95 transition-all">
                            <Plus size={16} strokeWidth={4} /> ADICIONAR MÁQUINA
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
                    <div className="max-w-[1600px] mx-auto space-y-12">

                        {/* KPI GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                            <MakerCoreIA printers={printers} onFixRequest={abrirDiagnostico} setPrinters={setPrinters} />

                            <TechStatCard
                                title="Peças Finalizadas"
                                value={formatBigNumber(totalPrints)}
                                icon={CheckCircle2}
                                colorClass="text-emerald-500"
                                subtext="Volume total de saída da farm"
                                secondaryLabel="Taxa de Sucesso"
                                secondaryValue="94.2%"
                            />

                            <div className="relative" onMouseEnter={() => setHoverManutencao(true)} onMouseLeave={() => setHoverManutencao(false)}>
                                <TechStatCard
                                    title="Saúde da Farm"
                                    value={criticalPrinters.length > 0 ? `${criticalPrinters.length} ALERTAS` : "NOMINAL"}
                                    icon={Activity}
                                    colorClass={criticalPrinters.length > 0 ? "text-rose-500" : "text-sky-400"}
                                    subtext="Integridade de bicos e nivelamento"
                                    alertMode={criticalPrinters.length > 0}
                                    secondaryLabel="Preventiva"
                                    secondaryValue="Ender-3 (12h)"
                                />
                                {/* Tooltip de Falhas (Omitido para brevidade, mas mantido via hoverManutencao) */}
                            </div>

                            <TechStatCard
                                title="Tempo de Extrusão"
                                value={`${formatBigNumber(totalHoursFarm)}h`}
                                icon={Timer}
                                colorClass="text-amber-500"
                                subtext="Ciclo total da frota ativa"
                                secondaryLabel="Consumo Filamento"
                                secondaryValue={`${totalFilament}kg`}
                            />
                        </div>

                        {/* LISTAGEM PRINCIPAL */}
                        <div className="space-y-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-emerald-500 ring-1 ring-emerald-500/10"><Cpu size={20} /></div>
                                    <div className="flex flex-col">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 font-mono">Unidades Conectadas</h2>
                                        <span className="text-xl font-black text-zinc-200 tracking-tighter uppercase">Gestão de Ativos</span>
                                    </div>
                                </div>

                                <div className="flex bg-zinc-900/40 p-1 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
                                    {[
                                        { id: 'all', l: 'GLOBAL' },
                                        { id: 'printing', l: 'IMPRIMINDO' },
                                        { id: 'idle', l: 'OCIOSA' },
                                        { id: 'maintenance', l: 'REPARO' }
                                    ].map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setFiltroStatus(s.id)}
                                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filtroStatus === s.id ? 'bg-emerald-500 text-[#050505] shadow-lg' : 'text-zinc-500 hover:text-zinc-200'}`}
                                        >
                                            {s.l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* GRID DE CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                                {filteredPrinters.map((printer) => (
                                    <div
                                        key={printer.id}
                                        id={`printer-card-${printer.id}`}
                                        className={`relative transition-all duration-300 ${highlightedId === printer.id ? "z-30 scale-[1.02]" : ""}`}
                                    >
                                        {highlightedId === printer.id && <div className="absolute -inset-2 bg-emerald-500/20 blur-3xl rounded-[2.5rem] animate-pulse" />}
                                        <PrinterCard
                                            printer={printer}
                                            onEdit={(p) => { setItemEdicao(p); setModalAberto(true); }}
                                            onDelete={aoDeletar}
                                            onResetMaint={() => abrirDiagnostico(printer.id)}
                                            onToggleStatus={() => handleToggleStatus(printer)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* SCANNER DE REDE (ESTADO VAZIO) */}
                            {filteredPrinters.length === 0 && (
                                <div className="relative py-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-[3rem] bg-zinc-900/5 overflow-hidden group">
                                    <div className="absolute inset-0 pointer-events-none opacity-20">
                                        <div className="w-full h-[2px] bg-emerald-500/50 blur-sm shadow-[0_0_15px_#10b981] animate-bounce" style={{ animationDuration: '4s' }} />
                                    </div>
                                    <div className="relative mb-10 flex items-center justify-center">
                                        <div className="absolute size-40 rounded-full border border-emerald-500/20 animate-ping" />
                                        <div className="absolute size-24 rounded-full border border-emerald-500/10 animate-pulse" />
                                        <div className="relative w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-600 shadow-2xl transition-all group-hover:border-emerald-500/50 group-hover:text-emerald-500">
                                            <Scan size={36} strokeWidth={1.5} className="animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-3 relative z-10 px-6">
                                        <h3 className="text-zinc-400 font-black font-mono uppercase tracking-[0.4em] text-sm">Perímetro Vazio</h3>
                                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 justify-center">
                                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Buscando sinal de hardware na rede local
                                        </p>
                                        <span className="text-[9px] text-zinc-800 font-mono uppercase">Protocolo: 802.11ax // SSID: Farm_Pro_Node</span>
                                        <div className="pt-6">
                                            <button onClick={() => { setItemEdicao(null); setModalAberto(true); }} className="px-6 py-2 border border-zinc-800 hover:border-emerald-500/50 bg-zinc-900/50 hover:bg-emerald-500/5 text-zinc-500 hover:text-emerald-500 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-3 mx-auto">
                                                <Plus size={14} /> Sincronizar Primeira Unidade
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <PrinterModal aberto={modalAberto} aoFechar={() => setModalAberto(false)} aoSalvar={aoSalvar} dadosIniciais={itemEdicao} />
                {printerEmDiagnostico && <DiagnosticsModal printer={printerEmDiagnostico} onClose={() => setPrinterEmDiagnostico(null)} onResolve={resolverManutencao} />}
            </main>
        </div>
    );
}