import React, { useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export default function Popup({ 
    isOpen, 
    onClose, 
    title, 
    subtitle = "MakersLog Cloud", 
    icon: Icon, 
    children, 
    footer,
    isLoading = false 
}) {
    
    // Bloqueia o scroll do body quando o popup está aberto
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
            
            {/* Overlay (Fundo) */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
            />

            {/* Janela do Popup */}
            <div className="relative z-[101] w-full max-w-2xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Cabeçalho Fixo */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-500 shadow-inner">
                            {isLoading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                Icon && <Icon size={24} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">
                                {subtitle}
                            </h2>
                            <p className="text-sm font-bold text-white uppercase tracking-wider">
                                {title}
                            </p>
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all hover:rotate-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Área de Conteúdo (Rolável) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {/* Rodapé Fixo (Opcional) */}
                {footer && (
                    <div className="p-6 border-t border-white/5 bg-zinc-900/10">
                        {footer}
                    </div>
                )}
            </div>

            {/* Estilo da Scrollbar customizada */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}} />
        </div>
    );
}