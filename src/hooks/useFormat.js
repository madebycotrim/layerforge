/**
 * Converte qualquer entrada em um número válido e finito.
 * Essencial para cálculos de ROI e persistência no banco SQL D1.
 */
export function parseNumber(valor) {
    // 1. Retorno imediato para números válidos
    if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
    
    // 2. Tratamento de nulos, undefined e tipos não-string
    if (valor === undefined || valor === null || valor === "" || typeof valor === 'boolean') return 0;
    
    // 3. Limpeza de caracteres não numéricos (mantendo apenas indicadores de decimal/milhar)
    let str = String(valor).trim().replace(/[^0-9,.]/g, "");
    
    if (str.includes('.') && str.includes(',')) {
        // Detecta formato: 1.234,56 (BR) vs 1,234.56 (US)
        if (str.indexOf(',') > str.indexOf('.')) {
            str = str.replace(/\./g, "").replace(",", "."); // BR -> US
        } else {
            str = str.replace(/,/g, ""); // US -> US (apenas remove milhar)
        }
    } else {
        // Trata caso simples de vírgula como decimal (ex: "10,50")
        str = str.replace(",", ".");
    }
    
    const n = parseFloat(str);
    return Number.isFinite(n) ? n : 0;
}

/**
 * Gera IDs únicos. Prioriza a API nativa de criptografia do navegador.
 */
export function generateUUID() {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }
    // Fallback seguro para ambientes sem suporte a randomUUID
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Determina se uma cor é escura para fins de contraste de acessibilidade.
 * Suporta Hex de 3, 6 e 8 dígitos.
 */
export function isColorDark(color) {
    if (!color || typeof color !== 'string' || !color.startsWith('#')) return false;
    
    let hex = color.replace('#', '');
    
    // Expandir hex curto (ex: #03F -> #0033FF)
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    
    // Se for hex inválido após o tratamento, retorna falso
    if (hex.length < 6) return false;

    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    
    // Fórmula YIQ de luminosidade
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq < 128;
}

/**
 * Formatação de Moeda Brasileira (R$)
 */
export function formatCurrency(n) {
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(parseNumber(n));
}

/**
 * Formatação de Decimais (ex: filamento, horas)
 */
export function formatDecimal(n, digits = 2) {
    return new Intl.NumberFormat('pt-BR', { 
        minimumFractionDigits: digits, 
        maximumFractionDigits: digits 
    }).format(parseNumber(n));
}

