import React, { useState, useMemo } from "react";
import {
    ArrowLeft, Package, Zap, Clock, DollarSign,
    TrendingUp, Info, Printer, Save, History, Crown
} from "lucide-react";
import { Link } from "wouter";
import logo from '../assets/logo.png'; // Garanta que o logo esteja importado

/* =============================
   LAYOUT DE IMPRESSÃO (PROFISSIONAL)
============================== */
const PrintLayout = ({ dados, inputs }) => {
    const date = new Date().toLocaleDateString('pt-BR');

    return (
        <div id="print-area" className="hidden print:flex flex-col p-8 bg-white text-black h-screen w-full fixed top-0 left-0 z-[9999]">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-zinc-100 pb-6 mb-8">
                <div className="flex items-center gap-4">
                    {/* Logo em preto e branco para impressão */}
                    <img src={logo} alt="LayerForge" className="w-12 h-12 object-contain grayscale contrast-125" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Orçamento de Impressão 3D</h1>
                        <p className="text-sm text-zinc-500 font-medium">Gerado em {date}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Referência</h2>
                    <p className="text-xl font-mono font-bold text-zinc-900">#{Math.floor(Math.random() * 10000)}</p>
                </div>
            </div>

            {/* Detalhes do Projeto */}
            <div className="mb-8 p-6 bg-zinc-50 rounded-xl border border-zinc-100">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-200 pb-2">Especificações do Projeto</h3>
                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <span className="block text-xs text-zinc-500 mb-1">Peso da Peça</span>
                        <span className="block text-lg font-bold text-zinc-800">{inputs.peso}g</span>
                    </div>
                    <div>
                        <span className="block text-xs text-zinc-500 mb-1">Tempo Estimado</span>
                        <span className="block text-lg font-bold text-zinc-800">
                            {inputs.horas}h {inputs.minutos}m
                        </span>
                    </div>
                    <div>
                        <span className="block text-xs text-zinc-500 mb-1">Material</span>
                        <span className="block text-lg font-bold text-zinc-800">PLA/PETG/ABS</span>
                    </div>
                </div>
            </div>

            {/* Tabela de Custos (Simplificada para o Cliente) */}
            <div className="flex-1">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Composição de Valores</h3>
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-100 text-zinc-600 font-bold uppercase text-xs">
                        <tr>
                            <th className="py-3 px-4 rounded-l-lg">Descrição</th>
                            <th className="py-3 px-4 text-right rounded-r-lg">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="text-zinc-700">
                        <tr className="border-b border-zinc-100">
                            <td className="py-4 px-4">Custo de Material (Filamento)</td>
                            <td className="py-4 px-4 text-right font-mono">{formatBRL(dados.custoMaterial)}</td>
                        </tr>
                        <tr className="border-b border-zinc-100">
                            <td className="py-4 px-4">Custos Operacionais (Energia/Máquina)</td>
                            <td className="py-4 px-4 text-right font-mono">{formatBRL(dados.custoEnergia)}</td>
                        </tr>
                        <tr className="border-b border-zinc-100">
                            <td className="py-4 px-4">Serviço de Impressão e Acabamento</td>
                            <td className="py-4 px-4 text-right font-mono">{formatBRL(dados.custoMaoDeObra + dados.lucroLiquido)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Total */}
            <div className="mt-8 flex justify-end">
                <div className="w-64 bg-zinc-900 text-white p-6 rounded-xl shadow-lg print:bg-black print:text-white">
                    <span className="block text-xs text-zinc-400 uppercase tracking-widest mb-1">Valor Total</span>
                    <span className="block text-3xl font-bold font-mono">{formatBRL(dados.precoVenda)}</span>
                </div>
            </div>

            {/* Footer Profissional */}
            <div className="mt-auto pt-8 border-t border-zinc-100 flex justify-between items-end">
                <div>
                    <p className="text-xs text-zinc-400">Orçamento válido por 7 dias.</p>
                    <p className="text-xs text-zinc-400">Sujeito a alteração conforme disponibilidade de material.</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Powered by</span>
                        <span className="text-sm font-bold text-zinc-800">LayerForge</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">www.layerforge.com</p>
                </div>
            </div>
        </div>
    );
};

