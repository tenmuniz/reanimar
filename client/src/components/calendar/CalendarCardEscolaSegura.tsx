import { useState, useEffect } from "react";
import { DaySchedule, MonthSchedule, CombinedSchedules } from "@/lib/types";
import { getWeekdayClass } from "@/lib/utils";
import OfficerSelect from "./OfficerSelect";
import { toast } from "@/hooks/use-toast";
import { BookOpen, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CalendarCardEscolaSeguraProps {
  day: number;
  month: number;
  year: number;
  weekday: string;
  officers: string[];
  savedSelections: (string | null)[];
  onOfficerChange: (day: number, position: number, officer: string | null) => void;
  combinedSchedules?: CombinedSchedules; // Schedule de PMF + Escola Segura para verificar limite total
}

export default function CalendarCardEscolaSegura({
  day,
  month,
  year,
  weekday,
  officers,
  savedSelections,
  onOfficerChange,
  combinedSchedules
}: CalendarCardEscolaSeguraProps) {
  const positions = 2; // Para Escola Segura, só temos 2 posições
  const [currentSelections, setCurrentSelections] = useState<(string | null)[]>(
    savedSelections.length === positions 
      ? savedSelections 
      : Array(positions).fill(null)
  );
  const [isLimitWarningOpen, setIsLimitWarningOpen] = useState(false);
  const [limitWarningMessage, setLimitWarningMessage] = useState("");
  
  useEffect(() => {
    // Atualiza quando as seleções salvas mudarem
    setCurrentSelections(
      savedSelections.length === positions 
        ? savedSelections 
        : Array(positions).fill(null)
    );
  }, [savedSelections, positions]);
  
  // Verify if an officer is already at the limit of 12 days across both operations
  const isOfficerAtLimit = (officer: string): boolean => {
    if (!combinedSchedules) return false;
    
    // Checa as escalas da PMF
    const pmfSchedule = combinedSchedules.pmf;
    const pmfMonthKey = `${year}-${month}`;
    const pmfMonthData = pmfSchedule[pmfMonthKey] || {};
    
    // Checa as escalas da Escola Segura
    const escolaSchedule = combinedSchedules.escolaSegura;
    const escolaMonthKey = `${year}-${month}`;
    const escolaMonthData = escolaSchedule[escolaMonthKey] || {};
    
    // Conta dias na PMF
    let totalDays = 0;
    Object.entries(pmfMonthData).forEach(([_, officers]) => {
      if (officers.includes(officer)) {
        totalDays++;
      }
    });
    
    // Conta dias na Escola Segura (excluindo o dia atual para permitir alterações)
    Object.entries(escolaMonthData).forEach(([dayStr, officers]) => {
      const currentDay = parseInt(dayStr);
      if (currentDay !== day && officers.includes(officer)) {
        totalDays++;
      }
    });
    
    // Verifica se já atingiu o limite de 12 dias
    return totalDays >= 12;
  };
  
  const handleOfficerChange = (position: number, selectedOfficer: string | null) => {
    // Verifica se o oficial selecionado já atingiu o limite
    if (selectedOfficer && isOfficerAtLimit(selectedOfficer)) {
      setLimitWarningMessage(
        `${selectedOfficer} já atingiu o limite de 12 escalas no mês, considerando PMF e Escola Segura. Não é possível escalar este policial novamente.`
      );
      setIsLimitWarningOpen(true);
      return;
    }
    
    // Atualiza seleções locais
    const newSelections = [...currentSelections];
    newSelections[position] = selectedOfficer;
    setCurrentSelections(newSelections);
    
    // Propaga alteração para o componente pai
    onOfficerChange(day, position, selectedOfficer);
  };
  
  // Lista de oficiais já selecionados para este dia (para desabilitar)
  const getDisabledOfficers = (position: number): string[] => {
    return currentSelections
      .filter((officer, idx) => idx !== position && officer !== null) as string[];
  };
  
  // Define a cor de fundo baseada no dia da semana
  const bgColorClass = getWeekdayClass(weekday);
  
  // Conta quantos policiais estão escalados
  const scheduledCount = currentSelections.filter(officer => officer !== null).length;
  
  return (
    <div className={`p-3 rounded-lg border border-green-700/30 ${bgColorClass} shadow-md h-full flex flex-col`}>
      {/* Cabeçalho do cartão */}
      <div className="flex justify-between items-center mb-3 font-medium text-white border-b border-green-700/40 pb-2">
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-1 text-green-300" />
          <span className="text-lg">{day}</span>
          <span className="text-xs ml-1.5 text-green-200">{weekday}</span>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded-full ${scheduledCount === 0 ? 'bg-red-600/40 text-red-100' : 'bg-green-600/50 text-green-50'}`}>
          {scheduledCount}/{positions}
        </div>
      </div>
      
      {/* Lista de seleção de policiais */}
      <div className="flex-1 flex flex-col gap-2">
        {Array.from({ length: positions }).map((_, position) => (
          <OfficerSelect
            key={`officer-select-${day}-${position}`}
            position={position}
            officers={officers}
            selectedOfficer={currentSelections[position]}
            disabledOfficers={getDisabledOfficers(position)}
            onChange={(officer) => handleOfficerChange(position, officer)}
          />
        ))}
      </div>
      
      {/* Diálogo de aviso de limite */}
      <Dialog open={isLimitWarningOpen} onOpenChange={setIsLimitWarningOpen}>
        <DialogContent className="bg-red-900 border-red-600 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-300" />
              <span className="text-xl">Limite de Escalas Atingido</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2 pb-1 text-red-100">
            {limitWarningMessage}
          </div>
          <div className="bg-red-800/50 p-3 mt-4 rounded-md text-amber-100 text-sm flex items-start">
            <AlertTriangle className="mr-2 h-4 w-4 text-amber-300 mt-0.5 flex-shrink-0" />
            <div>
              Os policiais não podem exceder o limite de 12 escalas extras por mês, 
              somando todas as operações (PMF e Escola Segura).
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}