import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { Scan, AlertTriangle, Trash2, X, PackageSearch, Database } from "lucide-react";

// LAYOUT E COMPONENTES GLOBAIS
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";
import Popup from "../components/Popup"; // Componente Unificado

// LÓGICA E STORE (Zustand)
import { useFilamentStore } from "../features/filamentos/logic/filaments.js";
import { useLocalWeather } from "../hooks/useLocalWeather";

// COMPONENTES DA FUNCIONALIDADE (FILAMENTOS)
import StatusFilamentos from "../features/filamentos/components/statusFilamentos";
import FilamentHeader from "../features/filamentos/components/header";
import SessaoFilamentos from "../features/filamentos/components/sessaoFilamentos";
import ModalFilamento from "../features/filamentos/components/modalFilamento.jsx";
import ModalBaixaRapida from "../features/filamentos/components/modalBaixaEstoque.jsx";

const VIEW_MODE_KEY = "printlog_filaments_view";
const DEFAULT_VIEW_MODE = "grid";

export default function FilamentosPage() {
  const [larguraSidebar, setLarguraSidebar] = useState(68);
  const [busca, setBusca] = useState("");
  const deferredBusca = useDeferredValue(busca);

  const { temp, humidity, loading: weatherLoading } = useLocalWeather();
  const { filaments, fetchFilaments, saveFilament, deleteFilament, loading } = useFilamentStore();

  const [viewMode, setViewMode] = useState(() => localStorage.getItem(VIEW_MODE_KEY) || DEFAULT_VIEW_MODE);

  // Estados de Controle de Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEdicao, setItemEdicao] = useState(null);
  const [itemConsumo, setItemConsumo] = useState(null);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  useEffect(() => {
    fetchFilaments().catch(() => showToast("Erro ao carregar os filamentos.", "error"));
  }, [fetchFilaments, showToast]);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // PROCESSAMENTO DE DADOS
  const { grupos, stats, lowStockCount } = useMemo(() => {
    const termo = deferredBusca.toLowerCase().trim();
    const listaOriginal = Array.isArray(filaments) ? filaments : [];

    const filtrados = listaOriginal.filter(f => {
      const nome = (f.nome || "").toLowerCase();
      const material = (f.material || "").toLowerCase();
      const marca = (f.marca || "").toLowerCase();
      return nome.includes(termo) || material.includes(termo) || marca.includes(termo);
    });

    let totalG = 0;
    let valorTotalAcumulado = 0;
    let lowStock = 0;

    listaOriginal.forEach(f => {
      const atual = Number(f.peso_atual) || 0;
      const total = Math.max(1, Number(f.peso_total) || 1000);
      const preco = Number(f.preco) || 0;
      totalG += atual;
      valorTotalAcumulado += (preco / total) * atual;
      if ((atual / total) <= 0.2 || atual < 150) lowStock++;
    });

    const map = filtrados.reduce((acc, f) => {
      const materialKey = (f.material || "OUTROS").toUpperCase().trim();
      if (!acc[materialKey]) acc[materialKey] = [];
      acc[materialKey].push(f);
      return acc;
    }, {});

    return {
      grupos: map,
      lowStockCount: lowStock,
      stats: { valorTotal: valorTotalAcumulado, pesoKg: totalG / 1000 }
    };
  }, [filaments, deferredBusca]);

  // HANDLERS
  const fecharModais = useCallback(() => {
    setModalAberto(false);
    setItemEdicao(null);
    setItemConsumo(null);
    setConfirmacaoExclusao({ aberta: false, item: null });
  }, []);

  const aoSalvarFilamento = async (dados) => {
    try {
      const isEdicao = !!(dados.id || itemEdicao?.id);
      await saveFilament(dados);
      fecharModais();
      showToast(isEdicao ? "Alterações salvas!" : "Novo material adicionado!");
    } catch (e) {
      showToast("Tivemos um problema ao salvar.", "error");
    }
  };

  const aoConfirmarExclusao = async () => {
    const { item } = confirmacaoExclusao;
    if (!item) return;
    try {
      await deleteFilament(item.id);
      showToast("Material removido com sucesso.");
    } catch (e) {
      showToast("Erro ao excluir o material.", "error");
    } finally {
      fecharModais();
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
      <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      )}

      <main
        className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${larguraSidebar}px` }}
      >
        {/* FUNDO DECORATIVO */}
        <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-0 opacity-[0.1]" style={{
            backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
          }} />

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
            <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-sky-500/30 via-transparent to-transparent" />
          </div>
        </div>

        <FilamentHeader
          busca={busca}
          setBusca={setBusca}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddClick={() => { setItemEdicao(null); setModalAberto(true); }}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 xl:p-12 relative z-10">
          <div className="max-w-[1600px] mx-auto space-y-16">
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              <StatusFilamentos
                totalWeight={stats.pesoKg}
                lowStockCount={lowStockCount}
                valorTotal={stats.valorTotal}
                weather={{ temp, humidity, loading: weatherLoading }}
              />
            </div>

            {Object.entries(grupos).length > 0 ? (
              <div className="space-y-24 pb-40 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {Object.entries(grupos).map(([tipo, items]) => (
                  <SessaoFilamentos
                    key={tipo}
                    tipo={tipo}
                    items={items}
                    viewMode={viewMode}
                    currentHumidity={humidity}
                    acoes={{
                      onEdit: (item) => { setItemEdicao(item); setModalAberto(true); },
                      onDelete: (id) => setConfirmacaoExclusao({ aberta: true, item: filaments.find(f => f.id === id) }),
                      onConsume: setItemConsumo
                    }}
                  />
                ))}
              </div>
            ) : (
              !loading && (
                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/10 opacity-40">
                  <Scan size={48} strokeWidth={1} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Nenhum material encontrado</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* --- MODAIS DE NEGÓCIO --- */}

        <ModalFilamento
          aberto={modalAberto}
          aoFechar={fecharModais}
          aoSalvar={aoSalvarFilamento}
          dadosIniciais={itemEdicao}
        />

        <ModalBaixaRapida
          aberto={!!itemConsumo}
          aoFechar={fecharModais}
          item={itemConsumo}
          aoSalvar={aoSalvarFilamento}
        />

        {/* --- POPUP DE CONFIRMAÇÃO DE EXCLUSÃO (UNIFICADO) --- */}
        <Popup
          isOpen={confirmacaoExclusao.aberta}
          onClose={fecharModais}
          title="Excluir Material?"
          subtitle="Gestão de Insumos"
          icon={AlertTriangle}
          footer={
            <div className="flex gap-3 w-full">
              <button
                onClick={fecharModais}
                className="flex-1 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={aoConfirmarExclusao}
                className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Confirmar Exclusão
              </button>
            </div>
          }
        >
          <div className="p-8 text-center space-y-4">
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Você está prestes a remover permanentemente o material <br />
              <span className="text-zinc-100 font-bold uppercase tracking-tight">
                "{confirmacaoExclusao.item?.nome}"
              </span>
            </p>
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
              <p className="text-[10px] text-rose-500/80 font-black uppercase tracking-widest">
                Atenção: Esta ação não pode ser desfeita e os dados históricos vinculados a este lote serão afetados.
              </p>
            </div>
          </div>
        </Popup>

      </main>
    </div>
  );
}