export const calcularFinanceiroAvancado = (impressora) => {
    const preco = Number(impressora.preco) || 0;
    const rendimento = Number(impressora.rendimento_total) || 0;
    const horas = Number(impressora.horas_totais) || 0;
    const potenciaKw = (Number(impressora.potencia) || 0) / 1000;
    
    const custoEletrico = horas * potenciaKw * 0.85; // Base kWh Brasil
    const depreciacao = (preco / 5000) * horas; // Vida útil estimada 5k horas
    const lucroLiquido = rendimento - (custoEletrico + depreciacao);

    return {
        roiPct: preco > 0 ? Math.max(0, (lucroLiquido / preco) * 100) : 0,
        pago: lucroLiquido >= preco,
        custoOperacional: (custoEletrico + depreciacao).toFixed(2)
    };
};

export const analisarSaudeImpressora = (impressora) => {
    if (!impressora) return [];
    const horasDesdeMaint = (Number(impressora.horas_totais) || 0) - (Number(impressora.ultima_manutencao_hora) || 0);
    
    const regras = [
        { id: 1, rotulo: 'Limpeza Mesa/Bico', intervalo: 50, severidade: 'low', acao: "Álcool Isopropílico" },
        { id: 2, rotulo: 'Lubrificação Eixos', intervalo: 200, severidade: 'medium', acao: "Graxa branca/Óleo leve" },
        { id: 3, rotulo: 'Revisão Elétrica', intervalo: 1000, severidade: 'critical', acao: "Reaperto de bornes" }
    ];

    return regras
        .filter(r => horasDesdeMaint >= r.intervalo * 0.9)
        .map(r => ({ ...r, atraso: Math.max(0, horasDesdeMaint - r.intervalo) }))
        .sort((a, b) => a.severidade === 'critical' ? -1 : 1);
};