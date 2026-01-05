import { create } from 'zustand';
import api from '../../../utils/api';
import { parseNumber } from "../../../utils/numbers";

/**
 * MOTOR DE CÁLCULO PROFISSIONAL (MÉTODO DO DIVISOR)
 */
export function calcularTudo(dadosEntrada = {}) {
    // Helper para extração segura de números
    const obterValor = (caminho, caminhoAlternativo) => {
        const partes = caminho.split('.');
        let valor = dadosEntrada;
        for (const parte of partes) {
            valor = valor?.[parte];
        }
        const resultado = valor !== undefined ? valor : dadosEntrada[caminhoAlternativo];
        const stringLimpa = String(resultado || "0").replace(',', '.');
        return parseNumber(stringLimpa) || 0;
    };

    const quantidade = Math.max(1, obterValor('qtdPecas', 'qtdPecas'));

    // Soma de custos extras
    const listaExtras = dadosEntrada.custosExtras?.lista || [];
    const somaExtrasAdicionais = Array.isArray(listaExtras)
        ? listaExtras.reduce((acumulado, item) => {
            const val = parseFloat(String(item?.valor || "0").replace(',', '.')) || 0;
            return acumulado + val;
        }, 0)
        : 0;

    // Parâmetros normalizados
    const p = {
        quantidade,
        custoKwh: obterValor('config.custoKwh', 'custoKwh'),
        valorHoraHumana: obterValor('config.valorHoraHumana', 'valorHoraHumana'),
        custoHoraMaquina: obterValor('config.custoHoraMaquina', 'custoHoraMaquina'),
        taxaSetup: obterValor('config.taxaSetup', 'taxaSetup'),
        embalagem: obterValor('custosExtras.embalagem', 'custoEmbalagem'),
        frete: obterValor('custosExtras.frete', 'custoFrete'),
        extras: somaExtrasAdicionais,
        margemLucro: obterValor('config.margemLucro', 'margemLucro') / 100,
        imposto: obterValor('config.imposto', 'imposto') / 100,
        taxaMkt: obterValor('vendas.taxaMarketplace', 'taxaMarketplace') / 100,
        taxaMktFixa: obterValor('vendas.taxaMarketplaceFixa', 'taxaMarketplaceFixa'),
        desconto: obterValor('vendas.desconto', 'desconto') / 100,
        taxaFalha: obterValor('config.taxaFalha', 'taxaFalha') / 100,

        tempoImp: obterValor('tempo.impressaoHoras', 'tempoImpressaoHoras') + (obterValor('tempo.impressaoMinutos', 'tempoImpressaoMinutos') / 60),
        tempoTrab: obterValor('tempo.trabalhoHoras', 'tempoTrabalhoHoras') + (obterValor('tempo.trabalhoMinutos', 'tempoTrabalhoMinutos') / 60),

        // CORREÇÃO: O valor vindo da config já deve estar em kW. 
        // A lógica de ">= 2" foi movida exclusivamente para o componente de UI.
        consumoKw: obterValor('config.consumoKw', 'consumoImpressoraKw')
    };

    // --- CÁLCULO DE MATERIAIS ---
    let custoMaterialUnitario = 0;
    const slots = dadosEntrada.material?.slots || [];
    const slotsValidos = slots.filter(s => {
        const peso = parseFloat(String(s?.weight || "0").replace(',', '.'));
        const preco = parseFloat(String(s?.priceKg || "0").replace(',', '.'));
        return peso > 0 && preco > 0;
    });

    if (slotsValidos.length > 0) {
        custoMaterialUnitario = slotsValidos.reduce((acc, slot) => {
            const weight = parseFloat(String(slot.weight).replace(',', '.'));
            const priceKg = parseFloat(String(slot.priceKg).replace(',', '.'));
            return acc + ((priceKg / 1000) * weight);
        }, 0);
    } else {
        const custoRolo = obterValor('material.custoRolo', 'custoRolo');
        const pesoModelo = obterValor('material.pesoModelo', 'pesoModelo');
        custoMaterialUnitario = (custoRolo / 1000) * pesoModelo;
    }

    // --- CUSTOS OPERACIONAIS ---
    const custoEnergiaUnit = (p.tempoImp * p.consumoKw * p.custoKwh) / p.quantidade;
    const custoBaseMaquinaUnit = (p.tempoImp * p.custoHoraMaquina) / p.quantidade;
    const reservaManutencaoUnit = custoBaseMaquinaUnit * 0.10;
    const custoMaoDeObraUnit = (p.tempoTrab * p.valorHoraHumana) / p.quantidade;
    const custoSetupUnit = p.taxaSetup / p.quantidade;

    const custoDiretoTotal = custoMaterialUnitario + custoEnergiaUnit + custoBaseMaquinaUnit + reservaManutencaoUnit + custoMaoDeObraUnit + custoSetupUnit;

    const fatorFalhaSeguro = Math.min(p.taxaFalha, 0.95);
    const custoComRisco = custoDiretoTotal / (1 - fatorFalhaSeguro);
    const valorRiscoUnitario = custoComRisco - custoDiretoTotal;

    const custoFixoSaidaUnitario = p.embalagem + p.frete + (p.extras / p.quantidade);
    const custoTotalOperacional = custoComRisco + custoFixoSaidaUnitario;

    // --- FORMAÇÃO DE PREÇO (MÉTODO DO DIVISOR) ---
    const somaTaxasELucro = p.imposto + p.taxaMkt + p.margemLucro;
    const divisor = Math.max(0.05, 1 - somaTaxasELucro);

    let precoVendaFinal = (custoTotalOperacional + (p.taxaMktFixa / p.quantidade)) / divisor;

    const divisorDesconto = Math.max(0.01, 1 - p.desconto);
    const precoSugerido = precoVendaFinal / divisorDesconto;
    const precoComDesconto = precoSugerido * (1 - p.desconto);

    // --- RESULTADOS ---
    const impostoReal = precoComDesconto * p.imposto;
    const taxaMktReal = (precoComDesconto * p.taxaMkt) + p.taxaMktFixa;
    const lucroLiquidoReal = precoComDesconto - impostoReal - taxaMktReal - custoTotalOperacional;
    const margemEfetivaReal = precoComDesconto > 0 ? (lucroLiquidoReal / precoComDesconto) * 100 : 0;

    const arredondar = (num) => isFinite(num) ? Math.round((num + Number.EPSILON) * 100) / 100 : 0;

    return {
        custoMaterial: arredondar(custoMaterialUnitario),
        custoEnergia: arredondar(custoEnergiaUnit),
        custoMaquina: arredondar(custoBaseMaquinaUnit),
        reservaManutencao: arredondar(reservaManutencaoUnit),
        custoMaoDeObra: arredondar(custoMaoDeObraUnit),
        custoSetup: arredondar(custoSetupUnit),
        custoEmbalagem: arredondar(p.embalagem),
        custoFrete: arredondar(p.frete),
        custosExtras: arredondar(p.extras / p.quantidade),
        valorRisco: arredondar(valorRiscoUnitario),
        valorImpostos: arredondar(impostoReal),
        valorMarketplace: arredondar(taxaMktReal),
        custoUnitario: arredondar(custoTotalOperacional),
        precoSugerido: arredondar(precoSugerido),
        precoComDesconto: arredondar(precoComDesconto),
        lucroBrutoUnitario: arredondar(lucroLiquidoReal),
        margemEfetivaPct: arredondar(margemEfetivaReal),
        tempoTotalHoras: arredondar(p.tempoImp),
        quantidadePecas: p.quantidade
    };
}

