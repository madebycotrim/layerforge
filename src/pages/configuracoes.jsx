import React from 'react';
import {
    User, Lock, RefreshCw, Save, ShieldCheck,
    KeyRound, Fingerprint, ShieldAlert, FileText,
    Table, Trash2, X, Loader2, Camera, Mail,
    Download, Box, Radiation,
    Wrench, HardDrive, Info,
} from 'lucide-react';

import { useLogicaConfiguracao } from '../utils/configLogic';
import BarraLateralPrincipal from "../layouts/mainSidebar";
import AvisoFlutuante from "../components/Toast";

// --- COMPONENTE DE CARTÃO (ESTILO DASHBOARD) ---
const CartaoInformativo = ({ titulo, subtitulo, Icone, classeCor = "sky", children, etiqueta }) => {
    const temas = {
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/30",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    };
    const temaEscolhido = temas[classeCor] || temas.sky;

    return (
        <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-[2rem] p-8 relative overflow-hidden hover-lift">
            {/* Header do Card */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${temaEscolhido}`}>
                        <Icone size={22} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-wide">{titulo}</h2>
                        <p className="text-xs text-zinc-500 font-medium">{subtitulo}</p>
                    </div>
                </div>
                {etiqueta && (
                    <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-500 uppercase tracking-wider">
                        {etiqueta}
                    </span>
                )}
            </div>
            {/* Content */}
            <div>
                {children}
            </div>
        </div>
    );
};

export default function PaginaConfiguracao() {
    const logica = useLogicaConfiguracao();

    if (!logica.estaCarregado) return (
        <div className="h-screen w-full bg-[#030303] flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <RefreshCw className="text-cyan-500 animate-spin" size={40} />
                <div className="absolute inset-0 blur-lg bg-cyan-500/20 animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-[0.4em]">Iniciando Painel de Controle...</p>
        </div>
    );

    const temSenhaDefinida = logica.usuario?.passwordEnabled;
    const tipoLogin = logica.usuario?.externalAccounts?.[0]?.verification?.strategy || "senha_local";
    const ehLoginSocial = tipoLogin.includes('google');

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            {/* FUNDO DECORATIVO - igual ao dashboard */}
            <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                    maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                }} />

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                    <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-sky-500/30 via-transparent to-transparent" />
                </div>
            </div>

            <input
                type="file"
                ref={logica.referenciaEntradaArquivo}
                onChange={logica.manipularCarregamentoImagem}
                accept="image/*"
                className="hidden"
            />

            {logica.aviso.exibir && (
                <AvisoFlutuante
                    {...logica.aviso}
                    onClose={() => logica.setAviso({ ...logica.aviso, exibir: false })}
                />
            )}

            <BarraLateralPrincipal
                onCollapseChange={(estaFechada) => logica.setLarguraBarraLateral(estaFechada ? 68 : 256)}
            />

            <main className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar" style={{ marginLeft: `${logica.larguraBarraLateral}px` }}>

                {/* CABEÇALHO DA PÁGINA - estilo dashboard */}
                <div className="p-8 xl:p-12 relative z-10">
                    <div className="max-w-[1600px] mx-auto mb-12 animate-fade-in-up">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                                    Configurações
                                </h1>
                                <p className="text-sm text-zinc-500">
                                    Ajustes da sua oficina maker
                                </p>
                            </div>

                            <button
                                onClick={logica.salvarAlteracoesGerais}
                                disabled={logica.estaSalvando || !logica.temAlteracao}
                                className={`
                                    h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] 
                                    flex items-center gap-3 transition-all duration-300
                                    hover:scale-105 active:scale-95
                                    ${logica.temAlteracao
                                        ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20'
                                        : 'bg-zinc-900/50 text-zinc-600 border border-zinc-800 opacity-50 cursor-not-allowed'
                                    }
                                `}
                            >
                                {logica.estaSalvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>

                    <div className="max-w-[1600px] mx-auto space-y-8">

                        {/* 1. CARTÕES DE RESUMO RÁPIDO */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            {[
                                {
                                    Icone: Fingerprint,
                                    label: 'Identificador Único',
                                    value: logica.usuario?.id?.slice(-8).toUpperCase(),
                                    color: 'sky',
                                    info: 'Código de Registro'
                                },
                                {
                                    Icone: ShieldCheck,
                                    label: 'Segurança da Conta',
                                    value: temSenhaDefinida ? 'Protegida' : 'Sem Senha',
                                    color: temSenhaDefinida ? 'emerald' : 'amber',
                                    info: 'Status de Proteção'
                                },
                                {
                                    Icone: logica.statusConexaoNuvem.Icone,
                                    label: 'Conexão Online',
                                    value: logica.statusConexaoNuvem.rotulo,
                                    color: logica.statusConexaoNuvem.cor === 'cyan' ? 'sky' : logica.statusConexaoNuvem.cor,
                                    info: logica.statusConexaoNuvem.informacao,
                                },
                            ].map((item, i) => (
                                <div key={i} className="bg-zinc-950/40 border border-zinc-800/50 rounded-[2rem] p-6 flex items-center gap-5 hover-lift">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-${item.color}-500/10 text-${item.color}-400 border border-${item.color}-500/30`}>
                                        <item.Icone size={24} className={item.value === 'Conectando' ? 'animate-spin' : ''} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-wider mb-1">{item.label}</p>
                                        <h3 className="text-lg font-black text-white tracking-tight uppercase">{item.value}</h3>
                                        <p className="text-xs text-zinc-500 font-medium">{item.info}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2. GRADE DE CONFIGURAÇÕES PRINCIPAIS */}
                        <div className="grid grid-cols-12 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                            {/* SEÇÃO DE PERFIL DO MAKER */}
                            <div className="col-span-12 lg:col-span-4">
                                <CartaoInformativo titulo="Minha Foto" subtitulo="Imagem do Perfil" Icone={User} classeCor="sky" etiqueta="Usuário">
                                    <div className="flex flex-col items-center mb-10">
                                        <div className="relative">
                                            {/* Efeito visual circular */}
                                            <div className="absolute -inset-2 border border-sky-500/20 rounded-[2.5rem] animate-[spin_10s_linear_infinite]" />
                                            <div className="w-36 h-36 rounded-[2.2rem] overflow-hidden border-2 border-zinc-800 bg-black p-1 transition-all shadow-2xl relative z-10">
                                                {logica.usuario?.imageUrl ? (
                                                    <img src={logica.usuario.imageUrl} className="w-full h-full object-cover rounded-[1.8rem]" alt="Sua Foto" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-[1.8rem]">
                                                        <User size={48} className="text-zinc-700" />
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => logica.referenciaEntradaArquivo.current?.click()}
                                                className="absolute -bottom-2 -right-2 z-20 p-3 bg-sky-500 text-white rounded-2xl shadow-xl hover:bg-sky-400 transition-all duration-300 border-4 border-zinc-950 hover:scale-110 active:scale-95"
                                            >
                                                <Camera size={18} />
                                            </button>
                                        </div>
                                        <div className="mt-8 text-center">
                                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">{logica.primeiroNome || "Membro da Oficina"}</h2>
                                            <div className="flex items-center gap-2 justify-center mt-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">Acesso Ativo</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-600 uppercase ml-1 tracking-wider flex items-center gap-2">
                                                Nome do Membro <Info size={10} className="text-sky-500" />
                                            </label>
                                            <input
                                                value={logica.primeiroNome}
                                                onChange={e => logica.setPrimeiroNome(e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-5 text-xs font-bold text-white outline-none focus:border-sky-500/50 transition-all uppercase tracking-wide"
                                            />
                                        </div>
                                        <div className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-[8px] font-black text-zinc-600 uppercase mb-1 tracking-wider">E-mail Cadastrado</p>
                                                <p className="text-[10px] text-zinc-400 font-mono truncate">{logica.usuario?.primaryEmailAddress?.emailAddress}</p>
                                            </div>
                                            <Mail size={14} className="text-zinc-600 shrink-0" />
                                        </div>
                                    </div>
                                </CartaoInformativo>
                            </div>

                            {/* SEÇÃO DE SEGURANÇA E DADOS */}
                            <div className="col-span-12 lg:col-span-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* CONTROLE DE SENHA */}
                                    <CartaoInformativo titulo="Senha de Acesso" subtitulo="Segurança da Conta" Icone={Lock} classeCor="emerald" etiqueta="Privado">
                                        <div className="space-y-4 mb-8">
                                            <div className="text-xs text-zinc-500 leading-relaxed font-medium bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                                                {ehLoginSocial
                                                    ? "Seu acesso é feito por conta externa (Google). Para maior segurança, você também pode criar uma senha interna."
                                                    : "Sua conta usa uma senha local. Lembre-se de trocá-la regularmente para manter seus dados seguros."}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => logica.setExibirJanelaSenha(true)}
                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                                        >
                                            <KeyRound size={16} /> {temSenhaDefinida ? "Trocar Senha Atual" : "Criar Nova Senha"}
                                        </button>
                                    </CartaoInformativo>

                                    {/* EXPORTAÇÃO DE RELATÓRIOS */}
                                    <CartaoInformativo titulo="Baixar Dados" subtitulo="Relatórios e Planilhas" Icone={HardDrive} classeCor="sky" etiqueta="Backup">
                                        <p className="text-xs text-zinc-500 mb-6 leading-relaxed font-medium">
                                            Baixe os dados da sua oficina para abrir em outros programas ou imprimir relatórios físicos do seu estoque.
                                        </p>

                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                                onClick={() => logica.exportarRelatorio('csv')}
                                                className="group w-full p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl flex items-center justify-between hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Table size={18} className="text-emerald-500" />
                                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-wide">Planilha Excel (CSV)</span>
                                                </div>
                                                <Download size={14} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                            </button>

                                            <button
                                                onClick={() => logica.exportarRelatorio('pdf')}
                                                className="group w-full p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl flex items-center justify-between hover:border-sky-500/40 hover:bg-sky-500/5 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-sky-500" />
                                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-wide">Documento Técnico (PDF)</span>
                                                </div>
                                                <Download size={14} className="text-zinc-600 group-hover:text-sky-500 transition-colors" />
                                            </button>
                                        </div>
                                    </CartaoInformativo>
                                </div>

                                {/* ZONA DE EXCLUSÃO (CUIDADO) */}
                                <div className="bg-rose-500/5 border border-rose-500/20 rounded-[2rem] p-8 relative overflow-hidden hover-lift">
                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(244,63,94,0.03)_20px,rgba(244,63,94,0.03)_40px)] pointer-events-none" />

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                        <div className="flex items-start gap-5">
                                            <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                                                <Trash2 size={28} />
                                            </div>
                                            <div className="max-w-md">
                                                <h3 className="text-sm font-black text-white uppercase tracking-wide mb-2 flex items-center gap-3">
                                                    Excluir Minha Conta <span className="text-[8px] bg-rose-600 text-white px-2 py-1 rounded-lg animate-pulse">Irreversível</span>
                                                </h3>
                                                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                                    Ao excluir sua conta, você perderá permanentemente todos os seus filamentos, impressoras e projetos cadastrados. Não será possível recuperar os dados.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={logica.excluirContaPermanente}
                                            className="h-12 px-8 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/30 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg"
                                        >
                                            <ShieldAlert size={16} /> Confirmar Exclusão
                                        </button>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                        <Radiation size={150} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* JANELA DE SENHA (MODAL) */}
            {logica.exibirJanelaSenha && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => logica.setExibirJanelaSenha(false)} />
                    <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                            <h2 className="text-[10px] font-black uppercase text-white tracking-[0.2em] flex items-center gap-2">
                                <KeyRound size={14} className="text-cyan-500" /> Configurar Nova Senha
                            </h2>
                            <button onClick={() => logica.setExibirJanelaSenha(false)} className="text-zinc-600 hover:text-white transition-colors bg-white/5 p-1 rounded-lg"><X size={18} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                {temSenhaDefinida && (
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Senha Atual</label>
                                        <input
                                            type="password"
                                            value={logica.formularioSenha.senhaAtual}
                                            onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, senhaAtual: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-4 text-xs font-bold text-white outline-none focus:border-cyan-500 transition-all uppercase tracking-widest"
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Nova Senha (Mínimo 8 caracteres)</label>
                                    <input
                                        type="password"
                                        value={logica.formularioSenha.novaSenha}
                                        onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, novaSenha: e.target.value })}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-4 text-xs font-bold text-white outline-none focus:border-cyan-500 transition-all uppercase tracking-widest"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Repetir Nova Senha</label>
                                    <input
                                        type="password"
                                        value={logica.formularioSenha.confirmarSenha}
                                        onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, confirmarSenha: e.target.value })}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-4 text-xs font-bold text-white outline-none focus:border-cyan-500 transition-all uppercase tracking-widest"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={logica.atualizarSenha}
                                disabled={logica.estaSalvando}
                                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-black rounded-xl font-black uppercase text-[10px] tracking-[0.3em] active:scale-95 shadow-[0_0_30px_rgba(8,145,178,0.2)] transition-all disabled:opacity-20"
                            >
                                {logica.estaSalvando ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Confirmar Mudança"}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}