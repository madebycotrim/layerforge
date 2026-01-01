// src/features/calculadora/logic/filament.js
import { create } from 'zustand';
import api from '../../../utils/api';

// --- HELPERS DE MAPEAMENTO E TRATAMENTO DE DADOS ---

/**
 * Prepara os dados para o SQLite (D1).
 * Garante que números sejam números e booleanos sejam 0 ou 1.
 */
const prepararDados = (f) => {
    const pTotal = Math.max(0, Number(f.peso_total || f.pesoTotal || 0));
    
    // Se for um novo cadastro (sem peso_atual), o rolo começa cheio
    let pAtual = (f.peso_atual !== undefined && f.peso_atual !== null) 
        ? Number(f.peso_atual) 
        : pTotal;
        
    // Validação: peso atual nunca pode ser negativo nem maior que o total
    pAtual = Math.min(pTotal, Math.max(0, pAtual));

    return {
        // Se for string começando com 'temp-', enviamos como null para o D1 gerar o ID real
        id: (String(f.id).startsWith('temp-')) ? null : f.id,
        user_id: f.user_id || "default_user",
        nome: (f.nome || f.name || "Novo Filamento").trim(),
        marca: (f.marca || f.brand || "Genérico").trim(),
        material: f.material || "PLA",
        cor_hex: f.cor_hex || f.colorHex || "#000000",
        peso_total: pTotal,
        peso_atual: pAtual,
        preco: Number(f.preco || f.price || 0),
        data_abertura: f.data_abertura || f.openedAt || new Date().toISOString(),
        favorito: (f.favorito === true || f.favorito === 1) ? 1 : 0
    };
};

// --- STORE ZUSTAND ---

export const useFilamentStore = create((set, get) => ({
    filaments: [],
    loading: false,
    isSaving: false,

    /**
     * Busca filamentos do D1
     */
    fetchFilaments: async (silent = false) => {
        if (!silent) set({ loading: true });
        try {
            const { data } = await api.get('/filaments');
            
            // Mapeia do banco para garantir consistência
            const formatados = (Array.isArray(data) ? data : []).map(f => ({
                ...f,
                id: String(f.id), // Garantimos que ID seja sempre string no Front
                favorito: Boolean(f.favorito)
            }));
            
            set({ filaments: formatados, loading: false });
        } catch (error) {
            console.error("Erro ao carregar filamentos do D1:", error);
            set({ loading: false, filaments: [] });
        }
    },

    /**
     * Salva ou Atualiza (Upsert)
     */
    saveFilament: async (filament) => {
        set({ isSaving: true });
        const backup = get().filaments;

        // 1. Prepara dados e gera ID temporário se necessário
        const dadosTratados = prepararDados(filament);
        const isNovo = !dadosTratados.id;
        const idTemp = dadosTratados.id || `temp-${Date.now()}`;
        
        const payloadOtimista = { ...dadosTratados, id: idTemp, favorito: Boolean(dadosTratados.favorito) };

        // 2. Atualização Otimista
        set(state => {
            if (isNovo) {
                return { filaments: [payloadOtimista, ...state.filaments] };
            }
            return {
                filaments: state.filaments.map(f => String(f.id) === String(idTemp) ? payloadOtimista : f)
            };
        });

        try {
            // 3. Envia ao Backend (D1)
            // Se o ID for temp-, o Worker deve tratar como INSERT
            await api.post('/filaments', dadosTratados);
            
            // 4. Sincroniza para pegar o ID definitivo gerado pelo banco
            await get().fetchFilaments(true);
        } catch (error) {
            console.error("Erro ao salvar filamento:", error);
            set({ filaments: backup }); // Reverte em caso de falha
            throw error;
        } finally {
            set({ isSaving: false });
        }
    },

    /**
     * Baixa rápida de peso (Usado após impressões)
     */
    quickUpdateWeight: async (id, novoPeso) => {
        const backup = get().filaments;
        const itemOriginal = backup.find(f => String(f.id) === String(id));
        if (!itemOriginal) return;

        const pesoValidado = Math.max(0, Number(novoPeso));

        // Atualização Otimista
        set(state => ({
            filaments: state.filaments.map(f => 
                String(f.id) === String(id) ? { ...f, peso_atual: pesoValidado } : f
            )
        }));

        try {
            const payload = prepararDados({ ...itemOriginal, peso_atual: pesoValidado });
            await api.post('/filaments', payload);
        } catch (error) {
            console.error("Erro na baixa rápida:", error);
            set({ filaments: backup });
        }
    },

    /**
     * Deleta permanentemente
     */
    deleteFilament: async (id) => {
        if (String(id).startsWith('temp-')) {
            set(state => ({ filaments: state.filaments.filter(f => String(f.id) !== String(id)) }));
            return;
        }

        const backup = get().filaments;
        set(state => ({ filaments: state.filaments.filter(f => String(f.id) !== String(id)) }));

        try {
            await api.delete(`/filaments?id=${id}`);
        } catch (error) {
            console.error("Erro ao deletar filamento:", error);
            set({ filaments: backup }); 
        }
    }
}));