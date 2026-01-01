/**
 * DIAGNÓSTICOS E CÁLCULOS AVANÇADOS - PRINTLOG
 * Transforma dados do D1 em insights de negócio e manutenção.
 */

// --- CONFIGURAÇÕES DE PADRÃO ---
const TARIFA_KWH_PADRAO = 0.85; 
const VIDA_UTIL_MAQUINA_HORAS = 5000; 

/**
 * Realiza cálculos financeiros de ROI e custo operacional.
 * Garante que valores nulos ou strings do banco não quebrem o app.
 */
export const calcularFinanceiroAvancado = (impressora, configuracoes = null) => {
    // Validação inicial e valores padrão
    const padrao = { 
        roiPct: "0.0", 
        pago: false, 
        custoOperacional: "0.00", 
        lucroLiquido: "0.00", 
        custoEnergia: "0.00",
        depreciacaoAcumulada: "0.00",
        progressoPagoPct: 0
    };

    if (!impressora) return padrao;
    
    // Normalização: Tenta camelCase (JS) e snake_case (D1)
    const tarifaKwh = Number(configuracoes?.custoKwh || configuracoes?.custo_kwh || TARIFA_KWH_PADRAO);
    const precoCompra = Math.max(0, Number(impressora.price || impressora.preco || 0));
    const rendimentoTotal = Number(impressora.yieldTotal || impressora.rendimento_total || 0);
    const horasTotais = Math.max(0, Number(impressora.totalHours || impressora.horas_totais || 0));
    const potenciaWatts = Number(impressora.power || impressora.potencia || 0);
    const potenciaKw = potenciaWatts / 1000;
    
    // 1. Custo de Energia Real (Horas * kW * Preço)
    const custoEnergia = horasTotais * potenciaKw * tarifaKwh; 
    
    // 2. Depreciação (Desgaste baseado no uso vs vida útil esperada)
    const depreciacaoPorHora = precoCompra > 0 ? (precoCompra / VIDA_UTIL_MAQUINA_HORAS) : 0;
    const depreciacaoAcumulada = Math.min(precoCompra, depreciacaoPorHora * horasTotais);
    
    // 3. Totais e Lucratividade
    const custoOperacionalTotal = custoEnergia + depreciacaoAcumulada;
    const lucroLiquido = rendimentoTotal - custoOperacionalTotal;

    // 4. ROI (Return on Investment)
    let roiCalculado = "0.0";
    let progressoPago = 0;

    if (precoCompra > 0) {
        roiCalculado = ((lucroLiquido / precoCompra) * 100).toFixed(1);
        // Calcula quanto da máquina já se pagou (0 a 100%)
        progressoPago = Math.min(100, Math.max(0, (lucroLiquido / precoCompra) * 100));
    }

    return {
        roiPct: roiCalculado,
        pago: precoCompra > 0 && lucroLiquido >= precoCompra,
        custoOperacional: custoOperacionalTotal.toFixed(2),
        lucroLiquido: lucroLiquido.toFixed(2),
        custoEnergia: custoEnergia.toFixed(2),
        depreciacaoAcumulada: depreciacaoAcumulada.toFixed(2),
        progressoPagoPct: Math.round(progressoPago)
    };
};

/**
 * Analisa o horímetro e gera alertas de manutenção preventiva.
 */
export const analisarSaudeImpressora = (impressora) => {
    if (!impressora) return [];

    const horasTotais = Number(impressora.totalHours || impressora.horas_totais || 0);
    const ultimaManutencao = Number(impressora.lastMaintenanceHour || impressora.ultima_manutencao_hora || 0);
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
        .map(regra => {
            const progresso = (horasDesdeUltima / regra.intervalo) * 100;
            return {
                ...regra,
                progresso: Math.min(100, Math.round(progresso)),
                vencido: horasDesdeUltima >= regra.intervalo,
                urgente: horasDesdeUltima >= (regra.intervalo * 0.9)
            };
        })
        .filter(regra => regra.urgente) // Apenas mostra o que está perto de vencer (90%) ou vencido
        .sort((a, b) => {
            // Ordena por severidade e depois por maior progresso
            const prioridade = { critical: 1, medium: 2, low: 3 };
            if (prioridade[a.severidade] !== prioridade[b.severidade]) {
                return prioridade[a.severidade] - prioridade[b.severidade];
            }
            return b.progresso - a.progresso;
        });
};