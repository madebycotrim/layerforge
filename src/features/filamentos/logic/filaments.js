// --- FILE: src/features/filamentos/logic/filaments.js ---

const KEY = "layerforge_filaments_data";

// --- FUNÇÕES AUXILIARES ---

// Garante que transformamos qualquer string de preço/peso em número válido
const parseNumber = (value) => {
    if (value === undefined || value === null || value === "") return 0;
    if (typeof value === 'number') return value;
    
    // Remove R$, espaços e converte vírgula para ponto
    const cleanString = String(value).replace("R$", "").trim();
    
    if (cleanString.includes(',')) {
        // Formato brasileiro: 1.000,00 -> 1000.00
        return parseFloat(cleanString.replace(/\./g, '').replace(',', '.')) || 0;
    }
    
    return parseFloat(cleanString) || 0;
};

// Gera ID único
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// --- CORE FUNCTIONS ---

/**
 * Retorna a lista de filamentos do LocalStorage.
 */
export const getFilaments = () => {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Erro ao carregar filamentos:", error);
        return [];
    }
};

/**
 * Salva ou Atualiza um filamento.
 * Lógica robusta: Verifica se o ID já existe na lista para decidir entre EDITAR ou CRIAR.
 */
export const saveFilament = (filament) => {
    const list = getFilaments();
    
    // 1. Higienização dos dados
    const safeFilament = {
        ...filament,
        price: parseNumber(filament.price),
        weightTotal: parseNumber(filament.weightTotal),
        // Se weightCurrent vier, converte. Se não, será tratado abaixo.
        weightCurrent: filament.weightCurrent !== undefined ? parseNumber(filament.weightCurrent) : undefined
    };

    // 2. Verifica se o item já existe no banco de dados
    const index = list.findIndex(f => f.id === safeFilament.id);

    if (index > -1) {
        // --- EDIÇÃO (Update) ---
        // Mescla os dados antigos com os novos
        list[index] = { 
            ...list[index], 
            ...safeFilament,
            // Garante que weightCurrent seja mantido se não foi enviado na edição, 
            // ou atualizado se foi enviado.
            weightCurrent: safeFilament.weightCurrent !== undefined 
                ? safeFilament.weightCurrent 
                : list[index].weightCurrent
        };
    } else {
        // --- CRIAÇÃO (Create) ---
        // Se não tem ID, gera um. Se já veio um ID (do modal), usa ele.
        if (!safeFilament.id) {
            safeFilament.id = generateUUID();
        }
        
        safeFilament.dateOpened = safeFilament.dateOpened || new Date().toISOString();
        
        // Se é novo e não foi especificado o peso atual, assume que está cheio (total)
        if (safeFilament.weightCurrent === undefined) {
            safeFilament.weightCurrent = safeFilament.weightTotal;
        }

        list.push(safeFilament);
    }

    // 3. Persistência
    try {
        localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
        console.error("Erro ao salvar no LocalStorage", e);
        // Opcional: Tratar quota excedida
    }
    
    return list;
};

/**
 * Remove um filamento pelo ID.
 */
export const deleteFilament = (id) => {
    const list = getFilaments().filter(f => f.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
    return list;
};

/**
 * Consome uma quantidade específica de um filamento (em gramas).
 * Útil para dar baixa após uma impressão.
 */
export const consumeFilament = (id, amountInGrams) => {
    const list = getFilaments();
    const index = list.findIndex(f => f.id === id);
    
    if (index > -1) {
        const currentWeight = parseNumber(list[index].weightCurrent);
        const consumption = parseNumber(amountInGrams);
        
        // Subtrai e garante que não fique negativo
        const newWeight = Math.max(0, currentWeight - consumption);
        
        // Atualiza apenas o peso atual
        list[index].weightCurrent = parseFloat(newWeight.toFixed(2));
        
        localStorage.setItem(KEY, JSON.stringify(list));
        
        // Retorna o objeto atualizado (útil para feedback visual)
        return list[index]; 
    }
    
    return null; // Retorna null se não achou o filamento
};