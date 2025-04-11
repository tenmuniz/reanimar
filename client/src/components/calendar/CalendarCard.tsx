import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DaySchedule, MonthSchedule, CombinedSchedules } from "@/lib/types";
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
  combinedSchedules?: CombinedSchedules; // Agenda combinada (PMF + Escola Segura)
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

  useEffect(() => {
    if (savedSelections) {
      setSelections(savedSelections);
    }
  }, [savedSelections]);
  
  // Verificar limites de serviço e atualizar oficiais desabilitados
  useEffect(() => {
    if (!combinedSchedules || !officers.length) return;
    
    const monthKeyPMF = `${year}-${month}`;
    const monthKeyEscolaSegura = `${year}-${month}`;
    
    // Contar dias de serviço para cada oficial em ambas operações
    const officerDaysCount: Record<string, number> = {};
    
    // Inicializar contador para todos os oficiais
    officers.forEach(officer => {
      officerDaysCount[officer] = 0;
    });
    
    // Contar dias em PMF
    if (combinedSchedules.pmf[monthKeyPMF]) {
      Object.values(combinedSchedules.pmf[monthKeyPMF]).forEach(daySchedule => {
        daySchedule.forEach(officer => {
          if (officer) {
            officerDaysCount[officer] = (officerDaysCount[officer] || 0) + 1;
          }
        });
      });
    }
    
    // Contar dias em Escola Segura
    if (combinedSchedules.escolaSegura[monthKeyEscolaSegura]) {
      Object.values(combinedSchedules.escolaSegura[monthKeyEscolaSegura]).forEach(daySchedule => {
        daySchedule.forEach(officer => {
          if (officer) {
            officerDaysCount[officer] = (officerDaysCount[officer] || 0) + 1;
          }
        });
      });
    }
    
    // Encontrar oficiais que já atingiram o limite de 12 dias no mês
    const limitReachedOfficers = officers.filter(
      officer => officerDaysCount[officer] >= 12
    );
    
    // Remover do limite os oficiais já escalados para este dia
    // para que possam ser desescalados mesmo se já atingiram limite
    const disabledForNewSelections = limitReachedOfficers.filter(
      officer => !savedSelections.includes(officer)
    );
    
    setDisabledOfficers(disabledForNewSelections);
  }, [combinedSchedules, officers, savedSelections, year, month, day]);

  // Função para verificar se um oficial já está escalado em 12 dias
  // Legacy - agora usamos o disabledOfficers do useEffect acima
  const checkOfficerLimit = (officer: string | null): boolean => {
    // Se não houver oficial selecionado, não há limite a verificar
    if (!officer) return true;
    
    // Se o oficial estiver na lista de desabilitados, não permitir
    if (disabledOfficers.includes(officer)) {
      return false;
    }
    
    return true;
  };

  const handleOfficerChange = (position: number, officer: string | null) => {
    // Se está removendo um oficial (null) ou se está dentro do limite, permite a troca
    if (!officer || checkOfficerLimit(officer)) {
      const newSelections = [...selections];
      newSelections[position] = officer;
      setSelections(newSelections);
      onOfficerChange(day, position, officer);
    } else {
      // Oficial já atingiu o limite de 12 dias
      toast({
        title: "Limite de escala atingido",
        description: `${officer} já está escalado em 12 dias neste mês.`,
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
            onChange={(value) => handleOfficerChange(position, value)}
          />
        ))}
        
        {/* Alerta de limite atingido */}
        {showLimitWarning && (
          <Alert className="mt-3 bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-xs">
              Este oficial já atingiu o limite de 12 escalas extras no mês.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
