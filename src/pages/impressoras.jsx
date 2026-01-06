import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { Printer, ChevronDown, Scan, AlertTriangle, Trash2, X } from "lucide-react";

// --- LAYOUT E INTERFACE GLOBAL ---
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";

// --- COMPONENTES DA FUNCIONALIDADE ---
import PrinterCard from "../features/impressoras/components/cardsImpressoras";
import PrinterModal from "../features/impressoras/components/modalImpressora";
import DiagnosticsModal from "../features/impressoras/components/modalDiagnostico";
import StatusImpressoras from "../features/impressoras/components/statusImpressoras";
import HeaderImpressoras from "../features/impressoras/components/header";

// --- LÓGICA E STORE (ARMAZENAMENTO) ---
import { usePrinterStore } from "../features/impressoras/logic/printer";

const CONFIG_SIDEBAR = { RECOLHIDA: 68, EXPANDIDA: 256 };

const SessaoImpressoras = ({ titulo, items, acoes }) => {
    const [estaAberto, setEstaAberto] = useState(true);

    const totalHorasGrupo = useMemo(() => items.reduce((acumulador, imp) => acumulador + Number(imp.horas_totais || imp.totalHours || 0), 0), [items]);

    return (
        <section className="space-y-8">
            <div className="flex items-center gap-6 group">
                <button onClick={() => setEstaAberto(!estaAberto)} className="flex items-center gap-5 hover:opacity-90 transition-all duration-200 focus:outline-none">
                    <div className={`p-2.5 rounded-xl border transition-all duration-300 ${estaAberto ? 'bg-zinc-900 border-zinc-800 text-emerald-400 shadow-inner' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}>
                        <Printer size={18} strokeWidth={2} />
                    </div>

                    <div className="flex flex-col items-start text-left">
                        <div className="flex items-center gap-3">
                            <h2 className="text-zinc-50 text-base font-bold uppercase tracking-widest leading-none">
                                {titulo}
                            </h2>
                            <ChevronDown
                                size={16}
                                className={`text-zinc-600 transition-transform duration-300 ease-out ${!estaAberto ? "-rotate-90" : ""}`}
                            />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1.5 tracking-widest">
                            Impressora Ativa no Sistema
                        </span>
                    </div>
                </button>

                <div className="h-px flex-1 bg-zinc-800/40 mx-2" />

                <div className="flex items-center gap-6 px-5 py-2 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase mb-1 tracking-widest">Horas do Grupo</span>
                        <span className="text-sm font-bold font-mono text-emerald-400 leading-none">
                            {totalHorasGrupo.toLocaleString('pt-BR')}<span className="text-[10px] ml-1 font-sans text-emerald-600/70">h</span>
                        </span>
                    </div>
                    <div className="w-px h-6 bg-zinc-800/60" />
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase mb-1 tracking-widest">Máquinas</span>
                        <span className="text-sm font-bold font-mono text-zinc-200 leading-none">
                            {String(items.length).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            {estaAberto && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,380px),1fr))] gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
                    {items.map((imp) => (
                        <PrinterCard key={imp.id} printer={imp} onEdit={acoes.onEdit} onDelete={acoes.onDelete} onResetMaint={() => acoes.onResetMaint(imp)} onToggleStatus={acoes.onToggleStatus} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default function ImpressorasPage() {
    const { printers, fetchPrinters, upsertPrinter, removePrinter, updatePrinterStatus, loading } = usePrinterStore();
    const [larguraSidebar, setLarguraSidebar] = useState(CONFIG_SIDEBAR.RECOLHIDA);
    const [busca, setBusca] = useState("");
    const buscaDiferida = useDeferredValue(busca);

    const [modalAberto, setModalAberto] = useState(false);
    const [itemParaEdicao, setItemParaEdicao] = useState(null);
    const [impressoraEmDiagnostico, setImpressoraEmDiagnostico] = useState(null);
    const [checklists, setChecklists] = useState({});
    
    // Estados para o Modal de Exclusão
    const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    useEffect(() => {
        fetchPrinters();
    }, [fetchPrinters]);

    const { gruposMapeados, estatisticas, contagemCritica } = useMemo(() => {
        const termo = buscaDiferida.toLowerCase();
        let totalPecas = 0;
        let totalFilamentoGrama = 0;
        let maquinasCriticas = 0;
        const listaOriginal = Array.isArray(printers) ? printers : [];

        const frotaFiltrada = listaOriginal.filter(p =>
            (p.name || p.nome || "").toLowerCase().includes(termo) ||
            (p.model || p.modelo || "").toLowerCase().includes(termo) ||
            (p.brand || p.marca || "").toLowerCase().includes(termo)
        );

        const agrupamento = frotaFiltrada.reduce((acc, p) => {
            const horas = Number(p.totalHours || p.horas_totais || 0);
            const historico = Array.isArray(p.history) ? p.history : [];

            totalPecas += historico.length;
            totalFilamentoGrama += historico.reduce((soma, h) => soma + (Number(h.filamentUsed || h.peso_usado || 0)), 0);

            const ultimaMaint = Number(p.lastMaintenanceHour || p.ultima_manutencao_hora || 0);
            const intervalo = Math.max(1, Number(p.maintenanceInterval || p.intervalo_manutencao || 300));
            const porcentagemSaude = ((intervalo - (horas - ultimaMaint)) / intervalo) * 100;

            if (p.status === 'maintenance' || p.status === 'error' || porcentagemSaude < 15) {
                maquinasCriticas++;
            }

            const categoria = (p.brand || p.marca || "Impressora Geral").toUpperCase();
            if (!acc[categoria]) acc[categoria] = [];
            acc[categoria].push(p);
            return acc;
        }, {});

        return {
            gruposMapeados: agrupamento,
            contagemCritica: maquinasCriticas,
            estatisticas: {
                totalPrints: totalPecas,
                filamento: (totalFilamentoGrama / 1000).toFixed(2)
            }
        };
    }, [printers, buscaDiferida]);

    const aoSalvar = async (dados) => {
        try {
            await upsertPrinter(dados);
            setModalAberto(false);
            setToast({ visible: true, message: "Impressora salva com sucesso!", type: 'success' });
        } catch (erro) {
            setToast({ visible: true, message: "Ops! Não conseguimos salvar a impressora.", type: 'error' });
        }
    };

    // Handler para abrir o modal de exclusão
    const handleOpenDeleteModal = (id) => {
        const item = printers.find(p => p.id === id);
        if (item) setConfirmacaoExclusao({ aberta: true, item });
    };

    // Execução real da exclusão
    const aoConfirmarExclusao = async () => {
        const { item } = confirmacaoExclusao;
        if (!item) return;

        try {
            await removePrinter(item.id);
            setToast({ visible: true, message: "Impressora removida com sucesso.", type: 'success' });
        } catch (e) {
            setToast({ visible: true, message: "Erro ao remover a impressora.", type: 'error' });
        } finally {
            setConfirmacaoExclusao({ aberta: false, item: null });
        }
    };

    const finalizarReparo = async (id) => {
        const impressora = printers.find(p => p.id === id);
        if (impressora) {
            try {
                await upsertPrinter({
                    ...impressora,
                    ultima_manutencao_hora: Number(impressora.totalHours || impressora.horas_totais || 0),
                    status: 'idle'
                });
                setChecklists(prev => {
                    const novo = { ...prev };
                    delete novo[id];
                    return novo;
                });
                setToast({ visible: true, message: "Manutenção finalizada!", type: 'success' });
            } catch (erro) {
                setToast({ visible: true, message: "Erro ao finalizar manutenção.", type: 'error' });
            }
        }
        setImpressoraEmDiagnostico(null);
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            <MainSidebar onCollapseChange={(recolhida) => setLarguraSidebar(recolhida ? CONFIG_SIDEBAR.RECOLHIDA : CONFIG_SIDEBAR.EXPANDIDA)} />

            {toast.visible && (
                <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />
            )}

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out" style={{ marginLeft: `${larguraSidebar}px` }}>
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-[0.1]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }} />
                </div>

                <HeaderImpressoras busca={busca} setBusca={setBusca} onAddClick={() => { setItemParaEdicao(null); setModalAberto(true); }} />

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 xl:p-12 relative z-10 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto space-y-16">
                        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                            <StatusImpressoras totalCount={printers.length} criticalCount={contagemCritica} stats={estatisticas} />
                        </div>

                        {Object.entries(gruposMapeados).length > 0 ? (
                            <div className="space-y-24 pb-40 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                                {Object.entries(gruposMapeados).map(([fabricante, lista]) => (
                                    <SessaoImpressoras
                                        key={fabricante}
                                        titulo={fabricante}
                                        items={lista}
                                        acoes={{
                                            onEdit: (p) => { setItemParaEdicao(p); setModalAberto(true); },
                                            onDelete: handleOpenDeleteModal, // Integrado com o modal
                                            onResetMaint: (p) => setImpressoraEmDiagnostico(p),
                                            onToggleStatus: updatePrinterStatus
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            !loading && (
                                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/10">
                                    <Scan size={48} strokeWidth={1.2} className="text-emerald-500/40" />
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* MODAIS EXISTENTES */}
                <PrinterModal aberto={modalAberto} aoFechar={() => { setModalAberto(false); setItemParaEdicao(null); }} aoSalvar={aoSalvar} dadosIniciais={itemParaEdicao} />

                {impressoraEmDiagnostico && (
                    <DiagnosticsModal 
                        printer={impressoraEmDiagnostico} 
                        completedTasks={new Set(checklists[impressoraEmDiagnostico.id] || [])} 
                        onToggleTask={(label) => {
                            setChecklists(prev => {
                                const atual = new Set(prev[impressoraEmDiagnostico.id] || []);
                                if (atual.has(label)) atual.delete(label); else atual.add(label);
                                return { ...prev, [impressoraEmDiagnostico.id]: Array.from(atual) };
                            });
                        }}
                        onClose={() => setImpressoraEmDiagnostico(null)}
                        onResolve={finalizarReparo}
                    />
                )}

                {/* NOVO: Modal de Confirmação de Exclusão */}
                {confirmacaoExclusao.aberta && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8">
                                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-500/10 mx-auto">
                                    <AlertTriangle className="text-red-500" size={32} />
                                </div>
                                
                                <h3 className="text-xl font-bold text-center text-zinc-100 mb-2">
                                    Remover Impressora?
                                </h3>
                                
                                <p className="text-center text-zinc-400 text-sm leading-relaxed">
                                    Você está prestes a remover <span className="text-zinc-200 font-semibold">"{confirmacaoExclusao.item?.name || confirmacaoExclusao.item?.nome}"</span>. 
                                    Isso apagará o histórico de impressões e horas desta máquina.
                                </p>
                            </div>

                            <div className="flex gap-3 p-6 bg-zinc-900/50 border-t border-zinc-800">
                                <button
                                    onClick={() => setConfirmacaoExclusao({ aberta: false, item: null })}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-widest transition-all"
                                >
                                    Manter
                                </button>
                                <button
                                    onClick={aoConfirmarExclusao}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Remover
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
