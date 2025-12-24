import { create } from 'zustand';
import { prepararDadosParaD1 } from './printers';

export const usePrinterStore = create((set, get) => ({
    printers: [],
    carregando: false,
    erro: null,

    fetchPrinters: async () => {
        set({ carregando: true, erro: null });
        try {
            const res = await fetch('/api/impressoras');

            // Se a Cloudflare devolver o index.html por erro de rota, 
            // o Content-Type não será application/json.
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("A API não foi encontrada (Rota 404). Verifique se a pasta /functions está na raiz do projeto.");
            }

            if (!res.ok) throw new Error("Erro na resposta do servidor");

            const rawData = await res.json();

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
                history: typeof imp.historico === 'string' ? JSON.parse(imp.historico) : (imp.historico || [])
            }));

            set({ printers: adaptadas, carregando: false, erro: null });
        } catch (err) {
            console.error("Erro no Store:", err.message);
            set({ printers: [], carregando: false, erro: err.message });
        }
    },

    upsertPrinter: async (dados) => {
        set({ carregando: true });
        try {
            const payload = prepararDadosParaD1(dados);
            const res = await fetch('/api/impressoras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Falha ao gravar no D1");
            await get().fetchPrinters(); // Recarrega a lista na hora
        } catch (err) {
            set({ carregando: false, erro: err.message });
            throw err;
        }
    },

    removePrinter: async (id) => {
        try {
            const res = await fetch(`/api/impressoras?id=${id}`, { method: 'DELETE' });
            if (res.ok) await get().fetchPrinters();
        } catch (err) { console.error(err); }
    },

    updatePrinterStatus: async (id, status) => {
        const p = get().printers.find(x => x.id === id);
        if (p) await get().upsertPrinter({ ...p, status });
    }
}));