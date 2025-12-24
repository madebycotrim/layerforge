import { generateUUID } from "../../../hooks/useFormat";

/**
 * Converte entradas (string com vírgula, nulos, etc) para Number (float) puro.
 * Essencial para que os cálculos de ROI e horímetros no banco D1 não quebrem.
 */
export const safeNum = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === 'number') return v;
    // Remove pontos de milhar e troca vírgula por ponto decimal
    const s = String(v).replace(/\./g, '').replace(',', '.');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
};

/**
 * ADAPTER: Traduz o objeto da UI (Inglês) para o esquema do Banco de Dados (Português).
 * Também garante a tipagem correta de cada campo antes do envio para a Cloudflare.
 */
export const prepararDadosParaD1 = (dadosForm) => {
    if (!dadosForm) return null;

    return {
        // Identificador Único
        id: dadosForm.id || generateUUID(),
        
        // Identificação (Texto)
        nome: (dadosForm.name || dadosForm.nome || "Nova Unidade").trim(),
        marca: (dadosForm.brand || dadosForm.marca || "Genérica").trim(),
        modelo: (dadosForm.model || dadosForm.modelo || "FDM").trim(),
        
        // Status do Equipamento
        status: dadosForm.status || "idle",
        
        // Dados Técnicos e Financeiros (Garante que sejam Números)
        potencia: safeNum(dadosForm.power || dadosForm.potencia),
        preco: safeNum(dadosForm.price || dadosForm.preco),
        rendimento_total: safeNum(dadosForm.yieldTotal || dadosForm.rendimento_total),
        horas_totais: safeNum(dadosForm.totalHours || dadosForm.horas_totais),
        ultima_manutencao_hora: safeNum(dadosForm.lastMaintenanceHour || dadosForm.ultima_manutencao_hora),
        
        // Histórico (Garante que seja um Array limpo)
        historico: Array.isArray(dadosForm.history) ? dadosForm.history : 
                   Array.isArray(dadosForm.historico) ? dadosForm.historico : []
    };
};