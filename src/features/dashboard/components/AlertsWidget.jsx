import React from 'react';
import { AlertCircle, AlertTriangle, Info, Package, Wrench, Bell } from 'lucide-react';

/**
 * Widget de Alertas e Notificações
 * Exibe alertas críticos de filamentos e manutenção de impressoras
 */
export default function AlertsWidget({ alerts = [], className = '' }) {
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const warningCount = alerts.filter(a => a.severity === 'warning').length;

    const getAlertIcon = (severity) => {
        switch (severity) {
            case 'critical':
                return AlertCircle;
            case 'warning':
                return AlertTriangle;
            default:
                return Info;
        }
    };

    const getAlertColor = (severity) => {
        switch (severity) {
            case 'critical':
                return {
                    bg: 'bg-rose-500/10',
                    border: 'border-rose-500/30',
                    text: 'text-rose-400',
                    icon: 'text-rose-500'
                };
            case 'warning':
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30',
                    text: 'text-amber-400',
                    icon: 'text-amber-500'
                };
            default:
                return {
                    bg: 'bg-sky-500/10',
                    border: 'border-sky-500/30',
                    text: 'text-sky-400',
                    icon: 'text-sky-500'
                };
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'filament':
                return Package;
            case 'printer':
                return Wrench;
            default:
                return Bell;
        }
    };

    return (
        <div className={`
      relative bg-zinc-950/40 border border-zinc-800/50 rounded-[2rem] p-6
      hover-lift overflow-hidden
      ${className}
    `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell size={20} className="text-zinc-500" />
                        {criticalCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 ring-2 ring-zinc-950 items-center justify-center text-[8px] font-black text-white">
                                    {criticalCount}
                                </span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
                            Alertas
                        </h3>
                        <p className="text-xs text-zinc-600 mt-0.5">
                            {alerts.length} {alerts.length === 1 ? 'notificação' : 'notificações'}
                        </p>
                    </div>
                </div>

                {/* Badges de contadores */}
                <div className="flex gap-2">
                    {criticalCount > 0 && (
                        <div className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                            {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
                        </div>
                    )}
                    {warningCount > 0 && (
                        <div className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                            {warningCount}
                        </div>
                    )}
                </div>
            </div>

            {/* Lista de Alertas */}
            {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 opacity-40">
                    <Bell size={40} strokeWidth={1} className="mb-3 text-zinc-600" />
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                        Nenhum alerta no momento
                    </p>
                    <p className="text-[10px] text-zinc-700 mt-1">
                        Tudo funcionando perfeitamente
                    </p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {alerts.map((alert, index) => {
                        const colors = getAlertColor(alert.severity);
                        const AlertIcon = getAlertIcon(alert.severity);
                        const TypeIcon = getTypeIcon(alert.type);

                        return (
                            <div
                                key={alert.id || index}
                                className={`
                  relative p-4 rounded-xl border backdrop-blur-sm
                  ${colors.bg} ${colors.border}
                  animate-slide-down transition-all duration-300
                  hover:scale-[1.02] cursor-pointer
                `}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Ícone de tipo */}
                                    <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${colors.bg} border ${colors.border}
                  `}>
                                        <TypeIcon size={18} className={colors.icon} />
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className={`text-sm font-bold ${colors.text}`}>
                                                {alert.title}
                                            </h4>
                                            <AlertIcon size={16} className={colors.icon} />
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                            {alert.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Indicador de severidade */}
                                <div className={`
                  absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full
                  ${alert.severity === 'critical' ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : 'bg-amber-500'}
                `} />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Decoração */}
            {criticalCount > 0 && (
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-500/5 blur-[60px] pointer-events-none" />
            )}
        </div>
    );
}