/* ... (MANTENHA OS COMPONENTES AdPlaceholder, Card, InputGroup, SummaryRow IGUAIS) ... */
const AdPlaceholder = ({ label = "Publicidade", className = "", width = "w-[160px]", height = "h-[600px]" }) => (
    <div className={`${width} ${height} flex flex-col items-center justify-center bg-[#09090b] border border-zinc-800 rounded-lg relative overflow-hidden shrink-0 ${className}`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#52525b 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
        <div className="z-10 flex flex-col items-center gap-2 opacity-50">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-700 px-2 py-0.5 rounded">{label}</div>
            <span className="text-[9px] text-zinc-600">Espaço Reservado</span>
        </div>
    </div>
);

const Card = ({ title, icon: Icon, children }) => (
    <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/10 transition-all duration-300 shadow-sm group">
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-sky-500 transition-colors">
                <Icon size={16} />
            </div>
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="grid gap-4">{children}</div>
    </div>
);

const InputGroup = ({ label, suffix, value, onChange, placeholder, icon: Icon }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide ml-1">{label}</label>
        <div className="relative group">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors">
                    <Icon size={14} />
                </div>
            )}
            <input
                type="number"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 text-sm font-mono text-zinc-200 placeholder-zinc-800 outline-none transition-all focus:border-sky-500 focus:ring-1 focus:ring-sky-500/10 hover:border-zinc-700 ${Icon ? "pl-9" : "pl-3"} ${suffix ? "pr-10" : "pr-3"}`}
            />
            {suffix && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600 pointer-events-none">{suffix}</div>
            )}
        </div>
    </div>
);

const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/5 last:border-0">
        <span className="text-zinc-500 text-xs font-medium">{label}</span>
        <span className="font-mono font-bold text-zinc-200">{formatBRL(value)}</span>
    </div>
);

const parseNumber = (value) => (!value ? 0 : Number(value.replace(",", ".")) || 0);
const formatBRL = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

/* =============================
   PÁGINA PRINCIPAL
============================== */
export default function CalculadoraFree() {
    const [precoFilamento, setPrecoFilamento] = useState("");
    const [pesoPeca, setPesoPeca] = useState("");
    const [tempoHoras, setTempoHoras] = useState("");
    const [tempoMinutos, setTempoMinutos] = useState("");
    const [consumoWatts, setConsumoWatts] = useState("300");
    const [valorKwh, setValorKwh] = useState("0.95");
    const [maoDeObraHora, setMaoDeObraHora] = useState("");
    const [horasTrabalhadas, setHorasTrabalhadas] = useState("");
    const [margemLucro, setMargemLucro] = useState("100");

    const resultado = useMemo(() => {
        const pKg = parseNumber(precoFilamento);
        const peso = parseNumber(pesoPeca);
        const tHoras = parseNumber(tempoHoras);
        const tMin = parseNumber(tempoMinutos);
        const watts = parseNumber(consumoWatts);
        const kwhPrice = parseNumber(valorKwh);
        const moHora = parseNumber(maoDeObraHora);
        const moTempo = parseNumber(horasTrabalhadas);
        const margem = parseNumber(margemLucro);

        const tempoTotalHoras = tHoras + (tMin / 60);
        const custoMaterial = (peso / 1000) * pKg;
        const consumoKwhTotal = ((watts * 0.7) / 1000) * tempoTotalHoras;
        const custoEnergia = consumoKwhTotal * kwhPrice;
        const custoMaoDeObra = moTempo * moHora;
        const custoTotal = custoMaterial + custoEnergia + custoMaoDeObra;
        const lucroDesejado = custoTotal * (margem / 100);
        const precoVenda = custoTotal + lucroDesejado;

        return { custoMaterial, custoEnergia, custoMaoDeObra, custoTotal, precoVenda, lucroLiquido: lucroDesejado };
    }, [precoFilamento, pesoPeca, tempoHoras, tempoMinutos, consumoWatts, valorKwh, maoDeObraHora, horasTrabalhadas, margemLucro]);

    const isEmpty = resultado.custoTotal <= 0.01;

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-sky-500/30 overflow-x-hidden flex flex-col">
            {/* CSS Global para controlar a impressão */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 20px; background: white; }
                    @page { margin: 0; size: auto; }
                }
            `}</style>

            {/* COMPONENTE DE IMPRESSÃO (INVISÍVEL NA TELA) */}
            <PrintLayout
                dados={resultado}
                inputs={{ peso: pesoPeca, horas: tempoHoras || '0', minutos: tempoMinutos || '0' }}
            />

            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 print:hidden">
                <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <button className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors cursor-pointer">
                                <ArrowLeft size={16} />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                                Calculadora<span className="px-1.5 py-0.5 rounded text-[9px] bg-sky-500/10 text-sky-500 border border-sky-500/20 uppercase font-bold">Free</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex justify-center py-10 px-4 gap-8 relative z-10 print:hidden">
                <aside className="hidden 2xl:flex flex-col gap-4 sticky top-24 h-fit">
                    <AdPlaceholder width="w-[160px]" height="h-[600px]" />
                </aside>

                <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 h-fit">
                    <div className="space-y-6">
                        <Card title="Material & Consumo" icon={Package}>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Preço Filamento" suffix="R$/kg" placeholder="120,00" value={precoFilamento} onChange={setPrecoFilamento} />
                                <InputGroup label="Peso da Peça" suffix="g" placeholder="Ex: 45" value={pesoPeca} onChange={setPesoPeca} />
                            </div>
                        </Card>
                        <Card title="Tempo & Energia" icon={Clock}>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Horas Impressão" suffix="h" placeholder="0" value={tempoHoras} onChange={setTempoHoras} />
                                <InputGroup label="Minutos" suffix="min" placeholder="0" value={tempoMinutos} onChange={setTempoMinutos} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                <InputGroup label="Potência Máquina" suffix="W" placeholder="300" value={consumoWatts} onChange={setConsumoWatts} icon={Zap} />
                                <InputGroup label="Custo Energia" suffix="R$/kWh" placeholder="0.95" value={valorKwh} onChange={setValorKwh} />
                            </div>
                        </Card>
                        <Card title="Financeiro" icon={DollarSign}>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Sua Hora" suffix="R$/h" placeholder="20,00" value={maoDeObraHora} onChange={setMaoDeObraHora} />
                                <InputGroup label="Tempo Gasto" suffix="h" placeholder="Ex: 0.5" value={horasTrabalhadas} onChange={setHorasTrabalhadas} />
                            </div>
                            <div className="pt-2 border-t border-white/5">
                                <InputGroup label="Margem de Lucro" suffix="%" placeholder="100" value={margemLucro} onChange={setMargemLucro} icon={TrendingUp} />
                            </div>
                        </Card>
                    </div>

                    <aside className="lg:sticky lg:top-24 h-fit space-y-6">
                        <div className="bg-[#0e0e11] border border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
                            <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full transition-all duration-1000 ${isEmpty ? 'bg-zinc-800/20' : 'bg-sky-500/20 group-hover:bg-sky-500/30'}`}></div>
                            <div className="relative z-10 text-center">
                                <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Preço Sugerido</h2>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <span className="text-xl text-zinc-600 font-light mt-2">R$</span>
                                    <span className={`text-5xl font-bold tracking-tighter font-mono ${isEmpty ? 'text-zinc-700' : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]'}`}>
                                        {isEmpty ? "0,00" : formatBRL(resultado.precoVenda).replace("R$", "").trim()}
                                    </span>
                                </div>
                                {!isEmpty && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mt-2">
                                        <TrendingUp size={12} />
                                        Lucro: {formatBRL(resultado.lucroLiquido)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-5 shadow-lg">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info size={14} className="text-sky-500" /> Detalhamento
                            </h3>
                            <div className="space-y-2">
                                <SummaryRow label="Material" value={resultado.custoMaterial} />
                                <SummaryRow label="Energia" value={resultado.custoEnergia} />
                                <SummaryRow label="Mão de Obra" value={resultado.custoMaoDeObra} />
                                <div className="h-px bg-zinc-800 my-2"></div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-xs font-bold text-zinc-400 uppercase">Custo Produção</span>
                                    <span className="font-mono font-bold text-zinc-200">{formatBRL(resultado.custoTotal)}</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => window.print()} className="w-full h-11 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg">
                            <Printer size={16} /> Imprimir Orçamento
                        </button>

                        {/* UPSSELL BUTTONS */}
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/register" className="w-full group">
                                <button className="w-full h-11 bg-[#09090b] border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:border-zinc-700 hover:text-zinc-300 transition-all shadow-sm">
                                    <Save size={14} /> Salvar <Crown size={12} className="text-amber-600/80 group-hover:text-amber-500 transition-colors" />
                                </button>
                            </Link>
                            <Link href="/register" className="w-full group">
                                <button className="w-full h-11 bg-[#09090b] border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:border-zinc-700 hover:text-zinc-300 transition-all shadow-sm">
                                    <History size={14} /> Histórico <Crown size={12} className="text-amber-600/80 group-hover:text-amber-500 transition-colors" />
                                </button>
                            </Link>
                        </div>

                        <div className="block xl:hidden w-full pt-4">
                            <AdPlaceholder width="w-full" height="h-[250px]" label="Anúncio" />
                        </div>
                    </aside>
                </main>

                <aside className="hidden xl:flex flex-col gap-4 sticky top-24 h-fit">
                    <AdPlaceholder width="w-[160px]" height="h-[600px]" />
                </aside>
            </div>
        </div>
    );
}