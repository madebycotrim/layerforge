// src/utils/wikiData.js
import {
    Factory, AlertTriangle, Users, CheckCircle,
    Coins, Store
} from 'lucide-react';

export const WIKI_DATA = [

/* ======================================================
   PRODUÇÃO E OPERAÇÃO
====================================================== */
{
    id: 'MOD-10',
    title: "Produção em Escala",
    category: "Produção",
    type: "setup",
    icon: Factory,
    color: "sky",
    topics: [
        {
            id: "pr1",
            title: "Batch inteligente",
            content: "Agrupe impressões por material, cor, altura e perfil. Cada troca de filamento ou perfil quebra o ritmo da produção, aumenta risco de erro humano e consome tempo não produtivo.",
            level: "Produção",
            updated: "MAR/2026"
        },
        {
            id: "pr2",
            title: "Risco em impressões longas",
            content: "Quanto maior o tempo de impressão, maior a chance de falha elétrica, mecânica ou térmica. Impressões acima de 10–12 horas devem ter margem maior ou ser divididas em partes.",
            level: "Gestão de Risco",
            updated: "MAR/2026"
        },
        {
            id: "pr3",
            title: "Redundância mínima",
            content: "Tenha sempre peças críticas de reposição: bico, tubo PTFE, correias, sensores e ventiladores. Parar produção por item barato gera prejuízo alto.",
            level: "Confiabilidade",
            updated: "FEV/2026"
        },
        {
            id: "pr4",
            title: "Produção noturna segura",
            content: "Produção noturna só deve ocorrer com máquina revisada, proteção elétrica e monitoramento remoto. Produzir sem segurança é trocar produtividade por risco.",
            level: "Segurança",
            updated: "JAN/2026"
        },
        {
            id: "pr5",
            title: "Padronização de perfis",
            content: "Perfis padronizados evitam erros, facilitam treinamento e permitem escalar produção. Ajustes finos devem ser exceção, não rotina.",
            level: "Eficiência",
            updated: "FEV/2026"
        },
        {
            id: "pr6",
            title: "Fila contínua de produção",
            content: "Manter modelos já fatiados e validados evita impressora parada. Máquina ociosa não faz barulho, mas consome lucro.",
            level: "Produtividade",
            updated: "MAR/2026"
        }
    ]
},

/* ======================================================
   FALHAS E PREJUÍZOS
====================================================== */
{
    id: "MOD-11",
    title: "Falhas e Prejuízos",
    category: "Erros Comuns",
    type: "critico",
    icon: AlertTriangle,
    color: "rose",
    topics: [
        {
            id: "e1",
            title: "Entupimento progressivo",
            content: "A impressão começa bem e perde qualidade com o tempo. Isso indica bico parcialmente obstruído. Em produção, trocar o bico preventivamente custa menos que refazer peças.",
            level: "Crítico",
            updated: "JAN/2026"
        },
        {
            id: "e2",
            title: "Extrusor patinando",
            content: "Cliques metálicos indicam tensão incorreta ou engrenagem suja. O filamento não avança corretamente e a peça fica fraca.",
            level: "Alerta",
            updated: "FEV/2026"
        },
        {
            id: "e3",
            title: "Warping silencioso",
            content: "A peça descola levemente da mesa e só falha horas depois. Brim adequado, mesa limpa e temperatura correta evitam esse prejuízo oculto.",
            level: "Prevenção",
            updated: "MAR/2026"
        },
        {
            id: "e4",
            title: "Layer shift",
            content: "Deslocamento das camadas causado por correias frouxas, colisões ou aceleração excessiva. Geralmente invalida a peça inteira.",
            level: "Crítico",
            updated: "FEV/2026"
        },
        {
            id: "e5",
            title: "Subextrusão oculta",
            content: "Visualmente aceitável, estruturalmente fraca. Esse tipo de falha destrói confiança do cliente.",
            level: "Qualidade",
            updated: "MAR/2026"
        },
        {
            id: "e6",
            title: "Falha elétrica",
            content: "Quedas de energia ou picos elétricos interrompem impressões longas. Proteção elétrica é investimento, não custo.",
            level: "Infraestrutura",
            updated: "JAN/2026"
        }
    ]
},

/* ======================================================
   QUALIDADE E PADRONIZAÇÃO
====================================================== */
{
    id: "MOD-13",
    title: "Qualidade e Padronização",
    category: "Controle",
    type: "qualidade",
    icon: CheckCircle,
    color: "cyan",
    topics: [
        {
            id: "q1",
            title: "Altura de camada comercial",
            content: "Altura de 0,20 mm oferece equilíbrio entre estética e tempo. Qualidade extrema raramente é percebida pelo cliente final.",
            level: "Comercial",
            updated: "JAN/2026"
        },
        {
            id: "q2",
            title: "Orientação da peça",
            content: "A resistência depende da orientação no eixo Z. Uma peça bonita pode falhar mecanicamente se mal orientada.",
            level: "Estrutural",
            updated: "FEV/2026"
        },
        {
            id: "q3",
            title: "Tolerância dimensional",
            content: "Impressão 3D possui variações naturais. Encaixes devem considerar folgas adequadas.",
            level: "Técnico",
            updated: "FEV/2026"
        },
        {
            id: "q4",
            title: "Acabamento padrão",
            content: "Definir o que é aceitável evita conflitos. Nem toda linha de camada é defeito.",
            level: "Processo",
            updated: "MAR/2026"
        },
        {
            id: "q5",
            title: "Checklist visual",
            content: "Inspeção rápida antes do envio evita retrabalho, devoluções e avaliações negativas.",
            level: "Processo",
            updated: "MAR/2026"
        },
        {
            id: "q6",
            title: "Controle de lote",
            content: "Identificar peças por lote ajuda a rastrear falhas e corrigir processos.",
            level: "Rastreabilidade",
            updated: "MAR/2026"
        }
    ]
},

/* ======================================================
   CLIENTES E EXPECTATIVAS
====================================================== */
{
    id: "MOD-12",
    title: "Clientes e Expectativas",
    category: "Comercial",
    type: "lucro",
    icon: Users,
    color: "emerald",
    topics: [
        {
            id: "c1",
            title: "Alinhamento de expectativa",
            content: "Explique limitações da impressão 3D antes de produzir. Expectativa desalinhada gera retrabalho.",
            level: "Essencial",
            updated: "JAN/2026"
        },
        {
            id: "c2",
            title: "Amostra de validação",
            content: "Validar uma miniatura reduz riscos financeiros em peças grandes.",
            level: "Estratégia",
            updated: "FEV/2026"
        },
        {
            id: "c3",
            title: "Cliente leigo",
            content: "Use linguagem simples, imagens e exemplos. Clareza gera confiança.",
            level: "Comunicação",
            updated: "MAR/2026"
        },
        {
            id: "c4",
            title: "Cliente técnico",
            content: "Use termos corretos e dados técnicos. Profissional reconhece profissional.",
            level: "Venda Consultiva",
            updated: "MAR/2026"
        },
        {
            id: "c5",
            title: "Prazo realista",
            content: "Prometer menos e entregar antes é melhor que o contrário.",
            level: "Gestão",
            updated: "JAN/2026"
        },
        {
            id: "c6",
            title: "Registro de acordos",
            content: "Tudo que foi combinado deve estar documentado. Memória falha, registro não.",
            level: "Segurança",
            updated: "FEV/2026"
        }
    ]
},

/* ======================================================
   MARKETPLACE
====================================================== */
{
    id: "MOD-20",
    title: "Marketplace e Vendas Online",
    category: "Vendas",
    type: "lucro",
    icon: Store,
    color: "violet",
    topics: [
        {
            id: "m1",
            title: "Produto campeão",
            content: "Produtos simples, leves e monocor escalam melhor e têm menos falhas.",
            level: "Estratégia",
            updated: "MAR/2026"
        },
        {
            id: "m2",
            title: "Preço psicológico",
            content: "Valores quebrados geram mais conversão que números redondos.",
            level: "Venda",
            updated: "JAN/2026"
        },
        {
            id: "m3",
            title: "Variações controladas",
            content: "Excesso de variação aumenta erro operacional e confunde o cliente.",
            level: "Plataforma",
            updated: "FEV/2026"
        },
        {
            id: "m4",
            title: "Frete e conversão",
            content: "Frete alto derruba vendas. Embalagem correta é parte do produto.",
            level: "Logística",
            updated: "MAR/2026"
        },
        {
            id: "m5",
            title: "SEO interno",
            content: "Título deve focar função, material e aplicação. Criatividade vem depois.",
            level: "Marketing",
            updated: "MAR/2026"
        },
        {
            id: "m6",
            title: "Avaliações",
            content: "Avaliações impactam mais que preço. Atendimento faz parte da venda.",
            level: "Reputação",
            updated: "MAR/2026"
        }
    ]
},

/* ======================================================
   FINANCEIRO
====================================================== */
{
    id: "MOD-14",
    title: "Saúde Financeira",
    category: "Financeiro",
    type: "lucro",
    icon: Coins,
    color: "amber",
    topics: [
        {
            id: "f1",
            title: "Taxa de falha",
            content: "Inclua 5–15% de falhas no custo. Toda produção perde peças.",
            level: "Essencial",
            updated: "JAN/2026"
        },
        {
            id: "f2",
            title: "Tempo invisível",
            content: "Atendimento, anúncios e embalagem também consomem horas.",
            level: "Gestão",
            updated: "MAR/2026"
        },
        {
            id: "f3",
            title: "Energia elétrica",
            content: "Impressoras ligadas o dia inteiro impactam a margem final.",
            level: "Custo Fixo",
            updated: "FEV/2026"
        },
        {
            id: "f4",
            title: "Depreciação",
            content: "Máquinas desgastam. Planejar reposição evita parada total.",
            level: "Planejamento",
            updated: "MAR/2026"
        },
        {
            id: "f5",
            title: "Margem mínima",
            content: "Preço sem margem não sustenta negócio. Lucro não é opcional.",
            level: "Lucro",
            updated: "JAN/2026"
        },
        {
            id: "f6",
            title: "Fluxo de caixa",
            content: "Venda sem controle de caixa quebra empresa lucrativa.",
            level: "Gestão",
            updated: "MAR/2026"
        }
    ]
}

];
