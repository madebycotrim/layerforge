import React, { useMemo, useId } from "react";

const generateColors = (hex) => {
    // Tratamento rigoroso para garantir que o hex seja válido
    let cleanHex = String(hex || "#3b82f6").replace(/^\#/, '');
    
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        cleanHex = "3b82f6"; // Fallback para azul padrão
    }

    const num = parseInt(cleanHex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    const mix = (c, t, p) => Math.round(c + (t - c) * p);
    
    return {
        base: "#" + cleanHex,
        shadow: `rgb(${mix(r, 0, 0.6)}, ${mix(g, 0, 0.6)}, ${mix(b, 0, 0.6)})`,
        border: `rgb(${mix(r, 0, 0.8)}, ${mix(g, 0, 0.8)}, ${mix(b, 0, 0.8)})`
    };
};

export default function SpoolSideView({
    color = "#3b82f6",
    percent = 100,
    size = 128,
    className = ""
}) {
    const uniqueId = useId();
    const { base, shadow } = useMemo(() => generateColors(color), [color]);
    
    // Garantia de que o percentual seja um número entre 0 e 100
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));

    // Geometria - Constantes numéricas para evitar NaN no SVG
    const cxLeft = 18;
    const cxRight = 82;
    const cy = 50;
    const coreRadius = 12;
    const maxRadius = 38;
    
    // Cálculo do raio atual baseado no preenchimento
    const currentRadius = coreRadius + ((maxRadius - coreRadius) * (safePercent / 100));

    return (
        <div
            className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
            style={{ width: size, height: size }}
        >
            <svg
                viewBox="0 0 100 100"
                className="relative z-10 w-full h-full overflow-visible"
            >
                <defs>
                    {/* Gradiente do Carretel */}
                    <linearGradient id={`spoolBody-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#18181b" />
                        <stop offset="50%" stopColor="#09090b" />
                        <stop offset="100%" stopColor="#000000" />
                    </linearGradient>

                    {/* Gradiente do Filamento */}
                    <linearGradient id={`filamentGrad-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={shadow} />
                        <stop offset="50%" stopColor={base} />
                        <stop offset="100%" stopColor={shadow} />
                    </linearGradient>

                    {/* Textura de Fios */}
                    <pattern id={`wires-${uniqueId}`} width="100%" height="1.5" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0.75" x2="100" y2="0.75" stroke="black" strokeWidth="0.3" opacity="0.3" />
                    </pattern>
                </defs>

                {/* --- EIXO CENTRAL --- */}
                <rect 
                    x={cxLeft} 
                    y={cy - coreRadius} 
                    width={Math.max(0, cxRight - cxLeft)} 
                    height={coreRadius * 2} 
                    fill="#050505" 
                />

                {/* --- MASSA DE FILAMENTO --- */}
                {safePercent > 0 && (
                    <g>
                        <rect
                            x={cxLeft + 2} 
                            y={cy - currentRadius}
                            width={Math.max(0, cxRight - cxLeft - 4)} 
                            height={currentRadius * 2}
                            fill={`url(#filamentGrad-${uniqueId})`}
                            className="transition-all duration-700 ease-in-out"
                        />
                        <rect
                            x={cxLeft + 2} 
                            y={cy - currentRadius}
                            width={Math.max(0, cxRight - cxLeft - 4)} 
                            height={currentRadius * 2}
                            fill={`url(#wires-${uniqueId})`}
                            className="transition-all duration-700 ease-in-out"
                        />
                    </g>
                )}

                {/* --- LATERAIS DO CARRETEL (FLANGES) --- */}
                <g>
                    <ellipse cx={cxLeft} cy={cy} rx="7" ry="42" fill={`url(#spoolBody-${uniqueId})`} stroke="#27272a" strokeWidth="0.5" />
                    <circle cx={cxLeft} cy={cy} r="2.5" fill="#000" />
                </g>

                <g>
                    <ellipse cx={cxRight} cy={cy} rx="7" ry="42" fill={`url(#spoolBody-${uniqueId})`} stroke="#27272a" strokeWidth="0.5" />
                    <circle cx={cxRight} cy={cy} r="2.5" fill="#000" />
                </g>
            </svg>
        </div>
    );
}