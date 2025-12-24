import { parseNumber, generateUUID } from "../../../hooks/useFormat";

const KEY = "layerforge_filaments_data";

export const getFilaments = () => {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(KEY);
        return Array.isArray(JSON.parse(data)) ? JSON.parse(data) : [];
    } catch { return []; }
};

export const saveFilament = (filament) => {
    const list = getFilaments();
    const wTotal = parseNumber(filament.weightTotal);
    const wCurrent = filament.weightCurrent !== undefined ? parseNumber(filament.weightCurrent) : wTotal;

    const safeFilament = {
        ...filament,
        id: filament.id || generateUUID(),
        price: parseNumber(filament.price),
        weightTotal: wTotal,
        weightCurrent: Math.min(wCurrent, wTotal), // Clamping: nunca maior que o total
        dateUpdated: new Date().toISOString()
    };

    const index = list.findIndex(f => f.id === safeFilament.id);
    if (index > -1) list[index] = { ...list[index], ...safeFilament };
    else list.push({ ...safeFilament, dateOpened: new Date().toISOString() });

    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage')); // Notifica outras abas
    return list;
};

export const deleteFilament = (id) => {
    const list = getFilaments().filter(f => f.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
    return list;
};