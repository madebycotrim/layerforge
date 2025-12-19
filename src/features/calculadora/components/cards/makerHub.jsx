import React, { useState, useEffect } from "react";
import { 
    Zap, Copy, Check, Package, CalendarClock, 
    Share2, PieChart, Printer, ArrowUpRight, 
    ChevronLeft, ChevronRight, AlertTriangle, Clock,
    Bot, Cpu, Sparkles
} from "lucide-react";
import { formatCurrency } from "../../../../lib/format";

export default function MakersHubWidget({ resultados, entradas, nomeProjeto }) {
    const [slide, setSlide] = useState(0);
    const [copied, setCopied] = useState(false);
    
    // Configurações do "Sonho de Consumo"
    const PRECO_IMPRESSORA_META = 4500; 

    // Resetar estado de cópia ao mudar dados
    useEffect(() => { setCopied(false); }, [resultados]);

    // --- CÁLCULOS CENTRAIS ---
    
    // 1. Orçamento
    const getQuoteText = () => {
        const total = formatCurrency(resultados.precoSugerido || 0);
        const prazo = `${entradas.tempoImpressaoHoras}h ${entradas.tempoImpressaoMinutos}m`;
        return `*ORÇAMENTO: ${nomeProjeto || "Peça 3D"}*\n\n📦 *Modelo:* Personalizado\n💎 *Qualidade:* Premium\n⏱️ *Tempo:* ~${prazo}\n💰 *Investimento:* ${total}\n\n_Validade: 7 dias._\nPodemos fechar? 🚀`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getQuoteText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 2. Cronograma
    const tempoTotalMinutos = (Number(entradas.tempoImpressaoHoras) * 60) + Number(entradas.tempoImpressaoMinutos);
    const dataAgora = new Date();
    const dataFim = new Date(dataAgora.getTime() + tempoTotalMinutos * 60000);
    const horaFim = dataFim.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isTomorrow = dataFim.getDate() !== dataAgora.getDate();
    const isLongPrint = tempoTotalMinutos > 720;

    // 3. Gestão de Filamento
    const pesoPeca = Number(entradas.pesoModelo) || 0;
    const porcentagemRolo = pesoPeca > 0 ? (pesoPeca / 1000) * 100 : 0;
    const pecasPorRolo = pesoPeca > 0 ? Math.floor(1000 / pesoPeca) : 0;

    // 4. Payback
    const lucroUnitario = resultados.lucroBrutoUnitario || 0;
    const hasData = lucroUnitario > 0 && pesoPeca > 0;
    const pecasParaNovaMaquina = hasData ? Math.ceil(PRECO_IMPRESSORA_META / lucroUnitario) : 0;

    // 5. Custos
    const custoTotal = resultados.custoUnitario || 1;
    const pctMat = Math.round((resultados.custoMaterial / custoTotal) * 100);
    const pctEnergia = Math.round((resultados.custoEnergia / custoTotal) * 100);
    const pctMaq = Math.round((resultados.custoMaquina / custoTotal) * 100);
    const pctMO = Math.round((resultados.custoMaoDeObra / custoTotal) * 100);

    // --- SLIDES CONFIG ---
    const slides = [
        { id: 'quote', title: "Gerador de Venda", icon: Share2, color: 'text-emerald-400', badge: 'Pronto para Enviar' },
        { id: 'schedule', title: "Cronograma", icon: CalendarClock, color: 'text-amber-400', badge: 'Estimativa Real' },
        { id: 'filament', title: "Estoque", icon: Package, color: 'text-sky-400', badge: 'Consumo de Material' },
        { id: 'costs', title: "Raio-X", icon: PieChart, color: 'text-purple-400', badge: 'Análise de Custo' },
        { id: 'meta', title: "Metas", icon: Printer, color: 'text-rose-400', badge: 'Expansão' },
    ];

    const currentSlide = slides[slide];

    // Navegação
    const nextSlide = () => setSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="h-full min-h-[300px] flex flex-col relative group select-none">
            
            {/* CONTAINER PRINCIPAL COM BORDA GRADIENTE SUTIL */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl -z-10" />
            <div className="absolute inset-[1px] bg-[#09090b] rounded-2xl -z-10" />
            
            {/* BACKGROUND PATTERN (Tech Grid) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl z-0"
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
            </div>

            {/* --- HEADER: MAKERS HUB BRANDING --- */}
            <div className="h-12 px-4 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/40 rounded-t-2xl backdrop-blur-sm z-20">
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(14,165,233,0.15)]">
                        <Bot size={14} className="text-sky-400" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-black text-zinc-200 tracking-widest uppercase font-mono">MAKERS HUB</span>
                        <span className="text-[8px] font-bold text-sky-500/80 uppercase tracking-widest">Intelligence</span>
                    </div>
                </div>

                {/* Status Dinâmico */}
                <div className={`flex items-center gap-2 px-2 py-1 rounded-full border bg-zinc-950/50 ${currentSlide.color.replace('text-', 'border-').replace('400', '500/20')}`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${currentSlide.color.replace('text-', 'bg-')}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${currentSlide.color}`}>
                        {currentSlide.badge}
                    </span>
                </div>
            </div>

            {/* --- CONTEÚDO (SLIDES) --- */}
            <div className="flex-1 p-5 relative z-10 overflow-hidden">
                
                {/* 1. GERADOR DE ORÇAMENTO */}
                {slide === 0 && (
                    <div className="h-full flex flex-col animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="flex-1 bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 mb-4 relative group/text hover:border-emerald-500/20 transition-all shadow-inner">
                             <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/text:opacity-100 transition-opacity">
                                <Share2 size={12} className="text-emerald-500" />
                             </div>
                             <p className="text-[10px] text-zinc-400 font-mono leading-relaxed opacity-90 whitespace-pre-wrap">
                                {getQuoteText()}
                             </p>
                        </div>

                        <div className="grid grid-cols-[1fr_auto] gap-2">
                            <button 
                                onClick={handleCopy}
                                className={`h-9 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border
                                ${copied 
                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                                    : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"}`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? "Copiado!" : "Copiar Texto"}
                            </button>
                            <button 
                                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getQuoteText())}`, '_blank')}
                                className="h-9 w-10 rounded-lg bg-[#25D366] hover:bg-[#1fa851] text-white flex items-center justify-center transition-all shadow-lg shadow-emerald-900/20 hover:scale-105"
                            >
                                <ArrowUpRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. CRONOGRAMA */}
                {slide === 1 && (
                    <div className="h-full flex flex-col justify-center animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="relative bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl w-full text-center overflow-hidden">
                            {/* Fundo decorativo */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                            
                            {hasData ? (
                                <>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Previsão de Término</span>
                                    <div className="flex items-baseline justify-center gap-2 mb-1">
                                        <span className="text-5xl font-mono font-bold text-white tracking-tighter drop-shadow-lg">{horaFim}</span>
                                    </div>
                                    {isTomorrow && (
                                        <span className="inline-block text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mb-3">
                                            Amanhã (+1 Dia)
                                        </span>
                                    )}
                                    <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center px-4">
                                        <div className="text-left">
                                            <span className="block text-[9px] text-zinc-600 uppercase">Duração</span>
                                            <span className="text-xs font-mono text-zinc-300">{tempoTotalMinutos} min</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[9px] text-zinc-600 uppercase">Risco</span>
                                            <span className={`text-xs font-bold ${isLongPrint ? "text-rose-500" : "text-emerald-500"}`}>
                                                {isLongPrint ? "Alto" : "Baixo"}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <span className="text-xs text-zinc-600 font-bold uppercase">Defina o tempo de impressão</span>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. ESTOQUE */}
                {slide === 2 && (
                    <div className="h-full flex flex-col justify-center gap-6 animate-in slide-in-from-right-8 fade-in duration-300">
                         {/* Visualização do Rolo */}
                         <div className="relative px-2">
                             <div className="flex justify-between text-[9px] font-bold uppercase text-zinc-500 mb-2">
                                 <span>Consumo ({pesoPeca}g)</span>
                                 <span>{porcentagemRolo.toFixed(1)}% do Rolo</span>
                             </div>
                             
                             <div className="h-8 w-full bg-zinc-900 rounded-lg border border-zinc-800 relative overflow-hidden group/bar">
                                 {/* Grid Pattern dentro da barra */}
                                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '4px 100%' }}></div>
                                 
                                 <div 
                                    style={{width: `${Math.min(porcentagemRolo, 100)}%`}} 
                                    className="h-full bg-gradient-to-r from-sky-600 to-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-1000 relative"
                                 >
                                    <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50"></div>
                                 </div>
                             </div>
                         </div>

                         <div className="grid grid-cols-2 gap-3">
                            <StatBox value={pecasPorRolo} label="Peças / Rolo" color="text-white" />
                            <StatBox value={`${pesoPeca}g`} label="Peso Unitário" color="text-sky-400" />
                         </div>
                    </div>
                )}

                {/* 4. CUSTOS */}
                {slide === 3 && (
                    <div className="h-full flex flex-col justify-center animate-in slide-in-from-right-8 fade-in duration-300">
                         <div className="flex items-center justify-center mb-6 relative">
                             {/* Gráfico Donut CSS Puro */}
                             <div 
                                className="w-32 h-32 rounded-full relative"
                                style={{
                                    background: `conic-gradient(
                                        #0ea5e9 0% ${pctMat}%, 
                                        #eab308 ${pctMat}% ${pctMat + pctEnergia}%, 
                                        #a855f7 ${pctMat + pctEnergia}% ${pctMat + pctEnergia + pctMaq}%, 
                                        #10b981 ${pctMat + pctEnergia + pctMaq}% 100%
                                    )`
                                }}
                             >
                                <div className="absolute inset-4 bg-[#09090b] rounded-full flex items-center justify-center flex-col z-10">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Custo</span>
                                    <span className="text-sm font-mono font-bold text-white">{formatCurrency(custoTotal)}</span>
                                </div>
                             </div>
                         </div>

                         <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-2">
                             <CostLegend label="Material" pct={pctMat} color="bg-sky-500" />
                             <CostLegend label="Energia" pct={pctEnergia} color="bg-yellow-500" />
                             <CostLegend label="Máquina" pct={pctMaq} color="bg-purple-500" />
                             <CostLegend label="Mão Obra" pct={pctMO} color="bg-emerald-500" />
                         </div>
                    </div>
                )}

                {/* 5. METAS */}
                {slide === 4 && (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-in slide-in-from-right-8 fade-in duration-300">
                         {hasData ? (
                             <div className="relative w-full">
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-rose-500/5 blur-3xl rounded-full -z-10" />
                                 
                                 <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-4 block">
                                    Nova Máquina em
                                 </span>
                                 
                                 <div className="text-7xl font-black text-white tracking-tighter drop-shadow-2xl mb-2 flex items-center justify-center gap-1">
                                    {pecasParaNovaMaquina}
                                    <span className="text-lg text-zinc-600 font-bold self-end mb-2">un.</span>
                                 </div>

                                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                                    <Printer size={12} className="text-rose-500" />
                                    <span className="text-[10px] text-zinc-400">
                                        Meta: <strong className="text-zinc-200">{formatCurrency(PRECO_IMPRESSORA_META)}</strong>
                                    </span>
                                 </div>
                             </div>
                         ) : (
                             <div className="flex flex-col items-center gap-3 opacity-50">
                                 <Sparkles size={32} className="text-zinc-600" />
                                 <span className="text-xs font-bold text-zinc-500 uppercase">Sem dados de lucro</span>
                             </div>
                         )}
                    </div>
                )}
            </div>

            {/* --- FOOTER: NAVEGAÇÃO --- */}
            <div className="h-10 border-t border-zinc-800/60 bg-zinc-900/20 flex items-center justify-between px-3 shrink-0 z-20 rounded-b-2xl">
                <button 
                    onClick={prevSlide}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all active:scale-95"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Indicadores Minimalistas */}
                <div className="flex gap-1.5">
                    {slides.map((s, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setSlide(idx)}
                            className={`transition-all duration-300 rounded-full 
                            ${slide === idx 
                                ? `w-6 h-1 ${s.color.replace('text-', 'bg-')}` 
                                : "w-1 h-1 bg-zinc-700 hover:bg-zinc-500"}`} 
                        />
                    ))}
                </div>

                <button 
                    onClick={nextSlide}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all active:scale-95"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

// --- COMPONENTES VISUAIS AUXILIARES ---

const StatBox = ({ value, label, color }) => (
    <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-xl flex flex-col items-center justify-center group hover:border-zinc-700 transition-colors">
        <span className={`text-xl font-mono font-bold ${color} mb-1`}>{value}</span>
        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">{label}</span>
    </div>
);

const CostLegend = ({ label, pct, color }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-sm ${color}`}></div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase">{label}</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-300 font-bold">{pct}%</span>
    </div>
);