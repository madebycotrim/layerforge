import React, { useState, useEffect } from 'react';
import { ShieldAlert, Database, X, ChevronLeft, Check, Settings2, Lock } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [view, setView] = useState('simple'); 
    
    // Estados seguindo as categorias oficiais do Google Consent V2
    const [prefs, setPrefs] = useState({
        ad_storage: false,
        ad_user_data: false,
        ad_personalization: false,
        analytics_storage: false,
        personalization_storage: false,
        functionality_storage: true, // Sempre true (Essencial)
        security_storage: true       // Sempre true (Segurança)
    });

    useEffect(() => {
        const savedConsent = localStorage.getItem('printlog_consent_v2');
        if (!savedConsent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        } else {
            // Se já existe, aplica o consentimento salvo ao carregar
            applyConsent(JSON.parse(savedConsent));
        }
    }, []);

    // Função técnica para comunicar com o Google Tag Manager / GA4
    const applyConsent = (consentSettings) => {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'ad_storage': consentSettings.ad_storage ? 'granted' : 'denied',
                'ad_user_data': consentSettings.ad_user_data ? 'granted' : 'denied',
                'ad_personalization': consentSettings.ad_personalization ? 'granted' : 'denied',
                'analytics_storage': consentSettings.analytics_storage ? 'granted' : 'denied',
                'personalization_storage': consentSettings.personalization_storage ? 'granted' : 'denied',
                'functionality_storage': 'granted',
                'security_storage': 'granted'
            });
        }
    };

    const handleSave = (all = false) => {
        const finalPrefs = all ? {
            ad_storage: true,
            ad_user_data: true,
            ad_personalization: true,
            analytics_storage: true,
            personalization_storage: true,
            functionality_storage: true,
            security_storage: true
        } : prefs;

        localStorage.setItem('printlog_consent_v2', JSON.stringify(finalPrefs));
        applyConsent(finalPrefs);
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
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[440px] z-[100] animate-in fade-in slide-in-from-bottom-10 duration-700 font-sans">
            <div className="bg-[#0c0c0e]/95 backdrop-blur-2xl border border-sky-500/20 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                
                {/* Visual Blueprint Background */}
                <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                    <ShieldAlert size={180} />
                </div>

                <div className="relative z-10">
                    {view === 'simple' ? (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-500 border border-sky-500/20">
                                    <Database size={20} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 italic">Google Consent V2 Ready</span>
                            </div>
                            
                            <h4 className="text-white font-black text-xl uppercase italic tracking-tighter mb-3 leading-tight">
                                Respeitamos sua <br/><span className="text-sky-500">Privacidade de Dados.</span>
                            </h4>
                            
                            <p className="text-zinc-500 text-[11px] leading-relaxed mb-8 font-medium italic">
                                Usamos tecnologias de rastreamento para melhorar sua experiência na farm e otimizar nossos orçamentos. Você tem controle total sobre o que compartilha.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button 
                                    onClick={() => handleSave(true)}
                                    className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all active:scale-95"
                                >
                                    Aceitar Tudo
                                </button>
                                <button 
                                    onClick={() => setView('config')}
                                    className="px-6 border border-white/5 text-zinc-500 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                                >
                                    Configurar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <button 
                                onClick={() => setView('simple')}
                                className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors group/back text-[10px] font-bold uppercase tracking-widest"
                            >
                                <ChevronLeft size={16} className="group-hover/back:-translate-x-1 transition-transform" /> Voltar
                            </button>

                            <h4 className="text-white font-black text-lg uppercase italic mb-6 tracking-tighter">Gerenciar Consentimento</h4>
                            
                            <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {/* Funcional / Essencial */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[10px] font-bold text-white uppercase italic">Funcionalidades</p>
                                            <Lock size={10} className="text-zinc-600" />
                                        </div>
                                        <p className="text-[9px] text-zinc-500 leading-none">Essenciais para o login e cálculos.</p>
                                    </div>
                                    <Toggle active={true} disabled={true} />
                                </div>

                                {/* Analíticos */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold text-white uppercase italic mb-1">Análise (GA4)</p>
                                        <p className="text-[9px] text-zinc-500 leading-none">Melhora a performance da ferramenta.</p>
                                    </div>
                                    <Toggle 
                                        active={prefs.analytics_storage} 
                                        onClick={() => setPrefs({...prefs, analytics_storage: !prefs.analytics_storage})} 
                                    />
                                </div>

                                {/* Marketing / Ads */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold text-white uppercase italic mb-1">Publicidade (Ads V2)</p>
                                        <p className="text-[9px] text-zinc-500 leading-none">Personalização e sinais de anúncios.</p>
                                    </div>
                                    <Toggle 
                                        active={prefs.ad_storage} 
                                        onClick={() => {
                                            const val = !prefs.ad_storage;
                                            setPrefs({...prefs, ad_storage: val, ad_user_data: val, ad_personalization: val});
                                        }} 
                                    />
                                </div>

                                {/* Personalização */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold text-white uppercase italic mb-1">Personalização</p>
                                        <p className="text-[9px] text-zinc-500 leading-none">Salva temas e preferências visuais.</p>
                                    </div>
                                    <Toggle 
                                        active={prefs.personalization_storage} 
                                        onClick={() => setPrefs({...prefs, personalization_storage: !prefs.personalization_storage})} 
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={() => handleSave(false)}
                                className="w-full bg-sky-600 text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Check size={14} strokeWidth={3} /> Aplicar Preferências
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1c; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default CookieConsent;