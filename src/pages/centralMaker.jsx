import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, ChevronRight, Mail, Terminal, Activity, AlertTriangle,
    Coins, Code, Send, Globe, Info, CheckCircle2,
    Copy, AlertCircle, FileText, Cpu, Target, Zap,
    Box, Server, RefreshCw, LayoutGrid, BookOpen,
    Wrench, Lightbulb, HelpCircle
} from 'lucide-react';

import { WIKI_DATA } from '../utils/wikiData';
import BarraLateralPrincipal from "../layouts/mainSidebar";
import JanelaFlutuante from "../components/Popup";

// --- COMPONENTES COM ESTILO REFINADO (VISUAL DE OFICINA MODERNA) ---

const CartaoInformativo = ({ titulo, subtitulo, Icone, classeCor = "sky", children, etiqueta }) => {
    const temas = {
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/30",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    };
    const temaEscolhido = temas[classeCor] || temas.sky;

    return (
        <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-[2rem] p-8 relative overflow-hidden hover-lift">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${temaEscolhido}`}>
                        <Icone size={22} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-wide">{titulo}</h2>
                        <p className="text-xs text-zinc-500 font-medium">{subtitulo}</p>
                    </div>
                </div>
                {etiqueta && (
                    <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-500 uppercase tracking-wider">
                        {etiqueta}
                    </span>
                )}
            </div>
            <div>
                {children}
            </div>
        </div>
    );
};

const BannerTextoAnimado = ({ frases, velocidade = 100, atraso = 2500 }) => {
    const [indiceFrase, setIndiceFrase] = useState(0);
    const [indiceLetra, setIndiceLetra] = useState(0);
    const [estaApagando, setEstaApagando] = useState(false);
    const fraseAtual = frases[indiceFrase];
    const textoCompleto = fraseAtual.linha1 + fraseAtual.linha2;

    useEffect(() => {
        if (indiceLetra === textoCompleto.length + 1 && !estaApagando) {
            setTimeout(() => setEstaApagando(true), atraso);
            return;
        }
        if (indiceLetra === 0 && estaApagando) {
            setEstaApagando(false);
            setIndiceFrase((anterior) => (anterior + 1) % frases.length);
            return;
        }
        const temporizador = setTimeout(() => {
            setIndiceLetra((anterior) => anterior + (estaApagando ? -1 : 1));
        }, estaApagando ? velocidade / 2 : velocidade);
        return () => clearTimeout(temporizador);
    }, [indiceLetra, indiceFrase, estaApagando, frases, textoCompleto.length, velocidade, atraso]);

    return (
        <div className="flex flex-col leading-none select-none">
            <span className="text-white font-black text-5xl md:text-7xl tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                {fraseAtual.linha1.substring(0, indiceLetra)}
                {indiceLetra <= fraseAtual.linha1.length && <span className="animate-pulse border-r-8 border-sky-500 ml-2"></span>}
            </span>
            <span className="text-zinc-800 font-black text-5xl md:text-7xl tracking-tighter uppercase not-italic">
                {indiceLetra > fraseAtual.linha1.length ? fraseAtual.linha2.substring(0, indiceLetra - fraseAtual.linha1.length) : ""}
                {indiceLetra > fraseAtual.linha1.length && <span className="animate-pulse border-r-8 border-zinc-700 ml-2"></span>}
            </span>
        </div>
    );
};

export default function PaginaAprender() {
    const [larguraBarraLateral, setLarguraBarraLateral] = useState(68);
    const [termoDeBusca, setTermoDeBusca] = useState("");
    const [filtroSelecionado, setFiltroSelecionado] = useState('todos');
    const [artigoSelecionado, setArtigoSelecionado] = useState(null);
    const [estaCopiado, setEstaCopiado] = useState(false);

    const [configuracaoJanela, setConfiguracaoJanela] = useState({
        aberta: false, titulo: "", mensagem: "", Icone: AlertCircle, cor: "sky"
    });

    const totalDeGuias = useMemo(() => {
        return WIKI_DATA.reduce((acumulador, categoria) => acumulador + categoria.topics.length, 0);
    }, []);

    const listaDeFrases = useMemo(() => [
        { linha1: "TRANSFORME ", linha2: "PLÁSTICO EM LUCRO" },
        { linha1: "APRENDA ", linha2: "TUDO NA PRÁTICA" },
        { linha1: "CRIE ", linha2: "COISAS REAIS" },
        { linha1: "DOMINE ", linha2: "SUA IMPRESSORA" },
        { linha1: "MELHORE ", linha2: "CADA DETALHE" },
        { linha1: "VENDA ", linha2: "MAIS TODO DIA" },
        { linha1: "CRESÇA ", linha2: "SUA OFICINA" }
    ], []);

    const dadosFiltrados = useMemo(() => {
        return WIKI_DATA.filter(categoria => {
            const combinaBusca = categoria.title.toLowerCase().includes(termoDeBusca.toLowerCase()) ||
                categoria.topics.some(tema => tema.title.toLowerCase().includes(termoDeBusca.toLowerCase()));
            const combinaFiltro = filtroSelecionado === 'todos' || categoria.type === filtroSelecionado;
            return combinaBusca && combinaFiltro;
        });
    }, [termoDeBusca, filtroSelecionado]);

    const copiarCodigoComando = (codigo) => {
        navigator.clipboard.writeText(codigo);
        setConfiguracaoJanela({
            aberta: true,
            titulo: "CÓDIGO COPIADO",
            mensagem: "O comando técnico foi copiado com sucesso. Agora você pode colar diretamente no programa da sua impressora.",
            Icone: CheckCircle2,
            cor: "emerald"
        });
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            {/* FUNDO DECORATIVO - igual ao dashboard */}
            <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                    maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                }} />

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                    <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-sky-500/30 via-transparent to-transparent" />
                </div>
            </div>

            <BarraLateralPrincipal onCollapseChange={(estaFechada) => setLarguraBarraLateral(estaFechada ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar" style={{ marginLeft: `${larguraBarraLateral}px` }}>

                {/* CABEÇALHO - estilo dashboard */}
                <div className="p-8 xl:p-12 relative z-10">
                    <div className="max-w-[1600px] mx-auto mb-12 animate-fade-in-up">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                                    Central Maker
                                </h1>
                                <p className="text-sm text-zinc-500">
                                    Guia de aprendizado para criadores
                                </p>
                            </div>

                            <div className="relative group">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-400 transition-colors" />
                                <input
                                    className="w-80 bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-wide text-white outline-none focus:border-sky-500/50 transition-all placeholder:text-zinc-700"
                                    placeholder="Procurar ajuda ou dicas..."
                                    value={termoDeBusca}
                                    onChange={e => setTermoDeBusca(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="max-w-[1600px] mx-auto space-y-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            {/* SEÇÃO PRINCIPAL DE DESTAQUE - REDESIGN PREMIUM */}
                            <div className="relative rounded-[2.5rem] p-12 md:p-16 overflow-hidden hover-lift group">
                                {/* Background Rico */}
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black" />

                                {/* Efeitos de Luz Atmosférica */}
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
                                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

                                {/* Grid Sutil Overlay */}
                                <div className="absolute inset-0 opacity-[0.03]" style={{
                                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                                    backgroundSize: '40px 40px'
                                }} />

                                {/* Elemento Decorativo Flutuante (Ícone Gigante) */}
                                <div className="absolute -right-10 -bottom-10 opacity-[0.05] transform rotate-12 transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110">
                                    <Lightbulb size={400} className="text-white" />
                                </div>

                                <div className="relative z-10">
                                    {/* Badge Superior */}
                                    <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 backdrop-blur-md">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                                        </span>
                                        <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Central de Conhecimento</span>
                                    </div>

                                    {/* Título Animado e Chamativo */}
                                    <div className="mb-12">
                                        <BannerTextoAnimado frases={listaDeFrases} />
                                    </div>

                                    {/* Cards de Stats Flutuantes (Glassmorphism) */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-4 px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-default">
                                            <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                                                <BookOpen size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Base de Conhecimento</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xl font-black text-white">{totalDeGuias}</span>
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Manuais</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-default">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <Activity size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Status do Sistema</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xl font-black text-emerald-400">Online</span>
                                                    <span className="text-[10px] font-bold text-emerald-500/50 uppercase">100%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BOTÕES DE FILTRO */}
                            <div className="flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                {[
                                    { id: 'todos', label: 'Todos os Manuais', Icone: LayoutGrid, cor: 'sky' },
                                    { id: 'critico', label: 'Avisos Importantes', Icone: AlertTriangle, cor: 'amber' },
                                    { id: 'lucro', label: 'Dicas de Lucro', Icone: Coins, cor: 'emerald' },
                                    { id: 'setup', label: 'Ajustes de Máquina', Icone: Wrench, cor: 'sky' },
                                ].map((filtro) => (
                                    <button
                                        key={filtro.id}
                                        onClick={() => setFiltroSelecionado(filtro.id)}
                                        className={`h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all duration-300 border ${filtroSelecionado === filtro.id
                                            ? 'bg-sky-500 hover:bg-sky-400 text-white border-sky-400 shadow-lg shadow-sky-500/20 scale-105'
                                            : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/50 hover:border-zinc-700 hover:text-zinc-300 hover:scale-105'
                                            } active:scale-95`}
                                    >
                                        <filtro.Icone size={14} />
                                        {filtro.label}
                                    </button>
                                ))}
                            </div>

                            {/* GRADE DE MANUAIS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                {dadosFiltrados.map((categoria) => (
                                    <CartaoInformativo
                                        key={categoria.id}
                                        titulo={categoria.title}
                                        subtitulo={categoria.category}
                                        Icone={categoria.icon}
                                        classeCor={categoria.color}
                                        etiqueta={`MANUAL: 0${categoria.id}`}
                                    >
                                        <div className="space-y-1.5">
                                            {categoria.topics.map(tema => (
                                                <button
                                                    key={tema.id}
                                                    onClick={() => setArtigoSelecionado(tema)}
                                                    className="w-full group/item flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:border-sky-500/40 transition-all hover:bg-white/[0.05] text-left"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-1 h-1 shrink-0 rounded-full bg-zinc-800 group-hover/item:bg-sky-500 group-hover/item:shadow-[0_0_8px_rgba(14,165,233,0.5)] transition-all" />
                                                        <span className="text-[10px] font-bold text-zinc-500 group-hover/item:text-white transition-colors uppercase truncate">{tema.title}</span>
                                                    </div>
                                                    <ChevronRight size={12} className="text-zinc-800 group-hover/item:text-sky-500 shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    </CartaoInformativo>
                                ))}
                            </div>

                            {/* SEÇÃO DE AJUDA ADICIONAL */}
                            {/* SEÇÃO DE AJUDA ADICIONAL */}
                            <div className="bg-gradient-to-r from-sky-500/10 to-transparent border border-sky-500/10 rounded-[2rem] p-10 relative overflow-hidden mt-12 hover-lift">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-start gap-6">
                                        <div className="p-4 bg-sky-500 text-white rounded-2xl shadow-lg shadow-sky-500/20">
                                            <HelpCircle size={28} />
                                        </div>
                                        <div className="max-w-md">
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 italic">Precisa de ajuda com algo difícil?</h3>
                                            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed tracking-tight">
                                                Nosso time está pronto para ajudar você a resolver qualquer problema com suas impressoras ou no uso do sistema.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => { navigator.clipboard.writeText("suporte@printlog.com.br"); setEstaCopiado(true); setTimeout(() => setEstaCopiado(false), 2000); }}
                                            className="h-12 px-8 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                                        >
                                            <Mail size={16} className={estaCopiado ? "text-emerald-400" : ""} /> {estaCopiado ? "COPIADO" : "COPIAR E-MAIL DE AJUDA"}
                                        </button>
                                        <button className="h-12 px-8 bg-sky-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sky-400 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-lg shadow-sky-500/20">
                                            FALAR COM UM ESPECIALISTA <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* JANELA DE DETALHES DO ARTIGO */}
            <JanelaFlutuante
                isOpen={!!artigoSelecionado}
                onClose={() => setArtigoSelecionado(null)}
                title={artigoSelecionado?.title || "Manual de Instruções"}
                subtitle={`Identificação: #MDK-${artigoSelecionado?.id || '000'}`}
                icon={artigoSelecionado?.gcode ? Terminal : FileText}
            >
                <div className="p-8 space-y-8 bg-zinc-950">
                    <div className="flex items-center gap-4">
                        <span className="text-[8px] font-black bg-sky-500/5 text-sky-400 px-3 py-1.5 rounded-lg border border-sky-500/20 uppercase tracking-widest flex items-center gap-2">
                            <Target size={10} /> Dificuldade: {artigoSelecionado?.level}
                        </span>
                        <span className="text-[8px] font-black bg-zinc-900 text-zinc-500 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest">
                            Última atualização: {artigoSelecionado?.updated}
                        </span>
                    </div>

                    <div className="relative p-6 bg-zinc-900/30 border-l-2 border-sky-500 rounded-r-2xl">
                        <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                            {artigoSelecionado?.content}
                        </p>
                    </div>

                    {artigoSelecionado?.gcode && (
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2 font-mono">
                                <Code size={12} /> Código da Impressora:
                            </p>
                            <div className="bg-black p-5 rounded-2xl border border-white/5 flex justify-between items-center group/code shadow-inner">
                                <code className="text-sky-400 text-xs font-mono font-bold tracking-wider">{artigoSelecionado.gcode}</code>
                                <button onClick={() => copiarCodigoComando(artigoSelecionado.gcode)} className="p-2 text-zinc-700 hover:text-sky-400 transition-colors">
                                    <Copy size={16} />
                                </button>
                            </div>
                            <button
                                onClick={() => copiarCodigoComando(artigoSelecionado.gcode)}
                                className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-sky-900/20"
                            >
                                COPIAR CÓDIGO PARA A IMPRESSORA
                            </button>
                        </div>
                    )}
                </div>
            </JanelaFlutuante>

            {/* AVISO DE SUCESSO AO COPIAR */}
            <JanelaFlutuante
                isOpen={configuracaoJanela.aberta}
                onClose={() => setConfiguracaoJanela({ ...configuracaoJanela, aberta: false })}
                title={configuracaoJanela.titulo}
                icon={configuracaoJanela.Icone}
            >
                <div className="p-10 text-center space-y-6">
                    <p className="text-xs text-zinc-500 font-bold leading-relaxed uppercase tracking-tight">
                        {configuracaoJanela.mensagem}
                    </p>
                    <button
                        onClick={() => setConfiguracaoJanela({ ...configuracaoJanela, aberta: false })}
                        className={`w-full h-12 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-white bg-emerald-600 hover:bg-emerald-500`}
                    >
                        ENTENDI
                    </button>
                </div>
            </JanelaFlutuante>
        </div>
    );
}