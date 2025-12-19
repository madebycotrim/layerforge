// --- FILE: src/features/filamentos/components/roloFilamento.jsx ---
import React, { useMemo, useId } from "react";

// Função utilitária de cores (levemente otimizada)
const generateColors = (hex) => {
    hex = hex.replace(/^\#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    // Fallback seguro
    if (hex.length !== 6) return { base: "#3b82f6", highlight: "#60a5fa", shadow: "#1e3a8a", border: "#1d4ed8" };

    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    // Highlight (Brilho especular sutil)
    const mix = (c, t, p) => Math.round(c + (t - c) * p);
    const rh = mix(r, 255, 0.2), gh = mix(g, 255, 0.2), bh = mix(b, 255, 0.2); // 20% branco

    // Shadow (Sombra volumétrica)
    const rs = mix(r, 0, 0.4), gs = mix(g, 0, 0.4), bs = mix(b, 0, 0.4); // 40% preto

    // Border (Para as linhas de textura)
    const rb = mix(r, 0, 0.2), gb = mix(g, 0, 0.2), bb = mix(b, 0, 0.2); // 20% escuro

    const toHex = (r, g, b) => "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);

    return {
        base: "#" + hex,
        highlight: toHex(rh, gh, bh),
        shadow: toHex(rs, gs, bs),
        border: toHex(rb, gb, bb)
    };
};

export default function SpoolSideView({
    color = "#3b82f6",
    percent = 100,
    size = 128,
    type = "plastic", // 'plastic' | 'cardboard'
    className = ""
}) {
    const uniqueId = useId(); // Hook estável para IDs do SVG
    const { base, highlight, shadow, border } = useMemo(() => generateColors(color), [color]);

    // Cores do Carretel (Suporte a Papelão vs Plástico)
    const spoolColors = type === "cardboard"
        ? { main: "#d4c5a9", border: "#a89b85", inner: "#b0a28c" } // Tom papelão
        : { main: "#27272a", border: "#52525b", inner: "#18181b" }; // Tom plástico preto

    // Geometria
    const cxLeft = 15;
    const cxRight = 85;
    const cy = 50;
    const flangeWidth = 8;
    const flangeHeight = 44; // Um pouco mais alto para parecer 'cheio'

    // Cálculos de Volume
    const coreRadius = 14;
    const maxFilamentRadius = 40;
    // Mapeamento não-linear para parecer mais realista (rolos cheios parecem grandes por mais tempo)
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
    const currentRadius = coreRadius + ((maxFilamentRadius - coreRadius) * (safePercent / 100));

    return (
        <div
            className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
            style={{ width: size, height: size }}
            role="img"
            aria-label={`Carretel com ${safePercent.toFixed(0)}% restante`}
        >
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full overflow-visible drop-shadow-xl"
                style={{ filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.3))' }}
            >
                <defs>
                    {/* 1. Gradiente Volumétrico do Filamento (Cilíndrico) */}
                    <linearGradient id={`volGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={shadow} />
                        <stop offset="20%" stopColor={base} />
                        <stop offset="45%" stopColor={highlight} /> {/* Specular highlight */}
                        <stop offset="60%" stopColor={base} />
                        <stop offset="100%" stopColor={shadow} />
                    </linearGradient>

                    {/* 2. Padrão de Linhas (Simula os fios enrolados) */}
                    <pattern id={`strandsPattern-${uniqueId}`} width="4" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
                        <rect width="100%" height="100%" fill={`url(#volGradient-${uniqueId})`} />
                        <line x1="0" y1="2" x2="4" y2="2" stroke={border} strokeWidth="0.25" opacity="0.4" />
                    </pattern>

                    {/* 3. Gradiente do Tubo Central */}
                    <linearGradient id={`coreGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={spoolColors.border} />
                        <stop offset="50%" stopColor={spoolColors.main} />
                        <stop offset="100%" stopColor={spoolColors.inner} />
                    </linearGradient>

                    {/* 4. Sombra de Oclusão (Onde o fio encosta na lateral) */}
                    <linearGradient id={`occlusion-${uniqueId}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="black" stopOpacity="0.4" />
                        <stop offset="15%" stopColor="black" stopOpacity="0" />
                        <stop offset="85%" stopColor="black" stopOpacity="0" />
                        <stop offset="100%" stopColor="black" stopOpacity="0.4" />
                    </linearGradient>
                </defs>

                {/* --- CAMADA 1: EIXO CENTRAL (Core) --- */}
                <rect
                    x={cxLeft} y={cy - coreRadius}
                    width={cxRight - cxLeft} height={coreRadius * 2}
                    fill={`url(#coreGradient-${uniqueId})`}
                />

                {/* --- CAMADA 2: FILAMENTO --- */}
                {safePercent > 0 && (
                    <g>
                        {/* Massa Principal com Textura */}
                        <path
                            d={`
                                M ${cxLeft + 2}, ${cy - currentRadius} 
                                L ${cxRight - 2}, ${cy - currentRadius} 
                                L ${cxRight - 2}, ${cy + currentRadius} 
                                L ${cxLeft + 2}, ${cy + currentRadius} 
                                Z
                            `}
                            fill={`url(#strandsPattern-${uniqueId})`}
                            className="transition-all duration-700 ease-out"
                        />

                        {/* Sombra Interna (Ambient Occlusion) nas pontas */}
                        <path
                            d={`
                                M ${cxLeft + 2}, ${cy - currentRadius} 
                                L ${cxRight - 2}, ${cy - currentRadius} 
                                L ${cxRight - 2}, ${cy + currentRadius} 
                                L ${cxLeft + 2}, ${cy + currentRadius} 
                                Z
                            `}
                            fill={`url(#occlusion-${uniqueId})`}
                            className="transition-all duration-700 ease-out pointer-events-none mix-blend-multiply"
                        />
                    </g>
                )}

                {/* --- CAMADA 3: FLANGES (Laterais) --- */}

                {/* Esquerda (Traseira visualmente) */}
                <g>
                    <ellipse
                        cx={cxLeft} cy={cy} rx={flangeWidth} ry={flangeHeight}
                        fill={spoolColors.main} stroke={spoolColors.border} strokeWidth="1"
                    />
                    {/* Buraco central */}
                    <ellipse cx={cxLeft} cy={cy} rx={3} ry={6} fill="#09090b" stroke={spoolColors.border} strokeWidth="0.5" />
                </g>

                {/* Direita (Frente visualmente) */}
                <g>
                    <ellipse
                        cx={cxRight} cy={cy} rx={flangeWidth} ry={flangeHeight}
                        fill={spoolColors.main} stroke={spoolColors.border} strokeWidth="1"
                    />
                    {/* Buraco central */}
                    <ellipse cx={cxRight} cy={cy} rx={3} ry={6} fill="#09090b" stroke={spoolColors.border} strokeWidth="0.5" />
                </g>
            </svg>
        </div>
    );
};