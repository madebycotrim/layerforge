import { parseNumber } from "../../../lib/format";

/**
 * MOTOR DE CÁLCULO - LAYERFORGE
 * Resolve problemas de prioridade de material, cálculo de tempos e indicadores financeiros.
 */
export function calcularTudo(entradas = {}) {
    // --- 1. NORMALIZAÇÃO DE ENTRADAS (Tratamento de Strings e Nulos) ---
    
    // Soma de Custos Adicionais (Extras)
    const totalExtrasSoma = Array.isArray(entradas.custosExtras)
        ? entradas.custosExtras.reduce((acc, item) => acc + parseNumber(item?.valor), 0)
        : 0;

    const p = {
        qtd: Math.max(1, parseNumber(entradas.qtdPecas)),
        custoKwh: parseNumber(entradas.custoKwh),
        horaHumana: parseNumber(entradas.valorHoraHumana),
        horaMaquina: parseNumber(entradas.custoHoraMaquina),
        taxaSetup: parseNumber(entradas.taxaSetup),
        embalagem: parseNumber(entradas.custoEmbalagem),
        frete: parseNumber(entradas.custoFrete),
        extras: totalExtrasSoma,
        // Conversão de Tempos: Soma Horas + (Minutos / 60)
        tImp: parseNumber(entradas.tempoImpressaoHoras) + (parseNumber(entradas.tempoImpressaoMinutos) / 60),
        tTrab: parseNumber(entradas.tempoTrabalhoHoras) + (parseNumber(entradas.tempoTrabalhoMinutos) / 60),
        // Percentuais para decimais
        margem: parseNumber(entradas.margemLucro) / 100,
        imposto: parseNumber(entradas.imposto) / 100,
        taxaMkt: parseNumber(entradas.taxaMarketplace) / 100,
        taxaMktFixa: parseNumber(entradas.taxaMarketplaceFixa),
        desconto: parseNumber(entradas.desconto) / 100,
        falha: parseNumber(entradas.taxaFalha) / 100,
        // Conversão de Watts para kW (Inteligente)
        consumoW: parseNumber(entradas.consumoImpressoraKw) > 10 
            ? parseNumber(entradas.consumoImpressoraKw) / 1000 
            : parseNumber(entradas.consumoImpressoraKw)
    };

    // --- 2. LÓGICA DE MATERIAL (CORREÇÃO DE PRIORIDADE) ---
    let custoMaterialUnit = 0;
    
    // Verifica se há peso real nos slots de material (Modo Várias Cores)
    const slotsValidos = (entradas.materialSlots || []).filter(s => parseNumber(s.weight) > 0);

    if (slotsValidos.length > 0) {
        // Se houver pesos nos slots, o cálculo é baseado neles
        custoMaterialUnit = slotsValidos.reduce((acc, slot) => {
            const peso = parseNumber(slot.weight);
            const precoKg = parseNumber(slot.priceKg);
            return acc + ((precoKg / 1000) * peso);
        }, 0);
    } else {
        // Fallback: Se os slots estiverem vazios, usa os campos do Modo "Uma Cor"
        const precoKgSimples = parseNumber(entradas.custoRolo);
        const pesoSimples = parseNumber(entradas.pesoModelo);
        custoMaterialUnit = (precoKgSimples / 1000) * pesoSimples;
    }

    // --- 3. CUSTOS DE PRODUÇÃO (TEMPO DE MÁQUINA E MÃO DE OBRA) ---
    // Importante: Só terão valor se o usuário configurar a aba "Minha Oficina"
    const custoEnergiaUnit = (p.tImp * p.consumoW * p.custoKwh) / p.qtd;
    const custoMaquinaUnit = (p.tImp * p.horaMaquina) / p.qtd;
    const custoMaoDeObraUnit = (p.tTrab * p.horaHumana) / p.qtd;
    const custoSetupUnit = p.taxaSetup / p.qtd;
    
    // Manutenção preventiva fixa (5% sobre o custo de hora máquina)
    const manutencaoOcultaUnit = custoMaquinaUnit * 0.05;

    // Custo Base Direto (Fabricação Pura)
    const custoProducaoDireto = custoMaterialUnit + custoEnergiaUnit + custoMaquinaUnit + 
                               custoMaoDeObraUnit + custoSetupUnit + manutencaoOcultaUnit;

    // Aplicação da Reserva de Falha (Markup proporcional sobre o custo de produção)
    const custoProducaoComRisco = p.falha < 1 
        ? custoProducaoDireto / (1 - p.falha) 
        : custoProducaoDireto * (1 + p.falha);
    
    const valorRiscoUnit = custoProducaoComRisco - custoProducaoDireto;

    // --- 4. CUSTO TOTAL OPERACIONAL (BREAK-EVEN) ---
    // Logística e Extras entram após o risco de falha da máquina
    const custoTotalOperacional = custoProducaoComRisco + p.embalagem + p.frete + p.extras;

    // --- 5. PRECIFICAÇÃO (Margem de Contribuição) ---
    const divisorTaxas = 1 - p.imposto - p.taxaMkt;
    let precoSugerido = 0;

    // Proteção contra divisão por zero em margens inviáveis
    if (divisorTaxas > 0.05) {
        precoSugerido = (custoTotalOperacional * (1 + p.margem) + p.taxaMktFixa) / divisorTaxas;
    } else {
        precoSugerido = custoTotalOperacional * 3; // Fallback de emergência para taxas > 95%
    }

    // Aplicação do Desconto Comercial
    const precoComDesconto = precoSugerido * (1 - p.desconto);

    // --- 6. INDICADORES FINANCEIROS REAIS (Baseados no Preço Final) ---
    const impostoReal = precoComDesconto * p.imposto;
    const taxaMktReal = (precoComDesconto * p.taxaMkt) + p.taxaMktFixa;

    // Lucro Líquido Real (O que sobra no bolso após pagar TUDO)
    const lucroLiquidoReal = precoComDesconto - impostoReal - taxaMktReal - custoTotalOperacional;
    
    // Margem Efetiva sobre a venda real
    const margemEfetivaReal = precoComDesconto > 0 ? (lucroLiquidoReal / precoComDesconto) * 100 : 0;

    // --- 7. FORMATAÇÃO DE RETORNO (Arredondamento Técnico) ---
    const round = (n) => {
        const num = Number(n);
        return isFinite(num) ? Math.round((num + Number.EPSILON) * 100) / 100 : 0;
    };

    return {
        // Resultados para o Summary.jsx
        custoMaterial: round(custoMaterialUnit),
        custoEnergia: round(custoEnergiaUnit),
        custoMaquina: round(custoMaquinaUnit + manutencaoOcultaUnit),
        custoMaoDeObra: round(custoMaoDeObraUnit),
        custoSetup: round(custoSetupUnit),
        custoEmbalagem: round(p.embalagem),
        custoFrete: round(p.frete),
        custosExtras: round(p.extras),
        valorRisco: round(valorRiscoUnit),
        valorImpostos: round(impostoReal),
        valorMarketplace: round(taxaMktReal),

        // Preços e Lucros
        custoUnitario: round(custoTotalOperacional), 
        precoSugerido: round(precoSugerido),
        precoComDesconto: round(precoComDesconto),
        lucroBrutoUnitario: round(lucroLiquidoReal),
        margemEfetivaPct: round(margemEfetivaReal),

        // Dados auxiliares para Widgets
        tempoTotalHoras: round(p.tImp),
        quantidadePecas: p.qtd
    };
}