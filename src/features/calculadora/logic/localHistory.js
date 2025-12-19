// src/features/calculadora/logic/localHistory.js

const STORAGE_KEY = "calculadora_history_v2";

/* Helper para ID único */
function gerarId() {
  return String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9);
}

/* Parse seguro para evitar crash se o localStorage for corrompido */
function parseSeguro(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* ========================================================
   LER HISTÓRICO
   Normaliza os dados para garantir que a UI sempre receba
   client_id (snake_case) e data.inputs/results
   ======================================================== */
export function lerHistorico() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = parseSeguro(raw);
    if (!Array.isArray(parsed)) return [];

    // Normalização agressiva para garantir compatibilidade com versões anteriores
    return parsed.map((reg) => ({
      // UI espera snake_case (client_id), mas aceita ler camelCase se existir
      client_id: reg.client_id ?? reg.clientId ?? gerarId(),
      label: reg.label ?? reg.name ?? "Sem Identificação",
      created_at: reg.created_at ?? reg.createdAt ?? Date.now(),

      // Padroniza estrutura de dados para inputs/results
      data: {
        inputs: reg.data?.inputs ?? reg.data?.entradas ?? {},
        results: reg.data?.results ?? reg.data?.resultados ?? {},
      },
    }));
  } catch (err) {
    console.error("Erro ao ler histórico:", err);
    return [];
  }
}

/* ========================================================
   GRAVAR (SALVAR TUDO)
   Usado internamente ou para deletar itens
   ======================================================== */
export function gravarHistorico(arr = []) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    return arr;
  } catch (err) {
    console.error("Erro ao gravar histórico:", err);
    return [];
  }
}

/* ========================================================
   ADICIONAR UM NOVO ITEM
   Recebe { entradas, resultados } e salva como { inputs, results }
   ======================================================== */
export function adicionarAoHistorico({
  label = "",
  entradas = {},
  resultados = {},
} = {}) {
  try {
    const atual = lerHistorico();

    const novoRegistro = {
      client_id: gerarId(),
      label: label || "Projeto sem nome",
      created_at: Date.now(),
      data: {
        // Mapeia aqui para garantir que HistoryDrawer consiga ler
        inputs: entradas,
        results: resultados,
      },
    };

    // Adiciona no topo da lista
    const novaLista = [novoRegistro, ...atual];

    // Limita a 100 itens para não estourar o localStorage
    const listaLimitada = novaLista.slice(0, 100);

    gravarHistorico(listaLimitada);
    return novoRegistro;
  } catch (err) {
    console.error("Erro ao adicionar ao histórico:", err);
    return null;
  }
}

/* ========================================================
   LIMPAR
   ======================================================== */
export function limparHistorico() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Erro ao limpar histórico:", err);
  }
}

/* ========================================================
   ALIASES (Compatibilidade com importações antigas)
   ======================================================== */
export const readHistory = lerHistorico;
export const writeHistory = gravarHistorico;
export const addHistoryEntry = adicionarAoHistorico;
export const clearHistory = limparHistorico;