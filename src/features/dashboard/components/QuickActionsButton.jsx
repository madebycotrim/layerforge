import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calculator, Package, Printer, FileText, X } from 'lucide-react';
import { useLocation } from 'wouter';

/**
 * Botão Flutuante de Ações Rápidas
 * Menu com opções de ações principais do sistema
 */
export default function QuickActionsButton({ onActionClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const [, setLocation] = useLocation();
    const menuRef = useRef(null);

    const actions = [
        {
            id: 'calculator',
            label: 'Novo Orçamento',
            icon: FileText,
            color: 'sky',
            route: '/calculadora'
        },
        {
            id: 'filament',
            label: 'Adicionar Filamento',
            icon: Package,
            color: 'emerald',
            action: 'add-filament'
        },
        {
            id: 'printer',
            label: 'Cadastrar Impressora',
            icon: Printer,
            color: 'amber',
            action: 'add-printer'
        }
    ];

    const colorClasses = {
        sky: 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/30',
        emerald: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        amber: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30',
        purple: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30'
    };

    // Fechar ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleActionClick = (action) => {
        if (action.route) {
            setLocation(action.route);
        } else if (action.action && onActionClick) {
            onActionClick(action.action);
        }
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="fixed bottom-8 right-8 z-50">
            {/* Menu de Ações */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-72 modal-content">
                    <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg">
                        {/* Header do Menu */}
                        <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/50">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                                    Ações Rápidas
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Lista de Ações */}
                        <div className="p-2 space-y-1">
                            {actions.map((action, index) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.id}
                                        onClick={() => handleActionClick(action)}
                                        className={`
                      w-full flex items-center gap-4 p-4 rounded-xl
                      border backdrop-blur-sm
                      transition-all duration-300
                      hover:scale-[1.02] active:scale-95
                      animate-slide-down
                      ${colorClasses[action.color]}
                    `}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                      ${action.color === 'sky' ? 'bg-sky-500/20' : ''}
                      ${action.color === 'emerald' ? 'bg-emerald-500/20' : ''}
                      ${action.color === 'amber' ? 'bg-amber-500/20' : ''}
                      ${action.color === 'purple' ? 'bg-purple-500/20' : ''}
                    `}>
                                            <Icon size={22} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-sm font-bold">
                                            {action.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-zinc-800/50 bg-zinc-900/30">
                            <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest">
                                Atalhos para ações frequentes
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Botão Principal */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          group relative w-16 h-16 rounded-2xl
          bg-gradient-to-br from-sky-600 to-sky-500
          hover:from-sky-500 hover:to-sky-400
          shadow-2xl shadow-sky-500/30 hover:shadow-sky-500/40
          flex items-center justify-center
          transition-all duration-300
          ${isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'}
          active:scale-95
        `}
            >
                <Plus size={32} strokeWidth={2.5} className="text-white" />

                {/* Ring animado */}
                <div className={`
          absolute inset-0 rounded-2xl border-2 border-sky-400
          transition-all duration-300
          ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 group-hover:scale-110 group-hover:opacity-50'}
        `} />

                {/* Pulse ring */}
                {!isOpen && (
                    <span className="absolute inset-0 flex">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-sky-400 opacity-20" />
                    </span>
                )}
            </button>

            {/* Tooltip */}
            {!isOpen && (
                <div className="
          absolute bottom-full right-0 mb-3 px-3 py-2
          bg-zinc-900 border border-zinc-800 rounded-lg
          text-xs font-bold text-zinc-300 whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-all duration-200
          shadow-xl
        ">
                    Ações Rápidas
                    <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-800" />
                </div>
            )}
        </div>
    );
}
