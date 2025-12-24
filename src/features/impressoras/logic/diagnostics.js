export const calcularFinanceiroAvancado = (impressora) => {
    // Garantindo que os dados sejam números para evitar NaN
    const preco = Math.max(0, Number(impressora.preco) || 0);
    const rendimento = Number(impressora.rendimento_total) || 0;
    const horas = Math.max(0, Number(impressora.horas_totais) || 0);
    const potenciaKw = (Number(impressora.potencia) || 0) / 1000;
    
    // Cálculos Operacionais
    const custoEletrico = horas * potenciaKw * 0.85; // Base kWh Brasil
    
    // Correção na Depreciação: A depreciação não deve exceder o preço da máquina
    // Se a máquina passou de 5000h, ela já está "totalmente depreciada" financeiramente
    const depreciacaoAcumulada = Math.min(preco, (preco / 5000) * horas);
    
    const custoOperacionalTotal = custoEletrico + depreciacaoAcumulada;
    const lucroLiquido = rendimento - custoOperacionalTotal;

    // Cálculo de ROI: (Lucro / Investimento) * 100
    // Removi o Math.max(0) para você saber se o ROI está negativo (prejuízo)
    const roi = preco > 0 ? (lucroLiquido / preco) * 100 : 0;

    return {
        roiPct: roi.toFixed(1), // Retorna com uma casa decimal para a UI
        pago: lucroLiquido >= preco, // A máquina se pagou quando o lucro líquido cobre o custo dela
        custoOperacional: custoOperacionalTotal.toFixed(2),
        lucroLiquido: lucroLiquido.toFixed(2)
    };
};

export const analisarSaudeImpressora = (impressora) => {
    if (!impressora) return [];

    const total = Number(impressora.horas_totais) || 0;
    const ultima = Number(impressora.ultima_manutencao_hora) || 0;
    const horasDesdeMaint = Math.max(0, total - ultima);
    
    const regras = [
        { id: 1, rotulo: 'Limpeza Mesa/Bico', intervalo: 50, severidade: 'low', acao: "Álcool Isopropílico" },
        { id: 2, rotulo: 'Lubrificação Eixos', intervalo: 200, severidade: 'medium', acao: "Graxa branca/Óleo leve" },
        { id: 3, rotulo: 'Revisão Elétrica', intervalo: 1000, severidade: 'critical', acao: "Reaperto de bornes" }
    ];

    // Mapeamento de peso para ordenação (Critical > Medium > Low)
    const pesoSeveridade = { critical: 3, medium: 2, low: 1 };

    return regras
        .filter(r => horasDesdeMaint >= (r.intervalo * 0.9)) // Começa a avisar com 90% do tempo
        .map(r => ({ 
            ...r, 
            atraso: Math.max(0, horasDesdeMaint - r.intervalo),
            urgencia: Math.min(100, (horasDesdeMaint / r.intervalo) * 100).toFixed(0)
        }))
        .sort((a, b) => pesoSeveridade[b.severidade] - pesoSeveridade[a.severidade]);
};