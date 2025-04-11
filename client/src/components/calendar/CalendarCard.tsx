import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";
import { getWeekdayClass } from "@/lib/utils";
import OfficerSelect from "./OfficerSelect";
import { toast } from "@/hooks/use-toast";

interface CalendarCardProps {
  day: number;
  month: number;
  year: number;
  weekday: string;
  officers: string[];
  savedSelections: (string | null)[];
  onOfficerChange: (day: number, position: number, officer: string | null) => void;
  schedule?: MonthSchedule; // Agenda da PMF atual
  combinedSchedules?: CombinedSchedules; // Mantido por compatibilidade
}

export default function CalendarCard({
  day,
  month,
  year,
  weekday,
  officers,
  savedSelections,
  onOfficerChange,
  schedule = {},
  combinedSchedules
}: CalendarCardProps) {
  const [selections, setSelections] = useState<(string | null)[]>(
    savedSelections || [null, null, null]
  );
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [disabledOfficers, setDisabledOfficers] = useState<string[]>([]);
  const [limitReachedOfficers, setLimitReachedOfficers] = useState<string[]>([]);

  useEffect(() => {
    if (savedSelections) {
      // Verificar se algum dos oficiais selecionados já atingiu o limite de 12 escalas
      // Mas permitimos sua exibição caso já esteja salvo (para evitar dados corrompidos)
      const containsLimitReachedOfficers = savedSelections.some(
        officer => officer && limitReachedOfficers.includes(officer)
      );
      
      // Se algum dos oficiais já atingiu o limite, mostrar alerta visual
      if (containsLimitReachedOfficers) {
        setShowLimitWarning(true);
      } else {
        setShowLimitWarning(false);
      }
      
      setSelections(savedSelections);
    }
  }, [savedSelections, limitReachedOfficers]);
  
  // Verificar limites de serviço e atualizar oficiais desabilitados
  useEffect(() => {
    if (!combinedSchedules || !officers.length) return;
    
    const monthKeyPMF = `${year}-${month}`;
    let disabledOfficersList: string[] = [];
    
    // 1. Contar dias de serviço para cada oficial (limite de 12)
    const officerDaysCount: Record<string, number> = {};
    
    // Inicializar contador para todos os oficiais
    officers.forEach(officer => {
      officerDaysCount[officer] = 0;
    });
    
    // Contar dias em PMF (agora só temos esta operação)
    if (combinedSchedules.pmf[monthKeyPMF]) {
      Object.values(combinedSchedules.pmf[monthKeyPMF]).forEach(daySchedule => {
        daySchedule.forEach(officer => {
          if (officer) {
            officerDaysCount[officer] = (officerDaysCount[officer] || 0) + 1;
          }
        });
      });
    }
    
    // Encontrar oficiais que já atingiram o limite de 12 dias no mês
    // IMPORTANTE: Aqui é onde aplicamos a regra de negócio que limita a 12 escalas
    const officersAtLimit = officers.filter(
      officer => officerDaysCount[officer] >= 12
    );
    
    // DEBUG: Para verificação do limite
    if (officersAtLimit.length > 0) {
      console.log(`LIMITE 12 ATINGIDO por: ${officersAtLimit.join(', ')}`);
      console.log(`Contagem atual: `, 
        officersAtLimit.map(o => `${o}: ${officerDaysCount[o]} escalas`)
      );
    }
    
    // Atualizar estado dos oficiais que atingiram o limite
    setLimitReachedOfficers(officersAtLimit);
    
    // Adicionar à lista de desabilitados
    disabledOfficersList = [...disabledOfficersList, ...officersAtLimit];
    
    // 2. Verificar se o oficial já está escalado no mesmo dia
    const currentDayKey = `${day}`;
    
    // Verificar PMF para o mesmo dia (outros cards do mesmo dia)
    if (combinedSchedules.pmf[monthKeyPMF] && combinedSchedules.pmf[monthKeyPMF][currentDayKey]) {
      // Pegar oficiais já selecionados neste dia, EXCETO os selecionados neste card
      const thisOfficers = new Set(savedSelections.filter(o => o !== null));
      const officersInPMF = combinedSchedules.pmf[monthKeyPMF][currentDayKey]
        .filter(o => o !== null && !thisOfficers.has(o)) as string[];
      
      // Para evitar duplicação na mesma operação, desabilite oficiais já escalados no mesmo dia
      const alreadySelectedInThisDay = combinedSchedules.pmf[monthKeyPMF][currentDayKey]
        .filter(o => o !== null) as string[];
      
      // Para o mesmo dia na operação PMF, desabilitar oficiais já selecionados
      // para evitar duplicatas no mesmo dia
      disabledOfficersList = [...disabledOfficersList, ...alreadySelectedInThisDay];
    }
    
    // Remover duplicações
    disabledOfficersList = Array.from(new Set(disabledOfficersList));
    
    // Preparar lista final de oficiais desabilitados para seleção
    // Dividimos em dois grupos:
    
    // 1. Oficiais que atingiram o limite de 12 - sempre desabilitados para novas seleções
    const limitReachedForSelection = officersAtLimit.filter(
      officer => !savedSelections.includes(officer)
    );
    
    // 2. Oficiais já selecionados em outro lugar neste dia - desabilitados somente para seleção
    const alreadyUsedInDay = disabledOfficersList.filter(
      officer => !officersAtLimit.includes(officer) && !savedSelections.includes(officer)
    );
    
    // Combinamos os dois grupos na lista final de desabilitados
    const disabledForNewSelections = [...limitReachedForSelection, ...alreadyUsedInDay];
    
    setDisabledOfficers(disabledForNewSelections);
  }, [combinedSchedules, officers, savedSelections, year, month, day]);

  // Função para verificar se um oficial já está escalado em 12 dias
  const checkOfficerLimit = (officer: string | null): boolean => {
    // Se não houver oficial selecionado, não há limite a verificar
    if (!officer) return true;
    
    // Verificação rigorosa de limite: nunca deixar escalar além de 12 dias
    if (limitReachedOfficers.includes(officer)) {
      return false;
    }
    
    // Se o oficial estiver na lista de desabilitados, não permitir
    if (disabledOfficers.includes(officer)) {
      return false;
    }
    
    return true;
  };

  const handleOfficerChange = (position: number, officer: string | null) => {
    // Caso 1: Remover um oficial (substituir por null) - sempre permitido
    if (!officer) {
      const newSelections = [...selections];
      newSelections[position] = null;
      setSelections(newSelections);
      onOfficerChange(day, position, null);
      return;
    }
    
    // Caso 2: Verificação rigorosa de limite (bloquear oficial com 12+ escalas)
    if (limitReachedOfficers.includes(officer)) {
      toast({
        title: "LIMITE MÁXIMO ATINGIDO",
        description: `${officer} já está escalado em 12 dias. Impossível adicionar mais escalas.`,
        variant: "destructive",
      });
      return;
    }
    
    // Caso 3: Verificação geral de regras de negócio
    if (checkOfficerLimit(officer)) {
      const newSelections = [...selections];
      newSelections[position] = officer;
      setSelections(newSelections);
      onOfficerChange(day, position, officer);
    } else {
      // Oficial já está escalado neste dia ou outra regra de negócio impede
      toast({
        title: "Operação não permitida",
        description: `${officer} não pode ser escalado nesta posição.`,
        variant: "destructive",
      });
    }
  };

  // Get the selected officers for this day to disable them in other dropdowns
  const selectedOfficers = selections.filter(Boolean) as string[];

  // Obter a classe de cor base para o dia da semana
  const weekdayClass = getWeekdayClass(weekday);

  // Verificar quantos policiais estão escalados
  const assignedCount = selections.filter(officer => officer !== null).length;
  
  // Para depuração
  console.log(`Dia ${day} - ${assignedCount}/3 policiais escalados:`, selections);
  
  // Definir cores com base no número de policiais escalados
  let headerBgColor = "";
  let dayTextColor = "";
  let weekdayBadgeClass = "";
  
  if (assignedCount === 3) {
    // Todos os 3 policiais estão escalados - verde vivo
    headerBgColor = "bg-green-500";
    dayTextColor = "text-white";
    weekdayBadgeClass = "bg-green-700 text-white";
  } else if (assignedCount > 0) {
    // Pelo menos 1 policial, mas não todos - vermelho
    headerBgColor = "bg-red-500"; 
    dayTextColor = "text-white";
    weekdayBadgeClass = "bg-red-700 text-white";
  } else {
    // Nenhum policial escalado - cinza padrão
    headerBgColor = "bg-gray-50";
    dayTextColor = "text-gray-800";
    weekdayBadgeClass = weekdayClass;
  }

  // Classes finais
  const headerClasses = `px-4 py-2 border-b flex justify-between items-center ${headerBgColor}`;
  const dayTextClasses = `font-medium ${dayTextColor}`;

  return (
    <div className="day-card bg-white rounded-lg shadow-sm overflow-hidden" id={`dia-${day}`}>
      <div className={headerClasses}>
        <h3 className={dayTextClasses}>Dia {day}</h3>
        <span className={`text-xs font-medium ${weekdayBadgeClass} px-2 py-1 rounded`}>
          {weekday}
        </span>
      </div>
      <div className="p-4 space-y-3">
        {[0, 1, 2].map((position) => (
          <OfficerSelect
            key={`day-${day}-position-${position}`}
            position={position + 1}
            officers={officers}
            selectedOfficer={selections[position]}
            disabledOfficers={[
              ...selectedOfficers.filter((officer) => officer !== selections[position]),
              ...disabledOfficers
            ]}
            limitReachedOfficers={limitReachedOfficers}
            onChange={(value) => handleOfficerChange(position, value)}
          />
        ))}
        
        {/* Alerta de limite atingido */}
        {showLimitWarning && (
          <Alert className="mt-3 bg-red-100 border-red-300 text-red-800">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-xs font-semibold">
              ATENÇÃO: Um ou mais militares neste dia já atingiram o limite de 12 escalas extras no mês. 
              É possível remover um policial (✕), mas não é possível adicionar mais serviços para ele.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
