// --- FILE: src/features/calculadora/logic/calculator.js ---
import { parseNumber } from "../../../lib/format";

export function calcularTudo(entradas = {}) {
    // --- 1. NORMALIZAÇÃO E TRATAMENTO DE ENTRADAS ---
    const p = {
        qtd: Math.max(1, parseNumber(entradas.qtdPecas)),
        custoKwh: parseNumber(entradas.custoKwh),
        horaHumana: parseNumber(entradas.valorHoraHumana),
        horaMaquina: parseNumber(entradas.custoHoraMaquina),
        taxaSetup: parseNumber(entradas.taxaSetup),
        embalagem: parseNumber(entradas.custoEmbalagem),
        frete: parseNumber(entradas.custoFrete),
        extras: parseNumber(entradas.custosExtras),
        // Tempos
        tImp: parseNumber(entradas.tempoImpressaoHoras) + (parseNumber(entradas.tempoImpressaoMinutos) / 60),
        tTrab: parseNumber(entradas.tempoTrabalhoHoras) + (parseNumber(entradas.tempoTrabalhoMinutos) / 60),
        // Financeiro
        margem: parseNumber(entradas.margemLucro) / 100,
        imposto: parseNumber(entradas.imposto) / 100,
        taxaMkt: parseNumber(entradas.taxaMarketplace) / 100,
        taxaMktFixa: parseNumber(entradas.taxaMarketplaceFixa || 0),
        desconto: parseNumber(entradas.desconto) / 100,
        falha: parseNumber(entradas.taxaFalha) / 100,
        consumoW: parseNumber(entradas.consumoImpressoraKw) > 10 
            ? parseNumber(entradas.consumoImpressoraKw) / 1000 
            : parseNumber(entradas.consumoImpressoraKw) || 0.15
    };

    // --- 2. CÁLCULO DE MATERIAL (SUPORTE A MULTICOLOR/AMS) ---
    let custoMaterialUnit = 0;
    
    // Se houver slots (Multicolor), soma todos. Se não, usa os campos simples.
    if (entradas.materialSlots && entradas.materialSlots.length > 0) {
        custoMaterialUnit = entradas.materialSlots.reduce((acc, slot) => {
            const peso = parseNumber(slot.weight);
            const precoKg = parseNumber(slot.priceKg);
            return acc + ((precoKg / 1000) * peso);
        }, 0);
    } else {
        custoMaterialUnit = (parseNumber(entradas.custoRolo) / 1000) * parseNumber(entradas.pesoModelo);
    }

    // --- 3. CUSTOS DE PRODUÇÃO (ONDE O RISCO SE APLICA) ---
    const custoEnergiaUnit = (p.tImp * p.consumoW * p.custoKwh) / p.qtd;
    const custoMaquinaUnit = (p.tImp * p.horaMaquina) / p.qtd;
    const custoMaoDeObraUnit = (p.tTrab * p.horaHumana) / p.qtd;
    const custoSetupUnit = p.taxaSetup / p.qtd;
    
    // Manutenção oculta (5% sobre o custo de máquina para bicos, correias, etc)
    const manutencaoOcultaUnit = custoMaquinaUnit * 0.05;

    // Custo de fabricação puro
    const custoProducaoDireto = custoMaterialUnit + custoEnergiaUnit + custoMaquinaUnit + 
                               custoMaoDeObraUnit + custoSetupUnit + manutencaoOcultaUnit;

    // Aplicação do Risco/Falha APENAS na produção
    const custoProducaoComRisco = p.falha < 1 ? custoProducaoDireto / (1 - p.falha) : custoProducaoDireto * 2;
    const valorRiscoUnit = custoProducaoComRisco - custoProducaoDireto;

    // --- 4. CUSTO TOTAL DE OPERAÇÃO (BREAK-EVEN) ---
    // Adicionamos logística e extras DEPOIS do risco de falha
    const custoTotalOperacional = custoProducaoComRisco + p.embalagem + p.frete + p.extras;

    // --- 5. PRECIFICAÇÃO (CONTRIBUIÇÃO MARGINAL) ---
    const divisor = 1 - p.imposto - p.taxaMkt;
    
    let precoSugerido = 0;
    if (divisor > 0.1) {
        // Fórmula: (Custos que não dependem do preço * (1 + Margem) + Taxa Fixa) / Divisor de Taxas %
        precoSugerido = (custoTotalOperacional * (1 + p.margem) + p.taxaMktFixa) / divisor;
    } else {
        precoSugerido = custoTotalOperacional * 3; 
    }

    const precoFinalVenda = precoSugerido * (1 - p.desconto);

    // --- 6. INDICADORES FINANCEIROS REAIS (Baseados no valor de venda real) ---
    const valorImpostoReal = precoFinalVenda * p.imposto;
    const valorMktReal = (precoFinalVenda * p.taxaMkt) + p.taxaMktFixa;

    // Lucro Líquido Real: O que sobra depois de pagar TUDO
    const lucroLiquidoReal = precoFinalVenda - valorImpostoReal - valorMktReal - custoTotalOperacional;
    const margemEfetivaReal = precoFinalVenda > 0 ? (lucroLiquidoReal / precoFinalVenda) * 100 : 0;

    // --- 7. RETORNO ---
    const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

    return {
        custoMaterial: round(custoMaterialUnit),
        custoEnergia: round(custoEnergiaUnit),
        custoMaquina: round(custoMaquinaUnit + manutencaoOcultaUnit),
        custoMaoDeObra: round(custoMaoDeObraUnit),
        custoSetup: round(custoSetupUnit),
        custoEmbalagem: round(p.embalagem),
        custoFrete: round(p.frete),
        custosExtras: round(p.extras),
        
        valorRisco: round(valorRiscoUnit),
        valorImpostos: round(valorImpostoReal),
        valorMarketplace: round(valorMktReal),

        custoUnitario: round(custoTotalOperacional), 
        precoSugerido: round(precoSugerido),
        precoComDesconto: round(precoFinalVenda),
        lucroBrutoUnitario: round(lucroLiquidoReal),
        margemEfetivaPct: round(margemEfetivaReal),

        tempoTotalHoras: round(p.tImp),
        quantidade: p.qtd
    };
}