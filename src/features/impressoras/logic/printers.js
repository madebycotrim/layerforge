import { generateUUID } from "../../../hooks/useFormat";

const safeNum = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === 'number') return v;
    const s = String(v).replace(/\./g, '').replace(',', '.');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
};

export const prepararDadosParaD1 = (d) => {
    return {
        id: d.id || generateUUID(),
        nome: (d.nome || d.name || "Nova Unidade").trim(),
        marca: (d.marca || d.brand || "Genérica").trim(),
        modelo: (d.modelo || d.model || "FDM").trim(),
        status: d.status || "idle",
        potencia: safeNum(d.potencia || d.power),
        preco: safeNum(d.preco || d.price),
        rendimento_total: safeNum(d.rendimento_total || d.yieldTotal),
        horas_totais: safeNum(d.horas_totais || d.totalHours),
        ultima_manutencao_hora: safeNum(d.ultima_manutencao_hora || d.lastMaintenanceHour),
        historico: Array.isArray(d.historico) ? d.historico : (Array.isArray(d.history) ? d.history : [])
    };
};