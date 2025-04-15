import { useState, useEffect } from "react";
import { AlertCircle, Shield, CheckCircle, UserCheck, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";
import { getWeekdayClass } from "@/lib/utils";
import OfficerSelect from "./OfficerSelect";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
    let totalEscalasMilitar = 0;
    
    // Conta escalas salvas no servidor
    if (combinedSchedules && combinedSchedules.pmf) {
      // Obtém o mês atual
      const monthKey = `${year}-${month}`;
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

  // Verificar quantos policiais estão em extras
  const assignedCount = selections.filter(officer => officer !== null).length;
  
  // Para depuração
  console.log(`Dia ${day} - ${assignedCount}/3 policiais em extras:`, selections);
  
  // Definir cores com base no número de policiais em extras
  let headerBgColor = "";
  let dayTextColor = "";
  let weekdayBadgeClass = "";
  
  if (assignedCount === 3) {
    // Todos os 3 policiais estão em extras - verde vivo
    headerBgColor = "bg-green-500";
    dayTextColor = "text-white";
    weekdayBadgeClass = "bg-green-700 text-white";
  } else if (assignedCount > 0) {
    // Pelo menos 1 policial, mas não todos - vermelho
    headerBgColor = "bg-red-500"; 
    dayTextColor = "text-white";
    weekdayBadgeClass = "bg-red-700 text-white";
  } else {
    // Nenhum policial em extras - cinza padrão
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
          : assignedCount === 3 
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg' 
            : 'bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg'}`} 
      id={`dia-${day}`}
      style={{
        boxShadow: assignedCount === 3 
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
          ${assignedCount === 3 
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
            : assignedCount > 0 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600'
              : weekdayClass
          } text-white relative overflow-hidden`}
      >
        {/* Efeito brilho no header */}
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 transform -skew-x-45"></div>
        
        {/* Círculo do dia com efeito 3D */}
        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-slate-800 font-bold text-xl shadow-[0_4px_6px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.6)]">
            {day}
          </div>
          <div>
            <div className="font-bold text-lg leading-none capitalize mb-0.5 drop-shadow-md">{weekday}</div>
            <div className="text-xs opacity-90">{day}/{month}/{year}</div>
          </div>
        </div>
        
        {/* Badge animado com contagem */}
        <Badge
          className={`${
            assignedCount === 3 
              ? 'bg-white text-emerald-700 border-emerald-300' 
              : assignedCount > 0 
                ? 'bg-white text-amber-700 border-amber-300'
                : 'bg-white/90 text-slate-600 border-slate-300'
          } font-bold py-1 px-3 rounded-full text-sm shadow-md relative z-10 border`}
        >
          {assignedCount === 3 
            ? <><CheckCircle className="h-4 w-4 mr-1 inline-block text-emerald-500" /> Completo</>
            : <><Users className="h-4 w-4 mr-1 inline-block" /> {assignedCount}/3</>
          }
        </Badge>
      </div>
      
      {/* Corpo do card com efeito de vidro e 3D */}
      <div className="p-5 space-y-4 relative">
        {/* Status visual rápido */}
        <div className="flex justify-center mb-1">
          {assignedCount === 3 ? (
            <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              <Shield className="h-4 w-4 mr-2 text-emerald-600" />
              Guarnição completa
            </div>
          ) : assignedCount > 0 ? (
            <div className="inline-flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
              Guarnição incompleta
            </div>
          ) : (
            <div className="inline-flex items-center bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              <Users className="h-4 w-4 mr-2 text-slate-500" />
              Sem extras
            </div>
          )}
        </div>
        
        {/* Seletores de oficiais com estilo moderno */}
        <div className="space-y-3 relative">
          {[0, 1, 2].map((position) => (
            <div 
              key={`select-${day}-${position}`} 
              className={`relative rounded-xl overflow-hidden transition-all duration-200
                ${selections[position] ? 'bg-white/70 shadow-md' : 'bg-white/30'}`}
            >
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
              
              {/* Removido o indicador visual de posição com números */}
            </div>
          ))}
        </div>
        
        {/* Alerta de limite atingido com estilo mais chamativo */}
        {showLimitWarning && (
          <div className="mt-3 bg-gradient-to-r from-red-50 to-yellow-50 border-l-4 border-red-500 rounded-lg p-3 text-red-800 text-sm shadow-inner">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-bold">Militares com limite de 12 serviços atingido!</p>
                <p className="mt-1 text-sm opacity-90">Não é possível adicionar mais extras para este(s) militar(es) neste mês, conforme regras do GCJO.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
