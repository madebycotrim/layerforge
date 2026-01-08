import React, { useState } from 'react';
import {
    User,
    Camera,
    Fingerprint,
    Activity,
    ShieldCheck,
    Mail,
    Clock,
    Loader2,
    Lock,
    Github,
    Chrome
} from 'lucide-react';
import { HUDInput, ConfigSection } from './ConfigUI';

export default function ProfileModule({ logic }) {
    // Filtro de busca
    if (!logic.isVisible("perfil nome e-mail id maker")) return null;

    const horasTotais = logic.totalPrintingHours || 0;
    const shortId = logic.user?.id?.slice(-8).toUpperCase() || "-------";

    // Mapeamento de Provedores de Autenticação
    const getAuthProvider = () => {
        const strategy = logic.user?.externalAccounts?.[0]?.verification?.strategy || "";
        if (strategy.includes('google')) return { name: 'Google', icon: Chrome };
        if (strategy.includes('github')) return { name: 'GitHub', icon: Github };
        return { name: 'E-mail/Senha', icon: Lock };
    };

    const provider = getAuthProvider();

    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. BANNER DE IDENTIDADE MAKER */}
            <div className="relative p-10 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 overflow-hidden group backdrop-blur-md shadow-2xl">
                {/* Background Decorativo */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-emerald-500/5 opacity-50" />
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-700 pointer-events-none group-hover:rotate-12 group-hover:scale-110">
                    <Fingerprint size={180} className="text-white" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    {/* Botão de Avatar com Correção de Arredondamento */}
                    <button
                        className="relative group/avatar cursor-pointer outline-none focus:ring-4 focus:ring-sky-500/20 rounded-[2.8rem] transition-all"
                        onClick={() => logic.fileInputRef.current?.click()}
                        disabled={logic.isSaving}
                    >
                        <div className="w-40 h-40 rounded-[2.8rem] bg-zinc-950 border-2 border-zinc-800 p-2 group-hover/avatar:border-sky-500/50 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                                {logic.user?.imageUrl ? (
                                    <>
                                        <img
                                            src={logic.user.imageUrl}
                                            className={`w-full h-full object-cover transition-all duration-700 ${logic.isSaving ? 'opacity-30 scale-110 blur-sm' : 'opacity-100 scale-100'}`}
                                            alt="Perfil"
                                        />
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
                                    </>
                                ) : (
                                    <User size={48} className="text-zinc-700" />
                                )}

                                {/* CORREÇÃO AQUI: Adicionado rounded-[2.2rem] para forçar o recorte do overlay */}
                                <div className="absolute inset-0 bg-sky-950/80 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-sm rounded-[2.2rem]">
                                    {logic.isSaving ? (
                                        <Loader2 size={28} className="text-sky-400 animate-spin" />
                                    ) : (
                                        <>
                                            <Camera size={28} className="text-white mb-2 transform translate-y-2 group-hover/avatar:translate-y-0 transition-transform" />
                                            <span className="text-[9px] font-black uppercase text-white tracking-[0.2em]">Atualizar Bio-ID</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <input type="file" ref={logic.fileInputRef} onChange={logic.handleImageUpload} className="hidden" accept="image/*" />
                    </button>

                    {/* Informações de Cabeçalho */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <Activity size={10} className="text-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Sistema Operacional Ativo</span>
                            </div>
                        </div>

                        <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic italic-none">
                            {logic.firstName || "Operador Desconhecido"}
                        </h3>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-8">
                            <div className="px-5 py-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2.5 hover:bg-sky-500/20 transition-colors cursor-default">
                                <Clock size={16} className="text-sky-500" />
                                <span>{horasTotais} <span className="opacity-60">Horas em Operação</span></span>
                            </div>

                            {/* UID apenas como Badge Visual (Sem botão de copiar) */}
                            <div className="px-5 py-2 bg-zinc-950/50 border border-zinc-800 text-zinc-400 rounded-2xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2.5 cursor-default">
                                <span className="opacity-50">UID:</span>
                                <span className="font-mono text-zinc-300">{shortId}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. SEÇÃO DE DADOS */}
            <ConfigSection
                title="Protocolos de Identidade"
                icon={Fingerprint}
                badge="Módulo 01"
                description="Dados de autenticação criptografados e parâmetros de perfil."
            >
                {/* Removido o overflow-hidden para permitir que o tooltip "salte" para fora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/30 p-8 md:p-12 rounded-[3rem] border border-zinc-800/50 items-end relative">

                    {/* Linha Decorativa Lateral */}
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-[1px] bg-gradient-to-b from-transparent via-sky-500/50 to-transparent pointer-events-none" />

                    <HUDInput
                        label="Nome ou Apelido Maker"
                        value={logic.firstName}
                        onChange={logic.setFirstName}
                        placeholder="Ex: Alex"
                    />

                    <HUDInput
                        label="E-mail de Acesso"
                        value={logic.user?.primaryEmailAddress?.emailAddress || ""}
                        disabled
                        icon={Mail}
                        info={
                            <div className="relative group">
                                {/* Botão de Status */}
                                <div className="flex items-center gap-2 px-1 cursor-help py-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.6)]" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-sky-400 transition-colors">
                                        Via {provider.name}
                                    </span>
                                    <provider.icon size={10} className="text-zinc-700" />
                                </div>

                                {/* Tooltip - Corrigido posicionamento e Z-index */}
                                <div className="absolute bottom-full left-0 mb-4 w-64 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[999] pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                                            <ShieldCheck size={12} className="text-sky-400" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">Campo Protegido</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                                            Este login é gerenciado pelo <span className="text-sky-400">{provider.name}</span>. A alteração é bloqueada para segurança da sua conta vinculada.
                                        </p>
                                    </div>
                                    {/* Seta do Tooltip */}
                                    <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-zinc-950 border-r border-b border-zinc-800 rotate-45" />
                                </div>
                            </div>
                        }
                    />
                </div>
            </ConfigSection>
        </div>
    );
}