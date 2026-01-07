import React, { useState, useEffect, useRef } from 'react';
import {
    User, Lock, Save, RefreshCw, Camera,
    Database, Cloud, AlertTriangle, Trash2, Search,
    Info, LogOut, ShieldAlert, Monitor, Smartphone, 
    ShieldCheck, Download, ChevronRight, Mail, Fingerprint,
    Cpu, Activity, Globe, HardDrive
} from 'lucide-react';
import { useClerk, useUser } from "@clerk/clerk-react";

// Utilitários e Componentes Customizados
import api from '../utils/api';
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";
import Popup from "../components/Popup";

// --- COMPONENTE: INPUT ESTILIZADO (HUD) ---
const HUDInput = ({ label, value, onChange, placeholder, type = "text", info, disabled, icon: Icon }) => (
    <div className="space-y-2 group w-full">
        <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-focus-within:text-sky-400 transition-colors">
                {label}
            </label>
            {info && (
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {info}
                </span>
            )}
        </div>
        <div className="relative flex items-center">
            {Icon && (
                <Icon size={14} className="absolute left-4 text-zinc-600 group-focus-within:text-sky-500 transition-colors" />
            )}
            <input
                disabled={disabled}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-zinc-900/40 border border-zinc-800 rounded-xl ${Icon ? 'pl-11' : 'px-4'} py-3.5 text-sm text-zinc-200 outline-none focus:border-sky-500/40 focus:bg-zinc-900/80 transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed placeholder:text-zinc-700 shadow-inner`}
            />
        </div>
    </div>
);

// --- COMPONENTE: SEÇÃO DE CONFIGURAÇÃO ---
const ConfigSection = ({ title, icon: Icon, badge, children, visible = true }) => {
    if (!visible) return null;
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-5">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sky-400 shadow-lg shadow-sky-500/5">
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-100">{title}</h2>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none mt-1">{badge}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-800/80 to-transparent mx-4" />
            </div>
            <div className="grid gap-6">
                {children}
            </div>
        </div>
    );
};

export default function ConfigPage() {
    // Estados de Interface
    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [activeTab, setActiveTab] = useState('PERFIL');
    const [isSaving, setIsSaving] = useState(false);
    const [busca, setBusca] = useState("");
    const [sessions, setSessions] = useState([]);

    // Estados de Feedback
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [modalConfig, setModalConfig] = useState({
        open: false, title: "", message: "", type: "info", icon: Info, onConfirm: null
    });

    // Hooks do Clerk & Referências
    const { signOut } = useClerk();
    const { user, isLoaded } = useUser();
    const fileInputRef = useRef(null);

    // Estados de Dados do Usuário
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [originalData, setOriginalData] = useState({ firstName: "", lastName: "" });

    // Sincronização Inicial
    useEffect(() => {
        if (isLoaded && user) {
            const data = { firstName: user.firstName || "", lastName: user.lastName || "" };
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setOriginalData(data);

            user.getSessions().then(res => setSessions(res));
        }
    }, [isLoaded, user]);

    // Lógica de Alterações Pendentes (Dirty State)
    const isDirty = firstName !== originalData.firstName || lastName !== originalData.lastName;

    // Bloqueio de saída acidental
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = 'As alterações não sincronizadas serão perdidas.';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Troca de Aba com Validação
    const handleTabChange = (newTab) => {
        if (isDirty && activeTab === 'PERFIL') {
            setModalConfig({
                open: true,
                title: "Divergência de Dados",
                message: "Existem parâmetros de identidade alterados e não sincronizados. Deseja descartar as mudanças e prosseguir?",
                type: "warning",
                icon: AlertTriangle,
                onConfirm: () => {
                    setFirstName(originalData.firstName);
                    setLastName(originalData.lastName);
                    setActiveTab(newTab);
                    setModalConfig(prev => ({ ...prev, open: false }));
                }
            });
        } else {
            setActiveTab(newTab);
        }
    };

    // Filtro de Busca
    const isVisible = (tag) => !busca || tag.toLowerCase().includes(busca.toLowerCase());

    // --- AÇÕES DO CLERK (AUTH) ---
    const handleGlobalSave = async () => {
        if (!isLoaded || !user) return;
        setIsSaving(true);
        try {
            await user.update({ firstName, lastName });
            setOriginalData({ firstName, lastName });
            setToast({ show: true, message: "Parâmetros atualizados no núcleo.", type: 'success' });
        } catch (err) {
            setToast({ show: true, message: "Falha na comunicação com o servidor.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setIsSaving(true);
            await user.setProfileImage({ file });
            setToast({ show: true, message: "Assinatura visual atualizada.", type: 'success' });
        } catch {
            setToast({ show: true, message: "Falha no upload da imagem.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    const handlePasswordReset = async () => {
        try {
            await user.preparePasswordReset();
            setToast({ show: true, message: "Protocolo enviado ao seu e-mail.", type: 'success' });
        } catch {
            setToast({ show: true, message: "Erro ao disparar reset de senha.", type: 'error' });
        }
    };

    const revokeSession = async (sess) => {
        try {
            await sess.revoke();
            setSessions(prev => prev.filter(s => s.id !== sess.id));
            setToast({ show: true, message: "Terminal desconectado com sucesso.", type: 'success' });
        } catch {
            setToast({ show: true, message: "Erro ao encerrar sessão remota.", type: 'error' });
        }
    };

    // --- AÇÕES DE SISTEMA (BACKEND/LOCAL) ---
    const exportUserData = async () => {
        try {
            setIsSaving(true);
            const response = await api.get(`/users/${user.id}/backup`);
            const dataStr = JSON.stringify(response.data || response, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `maker_core_backup_${new Date().getTime()}.json`;
            link.click();
            setToast({ show: true, message: "Manifesto de dados exportado.", type: 'success' });
        } catch {
            setToast({ show: true, message: "Erro ao exportar banco de dados.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    const clearLocalCache = () => {
        localStorage.clear();
        setToast({ show: true, message: "Limpando memória volátil...", type: 'success' });
        setTimeout(() => window.location.reload(), 1500);
    };

    const confirmDeleteAccount = () => {
        setModalConfig({
            open: true,
            title: "Protocolo de Rescisão",
            message: "CUIDADO: Esta ação apagará permanentemente todos os seus projetos, filamentos e registros do nosso Banco de Dados antes de encerrar sua conta. Esta ação é irreversível. Deseja prosseguir?",
            type: "danger",
            icon: ShieldAlert,
            onConfirm: async () => {
                try {
                    setIsSaving(true);
                    await api.delete(`/users/${user.id}`);
                    await user.delete();
                } catch (err) {
                    setToast({ show: true, message: "Erro crítico ao expurgar registros.", type: 'error' });
                    setModalConfig(prev => ({ ...prev, open: false }));
                } finally { setIsSaving(false); }
            }
        });
    };

    if (!isLoaded) return null;

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden selection:bg-sky-500/30">
            {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-500 ease-in-out" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* HEADER SUPERIOR */}
                <header className="h-24 px-10 flex items-center justify-between z-40 relative border-b border-white/5 bg-zinc-950/80 backdrop-blur-2xl">
                    <div className="flex flex-col relative">
                        <div className="flex items-center gap-2 mb-1">
                            <Cpu size={12} className="text-sky-500 animate-pulse" />
                            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">System_Settings_v4.0</h1>
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter text-white">
                            Configurações do <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500">Terminal</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={14} />
                            <input
                                className="w-72 bg-zinc-900/50 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-[11px] text-zinc-200 outline-none focus:border-sky-500/40 transition-all placeholder:text-zinc-600"
                                placeholder="LOCALIZAR COMANDO..."
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleGlobalSave}
                            disabled={isSaving || !isDirty}
                            className="h-11 px-8 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all disabled:opacity-20 active:scale-95 shadow-lg shadow-white/5"
                        >
                            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                            {isSaving ? "Sincronizando..." : "Sincronizar"}
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* MENU LATERAL DE NAVEGAÇÃO */}
                    <aside className="w-80 border-r border-zinc-900/50 p-8 bg-zinc-950/30 flex flex-col justify-between shrink-0">
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-8 px-4 border-l-2 border-sky-500/50">Módulos de Operação</p>
                            {[
                                { id: 'PERFIL', label: 'Identidade Operacional', icon: User, tag: "perfil nome avatar" },
                                { id: 'SEGURANÇA', label: 'Protocolos de Acesso', icon: Lock, tag: "senha seguranca sessao" },
                                { id: 'SISTEMA', label: 'Banco de Dados', icon: Database, tag: "dados exportar cache" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group ${activeTab === tab.id ? 'bg-zinc-100 text-zinc-950 shadow-xl' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                        {tab.label}
                                    </div>
                                    {activeTab === tab.id && <ChevronRight size={14} className="animate-in slide-in-from-left-2" />}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => signOut()} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 active:scale-95">
                            <LogOut size={18} /> Encerrar Conexão
                        </button>
                    </aside>

                    {/* ÁREA DE CONTEÚDO SCROLLÁVEL */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-16 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.03),transparent_40%)]">
                        <div className="max-w-4xl mx-auto space-y-16">

                            {/* ABA: PERFIL */}
                            {activeTab === 'PERFIL' && (
                                <div className="space-y-16">
                                    {/* CARD HERO DE PERFIL */}
                                    <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/60 to-zinc-900/20 border border-white/5 overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Fingerprint size={160} className="text-white" />
                                        </div>
                                        <div className="relative z-10 flex items-center gap-10">
                                            <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                                <div className="w-36 h-36 rounded-[2.5rem] bg-zinc-950 border-2 border-zinc-800 p-1.5 group-hover/avatar:border-sky-500/50 transition-all duration-500 rotate-3 group-hover/avatar:rotate-0 shadow-2xl">
                                                    <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                                                        {user?.imageUrl ? (
                                                            <img src={user.imageUrl} className="w-full h-full object-cover" alt="Avatar" />
                                                        ) : (
                                                            <User size={40} className="text-zinc-700" />
                                                        )}
                                                        <div className="absolute inset-0 bg-sky-950/80 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all">
                                                            <Camera size={24} className="text-white mb-2" />
                                                            <span className="text-[8px] font-black uppercase text-white tracking-widest">Alterar</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Activity size={12} className="text-emerald-500" />
                                                    <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">Operador Autenticado</p>
                                                    <div className="h-px w-8 bg-sky-500/30" />
                                                </div>
                                                <h3 className="text-4xl font-black text-white tracking-tighter uppercase">{firstName} {lastName}</h3>
                                                <div className="flex gap-3 mt-6">
                                                    <span className="px-4 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-xl text-[10px] font-bold uppercase tracking-wider">UID: {user?.id.slice(-12)}</span>
                                                    <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-sm shadow-emerald-500/5">
                                                        <ShieldCheck size={14} /> Status: Ativo
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <ConfigSection title="Dados de Identidade" icon={User} badge="Módulo 01" visible={isVisible("perfil nome sobrenome email")}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/40">
                                            <HUDInput label="Primeiro Nome" value={firstName} onChange={setFirstName} placeholder="Ex: Alex" />
                                            <HUDInput label="Sobrenome" value={lastName} onChange={setLastName} placeholder="Ex: Silva" />
                                            <HUDInput label="E-mail de Acesso" value={user?.primaryEmailAddress?.emailAddress || ""} disabled info="Canal Primário" icon={Mail} />
                                            <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 flex items-center gap-4">
                                                <Cloud className="text-sky-500/40" size={20} />
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sincronização em Nuvem</p>
                                                    <p className="text-[9px] text-zinc-600 font-bold uppercase mt-0.5">Gerenciado via Clerk Auth Proxy</p>
                                                </div>
                                            </div>
                                        </div>
                                    </ConfigSection>
                                </div>
                            )}

                            {/* ABA: SEGURANÇA */}
                            {activeTab === 'SEGURANÇA' && (
                                <div className="space-y-16">
                                    <ConfigSection title="Sessões de Terminais" icon={Monitor} badge="Monitoramento" visible={isVisible("sessão dispositivos terminais")}>
                                        <div className="grid gap-4">
                                            {sessions.map((sess) => (
                                                <div key={sess.id} className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 flex items-center justify-between group hover:bg-zinc-900/50 transition-all">
                                                    <div className="flex items-center gap-5">
                                                        <div className="p-4 bg-zinc-950 rounded-2xl text-zinc-500 group-hover:text-sky-500 transition-colors border border-zinc-800 shadow-inner">
                                                            {sess.latestActivityDevice?.type === 'mobile' ? <Smartphone size={22} /> : <Monitor size={22} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[12px] font-black text-zinc-100 uppercase tracking-tight">{sess.latestActivityDevice?.model || "Terminal Remoto"}</p>
                                                                <Globe size={10} className="text-zinc-600" />
                                                            </div>
                                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{sess.browserName} • {sess.ipAddress}</p>
                                                        </div>
                                                    </div>
                                                    {sess.id === user.lastActiveSessionId ? (
                                                        <span className="text-[9px] font-black text-sky-400 bg-sky-400/10 px-4 py-2 rounded-xl uppercase border border-sky-400/20 tracking-widest">Sessão Atual</span>
                                                    ) : (
                                                        <button onClick={() => revokeSession(sess)} className="text-[9px] font-black text-rose-500 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl uppercase border border-rose-500/20 transition-all">Encerrar</button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </ConfigSection>

                                    <ConfigSection title="Credenciais de Acesso" icon={ShieldCheck} badge="Segurança">
                                        <div className="bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/40 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h4 className="text-[11px] font-black text-zinc-200 uppercase tracking-widest">Redefinição de Senha Operacional</h4>
                                                <p className="text-[10px] text-zinc-500 uppercase font-medium">Um protocolo de segurança será disparado para seu e-mail.</p>
                                            </div>
                                            <button onClick={handlePasswordReset} className="px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-black uppercase rounded-xl transition-all border border-zinc-700">Solicitar Reset</button>
                                        </div>
                                    </ConfigSection>

                                    <ConfigSection title="Zona de Exclusão" icon={AlertTriangle} badge="Nível Crítico" visible={isVisible("excluir deletar conta rescisao")}>
                                        <div className="bg-rose-500/5 p-12 rounded-[2.5rem] border border-rose-500/20 space-y-8 relative overflow-hidden group">
                                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-rose-500/10 blur-[80px] pointer-events-none group-hover:bg-rose-500/20 transition-all duration-700" />
                                            <div className="flex flex-col relative select-none">
                                                <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500/80 mb-2">Protocolo de Rescisão Permanente</h1>
                                                <span className="text-2xl font-black uppercase tracking-tighter text-white">
                                                    Desativar <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-600">Identidade Maker</span>
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-zinc-500 font-medium leading-relaxed max-w-2xl uppercase tracking-wider">
                                                Atenção: Ao iniciar este protocolo, todos os projetos e registros de telemetria vinculados a esta ID serão <span className="text-rose-400 font-black italic underline decoration-rose-500/30 px-1 text-[13px]">expurgados permanentemente</span> do Banco de Dados Cloudflare D1.
                                            </p>
                                            <button
                                                onClick={confirmDeleteAccount}
                                                className="group flex items-center gap-4 px-8 py-5 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 rounded-2xl transition-all duration-500 shadow-lg shadow-rose-500/5 hover:shadow-rose-500/20"
                                            >
                                                <Trash2 size={20} className="text-rose-500 group-hover:text-white transition-colors" />
                                                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-500 group-hover:text-white">
                                                    Confirmar Exclusão Total
                                                </span>
                                            </button>
                                        </div>
                                    </ConfigSection>
                                </div>
                            )}

                            {/* ABA: SISTEMA */}
                            {activeTab === 'SISTEMA' && (
                                <div className="space-y-16">
                                    <ConfigSection title="Gestão de Ativos" icon={Download} badge="GDPR / Portabilidade">
                                        <div className="bg-zinc-900/20 p-12 rounded-[2.5rem] border border-zinc-800/40 space-y-8">
                                            <div className="flex items-start gap-4">
                                                <HardDrive className="text-sky-500 mt-1" size={18} />
                                                <p className="text-[12px] text-zinc-500 uppercase leading-relaxed font-medium tracking-widest max-w-2xl">
                                                    Extraia um manifesto completo em formato <code className="text-sky-400 font-black px-1.5 py-0.5 bg-sky-400/10 rounded">.json</code> contendo todos os dados técnicos e históricos vinculados à sua ID operacional.
                                                </p>
                                            </div>
                                            <button
                                                onClick={exportUserData}
                                                className="flex items-center gap-4 px-8 py-5 bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white border border-sky-500/20 rounded-2xl transition-all font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-sky-500/5 hover:shadow-sky-500/20"
                                            >
                                                <Database size={20} /> Exportar Backup do Núcleo
                                            </button>
                                        </div>
                                    </ConfigSection>

                                    <ConfigSection title="Sincronização de Cache" icon={RefreshCw} badge="Memória Volátil">
                                        <div className="bg-zinc-900/20 p-12 rounded-[2.5rem] border border-zinc-800/40 space-y-8">
                                            <p className="text-[12px] text-zinc-500 uppercase leading-relaxed font-medium tracking-widest max-w-2xl">
                                                Reinicialize o armazenamento local do navegador para resolver inconsistências visuais, falhas de interface ou estados pendentes de sincronização.
                                            </p>
                                            <button
                                                onClick={clearLocalCache}
                                                className="flex items-center gap-4 px-8 py-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 rounded-2xl transition-all font-black uppercase text-[11px] tracking-[0.2em]"
                                            >
                                                <RefreshCw size={20} /> Reinicializar Interface
                                            </button>
                                        </div>
                                    </ConfigSection>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL DE CONFIRMAÇÃO (POPUP) */}
            <Popup
                isOpen={modalConfig.open}
                onClose={() => !isSaving && setModalConfig({ ...modalConfig, open: false })}
                title={modalConfig.title}
                subtitle="Validação de Sistema"
                icon={modalConfig.icon}
                footer={
                    <div className="flex w-full gap-3 p-6 bg-zinc-900/50">
                        <button 
                            disabled={isSaving} 
                            onClick={() => setModalConfig({ ...modalConfig, open: false })} 
                            className="flex-1 text-[11px] font-black text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors h-14"
                        >
                            Abortar
                        </button>
                        <button 
                            disabled={isSaving} 
                            onClick={modalConfig.onConfirm} 
                            className={`flex-[1.5] ${modalConfig.type === 'danger' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' : 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/20'} text-white text-[11px] font-black uppercase tracking-widest h-14 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95`}
                        >
                            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : "Confirmar Protocolo"}
                        </button>
                    </div>
                }
            >
                <div className="p-10 text-center border-t border-white/5">
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed uppercase tracking-wider">
                        {modalConfig.message}
                    </p>
                </div>
            </Popup>
        </div>
    );
}