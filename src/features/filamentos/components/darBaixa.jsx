// --- FILE: src/features/filamentos/components/baixaEstoque.jsx ---
import React, { useState, useEffect } from "react";
import { X, ArrowRight, AlertTriangle, Scale, History, Factory, Fuel } from "lucide-react";
import SpoolSideView from "./roloFilamento";

// --- HELPERS VISUAIS ---
const isColorDark = (color) => {
    if (!color) return false;
    let hex = color.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 4), 16);
    const b = parseInt(hex.substr(4, 6), 16);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 140;
};

export default function ModalBaixaRapida({ aberto, aoFechar, item, aoSalvar }) {
    const [consumo, setConsumo] = useState("");

    // Reset ao abrir
    useEffect(() => {
        if (aberto) setConsumo("");
    }, [aberto]);

    if (!aberto || !item) return null;

    // --- CÁLCULOS EM TEMPO REAL ---
    const capacidade = Number(item.weightTotal) || 1000;
    const pesoAtual = Number(item.weightCurrent) || 0;
    const qtdConsumo = Number(consumo);

    // Saldo Futuro (Previsto)
    const pesoFinal = Math.max(0, pesoAtual - qtdConsumo);
    
    // Porcentagens
    const pctAtual = (pesoAtual / capacidade) * 100;
    
    // ESTA é a variável mágica: ela calcula a % baseada no input e atualiza o rolo
    const pctFinal = capacidade > 0 ? (pesoFinal / capacidade) * 100 : 0;

    // Validações
    const erroSaldo = (pesoAtual - qtdConsumo) < 0 && qtdConsumo > 0;
    const inputValido = consumo !== "" && qtdConsumo > 0;

    // Cores e Dados
    const corFilamento = item.colorHex || item.color || "#e4e4e7";
    const textoEscuro = isColorDark(corFilamento);

    // Ação
    const confirmar = () => {
        if (!inputValido || erroSaldo) return;
        aoSalvar({
            ...item,
            weightCurrent: pesoFinal
        });
        aoFechar();
    };

    // Botões de atalho
    const addConsumo = (valor) => {
        setConsumo(prev => {
            const atual = Number(prev) || 0;
            return (atual + valor).toString();
        });
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={aoFechar}></div>

            <div className="relative bg-[#09090b] border border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* --- COLUNA ESQUERDA: PREVIEW AO VIVO --- */}
                <div className="w-full md:w-[320px] bg-zinc-900/40 border-b md:border-b-0 md:border-r border-zinc-800 p-8 flex flex-col items-center justify-center relative shrink-0 transition-all duration-300">

                    {/* Tag "Preview" para indicar simulação */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 border border-zinc-800 backdrop-blur-sm px-3 py-1 rounded-full z-20">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                            <History size={10} /> Simulação
                        </span>
                    </div>

                    {/* Glow Effect Dinâmico (Diminui se o rolo ficar vazio) */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[90px] pointer-events-none transition-all duration-500"
                        style={{ 
                            backgroundColor: corFilamento,
                            opacity: pctFinal < 5 ? 0.05 : 0.2 // Glow diminui se acabar o fio
                        }}
                    />

                    {/* Rolo: Atualiza o tamanho conforme digita (pctFinal) */}
                    <div className="relative z-10 scale-125 mb-8 drop-shadow-2xl transition-all duration-500 ease-out">
                        <SpoolSideView
                            color={corFilamento}
                            percent={pctFinal} // <--- O SEGREDO ESTÁ AQUI
                            type={item.spoolType || "plastic"}
                            size={120}
                        />
                    </div>

                    {/* Infos do Material */}
                    <div className="z-10 text-center space-y-3 w-full">
                        <h3 className="text-zinc-100 font-bold text-xl leading-tight break-words px-4">
                            {item.name}
                        </h3>

                        <div className="flex flex-col items-center gap-2">
                             <div className="px-3 py-1 rounded bg-[#09090b] border border-zinc-800 shadow-sm">
                                <span className="text-[10px] font-black text-zinc-300 block uppercase tracking-widest leading-none">
                                    {item.material || item.type}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-zinc-500">
                                <Factory size={10} />
                                <span className="text-xs font-mono uppercase tracking-wide">
                                    {item.brand}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- COLUNA DIREITA: INPUTS --- */}
                <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">

                    {/* Header */}
                    <div className="px-8 py-6 border-b border-zinc-800 bg-zinc-900/20 flex justify-between items-center">
                        <div>
                            <h3 className="text-zinc-100 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                <Fuel size={16} className="text-zinc-400" />
                                Registrar Consumo
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">O rolo ao lado simula o resultado final.</p>
                        </div>
                        <button onClick={aoFechar} className="text-zinc-500 hover:text-zinc-200 p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-8 flex-1 flex flex-col justify-center space-y-8">

                        {/* Input Area */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                                <Scale size={12} /> Quantidade utilizada (gramas)
                            </label>

                            <div className="relative group">
                                <input
                                    autoFocus
                                    type="number"
                                    min="0"
                                    value={consumo}
                                    onChange={e => setConsumo(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && confirmar()}
                                    placeholder="0"
                                    className={`
                                        no-spinner w-full bg-[#050505] border-2 rounded-2xl py-5 px-4 text-center text-5xl font-mono font-bold text-white outline-none transition-all
                                        placeholder:text-zinc-800 shadow-inner
                                        ${erroSaldo ? 'border-rose-900/50 focus:border-rose-500 text-rose-500' : 'border-zinc-800 focus:border-zinc-600'}
                                    `}
                                />
                                <span className="absolute right-6 bottom-6 text-zinc-700 font-mono text-sm pointer-events-none font-bold">g</span>
                            </div>

                            {/* Botões de Atalho */}
                            <div className="grid grid-cols-4 gap-3 pt-2">
                                {[10, 25, 50, 100].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => addConsumo(val)}
                                        className="py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                                    >
                                        +{val}g
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Barra de Saldo Restante */}
                        <div className="bg-zinc-900/30 rounded-xl p-5 border border-zinc-800/50 space-y-3 relative overflow-hidden">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider relative z-10">
                                <span className="text-zinc-500">Saldo Previsto</span>
                                {erroSaldo ? (
                                    <span className="text-rose-500 flex items-center gap-1 animate-pulse">
                                        <AlertTriangle size={12} /> Saldo Insuficiente
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-2 font-mono">
                                        <span className="text-zinc-500 line-through decoration-zinc-700 decoration-2 opacity-50">
                                            {Math.round(pesoAtual)}g
                                        </span>
                                        <ArrowRight size={12} className="text-zinc-600" />
                                        <span className="text-white text-sm font-bold scale-110">
                                            {Math.round(pesoFinal)}g
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 relative">
                                {/* Fundo (Peso Atual - "Fantasma") */}
                                <div
                                    style={{ width: `${pctAtual}%` }}
                                    className="absolute top-0 left-0 h-full bg-zinc-800 transition-all duration-300"
                                />
                                
                                {/* Frente (Peso Final - Colorido) */}
                                <div
                                    style={{
                                        width: `${pctFinal}%`,
                                        backgroundColor: erroSaldo ? '#f43f5e' : corFilamento,
                                        boxShadow: `0 0 10px ${corFilamento}50`
                                    }}
                                    className="absolute top-0 left-0 h-full transition-all duration-300 ease-out z-10"
                                />

                                {/* Diferença (Consumo - Vermelho) */}
                                <div 
                                    className="absolute top-0 h-full bg-rose-500/20 z-0 border-l border-rose-500/50"
                                    style={{
                                        left: `${pctFinal}%`,
                                        width: `${Math.max(0, pctAtual - pctFinal)}%`,
                                        display: erroSaldo ? 'none' : 'block'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-zinc-800 bg-zinc-900/30 flex justify-end gap-3">
                        <button
                            onClick={aoFechar}
                            className="px-6 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold uppercase transition-colors"
                        >
                            Cancelar
                        </button>

                        <button
                            onClick={confirmar}
                            disabled={!inputValido || erroSaldo}
                            className={`
                                px-8 py-3 rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-xl transition-all
                                ${(!inputValido || erroSaldo)
                                    ? 'opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500'
                                    : 'hover:brightness-110 active:scale-95 transform'}
                            `}
                            style={(!inputValido || erroSaldo) ? {} : {
                                backgroundColor: corFilamento,
                                color: textoEscuro ? '#ffffff' : '#09090b',
                                boxShadow: `0 0 25px -5px ${corFilamento}50`
                            }}
                        >
                            <History size={16} />
                            Confirmar Baixa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};