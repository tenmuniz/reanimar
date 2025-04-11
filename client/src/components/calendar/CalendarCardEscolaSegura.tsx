import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn, getWeekdayClass } from "@/lib/utils";
import OfficerSelect from "./OfficerSelect";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";

interface CalendarCardEscolaSeguraProps {
  day: number;
  month: number;
  year: number;
  weekday: string;
  officers: string[];
  savedSelections: (string | null)[];
  onOfficerChange: (day: number, position: number, officer: string | null) => void;
  schedule?: MonthSchedule; // Agenda da Escola Segura atual
  combinedSchedules?: CombinedSchedules; // Combinação de PMF + Escola Segura para verificar limite total
}

export default function CalendarCardEscolaSegura({
  day,
  month,
  year,
  weekday,
  officers,
  savedSelections,
  onOfficerChange,
  schedule,
  combinedSchedules,
}: CalendarCardEscolaSeguraProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Classe CSS com base no dia da semana
  const weekdayClass = getWeekdayClass(weekday);
  
  // Verificar oficiais que já atingiram o limite de 12 escalas no mês
  // Estes oficiais devem ser desabilitados para novas escalas
  const limitReachedOfficers: string[] = [];
  
  // Contar total de escalas para cada oficial no mês inteiro (PMF + Escola Segura)
  if (combinedSchedules) {
    const monthKey = `${year}-${month}`;
    const pmfSchedule = combinedSchedules.pmf[monthKey] || {};
    const escolaSeguraSchedule = combinedSchedules.escolaSegura[monthKey] || {};
    
    // Contagem de escalas por oficial
    const officerCounts: Record<string, number> = {};
    
    // Contar em PMF
    Object.values(pmfSchedule).forEach((dayOfficers: any) => {
      if (Array.isArray(dayOfficers)) {
        dayOfficers.forEach(officer => {
          if (officer) {
            officerCounts[officer] = (officerCounts[officer] || 0) + 1;
          }
        });
      }
    });
    
    // Contar em Escola Segura
    Object.values(escolaSeguraSchedule).forEach((dayOfficers: any) => {
      if (Array.isArray(dayOfficers)) {
        dayOfficers.forEach(officer => {
          if (officer) {
            officerCounts[officer] = (officerCounts[officer] || 0) + 1;
          }
        });
      }
    });
    
    // Verificar se algum oficial já atingiu o limite (12 escalas)
    Object.entries(officerCounts).forEach(([officer, count]) => {
      if (count >= 12) {
        limitReachedOfficers.push(officer);
      }
    });
  }
  
  // Determinar quais oficiais já estão escalados neste dia (para desabilitar na seleção)
  const disabledOfficers = savedSelections.filter(Boolean) as string[];
  
  // Contar quantos oficiais já estão escalados neste dia
  const selectedCount = savedSelections.filter(Boolean).length;
  
  return (
    <div className="relative">
      {/* Card principal com sombra aumentada para efeito 3D */}
      <div
        className={cn(
          "bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)]",
          "transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)]",
          weekdayClass
        )}
      >
        {/* Header do card */}
        <div className="px-4 py-2 flex justify-between items-center border-b border-green-200 bg-green-50">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-green-700">{day}</span>
            <span className="text-xs uppercase font-medium text-green-600">{weekday}</span>
          </div>
          
          {/* Contador de oficiais */}
          <div 
            className={cn(
              "py-1 px-2 rounded-full text-xs font-medium shadow-md border", 
              selectedCount === 0 && "bg-gray-100 text-gray-700 border-gray-300",
              selectedCount === 1 && "bg-yellow-100 text-yellow-800 border-yellow-300",
              selectedCount === 2 && "bg-green-100 text-green-800 border-green-300"
            )}
          >
            {selectedCount}/2 policiais escalados
          </div>
        </div>
        
        {/* Corpo do card */}
        <div className="p-3 space-y-2">
          {/* Oficiais selecionados */}
          {Array.from({ length: 2 }).map((_, index) => {
            const selectedOfficer = savedSelections[index];
            
            return (
              <div 
                key={`officer-${index}`} 
                className="flex items-center space-x-2 p-2 border border-gray-100 rounded-md bg-white shadow-sm relative"
              >
                <div className="font-medium text-xs text-gray-500 absolute -top-2 left-2 bg-white px-1">
                  Posição {index + 1}
                </div>
                
                {selectedOfficer ? (
                  <>
                    <div className="flex-1 text-gray-800 font-medium ml-1 mr-2">
                      {selectedOfficer}
                    </div>
                    <button
                      onClick={() => onOfficerChange(day, index, null)}
                      className="text-rose-500 hover:text-rose-700 transition-colors p-1 rounded-full hover:bg-rose-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <OfficerSelect
                    position={index}
                    officers={officers}
                    selectedOfficer={null}
                    disabledOfficers={disabledOfficers}
                    limitReachedOfficers={limitReachedOfficers}
                    onChange={(value) => onOfficerChange(day, index, value)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}