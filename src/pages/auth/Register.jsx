// --- START OF FILE src/pages/Register.jsx ---

import React, { useState } from 'react';
import { Link } from "wouter";
import { 
  User, Mail, Lock, ArrowRight, Eye, EyeOff, 
  ArrowLeft, Github, Chrome, Check, Package, 
  Coins, PieChart, AlertTriangle, Database
} from 'lucide-react';
import logo from '../../assets/logo-branca.png';

// --- WIDGETS VISUAIS (LADO DIREITO - TEMA: ESTOQUE & LUCRO) ---

// 1. Widget de Estoque Inteligente (Lista de Filamentos)
const InventorySmartWidget = () => (
    <div className="w-80 bg-[#09090b]/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                    <Database size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">Estoque Inteligente</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Controle por gramatura</p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
                <Package size={10} className="text-zinc-400"/>
                <span className="text-[9px] font-bold text-zinc-300 uppercase">8 Rolos</span>
            </div>
        </div>

        {/* Lista de Materiais */}
        <div className="space-y-3">
            {/* Item 1 - Saudável */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                        <span className="text-[10px] font-bold text-zinc-200">PLA Silk Gold</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400">820g</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[82%] bg-amber-400 rounded-full"></div>
                </div>
            </div>

            {/* Item 2 - Crítico */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 transition-colors relative overflow-hidden">
                <div className="absolute right-0 top-0 p-1.5">
                     <AlertTriangle size={10} className="text-rose-500 animate-pulse" />
                </div>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                        <span className="text-[10px] font-bold text-zinc-200">PETG Black CF</span>
                    </div>
                    <span className="text-[9px] font-mono text-rose-400 font-bold">120g</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[12%] bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                </div>
            </div>

             {/* Item 3 - Normal */}
             <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 transition-colors opacity-60">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="text-[10px] font-bold text-zinc-200">ABS Blue</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400">450g</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-indigo-500 rounded-full"></div>
                </div>
            </div>
        </div>
    </div>
);

// 2. Widget de Lucratividade (Flutuante)
const ProfitWidget = () => (
    <div className="absolute -right-12 bottom-20 w-56 bg-[#0e0e11] border border-zinc-700/50 rounded-2xl p-4 shadow-2xl z-20 animate-float" style={{ animationDelay: '1s' }}>
        <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <PieChart size={16} />
            </div>
            <div>
                <p className="text-[9px] text-zinc-500 uppercase font-bold">Margem de Lucro</p>
                <h4 className="text-sm font-bold text-white font-mono">150%</h4>
            </div>
        </div>
        <div className="space-y-1">
             <div className="flex justify-between text-[9px] text-zinc-500 uppercase font-bold">
                <span>Custo</span>
                <span>Lucro</span>
             </div>
             <div className="flex h-1.5 w-full rounded-full overflow-hidden">
                 <div className="w-[30%] bg-zinc-700"></div>
                 <div className="w-[70%] bg-emerald-500"></div>
             </div>
        </div>
        <p className="text-[8px] text-zinc-500 mt-2 text-right">Projeto: <strong>BabyYoda.stl</strong></p>
    </div>
);

// --- COMPONENTES UI PADRÃO ---

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] uppercase tracking-wide";
    const variants = {
        primary: "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sky-500/20",
        outline: "border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white bg-transparent",
        social: "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs"
    };
    return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};
  
