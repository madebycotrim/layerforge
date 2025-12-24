import { create } from 'zustand';

export const useFilamentStore = create((set, get) => ({
    filamentos: [],
    loading: false,
    
    fetchFilamentos: async () => {
        set({ loading: true });
        try {
            const res = await fetch('/api/filamentos');
            const data = await res.json();
            const formatado = data.map(f => ({
                ...f,
                historico: typeof f.historico === 'string' ? JSON.parse(f.historico) : (f.historico || [])
            }));
            set({ filamentos: formatado, loading: false });
        } catch (e) { set({ loading: false }); }
    },

    salvarFilamento: async (filamento) => {
        const payload = { ...filamento, id: filamento.id || crypto.randomUUID() };
        await fetch('/api/filamentos', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });
        await get().fetchFilamentos();
    }
}));