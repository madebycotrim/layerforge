const STORAGE_KEY = "calculadora_history_v2";

/* Helper para ID único */
function gerarId() {
  return String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9);
}

/* Parse seguro para evitar crash */
function parseSeguro(json) {
  try {
    const parsed = JSON.parse(json);
    return parsed;
  } catch {
    return null;
  }
}

/* ========================================================
   FUNÇÃO: LER (getHistory)
   ======================================================== */
export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = parseSeguro(raw);
    if (!Array.isArray(parsed)) return [];

    // Normaliza os dados para garantir compatibilidade com os componentes
    return parsed.map((reg) => {
      const id = reg.id || reg.client_id || gerarId();
      return {
        id: id,
        client_id: id,
        label: reg.label || "Projeto sem nome",
        timestamp: reg.timestamp || new Date(reg.created_at || Date.now()).toLocaleString('pt-BR'),
        created_at: reg.created_at || Date.now(),
        data: {
          // Garante que entradas e resultados existam como objetos
          entradas: reg.data?.entradas || reg.data?.inputs || {},
          resultados: reg.data?.resultados || reg.data?.results || {},
        },
      };
    });
  } catch (err) {
    console.error("Erro crítico ao ler histórico local:", err);
    return [];
  }
}

/* ========================================================
   FUNÇÃO: SOBRESCREVER (writeHistory)
   ======================================================== */
export function writeHistory(novaLista = []) {
  try {
    const dataString = JSON.stringify(novaLista);
    localStorage.setItem(STORAGE_KEY, dataString);
    return novaLista;
  } catch (err) {
    console.error("Erro ao gravar dados no localStorage:", err);
    return [];
  }
}

/* ========================================================
   FUNÇÃO: ADICIONAR (addHistoryEntry)
   ======================================================== */
// --- TRECHO CORRIGIDO NO localHistory.js ---

export function addHistoryEntry({ label = "", entradas = {}, resultados = {} } = {}) {
  try {
    const atual = getHistory();
    const novoRegistro = {
      id: String(Date.now()),
      label: label || "Projeto sem nome",
      created_at: Date.now(),
      timestamp: new Date().toLocaleString('pt-BR'),
      data: {
        entradas: JSON.parse(JSON.stringify(entradas)), // Deep clone para evitar referências vivas
        resultados: JSON.parse(JSON.stringify(resultados)),
      },
    };
    const novaLista = [novoRegistro, ...atual].slice(0, 100);
    localStorage.setItem("calculadora_history_v2", JSON.stringify(novaLista));
    return novoRegistro;
  } catch (e) { return null; }
}

/* ========================================================
   FUNÇÃO: REMOVER (removeHistoryEntry)
   ======================================================== */
export function removeHistoryEntry(id) {
    try {
        const history = getHistory();
        const updated = history.filter(item => item.id !== id);
        writeHistory(updated);
        return true;
    } catch (err) {
        console.error("Erro ao remover item do histórico:", err);
        return false;
    }
}

/* ========================================================
   FUNÇÃO: LIMPAR (clearHistory)
   ======================================================== */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error("Erro ao resetar histórico:", err);
    return false;
  }
}

/* ========================================================
   ALIASES PARA COMPATIBILIDADE INTEGRADA
   ======================================================== */
export const readHistory = getHistory;
export const lerHistorico = getHistory;
export const gravarHistorico = writeHistory;
export const adicionarAoHistorico = addHistoryEntry;
export const addHistoryRow = addHistoryEntry;
export const limparHistorico = clearHistory;
export const deleteHistoryEntry = removeHistoryEntry;
export const removeHistoryRow = removeHistoryEntry;