const InputField = ({ label, icon: Icon, type = "text", placeholder, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;
    return (
      <div className="space-y-1.5 group">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 group-focus-within:text-sky-500 transition-colors">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors"><Icon size={18} /></div>
          <input type={inputType} className="w-full bg-[#09090b] border border-zinc-800 text-zinc-100 rounded-xl pl-10 pr-10 py-3.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all placeholder:text-zinc-800 hover:border-zinc-700 font-medium" placeholder={placeholder} {...props} />
          {isPassword && (
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors p-1">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      </div>
    );
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!termsAccepted) { alert("Você precisa aceitar os termos de uso."); return; }
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-zinc-100 font-sans selection:bg-sky-500/30 selection:text-sky-200 flex overflow-hidden">
      
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10 w-full max-w-xl mx-auto lg:mx-0 lg:max-w-none lg:w-1/2 xl:w-[45%]">
        
        {/* Noise Mobile */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none lg:hidden"></div>

        <div className="absolute top-8 left-8">
            <Link href="/">
            <a className="group flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-wide">
                <div className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 group-hover:border-zinc-700 transition-colors">
                    <ArrowLeft size={14} />
                </div>
                Voltar
            </a>
            </Link>
        </div>

        <div className="w-full max-w-sm animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <img src={logo} alt="LayerForge" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                    <span className="text-xl font-bold tracking-tight text-white">LayerForge</span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Crie sua conta</h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                   Controle seus custos e nunca mais fique sem filamento no meio da impressão.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label="Nome Completo" icon={User} type="text" placeholder="Ex: João Maker" required />
                <InputField label="E-mail" icon={Mail} type="email" placeholder="seu@email.com" required />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Senha" icon={Lock} type="password" placeholder="Mín. 8 caracteres" required />
                    <InputField label="Confirmar" icon={Lock} type="password" placeholder="Repita a senha" required />
                </div>

                <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group p-1">
                        <div className="relative flex items-center mt-0.5">
                            <input 
                                type="checkbox" 
                                className="peer appearance-none w-4 h-4 rounded border border-zinc-700 bg-zinc-900/50 checked:bg-sky-500 checked:border-sky-500 transition-all cursor-pointer" 
                                checked={termsAccepted} 
                                onChange={(e) => setTermsAccepted(e.target.checked)} 
                            />
                            <Check size={10} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                        </div>
                        <span className="text-xs text-zinc-500 leading-snug group-hover:text-zinc-400 transition-colors select-none">
                            Li e concordo com os <a href="#" className="text-sky-500 hover:text-sky-400 hover:underline">Termos de Serviço</a> e <a href="#" className="text-sky-500 hover:text-sky-400 hover:underline">Política de Privacidade</a>.
                        </span>
                    </label>
                </div>

                <Button type="submit" disabled={isLoading} className="mt-2">
                    {isLoading ? "Criando conta..." : <>Criar Conta Grátis <ArrowRight size={16} /></>}
                </Button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-[#050505] px-4 text-zinc-600">Ou cadastre com</span></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <Button variant="social"><Chrome size={16} /> Google</Button>
                <Button variant="social"><Github size={16} /> GitHub</Button>
            </div>

            <p className="mt-8 text-center text-xs text-zinc-500">
                Já tem uma conta?{' '}
                <Link href="/login">
                    <a className="font-bold text-sky-500 hover:text-sky-400 hover:underline transition-colors cursor-pointer">
                    Fazer Login
                    </a>
                </Link>
            </p>
        </div>
      </div>

      {/* LADO DIREITO: SHOWCASE */}
      <div className="hidden lg:flex flex-1 relative bg-[#09090b] items-center justify-center overflow-hidden border-l border-white/5">
         
         {/* Background Grid */}
         <div className="absolute inset-0 opacity-20"
            style={{ 
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
            }}>
         </div>

         {/* Luzes Ambientais (Cores focadas em Ouro/Amarelo e Verde para dinheiro/estoque) */}
         <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
         <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>

         {/* Container dos Widgets */}
         <div className="relative z-10 scale-110 xl:scale-125 transition-transform duration-700">
             
             {/* Widget Principal: Estoque Inteligente */}
             <InventorySmartWidget />

             {/* Widget Secundário: Lucro */}
             <ProfitWidget />

             {/* Texto de Apoio */}
             <div className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-full text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-2 text-zinc-500 mb-2">
                    <Coins size={14} className="text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">Evite desperdícios</span>
                </div>
                <p className="text-zinc-400 text-xs">Saiba exatamente quanto custa cada impressão</p>
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