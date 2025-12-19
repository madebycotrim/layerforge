// --- START OF FILE src/pages/Login.jsx ---

import React, { useState } from 'react';
import { Link } from "wouter";
import {
    Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft,
    Github, Chrome, CheckCircle2, Calculator,
    Package, TrendingUp, Zap, AlertCircle
} from 'lucide-react';
import logo from '../../assets/logo-branca.png'; // Garanta que o caminho esteja correto

// --- WIDGETS DE EXEMPLO (LADO DIREITO) ---

// 1. Cartão de Precificação (Simulando o resultado da Calculadora)
const PricingWidget = () => (
    <div className="w-80 bg-[#09090b]/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 duration-700">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Calculator size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">Precificação</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">IronMan_Helmet_v3.stl</p>
                </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                Aprovado
            </span>
        </div>

        {/* Valor Principal */}
        <div className="mb-6 text-center relative">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Preço Sugerido</span>
            <div className="text-4xl font-bold text-white font-mono tracking-tighter drop-shadow-lg">
                R$ 184,90
            </div>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 translate-x-full">
                <div className="flex flex-col items-center gap-1 animate-pulse">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                </div>
            </div>
        </div>

        {/* Breakdown Visual */}
        <div className="space-y-3">
            {/* Barra de Lucro */}
            <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-zinc-400">Lucro Líquido</span>
                    <span className="text-emerald-400">R$ 82,40 (45%)</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[45%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
            </div>

            {/* Custos Resumidos */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800 flex items-center gap-2">
                    <Package size={12} className="text-sky-500" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold">Material</span>
                        <span className="text-[10px] text-zinc-300 font-mono font-bold">R$ 42,10</span>
                    </div>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800 flex items-center gap-2">
                    <Zap size={12} className="text-amber-500" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold">Energia</span>
                        <span className="text-[10px] text-zinc-300 font-mono font-bold">R$ 12,50</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// 2. Cartão de Filamento (Simulando Estoque - Flutuante)
const FilamentWidget = () => (
    <div className="absolute -right-12 bottom-12 w-64 bg-[#0e0e11] border border-zinc-700/50 rounded-2xl p-4 shadow-2xl z-20 animate-float">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
                    <Package size={16} />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-white">PLA Silk Blue</h4>
                    <p className="text-[9px] text-zinc-500 font-mono">Voolt3D • Lote #902</p>
                </div>
            </div>
        </div>
        
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Restante</span>
                <span className="text-sm font-mono font-bold text-sky-400">120g <span className="text-zinc-600 text-[10px]">/ 1kg</span></span>
            </div>
            {/* Visualização do Carretel (Barra) */}
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-sky-500 w-[12%]"></div>
                <div className="h-full bg-zinc-700 w-[88%] opacity-20"></div>
            </div>
            
            <div className="flex items-center gap-1.5 mt-1">
                <AlertCircle size={10} className="text-amber-500" />
                <span className="text-[9px] text-amber-500 font-bold">Estoque Baixo - Repor logo</span>
            </div>
        </div>
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
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 group-focus-within:text-sky-500 transition-colors">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors">
                    <Icon size={18} />
                </div>
                <input 
                    type={inputType} 
                    className="w-full bg-[#09090b] border border-zinc-800 text-zinc-100 rounded-xl pl-10 pr-10 py-3.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all placeholder:text-zinc-800 hover:border-zinc-700 font-medium" 
                    placeholder={placeholder} 
                    {...props} 
                />
                {isPassword && (
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors p-1"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] text-zinc-100 font-sans selection:bg-sky-500/30 selection:text-sky-200 flex overflow-hidden">
            
            {/* LADO ESQUERDO: FORMULÁRIO */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10 w-full max-w-xl mx-auto lg:mx-0 lg:max-w-none lg:w-1/2 xl:w-[45%]">
                
                {/* Background Noise Mobile */}
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
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <img src={logo} alt="LayerForge" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                            <span className="text-xl font-bold tracking-tight text-white">LayerForge</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Bem-vindo de volta</h1>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            O sistema operacional da sua farm de impressão 3D.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputField label="E-mail" icon={Mail} type="email" placeholder="seu@email.com" required />
                        
                        <div className="space-y-2">
                            <InputField label="Senha" icon={Lock} type="password" placeholder="••••••••" required />
                            <div className="flex justify-between items-center px-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-sky-500 focus:ring-0 focus:ring-offset-0" />
                                    <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">Lembrar de mim</span>
                                </label>
                                <Link href="/forgot-password">
                                    <a className="text-xs font-bold text-sky-500 hover:text-sky-400 transition-colors">Recuperar senha?</a>
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="mt-4">
                            {isLoading ? "Acessando..." : <>Acessar Painel <ArrowRight size={16} /></>}
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-[#050505] px-4 text-zinc-600">Ou entre com</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="social"><Chrome size={16} /> Google</Button>
                        <Button variant="social"><Github size={16} /> GitHub</Button>
                    </div>

                    <p className="mt-8 text-center text-xs text-zinc-500">
                        Ainda não tem conta?{' '}
                        <Link href="/register">
                            <a className="font-bold text-sky-500 hover:text-sky-400 hover:underline transition-colors">Criar conta grátis</a>
                        </Link>
                    </p>
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
                
                {/* Luzes Ambientais */}
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '2s'}}></div>

                {/* Container Central dos Widgets */}
                <div className="relative z-10 scale-110 xl:scale-125 transition-transform duration-700">
                    
                    {/* Widget Principal: Calculadora */}
                    <PricingWidget />

                    {/* Widget Secundário: Filamento (Flutuando) */}
                    <FilamentWidget />
                    
                    {/* Texto de Apoio */}
                    <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full text-center">
                        <div className="flex items-center justify-center gap-2 text-zinc-500 mb-2">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-xs font-bold uppercase tracking-widest">Sem planilhas complexas</span>
                        </div>
                        <p className="text-zinc-400 text-xs">Cálculo de custo real & gestão de estoque</p>
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}