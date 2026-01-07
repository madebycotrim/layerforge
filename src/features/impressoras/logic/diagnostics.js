/**
 * DIAGNÓSTICOS E CÁLCULOS AVANÇADOS - PRINTLOG
 */

const TARIFA_KWH_PADRAO = 0.85; 
const VIDA_UTIL_MAQUINA_HORAS = 5000; 

/**
 * Realiza cálculos financeiros de ROI e custo operacional.
 */
export const calcularFinanceiroAvancado = (impressora, configuracoes = null) => {
    if (!impressora) return { roiPct: "0", pago: false, custoOperacional: "0.00", lucroLiquido: "0.00" };
    
    // AJUSTE DE COMPATIBILIDADE: 
    // O backend envia 'custo_kwh', o Store pode mapear para 'custoKwh'. Verificamos ambos.
    const tarifaKwh = Number(configuracoes?.custoKwh || configuracoes?.custo_kwh || TARIFA_KWH_PADRAO);

    // Sanitização rigorosa (usa os nomes mapeados no seu usePrinterStore)
    const precoCompra = Math.max(0, Number(impressora.price || impressora.preco) || 0);
    const rendimentoTotal = Number(impressora.yieldTotal || impressora.rendimento_total) || 0;
    const horasTotais = Math.max(0, Number(impressora.totalHours || impressora.horas_totais) || 0);
    const potenciaKw = (Number(impressora.power || impressora.potencia) || 0) / 1000;
    
    // 1. Custo de Energia
    const custoEnergia = horasTotais * potenciaKw * tarifaKwh; 
    
    // 2. Depreciação
    const depreciacaoAcumulada = precoCompra > 0 
        ? Math.min(precoCompra, (precoCompra / VIDA_UTIL_MAQUINA_HORAS) * horasTotais) 
        : 0;
    
    // 3. Totais e Lucratividade
    const custoOperacionalTotal = custoEnergia + depreciacaoAcumulada;
    const lucroLiquido = rendimentoTotal - custoOperacionalTotal;

    const roiCalculado = precoCompra > 0 ? ((lucroLiquido / precoCompra) * 100).toFixed(1) : "0";

    return {
        roiPct: roiCalculado,
        pago: precoCompra > 0 && lucroLiquido >= precoCompra,
        custoOperacional: custoOperacionalTotal.toFixed(2),
        lucroLiquido: lucroLiquido.toFixed(2),
        custoEnergia: custoEnergia.toFixed(2),
        depreciacaoAcumulada: depreciacaoAcumulada.toFixed(2)
    };
};

/**
 * Analisa o horímetro e gera alertas de manutenção preventiva.
 */
export const analisarSaudeImpressora = (impressora) => {
    if (!impressora) return [];

    // Garante compatibilidade com nomes vindos do D1 ou do Store mapeado
    const horasTotais = Number(impressora.totalHours || impressora.horas_totais) || 0;
    const ultimaManutencao = Number(impressora.lastMaintenanceHour || impressora.ultima_manutencao_hora) || 0;
    const horasDesdeUltima = Math.max(0, horasTotais - ultimaManutencao);
    
    const regrasManutencao = [
        { id: 'm1', rotulo: 'Limpeza Geral', acao: 'Mesa, bicos e fans', intervalo: 50, severidade: 'low' },
        { id: 'm2', rotulo: 'Correias', acao: 'Check de tensão X/Y', intervalo: 150, severidade: 'medium' },
        { id: 'm3', rotulo: 'Lubrificação', acao: 'Eixos lineares e fusos', intervalo: 300, severidade: 'medium' },
        { id: 'm4', rotulo: 'Nozzle', acao: 'Troca preventiva de bico', intervalo: 600, severidade: 'medium' },
        { id: 'm5', rotulo: 'Revisão Elétrica', acao: 'Aperto de bornes', intervalo: 1000, severidade: 'critical' },
        { id: 'm6', rotulo: 'Tubo PTFE', acao: 'Substituição interna', intervalo: 800, severidade: 'medium' }
    ];
    
    return regrasManutencao
        .filter(regra => horasDesdeUltima >= (regra.intervalo * 0.9)) // Alerta aos 90% do tempo
        .map(regra => ({
            ...regra,
            progresso: Math.min(100, (horasDesdeUltima / regra.intervalo) * 100).toFixed(0),
            horasRestantes: Math.max(0, regra.intervalo - horasDesdeUltima).toFixed(1)
        }))
        .sort((a, b) => {
            const prioridade = { critical: 1, medium: 2, low: 3 };
            return prioridade[a.severidade] - prioridade[b.severidade];
        });
};