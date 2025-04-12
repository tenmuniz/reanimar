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
  
  // IMPLEMENTAÇÃO RIGOROSA: Verificar limites de serviço e atualizar militares desabilitados
  useEffect(() => {
    if (!combinedSchedules || !officers.length) return;
    
    const monthKeyPMF = `${year}-${month}`;
    
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
    
    // LOG da contagem total de cada militar
    console.log("CONTAGEM TOTAL DE ESCALAS:", 
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
        militaresNoLimite.map(m => `${m}: ${contadorEscalas[m]} escalas`)
      );
    }
    
    // Lista de militares já escalados no mesmo dia (para evitar duplicação)
    let militaresNoDia: string[] = [];
    
    // Verifica se há militares já escalados neste mesmo dia
    const currentDayKey = `${day}`;
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
    
  }, [combinedSchedules, officers, savedSelections, selections, year, month, day]);

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
      onOfficerChange(day, position, null);
      return;
    }
    
    // VERIFICAÇÃO DE LIMITE ABSOLUTA
    // Conta total de escalas do militar no mês
    const monthKeyPMF = `${year}-${month}`;
    let totalEscalasMilitar = 0;
    
    // Conta escalas salvas no servidor
    if (combinedSchedules && combinedSchedules.pmf && combinedSchedules.pmf[monthKeyPMF]) {
      Object.values(combinedSchedules.pmf[monthKeyPMF]).forEach(diaEscala => {
        diaEscala.forEach(m => {
          if (m === officer) {
            totalEscalasMilitar++;
          }
        });
      });
    }
    
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
        description: `${officer} já está com ${totalEscalasMilitar} escalas no mês. 
                      IMPOSSÍVEL adicionar mais serviços. 
                      Esta é uma regra de negócio rigorosa do sistema.`,
        variant: "destructive",
      });
      
      // Log de erro detalhado
      console.error(`🚫 BLOQUEADO: ${officer} tem ${totalEscalasMilitar} escalas e atingiu o limite estrito!`);
      console.error(`🚫 REGRA DE NEGÓCIO VIOLADA: Tentativa de adicionar um ${totalEscalasMilitar + 1}º serviço`);
      
      // Retorna imediatamente sem processar
      return;
    }
    
    // Caso 2: Verificação rigorosa de limite (bloquear militar com 12+ escalas)
    if (limitReachedOfficers.includes(officer)) {
      toast({
        title: "LIMITE ATINGIDO",
        description: `${officer} já está escalado em 12 dias. Impossível adicionar mais escalas.`,
        variant: "destructive",
      });
      return;
    }
    
    // Caso 3: Verificação geral de regras de negócio
    if (checkOfficerLimit(officer)) {
      // VERIFICAÇÃO FINAL: garantir que não estamos adicionando um 13º serviço
      // Contar quantas vezes o militar já aparece nos outros dias
      const newSelections = [...selections];
      newSelections[position] = officer;
      setSelections(newSelections);
      onOfficerChange(day, position, officer);
    } else {
      // Militar já está escalado neste dia ou outra regra de negócio impede
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
    <div 
      className={`day-card relative bg-white rounded-md overflow-hidden transition-all duration-200
        ${assignedCount === 0 ? 'border border-gray-200 hover:shadow-md' : 
          assignedCount === 3 ? 'border-2 border-green-500 hover:shadow-lg' : 
          'border-2 border-orange-500 hover:shadow-lg'}`} 
      id={`dia-${day}`}
    >
      {/* Barra de limite - mostrada apenas quando um militar selecionado já atingiu o limite */}
      {showLimitWarning && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-xs text-center py-0.5 font-medium text-yellow-900 z-10">
          Militar atingiu o limite de 12 serviços
        </div>
      )}
      
      {/* Header com a data e dia da semana */}
      <div className={`flex items-center justify-between ${
        assignedCount === 3 
          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
          : assignedCount > 0 
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
            : 'bg-slate-100 text-slate-700'
      } px-4 py-3`}>
        <div className="flex flex-col">
          <span className="text-2xl font-bold leading-none">{day}</span>
          <span className="text-xs opacity-90 capitalize">{weekday}</span>
        </div>
        
        <div className="text-right">
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            assignedCount === 3 
              ? 'bg-green-700/30 text-white' 
              : assignedCount > 0 
                ? 'bg-orange-700/30 text-white'
                : 'bg-slate-200 text-slate-700'
          }`}>
            {assignedCount === 0 ? '0/3' : 
             assignedCount === 3 ? 'Completo' : 
             `${assignedCount}/3`}
          </div>
        </div>
      </div>
      
      {/* Corpo do card */}
      <div className="p-4 space-y-3">
        {/* Seletores de oficiais */}
        {[0, 1, 2].map((position) => (
          <div key={`select-${day}-${position}`} className="relative">
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-10 bg-blue-500 opacity-80 rounded-r-md"></div>
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
          </div>
        ))}
        
        {/* Status da guarnição */}
        {assignedCount === 3 && (
          <div className="mt-2 text-center">
            <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guarnição completa
            </span>
          </div>
        )}
        
        {/* Alerta de limite atingido */}
        {showLimitWarning && (
          <div className="mt-2 p-2 bg-yellow-100 border-l-4 border-yellow-500 rounded text-yellow-800 text-xs">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-1 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Limite de 12 serviços atingido</p>
                <p className="mt-0.5">Um ou mais militares neste dia já atingiram o limite mensal.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
