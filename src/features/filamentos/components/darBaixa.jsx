import React, { useState, useEffect } from "react";
import {
    X, AlertTriangle, Fuel, Activity, History
} from "lucide-react";
import SpoolSideView from "./roloFilamento";
import { parseNumber, isColorDark } from "../../../hooks/useFormat";

export default function ModalBaixaRapida({ aberto, aoFechar, item, aoSalvar }) {
    const [consumo, setConsumo] = useState("");

    useEffect(() => {
        if (aberto) setConsumo("");
    }, [aberto]);

    if (!aberto || !item) return null;

    const capacidade = Math.max(1, parseNumber(item.weightTotal));
    const pesoAtual = parseNumber(item.weightCurrent);
    const qtdConsumo = parseNumber(consumo);
    const pesoFinal = Math.max(0, pesoAtual - qtdConsumo);

    const pctAtual = Math.min(100, (pesoAtual / capacidade) * 100);
    const pctFinal = Math.min(100, (pesoFinal / capacidade) * 100);

    const erroSaldo = (pesoAtual - qtdConsumo) < 0 && qtdConsumo > 0;
    const inputValido = consumo !== "" && qtdConsumo > 0;
    const corFilamento = item.colorHex || item.color || "#3b82f6";
    const textoEscuro = !isColorDark(corFilamento);

    const confirmar = () => {
        if (!inputValido || erroSaldo) return;
        aoSalvar({ ...item, weightCurrent: pesoFinal });
        aoFechar();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0 z-0" onClick={aoFechar} />

            <div className="relative bg-[#080808] border border-zinc-800 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] z-10">

                {/* --- LADO ESQUERDO: PREVIEW --- */}
                <div className="w-full md:w-[280px] bg-black/40 border-b md:border-b-0 md:border-r border-zinc-800/60 p-6 flex flex-col items-center justify-between shrink-0">
                    <div className="relative z-10 w-full">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                            <Activity size={12} className="text-sky-500" />
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Visual do Rolo</span>
                        </div>
                        <div className="flex justify-center py-2">
                            <SpoolSideView color={corFilamento} percent={pctFinal} size={130} />
                        </div>
                    </div>

                    <div className="relative z-10 w-full text-center space-y-2">
                        <h3 className="text-base font-bold text-white uppercase truncate">{item.name || "Filamento"}</h3>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-[7px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded uppercase">{item.brand}</span>
                            <span className="text-[7px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase">{item.type}</span>
                        </div>
                    </div>
                </div>

                {/* --- LADO DIREITO: REGISTRO --- */}
                <div className="flex-1 flex flex-col">
                    <header className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black border border-zinc-800 text-amber-500"><Fuel size={16} /></div>
                            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Dar baixa no material</h3>
                        </div>
                        <button onClick={aoFechar} className="p-1 text-zinc-600 hover:text-white transition-colors"><X size={18} /></button>
                    </header>

                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                        {/* PASSO 01: PESO */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-sky-500 font-mono">[ 01 ]</span>
                                <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Quanto pesou a peça?</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>

                            <div className="relative group">
                                <input
                                    autoFocus type="number" value={consumo}
                                    onChange={e => setConsumo(e.target.value)}
                                    placeholder="0"
                                    className={`w-full bg-zinc-900/20 border-2 rounded-2xl py-6 px-6 text-5xl font-mono font-bold text-center outline-none transition-all duration-300
                                        ${erroSaldo ? 'border-rose-500/40 text-rose-500' : 'border-zinc-800/80 text-white focus:border-sky-500/50 shadow-inner'}`}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 font-bold text-sm opacity-40 uppercase">gramas</div>
                            </div>

                            <div className="grid grid-cols-5 gap-2 relative z-20">
                                {[10, 25, 50, 100, 250].map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setConsumo(prev => (parseNumber(prev) + val).toString());
                                        }}
                                        className="py-2 bg-zinc-900/50 border border-zinc-800 hover:border-sky-500/50 hover:bg-sky-500/10 text-[10px] font-black text-zinc-500 hover:text-sky-400 rounded-lg transition-all cursor-pointer active:scale-95"
                                    >
                                        +{val}g
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* PASSO 02: PROJEÇÃO */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-emerald-500 font-mono">[ 02 ]</span>
                                <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Como vai ficar o rolo</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>

                            <div className="p-4 bg-zinc-900/20 border border-zinc-800/60 rounded-xl space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Novo peso no estoque</p>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className={`text-2xl font-mono font-bold ${erroSaldo ? 'text-rose-500' : 'text-zinc-100'}`}>
                                                {Math.round(pesoFinal)}
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-600 uppercase">g</span>
                                        </div>
                                    </div>

                                    {erroSaldo && (
                                        <div className="flex items-center gap-1.5 text-rose-500 animate-pulse mb-1">
                                            <AlertTriangle size={12} />
                                            <span className="text-[8px] font-bold uppercase">Material insuficiente!</span>
                                        </div>
                                    )}
                                </div>

                                <div className="h-2 w-full bg-zinc-950 rounded-full border border-zinc-800/50 overflow-hidden relative">
                                    <div
                                        className="absolute h-full transition-all duration-700 opacity-20"
                                        style={{ width: `${pctAtual}%`, backgroundColor: corFilamento }}
                                    />
                                    <div
                                        className="absolute h-full transition-all duration-700 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                        style={{ width: `${pctFinal}%`, backgroundColor: corFilamento }}
                                    />
                                </div>
                                <div className="flex justify-between text-[7px] font-black text-zinc-700 uppercase">
                                    <span>Vazio</span>
                                    <span>{Math.round(pctFinal)}% disponível</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <footer className="p-6 border-t border-white/5 bg-zinc-950/50 flex gap-3 mt-auto">
                        <button onClick={aoFechar} className="flex-1 py-2.5 rounded-lg border border-zinc-800 text-[10px] font-bold uppercase text-zinc-600 hover:text-white transition-all">Cancelar</button>
                        <button
                            disabled={!inputValido || erroSaldo}
                            onClick={confirmar}
                            className={`flex-[2] py-2.5 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all
                                ${(!inputValido || erroSaldo) ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800' : 'hover:brightness-110 active:scale-[0.95]'}`}
                            style={(!inputValido || erroSaldo) ? {} : {
                                backgroundColor: corFilamento,
                                color: textoEscuro ? '#050505' : '#ffffff',
                                boxShadow: `0 8px 20px -6px ${corFilamento}60`
                            }}
                        >
                            <History size={14} /> Confirmar Retirada
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}