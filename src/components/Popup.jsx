import React, { useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export default function Popup({
    isOpen,
    onClose,
    title,
    icon: Icon,
    children,
    footer,
    isLoading = false
}) {

    // Bloqueio de scroll do fundo para melhor UX
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

            {/* Overlay: Desfoque elegante com escurecimento suave */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
            />

            {/* Janela Principal */}
            <div className="relative z-[101] w-full max-w-lg max-h-[85vh] bg-zinc-950 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300">

                {/* LINHA DE BRILHO (Accent Line): O detalhe que você pediu */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

                {/* Header: Minimalista e direto */}
                <div className="p-6 pb-0 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3.5">
                        {Icon && (
                            <div className="text-sky-500/80">
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Icon size={18} strokeWidth={2.5} />
                                )}
                            </div>
                        )}
                        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                            {title}
                        </h3>
                    </div>

                    {/* Botão Fechar: Ícone limpo */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-600 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Área de Conteúdo: Margens limpas */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="relative animate-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </div>

                {/* Rodapé: Apenas se houver botões/ações */}
                {footer && (
                    <div className="p-4 border-t border-white/5 bg-zinc-900/20 shrink-0">
                        {footer}
                    </div>
                )}
            </div>

            {/* Scrollbar ultra fina e sutil */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(255,255,255,0.05); 
                    border-radius: 10px; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
                    background: rgba(255,255,255,0.1); 
                }
            `}} />
        </div>
    );
}