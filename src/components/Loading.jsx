// src/components/LoadingPrint.jsx
import React, { useMemo } from "react";
import logo from "../assets/logo-branca.png";

export default function LoadingPrint({ layers = 12, duration = 3600, size = 160 }) {
  const durSec = duration / 1000;
  const stepTiming = `steps(${layers})`;

  // Keyframes dinâmicos (máscara + nozzle)
  const css = useMemo(() => {
    const layerH = size / layers;
    const percentPerLayer = 100 / layers;
    const xLeft = -20;
    const xRight = size - 20;

    // Mascara revelando
    const liftKF = `
@keyframes lift {
  from { transform: translateY(${size}px); }
  to   { transform: translateY(0px); }
}
`;

    // Movimentos do nozzle por camada
    let nozzleKF = `@keyframes nozzle-move {`;
    for (let i = 0; i < layers; i++) {
      const pStart = +(i * percentPerLayer).toFixed(4);
      const pEnd = +((i + 1) * percentPerLayer - 0.001).toFixed(4);
      const y = Math.round(size - (i + 0.5) * layerH);

      nozzleKF += `
  ${pStart}% { transform: translate(${xLeft}px, ${y}px); opacity: 1; }
  ${pEnd}%   { transform: translate(${xRight}px, ${y}px); opacity: 1; }
`;
    }
    nozzleKF += `
  100% { transform: translate(${Math.round(size / 2 - 10)}px, ${Math.round(layerH)}px) scale(1.1); opacity: 0; }
}
`;

    // Glow suave no nozzle
    const glowKF = `
@keyframes nozzle-glow {
  0% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1;   transform: scale(1.05); }
  100% { opacity: 0.7; transform: scale(1); }
}
`;

    return `${liftKF}\n${nozzleKF}\n${glowKF}`;
  }, [layers, size]);

  const revealStyle = {
    transformOrigin: "0 0",
    animation: `lift ${durSec}s ${stepTiming} forwards`,
  };

  const nozzleStyle = {
    animation: `nozzle-move ${durSec}s linear forwards`,
  };

  const nozzleGlowStyle = {
    animation: `nozzle-glow ${Math.max(0.8, durSec / 6)}s ease-in-out infinite`,
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b]">
        <div className="flex flex-col items-center gap-8 px-6">

          {/* Canvas da impressão */}
          <div style={{ width: size, height: size }} className="relative select-none">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              width={size}
              height={size}
              className="block overflow-visible rounded-xl"
            >
              <defs>
                <mask id="mask-steps">
                  <rect width={size} height={size} fill="black" />
                  <rect
                    width={size}
                    height={size}
                    fill="white"
                    transform={`translate(0,${size})`}
                    style={revealStyle}
                  />
                </mask>

                <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Logo surgindo */}
              <image
                href={logo}
                width={size}
                height={size}
                preserveAspectRatio="xMidYMid meet"
                mask="url(#mask-steps)"
                style={{ imageRendering: "optimizeQuality" }}
              />

              {/* Nozzle */}
              <g style={nozzleStyle} transform="translate(0,0)">
                <g style={nozzleGlowStyle} filter="url(#glow)">
                  <rect
                    x={-10}
                    y={-8}
                    width={28}
                    height={12}
                    rx={3}
                    fill="#d1eeff"
                  />
                  <circle cx={9} cy={-2} r={2.2} fill="#9fe1ff" />
                </g>
                <rect
                  x={-4}
                  y={-20}
                  width={3}
                  height={12}
                  rx={1}
                  fill="#1a1f2c"
                  opacity="0.4"
                />
              </g>
            </svg>
          </div>

          {/* Texto mais limpo */}
          <p className="text-zinc-300 text-base tracking-wide font-medium opacity-90">
            Imprimindo sua experiência...
          </p>
        </div>
      </div>

      <style>{css}</style>
    </>
  );
}
