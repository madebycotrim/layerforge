import { create } from 'zustand';
import { prepararDadosParaD1 } from './printers';

/**
 * STORE CENTRAL - ADAPTADO PARA CLOUDFLARE D1 (PT-BR)
 * Este store atua como uma ponte (Adapter) entre o Banco SQL em Português
 * e o Layout/Componentes que utilizam propriedades em Inglês.
 */
export const usePrinterStore = create((set, get) => ({
    printers: [], // Mantido como 'printers' para não quebrar o layout da ImpressorasPage
    carregando: false,
    erro: null,

    // BUSCAR: Traduz PT-DB para EN-UI
    fetchPrinters: async () => {
        set({ carregando: true, erro: null });
        try {
            const res = await fetch('/api/impressoras');
            if (!res.ok) throw new Error("Erro na comunicação com o Cloudflare D1");
            
            const dadosDoBanco = await res.json();
            
            // Mapeamento: Banco (PT-BR) -> Frontend (EN)
            const adaptadoParaFrontend = dadosDoBanco.map(imp => ({
                id: imp.id,
                name: imp.nome,
                brand: imp.marca,
                model: imp.modelo,
                status: imp.status,
                power: Number(imp.potencia) || 0,
                price: Number(imp.preco) || 0,
                yieldTotal: Number(imp.rendimento_total) || 0,
                totalHours: Number(imp.horas_totais) || 0,
                lastMaintenanceHour: Number(imp.ultima_manutencao_hora) || 0,
                history: typeof imp.historico === 'string' ? JSON.parse(imp.historico) : (imp.historico || []),
                createdAt: imp.criado_em,
                updatedAt: imp.atualizado_em
            }));

            set({ printers: adaptadoParaFrontend, carregando: false });
        } catch (err) {
            set({ erro: err.message, carregando: false });
        }
    },

    // SALVAR: Traduz EN-UI para PT-DB (via prepararDadosParaD1)
    upsertPrinter: async (dadosDoModal) => {
        set({ carregando: true });
        try {
            // A função prepararDadosParaD1 (do arquivo printers.js) 
            // já faz a higienização e converte para PT-BR
            const payloadPTBR = prepararDadosParaD1(dadosDoModal);

            const res = await fetch('/api/impressoras', {
                method: 'POST',
                body: JSON.stringify(payloadPTBR),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error("Falha ao persistir dados no D1");
            
            await get().fetchPrinters();
        } catch (err) {
            set({ erro: err.message, carregando: false });
        }
    },

    // REMOVER
    removePrinter: async (id) => {
        try {
            const res = await fetch(`/api/impressoras?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Falha ao excluir registro");
            
            await get().fetchPrinters();
        } catch (err) {
            set({ erro: err.message });
        }
    },

    // ATUALIZAR STATUS
    updatePrinterStatus: async (id, novoStatus) => {
        const printer = get().printers.find(p => p.id === id);
        if (printer) {
            // Reutiliza a lógica de salvamento que já trata a tradução
            await get().upsertPrinter({ ...printer, status: novoStatus });
        }
    }
}));