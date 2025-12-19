// --- FILE: src/features/calculadora/logic/calculator.js ---
import { parseNumber } from "../../../lib/format";

// Arredondamento interno para cálculos monetários precisos
function roundMoney(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function calcularTudo(entradas = {}) {
    const CONFIG = { pesoRoloGramas: 1000 };

    // --- 1. ENTRADAS (Usando parseNumber) ---
    const pesoModelo = parseNumber(entradas.pesoModelo); 
    const quantidade = Math.max(1, parseNumber(entradas.qtdPecas));

    // Custos Globais
    const custoRolo = parseNumber(entradas.custoRolo);
    const custoKwh = parseNumber(entradas.custoKwh);
    const valorHoraHumana = parseNumber(entradas.valorHoraHumana);
    const custoHoraMaquina = parseNumber(entradas.custoHoraMaquina);
    const taxaSetup = parseNumber(entradas.taxaSetup);

    // Custos Unitários Específicos
    const custoEmbalagem = parseNumber(entradas.custoEmbalagem);
    const custoFrete = parseNumber(entradas.custoFrete);
    const custosExtras = parseNumber(entradas.custosExtras);

    // Tempos (Total em horas decimais)
    const tempoImpTotal = parseNumber(entradas.tempoImpressaoHoras) + (parseNumber(entradas.tempoImpressaoMinutos) / 60);
    const tempoTrabTotal = parseNumber(entradas.tempoTrabalhoHoras) + (parseNumber(entradas.tempoTrabalhoMinutos) / 60);

    // Margens e Taxas
    const margemLucro = Math.max(0, parseNumber(entradas.margemLucro));
    const impostoPct = Math.min(99.9, Math.max(0, parseNumber(entradas.imposto)));
    const descontoPct = Math.min(99.9, Math.max(0, parseNumber(entradas.desconto)));
    const taxaMarketplace = Math.min(99.9, Math.max(0, parseNumber(entradas.taxaMarketplace)));
    const taxaFalhaPct = Math.min(99, Math.max(0, parseNumber(entradas.taxaFalha)));

    // Consumo Energético
    let consumoKw = parseNumber(entradas.consumoImpressoraKw);
    if (consumoKw > 10) consumoKw = consumoKw / 1000; // Converte W para kW se necessário
    if (consumoKw <= 0) consumoKw = 0.15; // Padrão seguro

    // --- 2. CÁLCULOS (Unitários) ---
    const custoPorGrama = CONFIG.pesoRoloGramas > 0 ? custoRolo / CONFIG.pesoRoloGramas : 0;
    
    // Rateios divididos pela quantidade de peças
    const custoMaterialUnit = custoPorGrama * pesoModelo;
    const custoEnergiaUnit = (tempoImpTotal * consumoKw * custoKwh) / quantidade;
    const custoMaquinaUnit = (tempoImpTotal * custoHoraMaquina) / quantidade;
    const custoMaoDeObraUnit = (tempoTrabTotal * valorHoraHumana) / quantidade;
    const custoSetupUnit = taxaSetup / quantidade;
    const custoLogisticaUnit = custoEmbalagem + custoFrete;

    const custoProducaoBase = custoMaterialUnit + custoEnergiaUnit + custoMaquinaUnit + 
                              custoMaoDeObraUnit + custoSetupUnit + custoLogisticaUnit + custosExtras;

    // Aplicação do Risco (Taxa de Falha)
    let custoUnitarioFinal = custoProducaoBase;
    if (taxaFalhaPct > 0) {
        custoUnitarioFinal = custoProducaoBase / (1 - (taxaFalhaPct / 100));
    }

    // --- 3. PREÇO ---
    const markup = 1 + (margemLucro / 100);
    const divisorTaxas = 1 - (impostoPct / 100) - (taxaMarketplace / 100);
    
    let precoSugerido = 0;
    if (divisorTaxas > 0.01) {
        precoSugerido = (custoUnitarioFinal * markup) / divisorTaxas;
    } else {
        precoSugerido = custoUnitarioFinal * markup * 2; // Fallback de segurança
    }

    const precoComDesconto = precoSugerido * (1 - (descontoPct / 100));

    // --- 4. RESULTADOS FINANCEIROS ---
    const valorImpostos = precoSugerido * (impostoPct / 100);
    const valorMarketplace = precoSugerido * (taxaMarketplace / 100);
    const valorRisco = custoUnitarioFinal - custoProducaoBase;

    const lucroLiquidoUnit = precoSugerido - valorImpostos - valorMarketplace - custoUnitarioFinal;
    const margemEfetivaPct = precoSugerido > 0 ? (lucroLiquidoUnit / precoSugerido) * 100 : 0;

    return {
        // Custos Detalhados
        custoMaterial: roundMoney(custoMaterialUnit),
        custoEnergia: roundMoney(custoEnergiaUnit),
        custoMaquina: roundMoney(custoMaquinaUnit),
        custoMaoDeObra: roundMoney(custoMaoDeObraUnit),
        custoEmbalagemFrete: roundMoney(custoLogisticaUnit), 
        custosExtras: roundMoney(custosExtras),
        custoSetup: roundMoney(custoSetupUnit),
        
        // Indicadores Estratégicos
        valorRisco: roundMoney(valorRisco),
        valorImpostos: roundMoney(valorImpostos),
        valorMarketplace: roundMoney(valorMarketplace),

        // Totais
        custoUnitario: roundMoney(custoUnitarioFinal),
        precoSugerido: roundMoney(precoSugerido),
        precoComDesconto: roundMoney(precoComDesconto),
        lucroBrutoUnitario: roundMoney(lucroLiquidoUnit),
        margemEfetivaPct: roundMoney(margemEfetivaPct),

        // Metadados
        tempoImpressaoHorasDec: roundMoney(tempoImpTotal),
        consumoTotalKwh: roundMoney(tempoImpTotal * consumoKw),
        quantidade
    };
}