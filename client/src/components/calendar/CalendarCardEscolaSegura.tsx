import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import OfficerSelect from "./OfficerSelect";
import { getWeekdayClass } from "@/lib/utils";
import { CombinedSchedules } from "@/lib/types";

// Interface para as props do componente
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
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [disabledOfficers, setDisabledOfficers] = useState<string[]>([]);
  
  // Classes para diferentes dias da semana
  const weekdayClass = getWeekdayClass(weekday);
  
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
  
  // Handler para mostrar alerta de limite quando um oficial é selecionado
  const handleOfficerChange = (position: number, officer: string | null) => {
    // Se o oficial a ser selecionado está na lista de desabilitados, mostrar alerta
    if (officer && disabledOfficers.includes(officer)) {
      setShowLimitWarning(true);
      return;
    }
    
    // Caso contrário, proceder com a seleção normalmente
    onOfficerChange(day, position, officer);
  };
  
  // Verificar se é final de semana
  const isWeekend = weekday === 'Dom' || weekday === 'Sáb';

  return (
    <Card className={`relative border-l-4 ${
      isWeekend
        ? 'border-l-gray-300 bg-gray-100' 
        : 'border-l-green-500 bg-green-50'
    } transition-all duration-200 hover:shadow-md`}>
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{day}</CardTitle>
          <Badge variant={isWeekend ? "outline" : "secondary"} className="uppercase">
            {weekday}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {isWeekend ? (
          // Sem operação nos finais de semana
          <div className="py-4 text-center text-gray-500 text-sm italic">
            Não há operação Escola Segura nos finais de semana.
          </div>
        ) : (
          // Dias úteis - permitir seleção
          <>
            {/* Seleção de oficiais - limite de 2 para Escola Segura */}
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, position) => (
                <OfficerSelect
                  key={`select-${position}`}
                  position={position}
                  officers={officers}
                  selectedOfficer={savedSelections[position]}
                  disabledOfficers={disabledOfficers}
                  onChange={(value) => handleOfficerChange(position, value)}
                />
              ))}
            </div>
            
            {/* Alerta de limite atingido */}
            {showLimitWarning && (
              <Alert className="mt-3 bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-xs">
                  Este oficial já atingiu o limite de 12 escalas extras no mês.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}