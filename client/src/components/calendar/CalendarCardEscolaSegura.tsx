import { useState, useEffect } from "react";
import { AlertCircle, Shield, CheckCircle, UserCheck, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";
import { getWeekdayClass } from "@/lib/utils";
import OfficerSelect from "./OfficerSelect";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface CalendarCardEscolaSeguraProps {
  day: number;
  month: number;
  year: number;
  weekday: string;
  officers: string[];
  savedSelections: (string | null)[];
  onOfficerChange: (day: number, position: number, officer: string | null) => void;
  schedule?: MonthSchedule; // Agenda da Escola Segura atual
  combinedSchedules?: CombinedSchedules; // Mantido por compatibilidade
}

export default function CalendarCardEscolaSegura({
  day,
  month,
  year,
  weekday,
  officers,
  savedSelections,
  onOfficerChange,
  schedule = {},
  combinedSchedules
}: CalendarCardEscolaSeguraProps) {
  const [selections, setSelections] = useState<(string | null)[]>(
    savedSelections || [null, null]
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
      }
      
      setSelections(savedSelections);
    }
  }, [savedSelections, limitReachedOfficers]);
  
  // Classe da semana
  const weekdayClass = getWeekdayClass(weekday);
  
  const handleOfficerChange = (position: number, officer: string | null) => {
    // Nulos são sempre permitidos (remover oficial)
    if (officer === null) {
      onOfficerChange(day, position, null);
      return;
    }
    
    // Não permitir exceder o limite
    checkOfficerLimit(officer) && onOfficerChange(day, position, officer);
  };
  
  useEffect(() => {
    // Verificar quais oficiais estão no limite dos 12 serviços
    // e quais não podem ser selecionados por já estarem escalados
    if (combinedSchedules) {
      // Contadores de escala baseado em: ano-mês
      const monthKeyPMF = `${year}-${month}`;
      const monthKeyES = `${year}-${month}`;
      
      // Coletar todas as escalas dos militares em ambas as operações
      const contadorEscalas: Record<string, number> = {};
      
      // Operação PMF
      const pmfData = combinedSchedules.pmf[monthKeyPMF] || {};
      Object.values(pmfData).forEach(escalaDia => {
        escalaDia.forEach(militar => {
          if (militar) {
            contadorEscalas[militar] = (contadorEscalas[militar] || 0) + 1;
          }
        });
      });
      
      // Operação Escola Segura
      const escolaSeguraData = combinedSchedules.escolaSegura[monthKeyES] || {};
      Object.values(escolaSeguraData).forEach(escalaDia => {
        escalaDia.forEach(militar => {
          if (militar) {
            contadorEscalas[militar] = (contadorEscalas[militar] || 0) + 1;
          }
        });
      });
      
      // Debug: mostrar contagem total para cada militar
      console.log("CONTAGEM TOTAL DE EXTRAS:", 
        Object.entries(contadorEscalas)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([militar, count]) => `${militar}: ${count}`)
      );
      
      // Lista de militares que já atingiram ou ultrapassaram o limite de 12
      const militaresNoLimite = officers.filter(
        militar => contadorEscalas[militar] >= 12
      );
      
      // DEBUG de quem atingiu o limite
      if (militaresNoLimite.length > 0) {
        console.log(`⚠️ LIMITE 12 ATINGIDO por: ${militaresNoLimite.join(', ')}`);
        console.log(`⚠️ Contagem atual: `, 
          militaresNoLimite.map(m => `${m}: ${contadorEscalas[m]} extras`)
        );
      }
      
      // Lista de militares já escalados no mesmo dia (para evitar duplicação)
      let militaresNoDia: string[] = [];
      
      // Verifica se há militares já escalados neste mesmo dia
      const currentDayKey = `${day}`;
      if (combinedSchedules.escolaSegura[monthKeyES] && 
          combinedSchedules.escolaSegura[monthKeyES][currentDayKey]) {
        militaresNoDia = combinedSchedules.escolaSegura[monthKeyES][currentDayKey]
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
    }
  }, [combinedSchedules, day, month, year, officers, savedSelections]);
  
  const checkOfficerLimit = (officer: string): boolean => {
    if (!combinedSchedules) return true;
    
    // Total de escalas para este militar em todas as operações
    let totalEscalasMilitar = 0;
    
    // Verificação em Operação PMF
    const monthKeyPMF = `${year}-${month}`;
    const pmfData = combinedSchedules.pmf[monthKeyPMF] || {};
    
    Object.entries(pmfData).forEach(([dia, militaresDia]) => {
      militaresDia.forEach(militar => {
        if (militar === officer) {
          totalEscalasMilitar++;
        }
      });
    });
    
    // Verificação em Operação Escola Segura
    const monthKeyES = `${year}-${month}`;
    const esData = combinedSchedules.escolaSegura[monthKeyES] || {};
    
    Object.entries(esData).forEach(([dia, militaresDia]) => {
      // Não contar o dia atual para evitar contar duas vezes
      if (parseInt(dia) !== day) {
        militaresDia.forEach(militar => {
          if (militar === officer) {
            totalEscalasMilitar++;
          }
        });
      }
    });
    
    // Conta escalas no card atual para não contar duas vezes o mesmo dia
    const currentDayKey = `${day}`;
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
      
      // Log de erro detalhado
      console.error(`🚫 BLOQUEADO: ${officer} tem ${totalEscalasMilitar} extras e atingiu o limite estrito!`);
      console.error(`🚫 REGRA DE NEGÓCIO VIOLADA: Tentativa de adicionar um ${totalEscalasMilitar + 1}º serviço`);
      
      // Retorna imediatamente sem processar
      return false;
    }
    
    // Caso 2: Verificação rigorosa de limite (bloquear militar com 12+ escalas)
    if (limitReachedOfficers.includes(officer)) {
      toast({
        title: "LIMITE ATINGIDO",
        description: `${officer} já está escalado em 12 dias. Impossível adicionar mais extras.`,
        variant: "destructive",
      });
      return false;
    }
    
    // Se chegou até aqui, está tudo certo para escalar
    return true;
  };
  
  // Calcular número de policiais já em extras
  const assignedCount = selections.filter(officer => officer !== null).length;
  
  // Para depuração
  console.log(`Dia ${day} - ${assignedCount}/2 policiais em extras:`, selections);
  
  // Definir cores com base no número de policiais em extras
  let headerBgColor = "";
  let dayTextColor = "";
  let weekdayBadgeClass = "";
  
  if (assignedCount === 2) {
    // Todos os 2 policiais estão escalados - verde vivo
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
    <div 
      className={`day-card relative rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02]
        ${assignedCount === 0 
          ? 'bg-gradient-to-br from-slate-50 to-slate-100 shadow-md' 
          : assignedCount === 2 
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg' 
            : 'bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg'}`} 
      id={`dia-${day}`}
      style={{
        boxShadow: assignedCount === 2 
          ? '0 10px 15px -3px rgba(0, 200, 83, 0.2), 0 4px 6px -4px rgba(0, 200, 83, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.6)' 
          : assignedCount > 0 
            ? '0 10px 15px -3px rgba(237, 137, 54, 0.2), 0 4px 6px -4px rgba(237, 137, 54, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.6)' 
            : '0 10px 15px -3px rgba(100, 116, 139, 0.1), 0 4px 6px -4px rgba(100, 116, 139, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
      }}
    >
      {/* Barra de limite - mostrada apenas quando um militar selecionado já atingiu o limite */}
      {showLimitWarning && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-xs text-center py-1 font-medium text-white z-10 shadow-md">
          <AlertCircle className="h-3 w-3 inline-block mr-1 animate-pulse" />
          Limite de 12 serviços atingido
        </div>
      )}
      
      {/* Header com a data e dia da semana - Visual mais 3D e moderno */}
      <div 
        className={`flex items-center justify-between px-5 py-4 
          ${assignedCount === 2 
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
            : assignedCount > 0 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600' 
              : 'bg-gradient-to-r from-slate-100 to-slate-200'}`}
      >
        {/* Data e dia da semana */}
        <div className="flex items-end">
          <span className={`text-2xl font-bold mr-2 ${assignedCount > 0 ? 'text-white' : 'text-gray-800'}`}>
            {day}
          </span>
          <Badge 
            variant="outline" 
            className={`${assignedCount > 0 ? 'bg-white/20 text-white border-white/30' : 'bg-slate-700/10 text-slate-800'} 
              shadow-inner rounded-md px-2 text-xs font-medium transform translate-y-[-2px]`}
          >
            {weekday}
          </Badge>
        </div>
        
        {/* Status de preenchimento */}
        <div>
          <Badge 
            variant={assignedCount === 2 ? "default" : assignedCount > 0 ? "destructive" : "outline"}
            className={`
              ${assignedCount === 2 
                ? 'bg-emerald-700 hover:bg-emerald-700 shadow-inner' 
                : assignedCount > 0 
                  ? 'bg-amber-700 hover:bg-amber-700 shadow-inner' 
                  : 'bg-transparent text-slate-600'} 
              px-2.5 py-1 text-xs`}
          >
            {assignedCount === 0 && <Users className="w-3 h-3 mr-1 inline opacity-70" />}
            {assignedCount > 0 && assignedCount < 2 && <UserCheck className="w-3 h-3 mr-1 inline opacity-80" />}
            {assignedCount === 2 && <CheckCircle className="w-3 h-3 mr-1 inline opacity-90" />}
            {assignedCount}/2
          </Badge>
        </div>
      </div>
      
      {/* Corpo do card com seleções de policiais - mais moderno e limpo */}
      <div className="p-4 space-y-3">
        {/* Posições para cada oficial */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={`pos-${i}`} className="space-y-1.5">
            {/* Nome da posição - simplificado */}
            <div className="flex items-center px-1">
              <Shield className="text-green-600 h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium text-gray-500">
                Policial {i + 1}
              </span>
            </div>
            
            {/* Campo de seleção ou display do oficial selecionado */}
            <div>
              {selections[i] ? (
                <div 
                  className="flex justify-between items-center p-2.5 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm"
                >
                  <span className="text-sm font-medium text-slate-800">{selections[i]}</span>
                  <button
                    onClick={() => handleOfficerChange(i, null)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-md transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <OfficerSelect
                  position={i}
                  officers={officers}
                  selectedOfficer={null}
                  disabledOfficers={disabledOfficers}
                  limitReachedOfficers={limitReachedOfficers}
                  onChange={(officer) => handleOfficerChange(i, officer)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}