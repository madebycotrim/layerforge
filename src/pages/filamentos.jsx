import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { Scan, AlertTriangle } from "lucide-react";
// LAYOUT E COMPONENTES GLOBAIS
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";
// LÓGICA E STORE (Zustand)
import { useFilamentStore } from "../features/filamentos/logic/filaments.js";
import { useLocalWeather } from "../hooks/useLocalWeather";
// COMPONENTES DA FUNCIONALIDADE (FILAMENTOS)
import StatusFilamentos from "../features/filamentos/components/statusFilamentos";
import FilamentHeader from "../features/filamentos/components/header";
import SessaoFilamentos from "../features/filamentos/components/sessaoFilamentos";
import ModalFilamento from "../features/filamentos/components/modalFilamento.jsx";
import ModalBaixaRapida from "../features/filamentos/components/modalBaixaEstoque.jsx";

// Constantes para evitar textos soltos no código
const VIEW_MODE_KEY = "printlog_filaments_view";
const DEFAULT_VIEW_MODE = "grid";

export default function FilamentosPage() {
  // 1. Estados da Interface e Barra Lateral
  const [larguraSidebar, setLarguraSidebar] = useState(68);
  const [busca, setBusca] = useState("");
  const deferredBusca = useDeferredValue(busca);

  // Hooks de Dados
  const { temp, humidity, loading: weatherLoading } = useLocalWeather();
  const { filaments, fetchFilaments, saveFilament, deleteFilament, loading } = useFilamentStore();

  // Estados de Controle de Visualização e Modais
  const [viewMode, setViewMode] = useState(() => localStorage.getItem(VIEW_MODE_KEY) || DEFAULT_VIEW_MODE);
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEdicao, setItemEdicao] = useState(null);
  const [itemConsumo, setItemConsumo] = useState(null);

  // Sistema de Notificações (Toast)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  // Carregamento Inicial dos Dados
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        await fetchFilaments();
      } catch (error) {
        if (isMounted) showToast("Ops! Tivemos um problema ao carregar os filamentos. Dá uma olhadinha na sua conexão.", "error");
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [fetchFilaments, showToast]);

  // Salva a preferência do modo de visualização
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // 2. PROCESSAMENTO DE DADOS (Memoized)
  const { grupos, stats, lowStockCount } = useMemo(() => {
    const termo = deferredBusca.toLowerCase().trim();
    const listaOriginal = Array.isArray(filaments) ? filaments : [];

    // Busca por Nome, Material ou Marca de um jeito seguro
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

      // Estatísticas Gerais
      totalG += atual;
      valorTotalAcumulado += (preco / total) * atual;

      // Alerta de Estoque Baixo (<= 20% OU menos de 150g)
      if ((atual / total) <= 0.2 || atual < 150) {
        lowStock++;
      }
    });

    // Organizando por tipo de Material
    const map = filtrados.reduce((acc, f) => {
      const materialKey = (f.material || "OUTROS").toUpperCase().trim();
      if (!acc[materialKey]) acc[materialKey] = [];
      acc[materialKey].push(f);
      return acc;
    }, {});

    // Colocando em ordem alfabética dentro dos grupos
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
    });

    return {
      grupos: map,
      lowStockCount: lowStock,
      stats: { valorTotal: valorTotalAcumulado, pesoKg: totalG / 1000 }
    };
  }, [filaments, deferredBusca]);

  // 3. AÇÕES DE SALVAMENTO (Handlers)

  const fecharModais = useCallback(() => {
    setModalAberto(false);
    setItemEdicao(null);
    setItemConsumo(null);
  }, []);

  const aoSalvarFilamento = async (dados) => {
    try {
      const isEdicao = !!(dados.id || itemEdicao?.id);
      await saveFilament(dados);
      fecharModais();
      showToast(isEdicao ? "Alterações salvas com sucesso!" : "Novo material adicionado ao seu estoque!");
    } catch (e) {
      showToast(e.message || "Tivemos um problema ao falar com o servidor. Tenta de novo?", "error");
    }
  };

  const aoDeletarFilamento = async (id) => {
    if (!id) return;

    // Confirmação para evitar exclusão acidental
    const materialParaDeletar = filaments.find(f => f.id === id);
    const confirmacao = window.confirm(
      `Tem certeza que quer excluir o filamento "${materialParaDeletar?.nome || 'esse material'}"?\nEssa ação não pode ser desfeita.`
    );

    if (confirmacao) {
      try {
        await deleteFilament(id);
        showToast("Material removido com sucesso.");
      } catch (e) {
        showToast("Não conseguimos excluir o material agora. Tenta mais tarde?", "error");
      }
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

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 xl:p-12 relative z-10 scroll-smooth">
          <div className="max-w-[1600px] mx-auto space-y-16">

            {/* Painel de Métricas */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              <StatusFilamentos
                totalWeight={stats.pesoKg}
                lowStockCount={lowStockCount}
                valorTotal={stats.valorTotal}
                weather={{ temp, humidity, loading: weatherLoading }}
              />
            </div>

            {/* Lista Organizada por Material */}
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
                      onDelete: aoDeletarFilamento,
                      onConsume: setItemConsumo
                    }}
                  />
                ))}
              </div>
            ) : (
              !loading && (
                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-sky-500/10 blur-2xl rounded-full" />
                    <Scan size={48} strokeWidth={1.2} className="text-sky-500/40 relative z-10" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-zinc-300 text-xs font-bold uppercase tracking-[0.2em]">
                      {busca ? "Nenhum resultado encontrado" : "Seu estoque está vazio"}
                    </h3>
                    <p className="text-zinc-600 text-[10px] uppercase mt-2 tracking-widest">
                      {busca ? "Tenta mudar o termo da sua pesquisa" : "Comece adicionando materiais ao seu inventário"}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* JANELAS (MODAIS) */}
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
      </main>
    </div>
  );
}