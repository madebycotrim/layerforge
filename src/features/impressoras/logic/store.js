import { create } from 'zustand';
import { prepararDadosParaD1 } from './printers';

export const usePrinterStore = create((set, get) => ({
    printers: [],
    carregando: false,
    erro: null,

    fetchPrinters: async () => {
        set({ carregando: true, erro: null });
        try {
            // Chamada para a Function na Cloudflare
            const res = await fetch('/api/impressoras');

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("A API não devolveu JSON. Verifique se o banco D1 está vinculado no painel da Cloudflare.");
            }

            if (!res.ok) throw new Error("Erro ao buscar dados no D1");

            const rawData = await res.json();

            // MAPEAMENTO: Banco (PT-BR) -> Store/UI (EN)
            const adaptadas = (rawData || []).map(imp => ({
                id: imp.id,
                name: imp.nome,
                brand: imp.marca,
                model: imp.modelo,
                status: imp.status || 'idle',
                power: Number(imp.potencia) || 0,
                price: Number(imp.preco) || 0,
                yieldTotal: Number(imp.rendimento_total) || 0,
                totalHours: Number(imp.horas_totais) || 0,
                lastMaintenanceHour: Number(imp.ultima_manutencao_hora) || 0,
                
                // CORREÇÃO: Mapeando o intervalo de manutenção (essencial para o Card/Modal)
                maintenanceInterval: Number(imp.intervalo_manutencao) || 300,
                
                // TRATAMENTO DO HISTÓRICO: D1 salva como String JSON
                history: typeof imp.historico === 'string' 
                    ? JSON.parse(imp.historico || "[]") 
                    : (imp.historico || [])
            }));

            set({ printers: adaptadas, carregando: false, erro: null });
        } catch (err) {
            console.error("Erro no Store (fetch):", err.message);
            set({ printers: [], carregando: false, erro: err.message });
        }
    },

    upsertPrinter: async (dados) => {
        set({ carregando: true });
        try {
            // O helper agora já devolve o objeto com nomes em PT e histórico como STRING
            const payload = prepararDadosParaD1(dados);
            
            const res = await fetch('/api/impressoras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Falha ao gravar no D1");
            }

            await get().fetchPrinters(); // Sincroniza a lista local com o banco remoto
        } catch (err) {
            console.error("Erro no Store (upsert):", err.message);
            set({ carregando: false, erro: err.message });
            throw err; // Lança para o Modal poder mostrar o erro no Toast
        }
    },

    removePrinter: async (id) => {
        if (!id) return;
        set({ carregando: true });
        try {
            const res = await fetch(`/api/impressoras?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Erro ao excluir do D1");
            
            await get().fetchPrinters(); // Recarrega a farm
        } catch (err) {
            console.error("Erro no Store (delete):", err.message);
            set({ carregando: false, erro: err.message });
        }
    },

    updatePrinterStatus: async (id, status) => {
        // Busca a impressora no estado atual do Zustand
        const p = get().printers.find(x => x.id === id);
        if (p) {
            // Como o upsertPrinter já chama o fetchPrinters no final, 
            // o status será atualizado em toda a aplicação.
            await get().upsertPrinter({ ...p, status });
        }
    }
}));