import { Sparkles, Wind, Droplets, Wrench, ThermometerSun, AlertOctagon, Zap } from "lucide-react";

// --- REGRAS DE MANUTENÇÃO (PT-BR MAKER) ---
export const MAINTENANCE_RULES = {
    clean: { id: 'clean', label: 'Limpeza da Mesa e do Bico', interval: 50, icon: Sparkles, severity: 'low', action: "Remover fiapos do bico e limpar mesa com Álcool Isopropílico.", type: "Rotina" },
    fans: { id: 'fans', label: 'Limpeza dos Coolers', interval: 150, icon: Wind, severity: 'medium', action: "Verificar cooler do hotend. Poeira causa Heat Creep.", type: "Manutenção preventiva" },
    lubrication: { id: 'lube', label: 'Lubrificação dos Eixos', interval: 200, icon: Droplets, severity: 'medium', action: "Óleo leve nas barras lisas. Graxa branca nos fusos Z.", type: "Manutenção preventiva" },
    tension: { id: 'tension', label: 'Ajuste das Correias', interval: 200, icon: Wrench, severity: 'medium', action: "Verificar se estão frouxas ou muito apertadas.", type: "Manutenção preventiva" },
    nozzle: { id: 'nozzle', label: 'Substituição do Bico', interval: 300, icon: ThermometerSun, severity: 'high', action: "Trocar bico de latão. Considere aço se usar abrasivos.", type: "Ocasional" },
    ptfe: { id: 'ptfe', label: 'Substituição do PTFE', interval: 400, icon: AlertOctagon, severity: 'high', action: "Cortar ponta queimada ou trocar tubo Bowden.", type: "Ocasional" },
    electric: { id: 'electric', label: 'Revisão Elétrica Geral', interval: 1000, icon: Zap, severity: 'critical', action: "Reapertar bornes da fonte e placa. Risco de fogo!", type: "Segurança elétrica" }
};

export const analyzePrinterHealth = (printer) => {
    const totalHours = printer.totalHours || 0;
    const lastMaint = printer.lastMaintenanceHour || 0;
    const hoursSinceReset = totalHours - lastMaint;
    let tasks = [];
    
    Object.values(MAINTENANCE_RULES).forEach(rule => {
        if (hoursSinceReset >= rule.interval) {
            tasks.push({ ...rule, overdue: hoursSinceReset - rule.interval });
        } else if (rule.interval > 250) {
             const cyclePosition = totalHours % rule.interval;
             if (cyclePosition > (rule.interval * 0.95)) {
                 tasks.push({ ...rule, overdue: 0, isWarning: true });
             }
        }
    });
    
    return tasks.sort((a, b) => {
        const priority = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return priority[b.severity] - priority[a.severity];
    });
};