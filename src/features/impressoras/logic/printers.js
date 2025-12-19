// --- FILE: src/features/impressoras/logic/printers.js ---
import { parseNumber, generateUUID } from "../../../lib/format";

const KEY = "layerforge_printers_data";

// --- LEITURA ---
export const getPrinters = () => {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

// --- SALVAR (Cria/Edita) ---
export const savePrinter = (printer) => {
    const list = getPrinters();
    
    const safePrinter = {
        ...printer,
        maintenanceInterval: parseNumber(printer.maintenanceInterval) || 300,
        totalHours: parseNumber(printer.totalHours),
        power: parseNumber(printer.power),
        lastMaintenanceHour: parseNumber(printer.lastMaintenanceHour),
        history: printer.history || []
    };

    if (safePrinter.id) {
        // Atualizar existente
        const index = list.findIndex(p => p.id === safePrinter.id);
        if (index > -1) list[index] = { ...list[index], ...safePrinter };
    } else {
        // Criar nova
        safePrinter.id = generateUUID();
        safePrinter.status = "idle";
        safePrinter.createdAt = new Date().toISOString();
        list.push(safePrinter);
    }

    localStorage.setItem(KEY, JSON.stringify(list));
    return list;
};

// --- DELETAR ---
export const deletePrinter = (id) => {
    const list = getPrinters().filter(p => p.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
    return list;
};

// --- RESETAR MANUTENÇÃO ---
export const resetMaintenance = (printerId) => {
    const list = getPrinters();
    const index = list.findIndex(p => p.id === printerId);
    if (index > -1) {
        list[index].lastMaintenanceHour = list[index].totalHours;
        // Se estava forçado em manutenção, libera
        if (list[index].status === 'maintenance') list[index].status = 'idle';
        localStorage.setItem(KEY, JSON.stringify(list));
    }
    return list;
};

// --- ATUALIZAR STATUS ---
export const updateStatus = (printerId, newStatus) => {
    const list = getPrinters();
    const index = list.findIndex(p => p.id === printerId);
    if (index > -1) {
        list[index].status = newStatus;
        localStorage.setItem(KEY, JSON.stringify(list));
    }
    return list;
};