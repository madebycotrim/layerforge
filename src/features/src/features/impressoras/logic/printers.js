// src/features/calculadora/logic/printer.js
import { create } from 'zustand';
import api from '../../../utils/api';
import axios from 'axios';

/**
 * Converte valores para número de forma segura (Trata 1.200,50 -> 1200.50)
 */
const limparNumero = (valor) => {
    if (valor === undefined || valor === null || valor === '') return 0;
    if (typeof valor === 'number') return valor;

    let texto = String(valor).trim();
    if (texto.includes(',')) {
        texto = texto.replace(/\./g, '').replace(',', '.');
    }
    const numero = parseFloat(texto);
    return isNaN(numero) ? 0 : numero;
};

/**
 * Mapeia do Frontend (CamelCase) para o Backend (Snake_Case)
 * Crucial para o Cloudflare D1
 */
export const prepararParaD1 = (dados = {}) => {
    let historicoFormatado = "[]";
    try {
        const h = dados.history || dados.historico || [];
        historicoFormatado = typeof h === 'string' ? h : JSON.stringify(h);
    } catch (erro) {
        console.error("Erro ao serializar histórico:", erro);
    }

    return {
        id: dados.id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2)),
        nome: (dados.name || dados.nome || "Nova Unidade").trim(),
        marca: (dados.brand || dados.marca || "Genérica").trim(),
        modelo: (dados.model || dados.modelo || "FDM").trim(),
        status: dados.status || "idle",
        potencia: limparNumero(dados.power || dados.potencia),
        preco: limparNumero(dados.price || dados.preco),
        rendimento_total: limparNumero(dados.yieldTotal || dados.rendimento_total),
        horas_totais: limparNumero(dados.totalHours || dados.horas_totais),
        ultima_manutencao_hora: limparNumero(dados.lastMaintenanceHour || dados.ultima_manutencao_hora),
        intervalo_manutencao: limparNumero(dados.maintenanceInterval || dados.intervalo_manutencao || 300),
        historico: historicoFormatado
    };
};

export const usePrinterStore = create((set, get) => ({
    printers: [],
    printerModels: [],
    loading: false,

    // Busca o catálogo estático (JSON local)
    fetchPrinterModels: async () => {
        if (get().printerModels.length > 0) return;
        try {
            const resposta = await axios.get('/printers.json');
            set({ printerModels: Array.isArray(resposta.data) ? resposta.data : [] });
        } catch (erro) {
            console.error("Falha ao carregar catálogo de modelos:", erro);
        }
    },

    // Busca as impressoras no Cloudflare D1
    fetchPrinters: async () => {
        set({ loading: true });
        try {
            const resposta = await api.get('/impressoras');
            const dadosBrutos = Array.isArray(resposta.data) ? resposta.data : [];

            // Mapeia de Snake_Case (Banco) para CamelCase (React)
            const impressorasMapeadas = dadosBrutos.map(item => {
                let historicoTratado = [];
                try {
                    historicoTratado = typeof item.historico === 'string' 
                        ? JSON.parse(item.historico) 
                        : (item.historico || []);
                } catch (e) { historicoTratado = []; }

                return {
                    id: item.id,
                    name: item.nome,
                    brand: item.marca,
                    model: item.modelo,
                    status: item.status,
                    power: item.potencia,
                    price: item.preco,
                    yieldTotal: item.rendimento_total,
                    totalHours: item.horas_totais,
                    lastMaintenanceHour: item.ultima_manutencao_hora,
                    maintenanceInterval: item.intervalo_manutencao,
                    history: historicoTratado
                };
            });

            set({ printers: impressorasMapeadas, loading: false });
        } catch (erro) {
            console.error("Erro ao buscar impressoras do D1:", erro);
            set({ loading: false, printers: [] });
        }
    },

    // Salva ou Atualiza
    upsertPrinter: async (dados) => {
        set({ loading: true });
        try {
            const payload = prepararParaD1(dados);
            await api.post('/impressoras', payload);
            
            // Recarrega para garantir que os dados do estado batem com o banco
            await get().fetchPrinters();
            return true;
        } catch (erro) {
            console.error("Erro ao salvar impressora:", erro);
            set({ loading: false });
            throw erro;
        }
    },

    // Remove do banco
    removePrinter: async (id) => {
        try {
            await api.delete(`/impressoras?id=${id}`);
            set(estado => ({
                printers: estado.printers.filter(p => String(p.id) !== String(id))
            }));
            return true;
        } catch (erro) {
            console.error("Erro ao remover impressora:", erro);
            throw erro;
        }
    },

    // Atualização de status rápida
    updatePrinterStatus: async (id, novoStatus) => {
        const listaAtual = get().printers;
        const impressora = listaAtual.find(p => String(p.id) === String(id));

        if (impressora) {
            try {
                // Atualização Otimista (mais rápido para o usuário)
                set({
                    printers: listaAtual.map(p =>
                        p.id === id ? { ...p, status: novoStatus } : p
                    )
                });

                const payload = prepararParaD1({ ...impressora, status: novoStatus });
                await api.post('/impressoras', payload);
            } catch (erro) {
                console.error("Erro ao atualizar status, revertendo...", erro);
                await get().fetchPrinters(); // Reverte para o estado do banco em caso de erro
            }
        }
    }
}));