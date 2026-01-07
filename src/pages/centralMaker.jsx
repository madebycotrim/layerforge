import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, ChevronRight, Mail, Terminal, Activity, AlertTriangle,
    Coins, Code, Send, Globe, Info, CheckCircle2,
    Copy, AlertCircle, FileText, Cpu, Target, Zap
} from 'lucide-react';

import { WIKI_DATA } from '../utils/wikiData';
import MainSidebar from "../layouts/mainSidebar";
import Popup from "../components/Popup";

// --- COMPONENTES VISUAIS AUXILIARES ---

const HUDOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] overflow-hidden"
        style={{
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
            backgroundSize: '100% 4px, 3px 100%'
        }}
    />
);

const TypewriterHero = ({ phrases, speed = 100, delay = 2500 }) => {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const currentPhrase = phrases[phraseIndex];
    const fullText = currentPhrase.line1 + currentPhrase.line2;

    useEffect(() => {
        if (subIndex === fullText.length + 1 && !reverse) {
            setTimeout(() => setReverse(true), delay);
            return;
        }
        if (subIndex === 0 && reverse) {
            setReverse(false);
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
            return;
        }
        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? speed / 2 : speed);
        return () => clearTimeout(timeout);
    }, [subIndex, phraseIndex, reverse, phrases, fullText.length, speed, delay]);

    return (
        <div className="flex flex-col leading-tight select-none">
            <span className="text-zinc-100 font-black text-4xl md:text-6xl tracking-tighter uppercase">
                {currentPhrase.line1.substring(0, subIndex)}
                {subIndex <= currentPhrase.line1.length && <span className="animate-pulse border-r-4 border-sky-500 ml-1"></span>}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-black text-4xl md:text-6xl tracking-tighter uppercase">
                {subIndex > currentPhrase.line1.length ? currentPhrase.line2.substring(0, subIndex - currentPhrase.line1.length) : ""}
                {subIndex > currentPhrase.line1.length && <span className="animate-pulse border-r-4 border-emerald-500 ml-1"></span>}
            </span>
        </div>
    );
};

