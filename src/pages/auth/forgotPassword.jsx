// --- START OF FILE src/pages/ForgotPassword.jsx ---

import React, { useState } from 'react';
import { Link } from "wouter";
import { 
  Mail, ArrowRight, ArrowLeft, CheckCircle2, 
  ShieldCheck, Cloud, Lock, KeyRound, Fingerprint, 
  Server
} from 'lucide-react';
import logo from '../../assets/logo-branca.png';

// --- WIDGETS VISUAIS (LADO DIREITO - TEMA: SEGURANÇA & BACKUP) ---

// 1. Widget de Status de Segurança
const SecurityStatusWidget = () => (
    <div className="w-80 bg-[#09090b]/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">Central de Segurança</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Monitoramento Ativo</p>
                </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
        </div>

        {/* Status List */}
        <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-3">
                    <Lock size={14} className="text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-300">Criptografia AES-256</span>
                </div>
                <CheckCircle2 size={12} className="text-emerald-500" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-3">
                    <Server size={14} className="text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-300">Banco de Dados</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Blindado
                </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-3">
                    <Fingerprint size={14} className="text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-300">Integridade da Conta</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-1 w-12 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-emerald-500"></div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500">100%</span>
                </div>
            </div>
        </div>
    </div>
);

// 2. Widget de Cloud Backup (Flutuante)
const CloudBackupWidget = () => (
    <div className="absolute -right-12 bottom-16 w-60 bg-[#0e0e11] border border-zinc-700/50 rounded-2xl p-4 shadow-2xl z-20 animate-float" style={{ animationDelay: '1s' }}>
        <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Cloud size={16} />
            </div>
            <div>
                <p className="text-[9px] text-zinc-500 uppercase font-bold">Backup Automático</p>
                <h4 className="text-xs font-bold text-white">Seus dados estão salvos</h4>
            </div>
        </div>
        <p className="text-[10px] text-zinc-400 leading-relaxed">
            Mesmo sem acesso, seus projetos e estoque continuam sincronizados na nuvem.
        </p>
    </div>
);

// --- COMPONENTES UI PADRÃO ---

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] uppercase tracking-wide";
    const variants = {
        primary: "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sky-500/20",
        outline: "border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white bg-transparent",
        ghost: "bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
    };
    return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};
  
const InputField = ({ label, icon: Icon, type = "text", placeholder, ...props }) => {
    return (
      <div className="space-y-1.5 group">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 group-focus-within:text-sky-500 transition-colors">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors"><Icon size={18} /></div>
          <input type={type} className="w-full bg-[#09090b] border border-zinc-800 text-zinc-100 rounded-xl pl-10 pr-4 py-3.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all placeholder:text-zinc-800 hover:border-zinc-700 font-medium" placeholder={placeholder} {...props} />
        </div>
      </div>
    );
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulação de envio
    setTimeout(() => {
        setIsLoading(false);
        setIsSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-zinc-100 font-sans selection:bg-sky-500/30 selection:text-sky-200 flex overflow-hidden">
      
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10 w-full max-w-xl mx-auto lg:mx-0 lg:max-w-none lg:w-1/2 xl:w-[45%]">
        
        {/* Noise Mobile */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none lg:hidden"></div>

        <div className="absolute top-8 left-8">
            <Link href="/login">
            <a className="group flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-wide">
                <div className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 group-hover:border-zinc-700 transition-colors">
                    <ArrowLeft size={14} />
                </div>
                Voltar ao Login
            </a>
            </Link>
        </div>

        <div className="w-full max-w-sm animate-in fade-in slide-in-from-left-8 duration-700">
            {/* Header Dinâmico (Muda se enviado) */}
            <div className="mb-8">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 transition-all duration-500
                    ${isSent 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                        : "bg-sky-500/10 border-sky-500/20 text-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.2)]"
                    }`}
                >
                    {isSent ? <CheckCircle2 size={24} /> : <KeyRound size={24} />}
                </div>

                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                    {isSent ? "Verifique seu e-mail" : "Recuperar senha"}
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    {isSent 
                        ? `Enviamos as instruções de recuperação para ${email}. Não esqueça de checar o spam.` 
                        : "Esqueceu sua senha? Digite seu e-mail abaixo e nós te ajudaremos a recuperar o acesso."
                    }
                </p>
            </div>

            {!isSent ? (
                /* ESTADO 1: FORMULÁRIO DE ENVIO */
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField 
                        label="E-mail Cadastrado" 
                        icon={Mail} 
                        type="email" 
                        placeholder="seu@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Enviando link..." : <>Enviar Link de Recuperação <ArrowRight size={16} /></>}
                    </Button>
                </form>
            ) : (
                /* ESTADO 2: SUCESSO / FEEDBACK */
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <div className="flex items-start gap-3">
                            <ShieldCheck size={18} className="text-emerald-500 mt-0.5 shrink-0"/>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-emerald-400">Link enviado com segurança</p>
                                <p className="text-xs text-zinc-400">O link expira em 30 minutos por motivos de segurança.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 pt-2">
                        <Button variant="outline" onClick={() => setIsSent(false)}>
                            Tentar outro e-mail
                        </Button>
                        <Link href="/login">
                            <a className="block w-full">
                                <Button variant="ghost">Voltar para Login</Button>
                            </a>
                        </Link>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* LADO DIREITO: SHOWCASE (VISUAL) */}
      <div className="hidden lg:flex flex-1 relative bg-[#09090b] items-center justify-center overflow-hidden border-l border-white/5">
         
         {/* Background Grid */}
         <div className="absolute inset-0 opacity-20"
            style={{ 
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
            }}>
         </div>

         {/* Luzes Ambientais (Tons de Verde/Azul para segurança) */}
         <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
         <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>

         {/* Container dos Widgets */}
         <div className="relative z-10 scale-110 xl:scale-125 transition-transform duration-700">
             
             {/* Widget Principal: Status de Segurança */}
             <SecurityStatusWidget />

             {/* Widget Secundário: Cloud Backup */}
             <CloudBackupWidget />

             {/* Texto de Apoio */}
             <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-2 text-zinc-500 mb-2">
                    <Lock size={14} className="text-zinc-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">Seus dados estão protegidos</span>
                </div>
            </div>
         </div>
      </div>

      <style>{`
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}