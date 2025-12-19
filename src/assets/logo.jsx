const LayerForgeLogo = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Definição do Gradiente (Opcional, dá um efeito metálico/tech) */}
    <defs>
      <linearGradient id="logo-gradient" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
        <stop offset="100%" stopColor="#0284c7" /> {/* sky-600 */}
      </linearGradient>
    </defs>

    {/* O Bico (Nozzle) */}
    <path d="M9 2h6v5l-3 4-3-4z" stroke="url(#logo-gradient)" fill="rgba(56, 189, 248, 0.1)" />
    <path d="M12 2v-2" stroke="url(#logo-gradient)" />
    
    {/* O Filamento sendo depositado */}
    <path d="M12 11v3" stroke="url(#logo-gradient)" strokeWidth="2" />
    
    {/* A Bigorna (Forge) - Baseada no conceito de 'Camada' */}
    <path d="M5 14h14l-1 4h-4v2h4v2H6v-2h4v-2H4z" stroke="currentColor" className="text-zinc-200" />
    
    {/* Detalhe de 'brilho' ou impacto na bigorna */}
    <circle cx="12" cy="14" r="1" className="fill-sky-400 animate-pulse" stroke="none" />
  </svg>
);