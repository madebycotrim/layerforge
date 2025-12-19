// --- FILE: src/lib/format.js ---

// ==========================================
// 1. CONVERSÃO E HIGIENIZAÇÃO (INPUTS)
// ==========================================

/**
 * Converte qualquer input (String BR/US ou Number) para Number JS puro.
 * Ex: "1.200,50" -> 1200.5
 * Ex: "1,200.50" -> 1200.5
 */
export function parseNumber(valor) {
    if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
    if (valor === undefined || valor === null || valor === "") return 0;
  
    let str = String(valor).trim();
  
    // Se tiver ponto E vírgula (formato BR explícito: 1.000,00)
    // Remove o ponto (milhar) e substitui a vírgula por ponto (decimal)
    if (str.includes('.') && str.includes(',')) {
      str = str.replace(/\./g, "").replace(",", ".");
    } 
    // Se tiver apenas vírgula (10,5), troca por ponto
    else {
      str = str.replace(",", ".");
    }
  
    const n = parseFloat(str);
    return Number.isFinite(n) ? n : 0;
}
  
/**
* Gera um ID único (UUID) compatível com todos os navegadores
*/
export function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==========================================
// 2. FORMATAÇÃO VISUAL (OUTPUTS)
// ==========================================

/** Formata para Dinheiro (BRL) -> "R$ 1.200,50" */
export function formatCurrency(n) {
    const num = parseNumber(n);
    return num.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/** Formata decimais genéricos -> "12,59" */
export function formatDecimal(n, digits = 2) {
    const num = parseNumber(n);
    return num.toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
}

/** Formata Porcentagem -> "10,5%" */
export function formatPercent(n, digits = 1) {
    const num = parseNumber(n);
    return `${formatDecimal(num, digits)}%`;
}

/** Formata Peso (g ou kg automático) */
export function formatWeight(gramas) {
    const g = parseNumber(gramas);
    if (g >= 1000) {
        return `${formatDecimal(g / 1000, 2)}kg`;
    }
    return `${formatDecimal(g, 0)}g`;
}

/** Formata Horas -> "12,5h" */
export function formatHours(h) {
    return `${formatDecimal(h, 1)}h`;
}