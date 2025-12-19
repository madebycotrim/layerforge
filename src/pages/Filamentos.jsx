import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "wouter";
import {
    ChevronLeft, Plus, Search, LayoutGrid, List, Thermometer, Droplets,
    BadgeDollarSign, AlertOctagon, Database, Filter,
    AlertTriangle
} from "lucide-react";

import MainSidebar from "../components/MainSidebar";
import { getFilaments, saveFilament, deleteFilament } from "../features/filamentos/logic/filaments";
import { useLocalWeather } from "../hooks/useLocalWeather";

// --- COMPONENTES VISUAIS ---
import StatCard from "../features/filamentos/components/cardPrincipal.jsx";
import FilamentGroup from "../features/filamentos/components/grupoFilamentos.jsx";

// --- MODAIS E IA ---
import ModalFilamento from "../features/filamentos/components/modalFilamento.jsx";
import ModalBaixaRapida from "../features/filamentos/components/darBaixa.jsx";

// Importação dos componentes externos do MakerBot
import { MakerBotCard, MakerBotModal } from "../features/filamentos/components/makerIA.jsx";

// --- HELPER DE CORES ---
const getCorTipo = (tipo) => {
    const tipoNormalizado = (tipo || "Outros").toUpperCase();
    const cores = {
        PLA: { bg: "bg-sky-500", text: "text-sky-500", border: "border-sky-500/20" },
        PETG: { bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500/20" },
        ABS: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/20" },
        TPU: { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500/20" },
        ASA: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/20" },
        NYLON: { bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500/20" },
        PC: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500/20" },
        SILK: { bg: "bg-fuchsia-500", text: "text-fuchsia-500", border: "border-fuchsia-500/20" },
        MARBLE: { bg: "bg-stone-400", text: "text-stone-400", border: "border-stone-500/20" },
        WOOD: { bg: "bg-yellow-700", text: "text-yellow-700", border: "border-yellow-700/20" },
    };
    return cores[tipoNormalizado] || { bg: "bg-zinc-500", text: "text-zinc-500", border: "border-zinc-500/20" };
};

export default function FilamentosPage() {
    // --- ESTADO ---
    const [larguraSidebar, setLarguraSidebar] = useState(72);
    const [filamentos, setFilamentos] = useState([]);
    const [busca, setBusca] = useState("");
    const [ordenacao, setOrdenacao] = useState("recentes");
    const [viewMode, setViewMode] = useState("grid");

    const { temp, humidity, loading } = useLocalWeather();

    // Estados dos Modais
    const [modalAberto, setModalAberto] = useState(false);
    const [itemEdicao, setItemEdicao] = useState(null);
    const [itemConsumo, setItemConsumo] = useState(null);
    const [itemDiagnostico, setItemDiagnostico] = useState(null);

    // Estado do Hover do Card de Reposição
    const [hoverReposicao, setHoverReposicao] = useState(false);
    const hoverTimeoutRef = useRef(null);

    // Carregar dados
    useEffect(() => {
        setFilamentos(getFilaments());
    }, []);

    // --- AÇÕES ---
    const aoSalvar = (dados) => {
        const novaLista = saveFilament(dados);
        setFilamentos(novaLista);
        setItemEdicao(null);
        setModalAberto(false);
        setItemConsumo(null);
        setItemDiagnostico(null);
    };

    const aoDeletar = (id) => {
        if (window.confirm("Vai remover este carretel da sua coleção?")) {
            setFilamentos(deleteFilament(id));
        }
    };

    const abrirEdicao = (item) => {
        setItemEdicao(item);
        setModalAberto(true);
    };

    const handleMouseEnterReposicao = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHoverReposicao(true);
    };

    const handleMouseLeaveReposicao = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoverReposicao(false);
        }, 200);
    };

    const focarNoFilamento = (id) => {
        const elemento = document.getElementById(`filament-${id}`) || document.getElementById(`card-${id}`);
        if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
            elemento.classList.add('ring-2', 'ring-rose-500', 'shadow-[0_0_30px_rgba(244,63,94,0.3)]');
            setTimeout(() => {
                elemento.classList.remove('ring-2', 'ring-rose-500', 'shadow-[0_0_30px_rgba(244,63,94,0.3)]');
            }, 2500);
        }
    };

    // --- PROCESSAMENTO ---
    const filamentosProcessados = useMemo(() => {
        let lista = filamentos.filter(f =>
            f.name.toLowerCase().includes(busca.toLowerCase()) ||
            (f.brand && f.brand.toLowerCase().includes(busca.toLowerCase())) ||
            (f.color && f.color.toLowerCase().includes(busca.toLowerCase()))
        );

        return lista.sort((a, b) => {
            const pctA = a.weightTotal > 0 ? a.weightCurrent / a.weightTotal : 0;
            const pctB = b.weightTotal > 0 ? b.weightCurrent / b.weightTotal : 0;

            switch (ordenacao) {
                case "cheio": return pctB - pctA;
                case "vazio": return pctA - pctB;
                case "caro": return Number(b.price) - Number(a.price);
                case "recentes": default: return new Date(b.dateOpened || 0) - new Date(a.dateOpened || 0);
            }
        });
    }, [filamentos, busca, ordenacao]);

    const filamentosAgrupados = useMemo(() => {
        const grupos = {};
        filamentosProcessados.forEach(item => {
            const tipo = item.material || item.type || "Outros";
            if (!grupos[tipo]) grupos[tipo] = [];
            grupos[tipo].push(item);
        });
        return grupos;
    }, [filamentosProcessados]);

    // --- KPIS ---
    const kpis = useMemo(() => {
        const pesoTotalG = filamentos.reduce((acc, curr) => acc + Number(curr.weightCurrent || 0), 0);
        const valorTotalEstoque = filamentos.reduce((acc, curr) => {
            const pct = curr.weightTotal > 0 ? curr.weightCurrent / curr.weightTotal : 0;
            return acc + (Number(curr.price || 0) * pct);
        }, 0);

        const precoMedioKg = pesoTotalG > 0 ? (valorTotalEstoque / (pesoTotalG / 1000)) : 0;

        const listaCriticos = filamentos.filter(f => {
            const cap = Number(f.weightTotal) || 1000;
            const cur = Number(f.weightCurrent) || 0;
            return cap > 0 && (cur / cap) < 0.2;
        });

        const metrosEstimados = (pesoTotalG / 1000) * 330;
        const itemSugeridoAnalise = [...filamentos].sort((a, b) => new Date(a.dateOpened) - new Date(b.dateOpened))[0];

        return {
            valorTotal: valorTotalEstoque,
            precoMedioKg,
            estoqueBaixo: listaCriticos.length,
            listaCriticos,
            pesoTotalKg: pesoTotalG / 1000,
            metrosEstimados,
            itemSugeridoAnalise
        };
    }, [filamentos]);

    return (
        <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(c) => setLarguraSidebar(c ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300" style={{ marginLeft: `${larguraSidebar}px` }}>
                <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* HEADER */}
                <header className="h-20 px-6 md:px-8 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <button className="group w-10 h-10 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                                <ChevronLeft size={18} />
                            </button>
                        </Link>
                        <div className="h-8 w-px bg-zinc-800/50"></div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-white uppercase leading-none">Materiais</h1>
                                <span className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-[10px] font-bold text-sky-400 uppercase">Estoque</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 mt-1">
                                <span className="flex items-center gap-1"><Thermometer size={10} className="text-amber-500" /> {loading ? "--" : temp}°C</span>
                                <span className="flex items-center gap-1"><Droplets size={10} className="text-sky-500" /> {loading ? "--" : humidity}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}><LayoutGrid size={14} /></button>
                            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}><List size={14} /></button>
                        </div>
                        <div className="relative group hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                            <input
                                className="w-48 bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-9 text-xs text-white focus:border-sky-500 outline-none transition-all focus:w-64"
                                placeholder="Filtrar materiais..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => { setItemEdicao(null); setModalAberto(true); }}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold uppercase flex gap-2 items-center shadow-lg active:scale-95 transition-all"
                        >
                            <Plus size={16} /> <span className="hidden sm:inline">Novo</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative z-10">
                    <div className="max-w-[1600px] mx-auto space-y-8">

                        {/* KPIS GRID - MAKERBOT EM PRIMEIRO */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">

                            {/* 1. IA MakerBot (Destaque Principal) */}
                            <div className="flex flex-col h-full">
                                <MakerBotCard
                                    itemSugerido={kpis.itemSugeridoAnalise}
                                    onClick={setItemDiagnostico}
                                />
                            </div>

                            {/* 2. Patrimônio */}
                            <div className="flex flex-col h-full">
                                <StatCard
                                    title="Patrimônio"
                                    value={`R$ ${kpis.valorTotal.toFixed(2)}`}
                                    icon={BadgeDollarSign}
                                    colorClass="text-emerald-500"
                                    subtext={`Médio: R$ ${kpis.precoMedioKg.toFixed(2)}/kg`}
                                />
                            </div>

                            {/* 3. Acabando (<20%) - Com Dropdown Flutuante */}
                            <div className="relative flex flex-col h-full" onMouseEnter={handleMouseEnterReposicao} onMouseLeave={handleMouseLeaveReposicao}>
                                <StatCard
                                    title="Acabando (<20%)"
                                    value={kpis.estoqueBaixo > 0 ? `${kpis.estoqueBaixo} Rolos` : "Estoque Seguro"}
                                    icon={AlertOctagon}
                                    colorClass={kpis.estoqueBaixo > 0 ? "text-rose-500" : "text-emerald-500"}
                                    subtext={kpis.estoqueBaixo > 0 ? "Requer atenção" : "Tudo sob controle"}
                                />

                                {/* Dropdown de Itens Críticos */}
                                {hoverReposicao && kpis.listaCriticos.length > 0 && (
                                    <div className="absolute top-[105%] left-0 right-0 z-[60] pt-1">
                                        <div className="bg-[#0A0A0A] border border-rose-500/30 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            <div className="bg-rose-500/10 p-3 border-b border-rose-500/10 flex items-center gap-2">
                                                <AlertTriangle size={14} className="text-rose-500" />
                                                <span className="text-[10px] font-bold text-rose-200 uppercase tracking-widest">Críticos</span>
                                            </div>
                                            <ul className="max-h-52 overflow-y-auto custom-scrollbar">
                                                {kpis.listaCriticos.map(f => (
                                                    <li key={f.id} onClick={() => focarNoFilamento(f.id)} className="flex justify-between items-center p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.colorHex || f.color || '#fff' }} />
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-zinc-300 text-[11px] font-bold truncate leading-tight">{f.name}</span>
                                                                <span className="text-[9px] text-zinc-500 font-mono uppercase">{f.material}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">{Math.round(f.weightCurrent)}g</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 4. Massa Total */}
                            <div className="flex flex-col h-full">
                                <StatCard
                                    title="Massa Total"
                                    value={`${kpis.pesoTotalKg.toFixed(1)} kg`}
                                    icon={Database}
                                    colorClass="text-sky-500"
                                    subtext={`~${Math.round(kpis.metrosEstimados)}m (1.75mm)`}
                                />
                            </div>
                        </div>

                        {/* LISTAGEM POR GRUPOS */}
                        <div className="space-y-8 pb-20">
                            {Object.entries(filamentosAgrupados).map(([tipo, items]) => (
                                <FilamentGroup
                                    key={tipo}
                                    tipo={tipo}
                                    items={items}
                                    viewMode={viewMode}
                                    estilo={getCorTipo(tipo)}
                                    acoes={{
                                        onEdit: abrirEdicao,
                                        onDelete: aoDeletar,
                                        onConsume: (item) => setItemConsumo(item),
                                        onDiagnose: (item) => setItemDiagnostico(item)
                                    }}
                                />
                            ))}

                            {filamentosProcessados.length === 0 && (
                                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 group hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => setModalAberto(true)}>
                                    <Filter size={48} className="text-zinc-700 mb-4 group-hover:text-sky-500 transition-colors" />
                                    <p className="text-zinc-400 font-medium">Sua estante está vazia.</p>
                                    <p className="text-zinc-600 text-[10px] uppercase font-bold mt-1 tracking-widest">Toque para adicionar seu primeiro rolo</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MODAIS */}
                <ModalFilamento aberto={modalAberto} aoFechar={() => setModalAberto(false)} aoSalvar={aoSalvar} dadosIniciais={itemEdicao} />
                <ModalBaixaRapida aberto={!!itemConsumo} aoFechar={() => setItemConsumo(null)} item={itemConsumo} aoSalvar={aoSalvar} />
                <MakerBotModal
                    item={itemDiagnostico}
                    onClose={() => setItemDiagnostico(null)}
                    onResetDrying={(id) => console.log("Resetando secagem:", id)}
                />
            </main>
        </div>
    );
}