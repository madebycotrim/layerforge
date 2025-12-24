import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
    User, Zap, Monitor, Settings2,
    HelpCircle, Save, Check, AlertCircle,
    Info, X, Factory, Sparkles, Trash2, RefreshCw
} from "lucide-react";

// --- PORTAL TOOLTIP ---
const PortalTooltip = ({ text, targetRef, visible }) => {
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    useLayoutEffect(() => {
        if (visible && targetRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            const tooltipWidth = 200;
            let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            if (left < 10) left = 10; 
            const top = rect.top - 10; 
            setCoords({ top, left });
        }
    }, [visible, targetRef]);

    if (!visible) return null;

    return createPortal(
        <div
            className="fixed w-[200px] p-3 bg-zinc-950/95 backdrop-blur-md text-zinc-300 text-[10px] leading-relaxed rounded-xl border border-zinc-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-[9999] pointer-events-none "
            style={{ top: coords.top, left: coords.left, transform: 'translateY(-100%)' }}
        >
            <div className="flex gap-2.5 relative z-50">
                <div className="shrink-0 mt-0.5 text-sky-500">
                    <AlertCircle size={12} />
                </div>
                <span className="font-medium text-zinc-300">{text}</span>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-zinc-950 border-b border-r border-zinc-800 transform rotate-45 z-40"></div>
        </div>,
        document.body
    );
};

// --- INPUT COMPONENT ---
const ConfigInput = ({ label, suffix, value, onChange, icon: Icon, helpText, color = "text-zinc-600" }) => {
    const [isHovered, setIsHovered] = useState(false);
    const iconRef = useRef(null);

    return (
        <div className="group relative flex items-center justify-between p-2 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-300 focus-within:ring-1 focus-within:ring-sky-500/20 focus-within:border-sky-500/30 focus-within:bg-zinc-900">
            <div className="flex items-center gap-3">
                <div className={`
                    w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800/80 
                    flex items-center justify-center transition-all duration-300
                    group-hover:scale-105 group-focus-within:border-sky-500/20 group-focus-within:text-sky-500
                    ${color}
                `}>
                    <Icon size={14} strokeWidth={1.5} />
                </div>

                <div className="flex flex-col relative cursor-help">
                    <div
                        className="flex items-center gap-1.5"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        ref={iconRef}
                    >
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide group-hover:text-zinc-200 transition-colors">
                            {label}
                        </span>
                        <HelpCircle size={10} className="text-zinc-700 group-hover:text-sky-500 transition-colors" />
                    </div>
                    <PortalTooltip text={helpText} targetRef={iconRef} visible={isHovered} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="number"
                    className="w-20 bg-transparent text-right text-xs font-mono font-bold text-zinc-300 outline-none placeholder:text-zinc-700 focus:text-white transition-colors"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onWheel={(e) => e.target.blur()}
                />
                <span className="text-[9px] font-bold text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800/60 min-w-[36px] text-center select-none">
                    {suffix}
                </span>
            </div>
        </div>
    );
};

