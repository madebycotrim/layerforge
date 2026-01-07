import { create } from 'zustand';
import api from '../../../utils/api'; 
import axios from 'axios'; 

/**
 * Converte valores para número de forma segura, tratando padrões brasileiros.
 */
const limparNumero = (valor) => {
    if (valor === undefined || valor === null || valor === '') return 0;
    if (typeof valor === 'number') return valor;
    
    let texto = String(valor).trim();
    // Tratamento de padrão brasileiro: 1.200,50 -> 1200.50
    if (texto.includes(',')) {
        texto = texto.replace(/\./g, '').replace(',', '.');
    }
    const numero = parseFloat(texto);
    return isNaN(numero) ? 0 : numero;
};

/**
 * Mapeia do Frontend (CamelCase) para o Backend (Snake_Case)
 */
export const prepararParaD1 = (dados = {}) => {
    // Garante que o histórico seja uma string JSON para o SQLite
    let historicoFormatado = "[]";
    if (dados.history || dados.historico) {
        const h = dados.history || dados.historico;
        historicoFormatado = typeof h === 'string' ? h : JSON.stringify(h);
    }

    return {
        id: dados.id || crypto.randomUUID(),
        nome: (dados.name || dados.nome || "Nova Unidade").trim(),
        marca: (dados.brand || dados.marca || "").trim(),
        modelo: (dados.model || dados.modelo || "").trim(),
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

    fetchPrinterModels: async () => {
        if (get().printerModels.length > 0) return;
        try {
            const resposta = await axios.get('/printers.json');
            set({ printerModels: Array.isArray(resposta.data) ? resposta.data : [] });
        } catch (erro) {
            console.error("Erro ao carregar catálogo:", erro);
        }
    },

    fetchPrinters: async () => {
        set({ loading: true });
        try {
            // Rota bate com o 'case impressoras' do seu backend
            const resposta = await api.get('/impressoras');
            const dadosBrutos = resposta.data || [];

            const impressorasMapeadas = dadosBrutos.map(item => ({
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
                // Parse do JSON que vem do SQLite
                history: typeof item.historico === 'string' ? JSON.parse(item.historico || "[]") : (item.historico || [])
            }));

            set({ printers: impressorasMapeadas, loading: false });
        } catch (erro) {
            console.error("Erro ao buscar impressoras:", erro);
            set({ loading: false, printers: [] });
        }
    },

    upsertPrinter: async (dados) => {
        try {
            const payload = prepararParaD1(dados);
            await api.post('/impressoras', payload);
            await get().fetchPrinters(); // Sincroniza
            return true;
        } catch (erro) {
            console.error("Erro ao salvar:", erro);
            throw erro;
        }
    },

    removePrinter: async (id) => {
        try {
            // Usa o parâmetro ?id= conforme esperado pelo seu backend
            await api.delete(`/impressoras?id=${id}`);
            set(estado => ({
                printers: estado.printers.filter(p => p.id !== id)
            }));
        } catch (erro) {
            console.error("Erro ao remover:", erro);
            throw erro;
        }
    }
}));