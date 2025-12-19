// --- FILE: src/features/filamentos/logic/filamentDiagnostics.js ---
import { Droplets, Calendar, Waves } from "lucide-react";

export const analyzeFilamentHealth = (item) => {
    if (!item) return { tasks: [], specs: {}, daysOpen: 0 };

    const material = (item.material || item.type || "PLA").toUpperCase();
    const dateOpened = new Date(item.dateOpened || new Date());
    const daysOpen = Math.floor((new Date() - dateOpened) / (1000 * 60 * 60 * 24));
    
    const database = {
        PLA: { dryTemp: 45, dryTime: 4, maxDays: 180 },
        PETG: { dryTemp: 65, dryTime: 6, maxDays: 90 },
        ABS: { dryTemp: 80, dryTime: 8, maxDays: 120 },
        TPU: { dryTemp: 55, dryTime: 8, maxDays: 30 },
        NYLON: { dryTemp: 90, dryTime: 12, maxDays: 15 },
    };

    const specs = database[material] || database.PLA;
    const tasks = [];

    if (daysOpen > specs.maxDays) {
        tasks.push({
            icon: Waves,
            severity: 'critical',
            label: "Saturação de Umidade",
            value: `Exposto há ${daysOpen} dias`,
            action: `Secar a ${specs.dryTemp}°C por ${specs.dryTime}h.`
        });
    } else if (daysOpen > specs.maxDays / 2) {
        tasks.push({
            icon: Droplets,
            severity: 'medium',
            label: "Risco de Hidroscopia",
            value: "Absorção em progresso",
            action: "Mover para caixa hermética com sílica."
        });
    }

    if (daysOpen > 365) {
        tasks.push({
            icon: Calendar,
            severity: 'high',
            label: "Validade Técnica",
            value: "Mais de 1 ano aberto",
            action: "Testar quebra do fio antes de imprimir."
        });
    }

    return { tasks, specs, daysOpen };
};

// Helper para encontrar o item mais crítico da lista
export const getMostCriticalFilament = (filamentos) => {
    if (!filamentos || filamentos.length === 0) return null;
    return [...filamentos].sort((a, b) => new Date(a.dateOpened) - new Date(b.dateOpened))[0];
};