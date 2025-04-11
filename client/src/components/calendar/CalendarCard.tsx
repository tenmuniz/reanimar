import { useState, useEffect } from "react";
import { DaySchedule, MonthSchedule } from "@/lib/types";
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
  schedule?: MonthSchedule; // Passar a agenda atual para verificar o limite de 12 dias
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
}: CalendarCardProps) {
  const [selections, setSelections] = useState<(string | null)[]>(
    savedSelections || [null, null, null]
  );

  useEffect(() => {
    if (savedSelections) {
      setSelections(savedSelections);
    }
  }, [savedSelections]);

  // Função para verificar se um oficial já está escalado em 12 dias
  const checkOfficerLimit = (officer: string | null): boolean => {
    // Se não houver oficial selecionado, não há limite a verificar
    if (!officer) return true;
    
    const currentMonthKey = `${year}-${month}`;
    const monthSchedule = schedule[currentMonthKey] || {};
    
    // Contar quantas vezes este oficial já está escalado no mês
    let count = 0;
    
    // Percorrer cada dia do mês
    Object.entries(monthSchedule).forEach(([dayKey, dayOfficers]) => {
      // Ignorar o dia atual na contagem
      if (parseInt(dayKey) === day) return;
      
      // Verificar se o oficial está presente neste dia
      if (dayOfficers.includes(officer)) {
        count++;
      }
    });
    
    // Verificar o dia atual nas seleções atuais (caso esteja a modificar outro posto no mesmo dia)
    if (selections.includes(officer)) {
      count++;
    }
    
    // Se já atingiu o limite de 12 dias, retorna falso
    if (count >= 12) {
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
            disabledOfficers={selectedOfficers.filter(
              (officer) => officer !== selections[position]
            )}
            onChange={(value) => handleOfficerChange(position, value)}
          />
        ))}
      </div>
    </div>
  );
}