const WikiModuleCard = ({ category, onSelectTopic }) => {
    const colorMap = {
        sky: "group-hover:border-sky-500/30 border-l-sky-500/50",
        rose: "group-hover:border-rose-500/30 border-l-rose-500/50",
        emerald: "group-hover:border-emerald-500/30 border-l-emerald-500/50",
        amber: "group-hover:border-amber-500/30 border-l-amber-500/50",
    };
    const textColorMap = {
        sky: "text-sky-400", rose: "text-rose-400", emerald: "text-emerald-400", amber: "text-amber-400",
    };

    return (
        <div className={`group relative bg-zinc-900/30 border border-zinc-800/40 border-l-4 ${colorMap[category.color]} rounded-2xl p-6 transition-all duration-500 hover:bg-zinc-900/60 hover:translate-y-[-4px] shadow-2xl backdrop-blur-md`}>
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 transition-all ${textColorMap[category.color]} shadow-inner`}>
                        <category.icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{category.category}</span>
                        <h3 className="text-[13px] font-black uppercase text-zinc-100 tracking-wider mt-0.5">{category.title}</h3>
                    </div>
                </div>
            </div>
            <div className="space-y-2.5 relative z-10">
                {category.topics.map(topic => (
                    <button 
                        key={topic.id} 
                        onClick={() => onSelectTopic(topic)} 
                        className="w-full group/item flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/50 hover:border-sky-500/30 transition-all hover:bg-zinc-900/80 text-left active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover/item:bg-sky-500 group-hover/item:shadow-[0_0_8px_rgba(14,165,233,0.5)] transition-all" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-zinc-400 group-hover/item:text-zinc-100 transition-colors uppercase tracking-tight">{topic.title}</span>
                                {topic.gcode && (
                                    <span className="text-[8px] text-sky-500/70 font-mono mt-1 flex items-center gap-1.5">
                                        <Code size={10} /> SCRIPT_EXECUTÁVEL
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronRight size={14} className="text-zinc-700 group-hover/item:text-sky-500 transition-all translate-x-0 group-hover/item:translate-x-1" />
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---

export default function WikiPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [busca, setBusca] = useState("");
    const [filtroAtivo, setFiltroAtivo] = useState('all');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [copiado, setCopiado] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        open: false, title: "", message: "", icon: AlertCircle, color: "bg-sky-600"
    });

    const phrases = useMemo(() => [
        { line1: "OTIMIZE", line2: "SEU FLUXO MAKER." },
        { line1: "PROTOCOLOS", line2: "DE ALTA PERFORMANCE." },
        { line1: "SISTEMAS", line2: "DE APOIO TÉCNICO." }
    ], []);

    const filteredData = useMemo(() => {
        return WIKI_DATA.filter(cat => {
            const matchBusca = cat.title.toLowerCase().includes(busca.toLowerCase()) ||
                cat.topics.some(t => t.title.toLowerCase().includes(busca.toLowerCase()));
            const matchFiltro = filtroAtivo === 'all' || cat.type === filtroAtivo;
            return matchBusca && matchFiltro;
        });
    }, [busca, filtroAtivo]);

    const handleCopyGCode = (code) => {
        navigator.clipboard.writeText(code);
        setModalConfig({
            open: true,
            title: "Terminal Buffer",
            message: "Protocolo G-Code sincronizado com a área de transferência do sistema.",
            icon: CheckCircle2,
            color: "bg-emerald-600"
        });
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden selection:bg-sky-500/30">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-500 ease-in-out" style={{ marginLeft: `${larguraSidebar}px` }}>
                
                {/* Background Decorativo com Grid */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#3f3f46 1px, transparent 1px), linear-gradient(90deg, #3f3f46 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent)'
                    }}
                />

                <header className="h-24 px-10 flex items-center justify-between z-40 relative border-b border-white/5 bg-zinc-950/80 backdrop-blur-2xl">
                    <div className="flex flex-col relative">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={12} className="text-sky-500 fill-sky-500 animate-pulse" />
                            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Knowledge_Base_v2.0</h1>
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter text-white">
                            Diretrizes da <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500">Oficina</span>
                        </span>
                    </div>

                    <div className="relative group">
                        <Search size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${busca ? 'text-sky-400' : 'text-zinc-600'}`} />
                        <input
                            className="w-96 bg-zinc-900/40 border border-white/10 rounded-2xl py-3 pl-11 pr-10 text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest focus:border-sky-500/40 focus:bg-zinc-900/80 placeholder:text-zinc-700"
                            placeholder="PESQUISAR DIRETRIZ OU COMANDO..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative z-10 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.02),transparent_40%)]">
                    <div className="max-w-[1600px] mx-auto space-y-16">

                        {/* HERO SECTION */}
                        <section className="relative overflow-hidden rounded-[3rem] bg-zinc-900/20 border border-white/5 p-16 min-h-[400px] flex flex-col justify-center shadow-2xl backdrop-blur-sm group">
                            <HUDOverlay />
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Cpu size={200} className="text-white" />
                            </div>
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-4 text-sky-400">
                                    <div className="h-px w-12 bg-sky-500/50" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">Núcleo de Inteligência Maker</span>
                                </div>
                                <TypewriterHero phrases={phrases} />
                                <p className="text-sm text-zinc-500 max-w-2xl font-medium leading-relaxed uppercase tracking-widest italic">
                                    Acesse protocolos validados para escala industrial e otimização de farm 3D.
                                </p>
                            </div>
                        </section>

                        {/* FILTROS DE CATEGORIA */}
                        <div className="flex flex-wrap gap-4 relative z-10">
                            {[
                                { id: 'all', label: 'Todos os Protocolos', icon: Activity },
                                { id: 'critico', label: 'Sistemas Críticos', icon: AlertTriangle, color: 'text-rose-400' },
                                { id: 'lucro', label: 'Otimização Financeira', icon: Coins, color: 'text-emerald-400' },
                                { id: 'setup', label: 'Configuração Hardware', icon: Code, color: 'text-sky-400' },
                            ].map((f) => (
                                <button 
                                    key={f.id} 
                                    onClick={() => setFiltroAtivo(f.id)} 
                                    className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-[0.15em] active:scale-95 ${filtroAtivo === f.id ? 'bg-white text-zinc-950 border-white shadow-lg shadow-white/5' : 'bg-zinc-900/40 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}`}
                                >
                                    <f.icon size={16} className={filtroAtivo === f.id ? 'text-zinc-950' : f.color} />
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* GRID DE MÓDULOS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredData.map((category) => (
                                <WikiModuleCard key={category.id} category={category} onSelectTopic={setSelectedArticle} />
                            ))}
                        </div>

                        {/* SEÇÃO DE SUPORTE (CTA) */}
                        <section className="relative overflow-hidden rounded-[3rem] bg-zinc-900/20 border border-white/5 p-12 shadow-2xl backdrop-blur-md group">
                            <HUDOverlay />
                            <div className="relative z-30 flex flex-col lg:flex-row items-center justify-between gap-12">
                                <div className="flex items-center gap-10">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-zinc-950 border border-zinc-800 flex items-center justify-center text-sky-400 shadow-2xl group-hover:border-sky-500/50 transition-all duration-500">
                                        <Globe size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-black text-zinc-100 uppercase tracking-widest">Colaboração & Dúvidas</h3>
                                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.1em] leading-relaxed max-w-xl">
                                            Sua experiência pode ajudar outros makers. Envie sugestões de novos protocolos ou solicite suporte técnico especializado.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                                    <button
                                        onClick={() => { navigator.clipboard.writeText("suporte@printlog.com.br"); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }}
                                        className="flex-1 lg:flex-none px-8 py-4 bg-zinc-900/50 hover:bg-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-zinc-800 flex items-center justify-center gap-3 transition-all"
                                    >
                                        <Mail size={18} className={copiado ? "text-emerald-400" : "text-zinc-500"} />
                                        {copiado ? "ID Copiada" : "Copiar E-mail"}
                                    </button>
                                    <a href="#" className="flex-1 lg:flex-none px-10 py-4 bg-zinc-100 hover:bg-white text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl">
                                        Abrir Ticket <Send size={18} />
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* MODAL: DOSSIÊ TÉCNICO DO ARTIGO */}
                <Popup
                    isOpen={!!selectedArticle}
                    onClose={() => setSelectedArticle(null)}
                    title={selectedArticle?.title || "Dossiê Técnico"}
                    subtitle={`Diretriz: #${selectedArticle?.id || '000'}`}
                    icon={selectedArticle?.gcode ? Code : FileText}
                    footer={
                        selectedArticle?.gcode && (
                            <button
                                onClick={() => handleCopyGCode(selectedArticle.gcode)}
                                className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-sky-900/40 active:scale-95"
                            >
                                <Copy size={18} /> Sincronizar Buffer G-Code
                            </button>
                        )
                    }
                >
                    <div className="p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black bg-zinc-900 text-sky-500 px-4 py-1.5 rounded-lg border border-sky-500/20 uppercase tracking-widest flex items-center gap-2">
                                <Target size={12} /> Nível: {selectedArticle?.level}
                            </span>
                            <span className="text-[10px] font-black bg-zinc-900 text-zinc-500 px-4 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest">
                                Revisão: {selectedArticle?.updated}
                            </span>
                        </div>

                        <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-500 to-transparent opacity-30" />
                            <p className="text-zinc-400 text-sm font-medium leading-relaxed pl-8 uppercase tracking-widest">
                                {selectedArticle?.content}
                            </p>
                        </div>

                        {selectedArticle?.gcode && (
                            <div className="space-y-4 pt-6">
                                <div className="flex items-center gap-3 ml-1">
                                    <Terminal size={14} className="text-zinc-600" />
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Terminal Protocol:</p>
                                </div>
                                <div className="bg-zinc-950/80 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center group/code shadow-inner">
                                    <code className="text-sky-400 text-sm font-mono tracking-wider">{selectedArticle.gcode}</code>
                                    <button onClick={() => handleCopyGCode(selectedArticle.gcode)} className="p-2 text-zinc-700 hover:text-sky-500 transition-colors">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Popup>

                {/* MODAL: NOTIFICAÇÃO GLOBAL */}
                <Popup
                    isOpen={modalConfig.open}
                    onClose={() => setModalConfig({ ...modalConfig, open: false })}
                    title={modalConfig.title}
                    icon={modalConfig.icon}
                    footer={
                        <button
                            onClick={() => setModalConfig({ ...modalConfig, open: false })}
                            className={`w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl text-white ${modalConfig.color}`}
                        >
                            Confirmar Protocolo
                        </button>
                    }
                >
                    <div className="p-10 flex flex-col items-center text-center gap-6 border-t border-white/5">
                        <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                            {modalConfig.message}
                        </p>
                    </div>
                </Popup>

            </main>
        </div>
    );
}