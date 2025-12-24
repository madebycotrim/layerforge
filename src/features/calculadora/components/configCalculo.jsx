import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
    User, Zap, Monitor, Settings2,
    HelpCircle, Save, Check, AlertCircle,
    Info, X, Factory, Sparkles, Trash2, RefreshCw
} from "lucide-react";

const PortalTooltip = ({ text, targetRef, visible }) => {
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    useLayoutEffect(() => {
        if (visible && targetRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            setCoords({ top: rect.top - 10, left: rect.left + (rect.width / 2) - 100 });
        }
    }, [visible, targetRef]);
    if (!visible) return null;
    return createPortal(
        <div className="fixed w-[200px] p-3 bg-zinc-950/95 backdrop-blur-md text-zinc-300 text-[10px] leading-relaxed rounded-xl border border-zinc-800 shadow-2xl z-[9999] pointer-events-none"
             style={{ top: coords.top, left: coords.left, transform: 'translateY(-100%)' }}>
            <div className="flex gap-2.5 relative z-50">
                <AlertCircle size={12} className="shrink-0 mt-0.5 text-sky-500" />
                <span className="font-medium">{text}</span>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-zinc-950 border-b border-r border-zinc-800 transform rotate-45"></div>
        </div>, document.body
    );
};

const ConfigInput = ({ label, suffix, value, onChange, icon: Icon, helpText, color = "text-zinc-600" }) => {
    const [isHovered, setIsHovered] = useState(false);
    const iconRef = useRef(null);
    return (
        <div className="group relative flex items-center justify-between p-2 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-300 focus-within:ring-1 focus-within:ring-sky-500/20 focus-within:border-sky-500/30">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-center transition-all ${color}`}>
                    <Icon size={14} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col relative cursor-help" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} ref={iconRef}>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide group-hover:text-zinc-200">{label}</span>
                        <HelpCircle size={10} className="text-zinc-700 group-hover:text-sky-500" />
                    </div>
                    <PortalTooltip text={helpText} targetRef={iconRef} visible={isHovered} />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input type="number" className="w-20 bg-transparent text-right text-xs font-mono font-bold text-zinc-300 outline-none" 
                       placeholder="0.00" value={value} onChange={(e) => onChange(e.target.value)} onWheel={(e) => e.target.blur()} />
                <span className="text-[9px] font-bold text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800/60 min-w-[36px] text-center">{suffix}</span>
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
    const isLoading = useRef(true);

    const printerPowerW = Number(impressoraSelecionada?.power || impressoraSelecionada?.potencia || 0);
    const hasSmartSync = printerPowerW > 0;

    // 1. Carregar do LocalStorage na montagem (Caso o pai ainda não tenha carregado)
    useEffect(() => {
        const defaults = localStorage.getItem("layerforge_defaults");
        if (defaults) {
            const parsed = JSON.parse(defaults);
            if (!valorHoraHumana) setValorHoraHumana(parsed.valorHoraHumana || "");
            if (!custoKwh) setCustoKwh(parsed.custoKwh || "");
            if (!custoHoraMaquina) setCustoHoraMaquina(parsed.custoHoraMaquina || "");
            if (!taxaSetup) setTaxaSetup(parsed.taxaSetup || "");
            if (!consumoImpressoraKw) setConsumoImpressoraKw(parsed.consumoImpressoraKw || "");
        } else {
            setShowWelcomeMessage(true);
        }
        // Finaliza o estado de carregamento para permitir que o botão "Salvar" mude de estado
        setTimeout(() => { isLoading.current = false; }, 200);
    }, []);

    // 2. Monitorar mudanças para ativar botão Salvar (Ignora a carga inicial)
    useEffect(() => {
        if (!isLoading.current) {
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
        if (window.confirm("Resertar custos da oficina?")) {
            setValorHoraHumana(""); setCustoKwh(""); setCustoHoraMaquina(""); setTaxaSetup(""); setConsumoImpressoraKw("");
            localStorage.removeItem("layerforge_defaults");
            setDadosSalvos(true);
        }
    };

    const handleSincronizar = () => {
        if (hasSmartSync) setConsumoImpressoraKw(String(printerPowerW / 1000));
    };

    return (
        <div className="flex flex-col gap-5 relative pb-10 select-none">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                    <div className="bg-zinc-900 p-1.5 rounded-md border border-zinc-800 text-zinc-500"><Settings2 size={14} /></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Custos da Farm</span>
                </div>
                <div className="flex items-center gap-2">
                    {hasSmartSync && (
                        <button onClick={handleSincronizar} className="p-1.5 rounded-lg text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"><RefreshCw size={14} /></button>
                    )}
                    <button onClick={handleLimparTudo} className="p-1.5 rounded-lg text-zinc-600 bg-zinc-900 border border-zinc-800 hover:text-rose-400 transition-all"><Trash2 size={14} /></button>
                    <div className="w-px h-4 bg-zinc-800 mx-0.5"></div>
                    <button onClick={handleSalvarPadroes} disabled={dadosSalvos}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${dadosSalvos ? "bg-zinc-900 text-zinc-600 opacity-60" : "bg-zinc-100 text-zinc-950 hover:bg-white shadow-lg"}`}>
                        {dadosSalvos ? <Check size={12} /> : <Save size={12} />} {dadosSalvos ? "Ajustes Salvos" : "Salvar Ajustes"}
                    </button>
                </div>
            </div>

            {showWelcomeMessage && (
                <div className="bg-sky-500/5 border border-sky-500/10 rounded-xl p-4 flex gap-3 relative">
                    <button onClick={() => setShowWelcomeMessage(false)} className="absolute top-2 right-2 text-zinc-600"><X size={12} /></button>
                    <div className="bg-sky-500/10 p-2 rounded-lg text-sky-400 h-fit"><Info size={16} /></div>
                    <div>
                        <h4 className="text-xs font-bold text-sky-100 mb-1">Configuração da Oficina</h4>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">Defina seus custos base. Esses valores serão usados como padrão para todos os novos cálculos.</p>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Máquina e Energia</h4>
                <div className="space-y-1.5">
                    <ConfigInput label="Potência" suffix="W" icon={Monitor} color="text-indigo-400" value={consumoImpressoraKw ? Math.round(Number(consumoImpressoraKw) * 1000) : ""} onChange={(v) => setConsumoImpressoraKw(v === "" ? "" : String(Number(v) / 1000))} helpText="Consumo médio da máquina (W)." />
                    <ConfigInput label="Preço kWh" suffix="R$/kWh" icon={Zap} color="text-amber-400" value={custoKwh} onChange={setCustoKwh} helpText="Valor do kWh na sua conta de luz." />
                    <ConfigInput label="Desgaste" suffix="R$/h" icon={Factory} color="text-zinc-400" value={custoHoraMaquina} onChange={setCustoHoraMaquina} helpText="Fundo para manutenção por hora de uso." />
                </div>
            </div>

            <div className="space-y-2 pt-2">
                <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Seu Trabalho</h4>
                <div className="space-y-1.5">
                    <ConfigInput label="Valor Hora" suffix="R$/h" icon={User} color="text-emerald-400" value={valorHoraHumana} onChange={setValorHoraHumana} helpText="Quanto vale sua hora de trabalho manual." />
                    <ConfigInput label="Taxa Início" suffix="R$" icon={Settings2} color="text-sky-400" value={taxaSetup} onChange={setTaxaSetup} helpText="Custo fixo para preparar cada impressão." />
                </div>
            </div>
        </div>
    );
}