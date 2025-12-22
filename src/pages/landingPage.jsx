import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import {
    Calculator, Package, ArrowRight, Zap,
    ShoppingBag, AlertTriangle,
    TrendingUp, Clock, Activity,
    Wrench, History, Boxes, 
    Coins, ShieldAlert, BarChart3,
    Check, MessageSquare, Database,
    ChevronLeft, Cpu, X, Settings2, Lock
} from 'lucide-react';
import logo from '../assets/logo-branca.png';

// --- COMPONENTES DE UI AUXILIARES ---

const Badge = ({ icon: Icon, label, color, className = "" }) => {
    const colors = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${colors[color] || colors.sky} backdrop-blur-md w-fit ${className}`}>
            {Icon && <Icon size={12} strokeWidth={3} />}
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
        </div>
    );
};

const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 lg:p-10 overflow-hidden transition-all duration-700 hover:border-white/10 group ${className}`}>
        {children}
    </div>
);

// --- COMPONENTE DE COOKIES (GOOGLE CONSENT V2 COMPLIANT) ---

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [view, setView] = useState('simple'); 
    
    // Estados mapeados para os parâmetros oficiais do Google
    const [prefs, setPrefs] = useState({
        analytics_storage: true,
        ad_storage: false,
        ad_user_data: false,
        ad_personalization: false,
        functionality_storage: true // Essencial
    });

    useEffect(() => {
        const consent = localStorage.getItem('printlog_consent_v2');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        } else {
            // Se já existe, aplica as permissões salvas no carregamento
            updateGoogleConsent(JSON.parse(consent));
        }
    }, []);

    // Função vital para o Consent Mode V2
    const updateGoogleConsent = (settings) => {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': settings.analytics_storage ? 'granted' : 'denied',
                'ad_storage': settings.ad_storage ? 'granted' : 'denied',
                'ad_user_data': settings.ad_user_data ? 'granted' : 'denied',
                'ad_personalization': settings.ad_personalization ? 'granted' : 'denied',
            });
        }
    };

    const savePreferences = (all = false) => {
        const finalPrefs = all
            ? { 
                analytics_storage: true, 
                ad_storage: true, 
                ad_user_data: true, 
                ad_personalization: true,
                functionality_storage: true 
              }
            : prefs;
            
        localStorage.setItem('printlog_consent_v2', JSON.stringify(finalPrefs));
        updateGoogleConsent(finalPrefs);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const Toggle = ({ active, disabled, onClick }) => (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`w-10 h-5 rounded-full transition-all relative ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${active ? 'bg-sky-500' : 'bg-zinc-800'}`}
        >
            <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${active ? 'left-6 bg-white' : 'left-1 bg-zinc-500'}`} />
        </button>
    );

    return (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[420px] z-[100] animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-sky-500/20 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                    <Settings2 size={180} />
                </div>

                <div className="relative z-10">
                    {view === 'simple' ? (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-500 border border-sky-500/20">
                                        <ShieldAlert size={20} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 italic">Consent V2 Ready</span>
                                </div>
                                <button onClick={() => setIsVisible(false)} className="text-zinc-600 hover:text-white transition-colors"><X size={18} /></button>
                            </div>
                            <h4 className="text-white font-black text-xl uppercase italic tracking-tighter mb-3 leading-tight">Otimizando sua <br /><span className="text-sky-500">Experiência Maker.</span></h4>
                            <p className="text-zinc-500 text-[11px] leading-relaxed mb-8 font-medium italic">Utilizamos cookies para processar seus orçamentos e garantir que seus cálculos de filamento sejam precisos via Google Analytics e Ads.</p>
                            <div className="flex gap-3">
                                <button onClick={() => savePreferences(true)} className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all active:scale-95">Aceitar Tudo</button>
                                <button onClick={() => setView('config')} className="px-6 border border-white/5 text-zinc-500 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Configurar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <button onClick={() => setView('simple')} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors group/back">
                                <ChevronLeft size={16} className="group-hover/back:-translate-x-1 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Voltar</span>
                            </button>
                            <h4 className="text-white font-black text-lg uppercase italic mb-6 tracking-tighter">Privacidade de Dados</h4>
                            <div className="space-y-4 mb-8">
                                {/* Essenciais */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[10px] font-bold text-white uppercase italic">Essenciais</p>
                                            <Lock size={10} className="text-zinc-500" />
                                        </div>
                                        <p className="text-[9px] text-zinc-500 leading-none">Login e cálculos de farm.</p>
                                    </div>
                                    <Toggle active={true} disabled={true} />
                                </div>

                                {/* Analytics */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold text-white uppercase italic mb-1">Analíticos</p>
                                        <p className="text-[9px] text-zinc-500 leading-none">Melhoria de performance (GA4).</p>
                                    </div>
                                    <Toggle
                                        active={prefs.analytics_storage}
                                        onClick={() => setPrefs({ ...prefs, analytics_storage: !prefs.analytics_storage })}
                                    />
                                </div>

                                {/* Marketing (G-Ads V2) */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold text-white uppercase italic mb-1">Publicidade</p>
                                        <p className="text-[9px] text-zinc-500 leading-none">Sinais de Ads e personalização.</p>
                                    </div>
                                    <Toggle
                                        active={prefs.ad_storage}
                                        onClick={() => {
                                            const val = !prefs.ad_storage;
                                            setPrefs({ ...prefs, ad_storage: val, ad_user_data: val, ad_personalization: val });
                                        }}
                                    />
                                </div>
                            </div>
                            <button onClick={() => savePreferences(false)} className="w-full bg-sky-600 text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Check size={14} strokeWidth={3} /> Salvar Preferências
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- RESTO DO CÓDIGO (HERO, RECURSOS, ETC) MANTIDO ---
// (HeroVisual e LandingPage continuam iguais ao seu código original)

const HeroVisual = () => (
    <div className="relative w-full h-[500px] flex items-center justify-center scale-90 lg:scale-100">
        <div className="absolute top-15 left-[-20px] z-30 bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 shadow-2xl animate-float-slow">
            <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Meu Lucro</span>
            </div>
            <div className="text-xl font-bold text-white italic tracking-tighter">+ R$ 2.450</div>
        </div>

        <div className="relative z-20 w-[380px] bg-[#0c0c0e] border border-sky-500/20 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-start mb-8">
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                    <Activity size={12} strokeWidth={3} /> Impressão Ativa
                </div>
                <div className="bg-sky-500/10 p-2.5 rounded-xl text-sky-500 border border-sky-500/20">
                    <BarChart3 size={18} />
                </div>
            </div>
            <h4 className="text-white font-bold text-2xl italic uppercase mb-8 tracking-tighter">Peça_Final.gcode</h4>
            <div className="space-y-4 mb-8">
                {[
                    { icon: Zap, label: "Gasto de Energia", val: "R$ 12,30", color: "text-amber-500" },
                    { icon: Clock, label: "Desgaste do Bico", val: "R$ 2,15", color: "text-sky-500" },
                    { icon: ShieldAlert, label: "Reserva p/ Falhas", val: "R$ 5,00", color: "text-rose-500" },
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-3 text-zinc-500 italic">
                            <item.icon size={14} className={item.color} /> {item.label}
                        </div>
                        <span className="text-white font-mono">{item.val}</span>
                    </div>
                ))}
            </div>
            <div className="pt-6 border-t border-white/10">
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Lucro Limpo</p>
                <div className="text-4xl font-bold text-white font-mono italic tracking-tighter leading-none">
                    R$ 185<span className="text-lg opacity-40">,00</span>
                </div>
            </div>
        </div>

        <div className="absolute bottom-5 right-[-40px] z-30 w-64 bg-[#0c0c0e] border border-rose-500/10 rounded-2xl p-5 shadow-2xl animate-float-slow" style={{ animationDelay: '2s' }}>
            <div className="flex items-center gap-2 text-rose-500 mb-3">
                <Package size={14} />
                <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Estoque Baixo</span>
            </div>
            <p className="text-[10px] font-bold text-white uppercase italic mb-3">PLA Silk Dourado</p>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[12%] animate-pulse shadow-[0_0_8px_#f43f5e]" />
            </div>
        </div>
    </div>
);

export default function LandingPage() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-[#050506] text-zinc-100 font-sans selection:bg-sky-500/30 overflow-x-hidden relative">

            {/* EFEITO BLUEPRINT */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden min-h-[1500px]">
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)'
                    }}
                />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[700px] bg-sky-500/10 blur-[160px] rounded-full" />
            </div>

            {/* NAV BAR */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050506]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src={logo} alt="PrintLog" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold tracking-tighter uppercase italic text-white">PrintLog</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <button onClick={() => setLocation('/login')} className="hidden sm:block text-[10px] font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest">Entrar</button>
                        <button onClick={() => setLocation('/register')} className="bg-white text-black px-7 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all active:scale-95">Criar Conta</button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative pt-44 pb-32 px-8 z-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-12 text-center lg:text-left">
                        <div className="space-y-6">
                            <Badge icon={Boxes} label="Organização Maker" color="sky" />
                            <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black tracking-[-0.05em] leading-[0.8] text-white uppercase italic">
                                TRANSFORME <br />
                                <span className="text-sky-500">PLÁSTICO</span> <br />
                                EM LUCRO.
                            </h1>
                            <p className="text-xl text-zinc-500 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed italic">
                                Chega de chutar o preço das suas peças. Calcule o custo real de cada impressão em segundos, do hobby à farm profissional.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <button onClick={() => setLocation('/register')} className="h-16 px-10 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-sky-500/20">
                                Começar agora <ArrowRight size={18} strokeWidth={3} />
                            </button>
                            <button onClick={() => setLocation('/preview')} className="h-16 px-10 rounded-2xl bg-[#1a1a1c] border border-white/5 text-white font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
                                <Calculator size={18} /> Calculadora rápida
                            </button>
                        </div>
                    </div>
                    <div className="hidden lg:block relative"><HeroVisual /></div>
                </div>
            </section>

            {/* RECURSOS */}
            <section className="py-24 px-8 max-w-7xl mx-auto z-10 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                    <GlassCard className="lg:col-span-8">
                        <div className="space-y-6">
                            <Badge icon={Coins} label="Finanças" color="emerald" />
                            <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Pare de cobrar no <span className="text-emerald-500">"olhômetro".</span></h3>
                            <p className="text-zinc-500 text-lg max-w-lg">Calculamos a luz, o desgaste do bico e até o custo daquela peça que deu errado.</p>
                        </div>
                        <div className="mt-12 grid grid-cols-3 gap-8 bg-black/40 p-8 rounded-[2rem] border border-white/5 font-bold uppercase italic">
                            <div><p className="text-[10px] text-zinc-600 mb-1">Energia</p><p className="text-2xl text-white">R$ 1,12/h</p></div>
                            <div className="border-l border-white/5 pl-8"><p className="text-[10px] text-zinc-600 mb-1">Desgaste</p><p className="text-2xl text-white">R$ 0,15/h</p></div>
                            <div className="border-l border-white/5 pl-8"><p className="text-[10px] text-emerald-500 mb-1">Sugerido</p><p className="text-3xl text-emerald-400">R$ 145,90</p></div>
                        </div>
                    </GlassCard>

                    <GlassCard className="lg:col-span-4 flex flex-col justify-between">
                        <div className="space-y-4">
                            <Badge icon={Database} label="Materiais" color="sky" />
                            <h3 className="text-2xl font-bold uppercase italic leading-tight">Meus <br /> Filamentos.</h3>
                            <p className="text-zinc-500 text-sm font-medium italic">Saiba quanto resta antes do carretel acabar.</p>
                        </div>
                        <div className="space-y-3 mt-8">
                            {[
                                { name: "PLA Silk Ouro", weight: "820g", color: "bg-amber-500", p: 82 },
                                { name: "PETG Preto", weight: "110g", color: "bg-rose-500", p: 11, alert: true },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center mb-2 font-bold text-[9px] uppercase">
                                        <span className="text-zinc-400">{item.name}</span>
                                        <span className={item.alert ? "text-rose-500 animate-pulse" : "text-white"}>{item.weight}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.p}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="lg:col-span-12 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <Badge icon={MessageSquare} label="Orçamentos" color="emerald" />
                            <h3 className="text-5xl font-black text-white uppercase italic leading-[0.9] tracking-tighter">Envie o preço direto <br /> no <span className="text-emerald-500">WhatsApp.</span></h3>
                            <p className="text-zinc-500 text-lg max-w-sm italic">Gere um orçamento profissional em segundos e mande para o seu cliente.</p>
                        </div>
                        <div className="w-full max-w-[380px] bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                             <div className="flex justify-between items-center p-5 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><Cpu size={18} /></div>
                                    <p className="text-[10px] font-bold text-white uppercase leading-none">PrintLog<br /><span className="text-sky-500 text-[8px]">Assistente</span></p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 bg-[#0a0a0c]">
                                <div className="p-5 bg-[#0c0c0e] rounded-xl border border-white/5 font-mono text-[10px] space-y-3 text-zinc-300">
                                    <p className="text-zinc-500">*ORÇAMENTO*</p>
                                    <p>*Peça:* Samurai V2</p>
                                    <p>*Investimento:* <span className="text-emerald-400 font-bold">R$ 180,00</span></p>
                                </div>
                                <button className="w-full bg-emerald-500 hover:bg-emerald-400 py-3.5 rounded-xl text-black font-bold text-[10px] uppercase transition-all">Copiar e Enviar</button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* PERDAS */}
            <section className="py-32 bg-[#050506] border-y border-white/5 relative z-10 text-center">
                <div className="max-w-7xl mx-auto px-8">
                    <Badge label="Evite Prejuízos" color="rose" icon={ShieldAlert} className="mx-auto" />
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] uppercase italic mt-8 mb-24">PARA ONDE ESTÁ <br /><span className="text-rose-500">INDO SEU DINHEIRO?</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        {[
                            { title: 'Impressão Falhou', icon: AlertTriangle, desc: 'Cálculo automático de perdas de material e tempo.' },
                            { title: 'Manutenção', icon: Wrench, desc: 'Fundo de reserva para bicos, correias e peças.' },
                            { title: 'Taxas de Venda', icon: ShoppingBag, desc: 'Lucro real após descontar taxas de marketplaces.' },
                            { title: 'Máquina Parada', icon: History, desc: 'Saiba o custo de oportunidade da sua impressora.' }
                        ].map((item, i) => (
                            <div key={i} className="p-10 rounded-[2.5rem] bg-[#0a0a0c] border border-white/5 hover:border-rose-500/20 transition-all">
                                <item.icon size={28} className="text-rose-500 mb-8" />
                                <h4 className="text-xl font-bold text-white uppercase mb-3 italic tracking-tighter">{item.title}</h4>
                                <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-40 px-8 relative z-10 text-center">
                <div className="max-w-4xl mx-auto space-y-14">
                    <Badge label="Hora de crescer" color="sky" icon={Zap} />
                    <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">MENOS CHUTE. <br /><span className="text-zinc-800">MAIS LUCRO.</span></h2>
                    <button onClick={() => setLocation('/register')} className="h-20 px-14 rounded-[2.5rem] bg-white text-black text-[13px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95 group mx-auto">
                        Começar agora <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </section>

            <footer className="py-20 border-t border-white/5 bg-[#050506] relative z-10">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="PrintLog" className="w-6 h-6 opacity-90" />
                        <span className="text-sm font-bold uppercase italic text-white">PrintLog</span>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-700 uppercase">© 2026 PrintLog</div>
                </div>
            </footer>

            {/* SISTEMA DE COOKIES */}
            <CookieConsent />

            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                .animate-float-slow { animation: float 8s ease-in-out infinite; }
                .animate-in { animation: enter 0.6s ease-out; }
                @keyframes enter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .slide-in-from-right-4 { animation: slideInRight 0.4s ease-out; }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
            `}</style>
        </div>
    );
}