export default function PainelConfiguracoesCalculo({
    valorHoraHumana, setValorHoraHumana,
    custoKwh, setCustoKwh,
    consumoImpressoraKw, setConsumoImpressoraKw,
    custoHoraMaquina, setCustoHoraMaquina,
    taxaSetup, setTaxaSetup,
    onSaved,
    impressoraSelecionada
}) {
    const [dadosSalvos, setDadosSalvos] = useState(true);
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

    const getSafePower = () => {
        if (!impressoraSelecionada) return 0;
        return Number(impressoraSelecionada.power) || Number(impressoraSelecionada.potencia) || 0;
    };

    const printerPowerW = getSafePower();
    const printerName = impressoraSelecionada?.name || impressoraSelecionada?.nome || "Impressora";
    const hasSmartSync = printerPowerW > 0;

    useEffect(() => {
        if (hasSmartSync) {
            setConsumoImpressoraKw(printerPowerW / 1000);
        }
    }, [impressoraSelecionada]);

    useEffect(() => {
        const defaults = localStorage.getItem("layerforge_defaults");
        if (defaults) {
            const parsed = JSON.parse(defaults);
            if (!valorHoraHumana) setValorHoraHumana(parsed.valorHoraHumana || "");
            if (!custoKwh) setCustoKwh(parsed.custoKwh || "");
            if (!custoHoraMaquina) setCustoHoraMaquina(parsed.custoHoraMaquina || "");
            if (!taxaSetup) setTaxaSetup(parsed.taxaSetup || "");
            
            if (!consumoImpressoraKw && !hasSmartSync && parsed.consumoImpressoraKw) {
                setConsumoImpressoraKw(parsed.consumoImpressoraKw);
            }
        } else {
            setShowWelcomeMessage(true);
        }
    }, []); 

    useEffect(() => {
        if (valorHoraHumana || custoKwh || custoHoraMaquina || taxaSetup) {
            setDadosSalvos(false);
        }
    }, [valorHoraHumana, custoKwh, custoHoraMaquina, taxaSetup, consumoImpressoraKw]);

    const handleSalvarPadroes = () => {
        const settings = { valorHoraHumana, custoKwh, consumoImpressoraKw, custoHoraMaquina, taxaSetup };
        localStorage.setItem("layerforge_defaults", JSON.stringify(settings));
        setDadosSalvos(true);
        setShowWelcomeMessage(false);
        if (onSaved) onSaved();
    };

    const handleLimparTudo = () => {
        if (window.confirm("Quer mesmo resetar os custos da sua oficina? Isso apagará seus valores salvos.")) {
            setValorHoraHumana("");
            setCustoKwh("");
            setCustoHoraMaquina("");
            setTaxaSetup("");
            setConsumoImpressoraKw(""); 
            localStorage.removeItem("layerforge_defaults");
            setDadosSalvos(true);
        }
    };

    const handleSincronizar = () => {
        setConsumoImpressoraKw(printerPowerW / 1000);
    };

    return (
        <div className="flex flex-col gap-5 relative pb-10 select-none">

            {/* HEADER: TÍTULO E AÇÕES */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                    <div className="bg-zinc-900 p-1.5 rounded-md border border-zinc-800 text-zinc-500">
                        <Settings2 size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        Custos da Farm
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {hasSmartSync && (
                        <button
                            onClick={handleSincronizar}
                            title={`Usar potência da ${printerName}`}
                            className="p-1.5 rounded-lg text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all active:scale-95 group relative"
                        >
                            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        </button>
                    )}

                    <button
                        onClick={handleLimparTudo}
                        title="Limpar todos os campos"
                        className="p-1.5 rounded-lg text-zinc-600 bg-zinc-900 border border-zinc-800 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-900/10 transition-all active:scale-95"
                    >
                        <Trash2 size={14} />
                    </button>

                    <div className="w-px h-4 bg-zinc-800 mx-0.5"></div>

                    <button
                        onClick={handleSalvarPadroes}
                        disabled={dadosSalvos}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all duration-300
                            ${dadosSalvos
                                ? "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-default opacity-60"
                                : "bg-zinc-100 text-zinc-950 hover:bg-white hover:scale-[1.02] shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)] active:scale-95 cursor-pointer"
                            }
                        `}
                    >
                        {dadosSalvos ? <Check size={12} /> : <Save size={12} />}
                        {dadosSalvos ? "Ajustes Salvos" : "Salvar Ajustes"}
                    </button>
                </div>
            </div>

            {/* ALERT DE BOAS-VINDAS */}
            {showWelcomeMessage && (
                <div className="relative overflow-hidden bg-sky-500/5 border border-sky-500/10 rounded-xl p-4 flex gap-3">
                    <div className="absolute top-0 right-0 p-2">
                        <button onClick={() => setShowWelcomeMessage(false)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                            <X size={12} />
                        </button>
                    </div>
                    <div className="bg-sky-500/10 p-2 h-fit rounded-lg text-sky-400 ring-1 ring-sky-500/20">
                        <Info size={16} />
                    </div>
                    <div className="flex-1 pr-4">
                        <h4 className="text-xs font-bold text-sky-100 mb-1">Configuração da Oficina</h4>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                            Configure os custos da sua oficina para ter orçamentos exatos.
                            {hasSmartSync && (
                                <span className="text-sky-400 block mt-1 flex items-center gap-1">
                                    <Sparkles size={10} />
                                    Potência sincronizada com a <strong>{printerName}</strong> ({printerPowerW}W).
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* SEÇÃO 1: MÁQUINA E ENERGIA */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-1 h-3 rounded-full bg-indigo-500/50"></div>
                    <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Máquina e Energia</h4>
                </div>

                <div className="space-y-1.5">
                    <ConfigInput
                        label="Potência da Impressora" suffix="W" icon={Monitor}
                        color="text-indigo-400"
                        value={Math.round((consumoImpressoraKw || 0) * 1000)}
                        onChange={(v) => setConsumoImpressoraKw(v / 1000)}
                        helpText={hasSmartSync
                            ? `Puxado do perfil da ${printerName}: média de ${printerPowerW}W.` 
                            : "Potência média que sua máquina consome (ex: Ender 3 usa cerca de 150W)."}
                    />

                    <ConfigInput
                        label="Preço do kWh" suffix="R$/kWh" icon={Zap}
                        color="text-amber-400"
                        value={custoKwh} onChange={setCustoKwh}
                        helpText="Confira o valor do kWh na sua conta de luz, já com as taxas."
                    />

                    <ConfigInput
                        label="Desgaste por Hora" suffix="R$/h" icon={Factory}
                        color="text-zinc-400"
                        value={custoHoraMaquina} onChange={setCustoHoraMaquina}
                        helpText="Valor para cobrir futuras manutenções e trocas de peças (bicos, correias, etc)."
                    />
                </div>
            </div>

            {/* SEÇÃO 2: OPERACIONAL */}
            <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-1 h-3 rounded-full bg-emerald-500/50"></div>
                    <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Seu Trabalho</h4>
                </div>

                <div className="space-y-1.5">
                    <ConfigInput
                        label="Valor da sua Hora" suffix="R$/h" icon={User}
                        color="text-emerald-400"
                        value={valorHoraHumana} onChange={setValorHoraHumana}
                        helpText="Quanto vale o seu tempo para fatiar, limpar a peça e dar o acabamento."
                    />

                    <ConfigInput
                        label="Início da Impressão" suffix="R$" icon={Settings2}
                        color="text-sky-400"
                        value={taxaSetup} onChange={setTaxaSetup}
                        helpText="Custo fixo para cada vez que você liga a máquina (limpeza da mesa, adesivo, etc)."
                    />
                </div>
            </div>
        </div>
    );
}