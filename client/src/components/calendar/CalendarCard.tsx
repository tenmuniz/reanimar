import { useState, useEffect } from "react";
import { DaySchedule } from "@/lib/types";
import { getWeekdayClass } from "@/lib/utils";
import OfficerSelect from "./OfficerSelect";

interface CalendarCardProps {
  day: number;
  month: number;
  year: number;
  weekday: string;
  officers: string[];
  savedSelections: (string | null)[];
  onOfficerChange: (day: number, position: number, officer: string | null) => void;
}

export default function CalendarCard({
  day,
  month,
  year,
  weekday,
  officers,
  savedSelections,
  onOfficerChange,
}: CalendarCardProps) {
  const [selections, setSelections] = useState<(string | null)[]>(
    savedSelections || [null, null, null]
  );

  useEffect(() => {
    if (savedSelections) {
      setSelections(savedSelections);
    }
  }, [savedSelections]);

  const handleOfficerChange = (position: number, officer: string | null) => {
    const newSelections = [...selections];
    newSelections[position] = officer;
    setSelections(newSelections);
    onOfficerChange(day, position, officer);
  };

  // Get the selected officers for this day to disable them in other dropdowns
  const selectedOfficers = selections.filter(Boolean) as string[];

  const weekdayClass = getWeekdayClass(weekday);

  // Verificar se todas as 3 posições estão preenchidas
  const allPositionsFilled = selections.every(officer => officer !== null);
  // Verificar se pelo menos um oficial está escalado (mas não todos)
  const hasAnyOfficer = selectedOfficers.length > 0;
  
  // Definir as classes do cabeçalho com base no estado de preenchimento
  let headerClasses = "px-4 py-2 border-b flex justify-between items-center";
  let dayTextClass = "font-medium";
  
  if (allPositionsFilled) {
    // Todos os 3 policiais estão escalados - verde vivo
    headerClasses += " bg-green-500";
    dayTextClass += " text-white";
  } else if (hasAnyOfficer) {
    // Há pelo menos 1 policial, mas faltam outros - vermelho
    headerClasses += " bg-red-500";
    dayTextClass += " text-white";
  } else {
    // Nenhum policial escalado - cinza padrão
    headerClasses += " bg-gray-50";
    dayTextClass += " text-gray-800";
  }

  // Definir a cor do indicador do dia da semana
  let weekdayBgClass = "";
  
  if (allPositionsFilled) {
    weekdayBgClass = "bg-green-700 text-white";
  } else if (hasAnyOfficer) {
    weekdayBgClass = "bg-red-700 text-white";
  } else {
    weekdayBgClass = weekdayClass; // Usa a cor padrão baseada no dia da semana
  }

  return (
    <div className="day-card bg-white rounded-lg shadow-sm overflow-hidden" id={`dia-${day}`}>
      <div className={headerClasses}>
        <h3 className={dayTextClass}>Dia {day}</h3>
        <span className={`text-xs font-medium ${weekdayBgClass} px-2 py-1 rounded`}>
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
