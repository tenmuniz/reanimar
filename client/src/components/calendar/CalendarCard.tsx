import { useState, useEffect } from "react";
import { AlertCircle, Shield, CheckCircle, UserCheck, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";
import { getWeekdayClass } from "@/lib/utils";
import OfficerSelect from "./OfficerSelect";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CalendarCardProps {
  day: number;
  month: number;
  year: number;
  weekday: string;
  officers: string[];
  savedSelections: (string | null)[];
  onOfficerChange: (day: number, position: number, officer: string | null) => void;
  schedule?: MonthSchedule;
  combinedSchedules?: CombinedSchedules;
}

// As guarnições disponíveis
const GUARNICOES = ["EXPEDIENTE", "ALFA", "BRAVO", "CHARLIE"];

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
  // Validação de datas para evitar NaN
  const validDay = isNaN(day) ? 1 : day;
  const validMonth = isNaN(month) ? new Date().getMonth() : month;
  const validYear = isNaN(year) ? new Date().getFullYear() : year;
  
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
  
  // IMPLEMENTAÇÃO RIGOROSA: Verificar limites de serviço e atualizar militares desabilitados
  useEffect(() => {
    if (!combinedSchedules || !officers.length) return;
    
    const monthKeyPMF = `${validYear}-${validMonth}`;
    
    // SOLUÇÃO DEFINITIVA: Contador global de escalas para cada militar
    const contadorEscalas: Record<string, number> = {};
    
    // Inicializa contador zerado para todos os militares
    officers.forEach(militar => {
      contadorEscalas[militar] = 0;
    });
    
    // Conta TODAS as escalas no mês para cada militar (contagem rigorosa)
    if (combinedSchedules && combinedSchedules.pmf && combinedSchedules.pmf[monthKeyPMF]) {
      // Para cada dia do mês na escala
      Object.values(combinedSchedules.pmf[monthKeyPMF]).forEach(diaEscala => {
        // Para cada posição do dia
        diaEscala.forEach(militar => {
          if (militar) {
            contadorEscalas[militar] = (contadorEscalas[militar] || 0) + 1;
          }
        });
      });
    }
    
    // Conta as escalas atuais no card, caso ainda não tenham sido salvas no servidor
    // Isto é crucial para verificar em tempo real
    if (selections) {
      selections.forEach(militar => {
        if (militar) {
          contadorEscalas[militar] = (contadorEscalas[militar] || 0) + 1;
        }
      });
    }
    
    // Lista de militares que já atingiram ou ultrapassaram o limite de 12
    const militaresNoLimite = officers.filter(
      militar => contadorEscalas[militar] >= 12
    );
    
    // Lista de militares já escalados no mesmo dia (para evitar duplicação)
    let militaresNoDia: string[] = [];
    
    // Verifica se há militares já escalados neste mesmo dia
    const currentDayKey = `${validDay}`;
    if (combinedSchedules.pmf[monthKeyPMF] && 
        combinedSchedules.pmf[monthKeyPMF][currentDayKey]) {
      militaresNoDia = combinedSchedules.pmf[monthKeyPMF][currentDayKey]
        .filter(m => m !== null) as string[];
    }
    
    // Atualiza o estado com militares que atingiram o limite
    setLimitReachedOfficers(militaresNoLimite);
    
    // Lista completa de militares desabilitados (no limite + já usados no dia)
    const listaFinalDesabilitados = Array.from(new Set([
      ...militaresNoLimite,
      ...militaresNoDia
    ]));
    
    // Não desabilita militares que já estão selecionados no card atual
    // para permitir a remoção deles
    const desabilitadosParaSelecao = listaFinalDesabilitados.filter(
      militar => !savedSelections.includes(militar)
    );
    
    // Define militares desabilitados para seleção
    setDisabledOfficers(desabilitadosParaSelecao);
    
    // Verifica se algum dos militares selecionados já está no limite
    if (savedSelections.some(militar => militar && militaresNoLimite.includes(militar))) {
      setShowLimitWarning(true);
    } else {
      setShowLimitWarning(false);
    }
    
  }, [combinedSchedules, officers, savedSelections, selections, validYear, validMonth, validDay]);

  // Função para verificar se um militar já está escalado em 12 dias
  const checkOfficerLimit = (officer: string | null): boolean => {
    // Se não houver militar selecionado, não há limite a verificar
    if (!officer) return true;
    
    // Verificação rigorosa de limite: nunca deixar escalar além de 12 dias
    if (limitReachedOfficers.includes(officer)) {
      return false;
    }
    
    // Se o militar estiver na lista de desabilitados, não permitir
    if (disabledOfficers.includes(officer)) {
      return false;
    }
    
    return true;
  };

  // VERIFICAÇÃO CRÍTICA: Nunca permitir um 13º serviço
  const handleOfficerChange = (position: number, officer: string | null) => {
    // Caso 1: Remover um militar (substituir por null) - sempre permitido
    if (!officer) {
      const newSelections = [...selections];
      newSelections[position] = null;
      setSelections(newSelections);
      onOfficerChange(validDay, position, null);
      return;
    }
    
    // VERIFICAÇÃO DE LIMITE ABSOLUTA
    // Conta total de escalas do militar no mês
    let totalEscalasMilitar = 0;
    
    // Conta escalas salvas no servidor
    if (combinedSchedules && combinedSchedules.pmf) {
      // Obtém o mês atual
      const monthKey = `${validYear}-${validMonth}`;
      const pmfSchedule = combinedSchedules.pmf[monthKey] || {};
      
      // Percorre os dias do mês
      Object.entries(pmfSchedule).forEach(([dia, militares]) => {
        if (Array.isArray(militares)) {
          militares.forEach((militar: string | null) => {
            if (militar === officer) {
              totalEscalasMilitar++;
            }
          });
        }
      });
    }
    
    // Conta escalas no card atual para não contar duas vezes o mesmo dia
    const currentDayKey = `${validDay}`;
    const cardActual = selections.filter(m => m === officer).length;
    
    // REGRA DE NEGÓCIO RIGOROSA: BLOQUEIO ABSOLUTO ao 13º serviço ou mais
    // Para garantir que o militar NUNCA ultrapasse 12 serviços,
    // fazemos uma contagem completa de todos os seus serviços
    
    // Verifica se ainda tem margem para mais um serviço
    let servicosRestantes = 12 - totalEscalasMilitar;
    
    if (servicosRestantes <= 0) {
      // BLOQUEIO TOTAL - Mensagem clara para o usuário
      toast({
        title: "⛔ LIMITE DE 12 SERVIÇOS ATINGIDO",
        description: `${officer} já está com ${totalEscalasMilitar} extras no mês. 
                      IMPOSSÍVEL adicionar mais serviços. 
                      Esta é uma regra de negócio rigorosa do sistema.`,
        variant: "destructive",
      });
      
      // Retorna imediatamente sem processar
      return;
    }
    
    // Caso 2: Verificação rigorosa de limite (bloquear militar com 12+ escalas)
    if (limitReachedOfficers.includes(officer)) {
      toast({
        title: "LIMITE ATINGIDO",
        description: `${officer} já está escalado em 12 dias. Impossível adicionar mais extras.`,
        variant: "destructive",
      });
      return;
    }
    
    // Caso 3: Verificação de duplicação no mesmo dia
    const isDuplicate = selections.some((selected, idx) => selected === officer && idx !== position);
    if (isDuplicate) {
      toast({
        title: "Militar já escalado",
        description: `${officer} já está escalado neste dia em outra posição.`,
        variant: "destructive",
      });
      return;
    }
    
    // Caso 4: Verificação geral de regras de negócio
    if (checkOfficerLimit(officer)) {
      // Tudo está ok, atualizar a seleção
      const newSelections = [...selections];
      newSelections[position] = officer;
      setSelections(newSelections);
      onOfficerChange(validDay, position, officer);
    }
  };

  // Determinar o estilo com base na classe de dia da semana
  const weekdayClass = getWeekdayClass(weekday);

  return (
    <div 
      className={`calendar-card w-full min-w-[280px] max-w-full md:max-w-[320px] bg-white/10 backdrop-blur-md border border-white/10
        transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl overflow-hidden
        ${weekdayClass.border}
        ${showLimitWarning ? 'ring-2 ring-red-500 border-l-red-500' : ''}
      `}
    >
      {/* Cabeçalho do Card */}
      <div className={`p-3 text-white font-medium flex justify-between items-center
        ${weekdayClass.background}
        ${showLimitWarning ? 'bg-gradient-to-r from-red-600/80 to-pink-700/70' : ''}
      `}>
        <div className="flex items-center">
          <div className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-lg mr-2 backdrop-blur-sm">
            <span className="text-xl font-bold">{validDay}</span>
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-md">{weekday}</span>
              
              {/* Exibir indicador de limite apenas se necessário */}
              {showLimitWarning && (
                <div className="ml-2 p-1 bg-red-600 rounded-full flex items-center shadow animate-pulse">
                  <AlertCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="text-xs text-white/70">
              {new Date(validYear, validMonth, validDay).toLocaleDateString('pt-BR', { month: 'short' })}
            </div>
          </div>
        </div>
        <div>
          <Badge 
            variant="outline" 
            className={`text-xs font-semibold px-2 py-0.5
              ${weekdayClass.badge}
              ${showLimitWarning ? 'bg-red-600/20 text-white border-red-300/20' : ''}
            `}
          >
            <Shield className="h-3 w-3 mr-1" />
            <span>PMF</span>
          </Badge>
        </div>
      </div>
      
      {/* Corpo do Card - Lista de Policiais */}
      <div className="p-3 space-y-2 text-white">
        {/* Exibir aviso de limite */}
        {showLimitWarning && (
          <Alert variant="destructive" className="py-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Militar atingiu o limite de 12 escalas mensais!
            </AlertDescription>
          </Alert>
        )}
        
        {/* Lista de Policiais */}
        {[0, 1, 2].map((position) => (
          <div key={position} className="mb-3 last:mb-0">
            <OfficerSelect
              position={position}
              officers={officers}
              selectedOfficer={selections[position]}
              disabledOfficers={disabledOfficers}
              limitReachedOfficers={limitReachedOfficers}
              onChange={(officer) => handleOfficerChange(position, officer)}
              guarnicao="TODOS"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
