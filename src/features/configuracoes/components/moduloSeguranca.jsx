import React from 'react';
import { 
    KeyRound, 
    RefreshCw, 
    ShieldCheck, 
    AlertTriangle, 
    Trash2, 
    Database, 
    Fingerprint, 
    ShieldHalf, 
    FileText, 
    Table,
    ShieldAlert
} from 'lucide-react';
import { ConfigSection } from './ConfigUI';

export default function SecurityModule({ logic }) {
    const passwordEnabled = logic.user?.passwordEnabled;
    const hasExternalAccount = (logic.user?.externalAccounts?.length || 0) > 0;
    
    // Lógica Inteligente com Linha Decorativa Dinâmica
    const getSecurityStatus = () => {
        if (passwordEnabled && hasExternalAccount) {
            return { 
                label: "Máxima", 
                color: "text-emerald-500", 
                glow: "bg-emerald-500/20",
                line: "via-emerald-500/50", // Linha Verde
                icon: ShieldCheck, 
                desc: "Identidade verificada por provedor externo e chave local ativa." 
            };
        }
        if (hasExternalAccount && !passwordEnabled) {
            return { 
                label: "Gerenciada", 
                color: "text-sky-500", 
                glow: "bg-sky-500/20",
                line: "via-sky-500/50", // Linha Azul
                icon: ShieldCheck, 
                desc: "Segurança biométrica/social ativa. Autenticação delegada ao provedor." 
            };
        }
        if (passwordEnabled) {
            return { 
                label: "Validada", 
                color: "text-amber-500", 
                glow: "bg-amber-500/20",
                line: "via-amber-500/50", // Linha Laranja
                icon: ShieldHalf, 
                desc: "Proteção via senha local. Recomendamos vincular conta social." 
            };
        }
        return { 
            label: "Vulnerável", 
            color: "text-rose-500", 
            glow: "bg-rose-500/20",
            line: "via-rose-500/50", // Linha Vermelha
            icon: ShieldAlert, 
            desc: "Nenhum protocolo de autenticação robusto detectado nesta sessão." 
        };
    };

    const status = getSecurityStatus();

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 1. SISTEMAS DE DEFESA */}
            <ConfigSection 
                title="Sistemas de Defesa" 
                icon={KeyRound} 
                badge="Módulo 02" 
                description="Monitoramento de integridade e chaves de acesso."
            >
                <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900/40 border border-white/5 backdrop-blur-md">
                    
                    {/* LINHA DECORATIVA DINÂMICA */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent ${status.line} to-transparent transition-colors duration-1000`} />
                    
                    <div className="p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-12">
                        
                        {/* HUD INDICATOR */}
                        <div className="relative flex-shrink-0 group">
                            <div className={`absolute inset-0 blur-3xl opacity-20 rounded-full transition-all duration-700 ${status.glow}`} />
                            
                            <div className="relative w-36 h-36 rounded-full border border-white/5 flex flex-col items-center justify-center bg-zinc-950/50 shadow-2xl">
                                <status.icon className={`${status.color} mb-1 transition-colors duration-700`} size={38} />
                                <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-500">Integridade</span>
                                <span className={`text-[14px] font-black uppercase italic tracking-tight transition-colors duration-700 ${status.color}`}>
                                    {status.label}
                                </span>
                                
                                {/* Anel de scan animado dinâmico */}
                                <div className={`absolute inset-0 rounded-full border-t-2 border-transparent ${status.line.replace('via', 'border').replace('/50', '/30')} opacity-40 animate-spin-slow`} />
                            </div>
                        </div>

                        {/* Conteúdo Central */}
                        <div className="flex-1 space-y-6 text-center lg:text-left">
                            <div className="space-y-2">
                                <div className="flex items-center justify-center lg:justify-start gap-3">
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Status do Operador</h3>
                                    <div className={`px-2 py-0.5 rounded-md text-[8px] font-mono bg-zinc-800 text-zinc-400 border border-white/5 uppercase tracking-widest`}>
                                        Encrypted V2.0
                                    </div>
                                </div>
                                <p className="text-[11px] text-zinc-500 uppercase font-bold leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                    {status.desc} Protocolos de entropia ativos para mitigar vulnerabilidades.
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <button
                                    onClick={() => logic.setShowPasswordModal(true)}
                                    className="px-8 py-4 bg-white hover:bg-sky-400 text-zinc-950 rounded-2xl transition-all duration-300 flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95"
                                >
                                    <RefreshCw size={14} /> 
                                    {passwordEnabled ? "Reciclar Senha Local" : "Gerar Senha de Acesso"}
                                </button>
                                
                                {hasExternalAccount && (
                                    <div className="px-6 py-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 flex items-center gap-3">
                                        <Fingerprint size={14} className="text-sky-500" />
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Biometria Social Ativa</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ConfigSection>

            {/* 2. MÓDULO DE DADOS E RISCO (Módulo 03) */}
            <ConfigSection 
                title="Gestão de Dados" 
                icon={Database} 
                badge="Módulo 03" 
                description="Protocolos de exportação e ações críticas de sistema."
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    
                    {/* CARD EXPORTAÇÃO */}
                    <div className="relative p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 flex flex-col justify-between hover:border-sky-500/30 transition-all duration-500 group overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-sky-500/20" />
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Database size={16} className="text-sky-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">Extração de Manifesto</span>
                            </div>
                            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Biblioteca Maker</h4>
                            <p className="text-[11px] text-zinc-500 uppercase font-bold leading-relaxed">
                                Snapshot completo de estoque, máquinas e históricos de projetos.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-10">
                            <button
                                onClick={() => logic.exportFormattedData('pdf')}
                                className="py-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-sky-500/50 transition-all font-black uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95"
                            >
                                <FileText size={14} className="text-sky-500" /> PDF
                            </button>
                            <button
                                onClick={() => logic.exportFormattedData('xlsx')}
                                className="py-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-sky-500/50 transition-all font-black uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Table size={14} className="text-emerald-500" /> Planilha
                            </button>
                        </div>
                    </div>

                    {/* CARD DANGER ZONE */}
                    <div className="relative p-8 rounded-[2rem] bg-rose-500/5 border border-rose-500/10 flex flex-col justify-between hover:border-rose-500/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-rose-500/20" />
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-rose-500">
                                <AlertTriangle size={16} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocolo de Purga</span>
                            </div>
                            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Encerrar Jornada</h4>
                            <p className="text-[11px] text-zinc-500 uppercase font-bold leading-relaxed">
                                Remoção irreversível de todos os dados e estatísticas dos servidores.
                            </p>
                        </div>

                        <button
                            onClick={() => logic.setModalConfig({
                                open: true,
                                title: "Confirmar Purga?",
                                message: "Isso apagará permanentemente todo seu progresso. Não pode ser desfeito.",
                                type: "danger",
                                icon: AlertTriangle,
                                onConfirm: () => logic.handleDeleteAccount()
                            })}
                            className="w-full mt-10 py-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Trash2 size={14} /> Iniciar Protocolo de Exclusão
                        </button>
                    </div>

                </div>
            </ConfigSection>

        </div>
    );
}