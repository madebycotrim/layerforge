import React, { useMemo } from "react";
import { Clock, Timer, Wrench } from "lucide-react";
import { UnifiedInput } from "../../../../components/formInputs";

export default function Tempo({
  tempoImpressaoHoras, setTempoImpressaoHoras,
  tempoImpressaoMinutos, setTempoImpressaoMinutos,
  tempoTrabalhoHoras, setTempoTrabalhoHoras,
  tempoTrabalhoMinutos, setTempoTrabalhoMinutos
}) {
  // Cálculo reativo e seguro para exibição do alerta de longa duração
  const totalHorasImpressao = useMemo(() => {
    const h = Number(tempoImpressaoHoras || 0);
    const m = Number(tempoImpressaoMinutos || 0);
    return h + (m / 60);
  }, [tempoImpressaoHoras, tempoImpressaoMinutos]);

  return (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">

      {/* GRUPO DE IMPRESSÃO (Tempo de Máquina) */}
      <UnifiedInput
        label="Duração da Impressão"
        icon={Clock}
        type="time"
        hoursValue={tempoImpressaoHoras || ""}
        onHoursChange={setTempoImpressaoHoras}
        minutesValue={tempoImpressaoMinutos || ""}
        onMinutesChange={setTempoImpressaoMinutos}
      />

      {/* GRUPO DE TRABALHO MANUAL (Mão de Obra) */}
      <UnifiedInput
        label="Trabalho Manual"
        icon={Wrench}
        type="time"
        hoursValue={tempoTrabalhoHoras || ""}
        onHoursChange={setTempoTrabalhoHoras}
        minutesValue={tempoTrabalhoMinutos || ""}
        onMinutesChange={setTempoTrabalhoMinutos}
      />

      {/* AVISO DE CARGA HORÁRIA (Alerta condicional) */}
      {totalHorasImpressao > 12 && (
        <div className="col-span-2 mt-1 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3">
          <Timer size={12} className="text-amber-500" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider leading-tight">
            <strong className="text-amber-500 text-[10px]">Atenção:</strong> Impressão longa detectada. Verifique a aderência da primeira camada.
          </span>
        </div>
      )}
    </div>
  );
}

// Nota: O hook useMemo foi adicionado para otimizar o cálculo do alerta, 
// mas se preferir manter a const simples como estava, o funcionamento é idêntico.