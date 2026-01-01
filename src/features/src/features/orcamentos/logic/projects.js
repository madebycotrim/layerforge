// src/features/calculadora/logic/projects.js
import { create } from 'zustand';
import api from '../../../utils/api'; 

/**
 * useProjectsStore - Gestão de Orçamentos e Produção
 * Integração com Cloudflare D1 via API Workers
 */
export const useProjectsStore = create((set, get) => ({
    projects: [],
    isLoading: false,

    // 1. BUSCAR TODOS OS PROJETOS
    fetchHistory: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/projects');
            // O D1 retorna um array. Garantimos a formatação.
            const projetosFormatados = Array.isArray(data) ? data : [];
            set({ projects: projetosFormatados, isLoading: false });
            return projetosFormatados;
        } catch (erro) {
            console.error("Erro ao buscar histórico no Banco D1:", erro);
            set({ isLoading: false, projects: [] });
            return [];
        }
    },

    // 2. SALVAR OU ATUALIZAR PROJETO (Rascunho/Orçamento)
    addHistoryEntry: async ({ id = null, label = "", entradas = {}, resultados = {} }) => {
        set({ isLoading: true });
        try {
            const listaAtual = get().projects;
            
            // Localiza projeto existente para preservar status
            const projetoExistente = id ? listaAtual.find(p => String(p.id) === String(id)) : null;
            const statusAtual = projetoExistente?.data?.status || "rascunho";

            // Nome do projeto com fallback
            const nomeProjeto = label || entradas.nomeProjeto || "Novo Orçamento";

            const payloadParaBanco = {
                id: id, // Se for null, o Worker criará um novo UUID
                label: nomeProjeto,
                data: { 
                    entradas, 
                    resultados,
                    status: statusAtual,
                    ultimaAtualizacao: new Date().toISOString()
                }
            };

            const { data } = await api.post('/projects', payloadParaBanco);
            
            // Atualiza estado local: substitui o antigo pelo novo retornado do banco
            set((estado) => {
                const outrosProjetos = estado.projects.filter(p => String(p.id) !== String(data.id));
                return { 
                    projects: [data, ...outrosProjetos], 
                    isLoading: false 
                };
            });
            
            return data;
        } catch (erro) {
            console.error("Erro ao salvar no D1:", erro);
            set({ isLoading: false });
            return null;
        }
    },

    // 3. APROVAR ORÇAMENTO (Transição para Produção + Baixa de Estoque)
    approveBudget: async (projeto) => {
        if (!projeto || !projeto.data) return false;

        set({ isLoading: true });
        const { entradas, resultados } = projeto.data;
        
        // Quantidade total de peças
        const quantidade = Number(entradas?.quantidade || entradas?.qtdPecas || 1);

        // Processamento de materiais para baixa de estoque
        let filamentosParaBaixa = [];
        const material = entradas?.material || {};
        
        // Caso A: Múltiplas Cores (Slots do AMS/MMU)
        if (material.selectedFilamentId === 'multi' || (material.slots && material.slots.length > 0)) {
            filamentosParaBaixa = (material.slots || [])
                .filter(slot => slot.id && slot.id !== 'manual' && Number(slot.weight || 0) > 0)
                .map(slot => ({ 
                    id: slot.id, 
                    peso: Number(slot.weight) * quantidade 
                }));
        } 
        // Caso B: Cor Única
        else if (material.selectedFilamentId && material.selectedFilamentId !== 'manual') {
            const pesoUnitario = Number(material.pesoModelo || resultados?.pesoTotal || 0);
            if (pesoUnitario > 0) {
                filamentosParaBaixa = [{ 
                    id: material.selectedFilamentId, 
                    peso: pesoUnitario * quantidade
                }];
            }
        }

        try {
            // Chamada ao endpoint específico que lida com a transação no D1
            await api.post('/approve-budget', {
                projectId: projeto.id,
                printerId: entradas?.selectedPrinterId,
                filaments: filamentosParaBaixa,
                totalTime: Number(resultados?.tempoTotalHoras || 0)
            });

            // Recarrega a lista para garantir sincronia total com o banco
            await get().fetchHistory();
            set({ isLoading: false });
            return true;
        } catch (erro) {
            console.error("Falha ao aprovar orçamento no banco:", erro);
            set({ isLoading: false });
            return false;
        }
    },

    // 4. ATUALIZAR STATUS (Ex: Produção -> Finalizado)
    updateProjectStatus: async (projetoId, novoStatus) => {
        if (!projetoId) return false;
        
        set({ isLoading: true });
        try {
            const projetoAtual = get().projects.find(p => String(p.id) === String(projetoId));
            if (!projetoAtual) throw new Error("Projeto não encontrado no estado local");

            // Prepara o payload mantendo os dados e alterando apenas o status
            const payloadAtualizado = {
                id: projetoId,
                label: projetoAtual.label,
                data: {
                    ...projetoAtual.data,
                    status: novoStatus,
                    ultimaAtualizacao: new Date().toISOString()
                }
            };

            // Reutiliza a rota de POST (Upsert) do Worker
            await api.post('/projects', payloadAtualizado);
            
            // Sincroniza localmente
            await get().fetchHistory();
            set({ isLoading: false });
            return true;
        } catch (erro) {
            console.error("Erro ao transicionar status no D1:", erro);
            set({ isLoading: false });
            return false;
        }
    },

    // 5. REMOVER ENTRADA
    removeHistoryEntry: async (id) => {
        if (!id) return false;
        set({ isLoading: true });
        try {
            await api.delete(`/projects?id=${id}`);
            set((estado) => ({
                projects: estado.projects.filter(p => String(p.id) !== String(id)),
                isLoading: false
            }));
            return true;
        } catch (erro) {
            console.error("Erro ao excluir do D1:", erro);
            set({ isLoading: false });
            return false;
        }
    },

    // 6. LIMPAR BASE COMPLETA
    clearHistory: async () => {
        if (!confirm("Isso apagará TODOS os projetos do banco de dados. Confirma?")) return false;
        
        set({ isLoading: true });
        try {
            await api.delete('/projects'); 
            set({ projects: [], isLoading: false });
            return true;
        } catch (erro) {
            console.error("Erro ao resetar banco D1:", erro);
            set({ isLoading: false });
            return false;
        }
    }
}));