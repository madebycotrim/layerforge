import React from 'react';

const PageLoading = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#050506]">
      <div className="relative flex flex-col items-center">
        
        {/* Logo Minimalista */}
        <div className="mb-8 overflow-hidden relative">
          <h1 className="text-xl font-black tracking-[0.3em] text-white opacity-90 uppercase">
            Print<span className="text-sky-500">Log</span>
          </h1>
          {/* Linha de "scan" que passa pelo texto */}
          <div className="h-[1px] w-full bg-sky-500/50 shadow-[0_0_8px_#0ea5e9] mt-1"></div>
        </div>

        {/* Loader de Camadas (Simulando impressão 3D) */}
        <div className="flex flex-col gap-1.5 w-12">
          {[0, 200, 400].map((delay) => (
            <div key={delay} className="h-[2px] w-full bg-sky-500/10 overflow-hidden rounded-full">
              <div 
                className="h-full bg-sky-500" 
                style={{ animationDelay: `${delay}ms` }}
              ></div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default PageLoading;