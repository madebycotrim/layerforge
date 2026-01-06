import React, { useEffect, useMemo, useState } from "react";
import {
    X, History, Package, RotateCcw, Trash2, Search,
    Database, Loader2, Calendar, TrendingUp, Clock, Check, 
    AlertTriangle, CheckCircle2, ExternalLink
} from "lucide-react";
import { useProjectsStore } from "../../orcamentos/logic/projects";
import { formatCurrency } from "../../../utils/numbers";
import Popup from "../../../components/Popup";

export default function GavetaHistorico({ open, onClose, onRestore }) {
    const {
        projects: projetos,
        fetchHistory: buscarHistorico,
        removeHistoryEntry: removerEntrada,
        clearHistory: limparHistorico,
        approveBudget: aprovarOrcamento,
        isLoading: estaCarregando
    } = useProjectsStore();

    const [busca, setBusca] = useState("");

    const [confirmacao, setConfirmacao] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: null,
        icon: AlertTriangle,
        variant: "primary"
    });

    const fecharConfirmacao = () => setConfirmacao(prev => ({ ...prev, open: false }));

    // Função de formatação para o padrão Brasileiro
    const formatarDataLocal = (stringData) => {
        if (!stringData) return "Data não registrada";
        try {
            const data = new Date(stringData);
            
            // Verifica se a data é válida
            if (isNaN(data.getTime())) return "Data inválida";

            // Formata: 06/01/2026 às 14:30
            const formatador = new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'America/Sao_Paulo' // Força o fuso de Brasília
            });

            const partes = formatador.formatToParts(data);
            const d = partes.find(p => p.type === 'day').value;
            const m = partes.find(p => p.type === 'month').value;
            const y = partes.find(p => p.type === 'year').value;
            const hr = partes.find(p => p.type === 'hour').value;
            const min = partes.find(p => p.type === 'minute').value;

            return `${d}/${m}/${y} às ${hr}:${min}`;
        } catch {
            return "Erro ao formatar";
        }
    };

    const perguntarAprovacao = (projeto) => {
        setConfirmacao({
            open: true,
            title: "Confirmar Aprovação",
            message: "Ao aprovar, este projeto será enviado para a fila de produção e os insumos serão reservados. Confirmar?",
            icon: CheckCircle2,
            variant: "success",
            onConfirm: () => {
                aprovarOrcamento(projeto);
                fecharConfirmacao();
            }
        });
    };

    const perguntarExclusao = (id) => {
        setConfirmacao({
            open: true,
            title: "Remover Registro",
            message: "Esta ação é permanente e removerá todos os dados técnicos e financeiros deste registro. Deseja continuar?",
            icon: Trash2,
            variant: "danger",
            onConfirm: () => {
                removerEntrada(id);
                fecharConfirmacao();
            }
        });
    };

    const perguntarLimparTudo = () => {
        setConfirmacao({
            open: true,
            title: "Purgar Histórico",
            message: "Atenção: Você apagará TODOS os orçamentos salvos na nuvem. Esta operação não pode ser desfeita.",
            icon: AlertTriangle,
            variant: "danger",
            onConfirm: () => {
                limparHistorico();
                fecharConfirmacao();
            }
        });
    };

    useEffect(() => {
        if (open) buscarHistorico();
    }, [open, buscarHistorico]);

    const projetosFiltrados = useMemo(() => {
        const lista = Array.isArray(projetos) ? projetos : [];
        const termo = busca.toLowerCase();
        return lista.filter(item => (item.label || "").toLowerCase().includes(termo));
    }, [projetos, busca]);

    return (
        <>
            <div
                className={`fixed inset-0 z-[100] bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            <aside className={`fixed top-0 right-0 z-[101] h-screen w-full sm:w-[480px] bg-zinc-950 border-l border-white/10 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}>

                {/* Header */}
                <div className="h-28 px-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-400 shadow-inner group">
                            {estaCarregando ? <Loader2 size={26} className="animate-spin" /> : <History size={26} />}
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-1">MakersLog Cloud</h2>
                            <p className="text-sm font-bold text-white tracking-tight uppercase">Histórico de Vendas</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Busca */}
                <div className="p-8 pb-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={18} />
                        <input
                            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl pl-12 pr-4 h-14 text-sm font-medium text-zinc-200 outline-none focus:border-sky-500/40 focus:ring-4 focus:ring-sky-500/5 transition-all"
                            placeholder="Pesquisar por nome do projeto..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-5 custom-scrollbar">
                    {projetosFiltrados.length > 0 ? (
                        projetosFiltrados.map((projeto) => {
                            const dados = projeto.data || projeto.payload || {};
                            const resultados = dados.resultados || {};
                            const status = projeto.status || dados.status || "rascunho";
                            const isAprovado = status === 'aprovado';
                            const margem = Number(resultados.margemEfetivaPct || 0);

                            return (
                                <div key={projeto.id} className="group relative bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-6 transition-all duration-300 hover:bg-zinc-900/60 hover:border-white/10">
                                    
                                    <div className={`absolute left-0 top-8 bottom-8 w-1.5 rounded-r-full transition-all duration-500 ${
                                        isAprovado ? 'bg-sky-500 shadow-[4px_0_15px_rgba(14,165,233,0.5)]' : 
                                        margem > 25 ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`} />

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="pl-3">
                                            <h3 className="text-base font-bold text-white tracking-tight mb-1">
                                                {projeto.label || "Projeto sem título"}
                                            </h3>
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Calendar size={13} className="text-zinc-600" />
                                                <span className="text-[11px] font-bold tracking-wider">
                                                    {formatarDataLocal(projeto.timestamp || projeto.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className={`text-[10px] font-black flex items-center justify-end gap-1.5 mb-1 ${
                                                margem > 0 ? 'text-emerald-400' : 'text-rose-400'
                                            }`}>
                                                <TrendingUp size={14} /> {Math.round(margem)}%
                                            </div>
                                            <div className="text-xl font-black text-white font-mono tracking-tighter">
                                                {formatCurrency(resultados.precoComDesconto || resultados.precoSugerido || 0)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-black/20 rounded-2xl p-3 border border-white/[0.02] flex items-center gap-3">
                                            <Package size={16} className="text-zinc-600" />
                                            <div>
                                                <p className="text-[9px] font-black text-zinc-500 uppercase">Material</p>
                                                <p className="text-xs font-bold text-zinc-200">{(Number(dados.entradas?.material?.pesoModelo || 0) * Number(dados.entradas?.qtdPecas || 1)).toFixed(0)}g</p>
                                            </div>
                                        </div>
                                        <div className="bg-black/20 rounded-2xl p-3 border border-white/[0.02] flex items-center gap-3">
                                            <Clock size={16} className="text-zinc-600" />
                                            <div>
                                                <p className="text-[9px] font-black text-zinc-500 uppercase">Tempo</p>
                                                <p className="text-xs font-bold text-zinc-200">{dados.entradas?.tempo?.impressaoHoras || 0}h{dados.entradas?.tempo?.impressaoMinutos || 0}m</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {!isAprovado ? (
                                            <button
                                                onClick={() => perguntarAprovacao(projeto)}
                                                className="flex-1 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <Check size={16} strokeWidth={3} /> Aprovar Agora
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => { onRestore(projeto); onClose(); }}
                                                className="flex-1 h-12 rounded-2xl bg-sky-600 border border-sky-400/20 text-white text-[11px] font-black uppercase tracking-widest hover:bg-sky-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-900/20"
                                            >
                                                <ExternalLink size={16} /> Abrir Orçamento
                                            </button>
                                        )}

                                        <button
                                            onClick={() => { onRestore(projeto); onClose(); }}
                                            title="Restaurar dados"
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-800/40 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                                        >
                                            <RotateCcw size={18} />
                                        </button>

                                        <button
                                            onClick={() => perguntarExclusao(projeto.id)}
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-800/40 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-80 flex flex-col items-center justify-center text-zinc-800 gap-4 opacity-30">
                            <Database size={48} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Histórico Inexistente</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {projetos.length > 0 && (
                    <div className="p-8 border-t border-white/5 bg-zinc-900/10">
                        <button onClick={perguntarLimparTudo} className="w-full h-14 rounded-2xl border border-rose-500/10 text-rose-500/40 hover:text-rose-400 hover:border-rose-500/40 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all">
                            <Trash2 size={16} /> Purgar Banco de Dados
                        </button>
                    </div>
                )}
            </aside>

            {/* Popup */}
            <Popup
                isOpen={confirmacao.open}
                onClose={fecharConfirmacao}
                title={confirmacao.title}
                subtitle="Ação Crítica"
                icon={confirmacao.icon}
                footer={
                    <div className="flex gap-3 w-full">
                        <button onClick={fecharConfirmacao} className="flex-1 h-14 rounded-2xl bg-zinc-900 text-zinc-500 text-xs font-bold hover:text-white transition-all">
                            Cancelar
                        </button>
                        <button
                            onClick={confirmacao.onConfirm}
                            className={`flex-[2] h-14 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all ${
                                confirmacao.variant === 'danger' ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/20' : 'bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-900/20'
                            }`}
                        >
                            Confirmar
                        </button>
                    </div>
                }
            >
                <div className="p-8 text-center text-zinc-400 text-sm font-medium leading-relaxed">
                    {confirmacao.message}
                </div>
            </Popup>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 20px; }
            `}} />
        </>
    );
}