/**
 * ZUSTAND STORE: CONFIGURAÇÕES
 */
export const useSettingsStore = create((set) => ({
    settings: {
        custoKwh: "",
        valorHoraHumana: "",
        custoHoraMaquina: "",
        taxaSetup: "",
        consumoKw: "",
        margemLucro: "",
        imposto: "",
        taxaFalha: "",
        desconto: "",
        whatsappTemplate: ""
    },
    isLoading: false,

    fetchSettings: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/settings');
            const d = Array.isArray(data) ? data[0] : (data?.results ? data.results[0] : data);

            if (d) {
                const mapeado = {
                    custoKwh: String(d.custo_kwh ?? ""),
                    valorHoraHumana: String(d.valor_hora_humana ?? ""),
                    custoHoraMaquina: String(d.custo_hora_maquina ?? ""),
                    taxaSetup: String(d.taxa_setup ?? ""),
                    consumoKw: String(d.consumo_impressora_kw ?? ""),
                    margemLucro: String(d.margem_lucro ?? ""),
                    imposto: String(d.imposto ?? ""),
                    taxaFalha: String(d.taxa_falha ?? ""),
                    desconto: String(d.desconto ?? ""),
                    whatsappTemplate: d.whatsapp_template || "Segue o orçamento do projeto *{projeto}*:\n\n💰 Valor: *{valor}*\n⏱️ Tempo estimado: *{tempo}*\n\nPodemos fechar?"
                };
                set({ settings: mapeado, isLoading: false });
                return true;
            }
        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
        }
        set({ isLoading: false });
        return false;
    },

    saveSettings: async (dados) => {
        set({ isLoading: true });
        try {
            // CORREÇÃO: Garantindo que valores vazios ou indefinidos virem 0 para não quebrar o banco
            const paraEnviar = {
                custo_kwh: parseNumber(String(dados.custoKwh || 0).replace(',', '.')),
                valor_hora_humana: parseNumber(String(dados.valorHoraHumana || 0).replace(',', '.')),
                custo_hora_maquina: parseNumber(String(dados.custoHoraMaquina || 0).replace(',', '.')),
                taxa_setup: parseNumber(String(dados.taxaSetup || 0).replace(',', '.')),
                consumo_impressora_kw: parseNumber(String(dados.consumoKw || 0).replace(',', '.')),
                margem_lucro: parseNumber(String(dados.margemLucro || 0).replace(',', '.')),
                imposto: parseNumber(String(dados.imposto || 0).replace(',', '.')),
                taxa_falha: parseNumber(String(dados.taxaFalha || 0).replace(',', '.')),
                desconto: parseNumber(String(dados.desconto || 0).replace(',', '.')),
                whatsapp_template: dados.whatsappTemplate || ""
            };

            await api.post('/settings', paraEnviar);
            set({ settings: dados, isLoading: false });
            return true;
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            set({ isLoading: false });
            return false;
        }
    }
}));