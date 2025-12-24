import { generateUUID } from "../../../hooks/useFormat";

const safeNum = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === 'number') return v;
    
    let s = String(v).trim();
    
    // Melhora: Se o número vier com vírgula (formato BR), tratamos.
    // Se vier apenas com ponto (padrão type="number"), mantemos o ponto.
    if (s.includes(',')) {
        s = s.replace(/\./g, '').replace(',', '.');
    }
    
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
};

export const prepararDadosParaD1 = (d) => {
    // 1. Garantimos que o ID exista e seja consistente
    const id = d.id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : generateUUID());

    // 2. Criamos o objeto exatamente como as colunas do seu banco D1
    const payload = {
        id: id,
        nome: (d.nome || d.name || "Nova Unidade").trim(),
        marca: (d.marca || d.brand || "Genérica").trim(),
        modelo: (d.modelo || d.model || "FDM").trim(),
        status: d.status || "idle",
        potencia: safeNum(d.potencia || d.power),
        preco: safeNum(d.preco || d.price),
        rendimento_total: safeNum(d.rendimento_total || d.yieldTotal),
        horas_totais: safeNum(d.horas_totais || d.totalHours),
        ultima_manutencao_hora: safeNum(d.ultima_manutencao_hora || d.lastMaintenanceHour),
        // Importante: Adicionando o intervalo de manutenção que usamos no Modal/Card
        intervalo_manutencao: safeNum(d.intervalo_manutencao || d.maintenanceInterval || 300),
        
        // CRÍTICO: D1 (SQLite) não aceita Arrays. 
        // Convertemos para String aqui ou na Function. Faremos aqui para garantir.
        historico: JSON.stringify(
            Array.isArray(d.historico) ? d.historico : (Array.isArray(d.history) ? d.history : [])
        )
    };

    return payload;
};