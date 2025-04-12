import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getMonthData, getWeekdayName, getLocalStorageSchedule, saveLocalStorageSchedule } from "@/lib/utils";
import { MonthSchedule, OfficersResponse, CombinedSchedules } from "@/lib/types";
import { Save, BookOpen } from "lucide-react";
import CalendarCardEscolaSegura from "@/components/calendar/CalendarCardEscolaSegura";
import MonthSelector from "@/components/calendar/MonthSelector";
import ResumoEscala from "@/components/calendar/ResumoEscala";
import ResumoGuarnicao from "@/components/calendar/ResumoGuarnicao";
import VerificadorInconsistencias from "@/components/calendar/VerificadorInconsistencias";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

// API endpoint for officers
const OFFICERS_ENDPOINT = "/api/officers";
const STORAGE_KEY = "escolaSeguraSchedule";

export default function EscolaSegura() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<MonthSchedule>({});
  // Simplificamos para usar apenas Escola Segura
  const [combinedSchedules, setCombinedSchedules] = useState<CombinedSchedules>({
    pmf: {},
    escolaSegura: {}
  });
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  
  // Buscar oficiais da API
  const { data: officersData, isLoading } = useQuery<OfficersResponse>({
    queryKey: [OFFICERS_ENDPOINT],
    enabled: true,
  });
  
  const officers = officersData?.officers || [];
  
  // Get current month data
  const monthData = getMonthData(currentDate.getFullYear(), currentDate.getMonth());
  
  // Buscar agenda combinada do servidor
  useEffect(() => {
    const fetchCombinedSchedules = async () => {
      try {
        setIsLoadingSchedules(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Buscar agenda específica da Escola Segura
        const escolaResponse = await fetch(`/api/schedule?operation=escolaSegura&year=${year}&month=${month}`);
        if (!escolaResponse.ok) throw new Error("Erro ao buscar agenda da Escola Segura");
        
        const escolaData = await escolaResponse.json();
        if (Object.keys(escolaData.schedule).length > 0) {
          setSchedule({ [`${year}-${month}`]: escolaData.schedule });
        } else {
          // Se não há dados no servidor, usar dados locais
          const savedSchedule = getLocalStorageSchedule(STORAGE_KEY);
          const currentMonthKey = `${year}-${month}`;
          
          if (savedSchedule[currentMonthKey]) {
            setSchedule(savedSchedule);
          } else {
            setSchedule({});
          }
        }
        
        // Buscar agenda combinada (PMF + Escola Segura)
        const combinedResponse = await fetch(`/api/combined-schedules?year=${year}&month=${month}`);
        if (!combinedResponse.ok) throw new Error("Erro ao buscar agendas combinadas");
        
        const combinedData = await combinedResponse.json();
        setCombinedSchedules(combinedData.schedules);
        
        setIsLoadingSchedules(false);
      } catch (error) {
        console.error("Erro ao carregar agendas:", error);
        setIsLoadingSchedules(false);
        // Em caso de erro, tentar usar dados locais
        const savedSchedule = getLocalStorageSchedule(STORAGE_KEY);
        const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
        
        if (savedSchedule[currentMonthKey]) {
          setSchedule(savedSchedule);
        } else {
          setSchedule({});
        }
      }
    };
    
    fetchCombinedSchedules();
  }, [currentDate]);
  
  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  // BLOQUEIO TOTAL: esta função é o último ponto de controle antes de adicionar um militar à escala
  const handleOfficerChange = (day: number, position: number, officer: string | null) => {
    // Verificar se a posição está dentro do limite (apenas 2 posições para Escola Segura)
    if (position >= 2) {
      console.error(`Posição ${position} não permitida. Operação Escola Segura permite apenas 2 policiais por dia.`);
      toast({
        variant: "destructive",
        title: "Limite de policiais",
        description: "Operação Escola Segura permite apenas 2 policiais por dia."
      });
      return;
    }
    
    const dayKey = `${day}`;
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    
    // Se estiver removendo um militar (officer = null), sempre permitimos
    if (officer === null) {
      setSchedule((prev) => {
        const newSchedule = { ...prev };
        
        if (!newSchedule[currentMonthKey]) {
          newSchedule[currentMonthKey] = {};
        }
        
        if (!newSchedule[currentMonthKey][dayKey]) {
          newSchedule[currentMonthKey][dayKey] = [null, null]; // Apenas 2 posições para Escola Segura
        }
        
        newSchedule[currentMonthKey][dayKey][position] = null;
        
        return newSchedule;
      });
      return;
    }
    
    // VERIFICAÇÃO CRÍTICA DE LIMITE: Este é o último ponto de verificação
    // Vamos calcular o total de escalas do militar no mês inteiro (PMF + Escola Segura)
    
    // 1. Calcular total atual do militar em TODAS as operações
    const pmfSchedule = combinedSchedules?.pmf?.[currentMonthKey] || {};
    const escolaSeguraSchedule = combinedSchedules?.escolaSegura?.[currentMonthKey] || {};
    let totalEscalas = 0;
    
    // Contar em PMF
    Object.values(pmfSchedule).forEach((dayOfficers: any) => {
      if (Array.isArray(dayOfficers)) {
        dayOfficers.forEach(off => {
          if (off === officer) {
            totalEscalas++;
          }
        });
      }
    });
    
    // Contar em Escola Segura
    Object.values(escolaSeguraSchedule).forEach((dayOfficers: any) => {
      if (Array.isArray(dayOfficers)) {
        dayOfficers.forEach(off => {
          if (off === officer) {
            totalEscalas++;
          }
        });
      }
    });
    
    // Verificar também na agenda local que ainda não foi salva no servidor
    // Exceto o próprio dia atual que estamos modificando
    const localSchedule = schedule[currentMonthKey] || {};
    Object.entries(localSchedule).forEach(([checkDay, dayOfficers]) => {
      // Ignorar o dia atual que estamos modificando para evitar contagem dupla
      if (checkDay !== dayKey && Array.isArray(dayOfficers)) {
        dayOfficers.forEach(off => {
          if (off === officer) {
            totalEscalas++;
          }
        });
      }
    });
    
    // BLOQUEIO CRÍTICO: Impedir completamente a adição se já atingiu o limite
    if (totalEscalas >= 12) {
      // PROIBIDO: Já atingiu o limite máximo!
      console.error(`🚫 BLOQUEIO TOTAL: ${officer} já atingiu o limite de 12 serviços (${totalEscalas} serviços)`);
      toast({
        variant: "destructive",
        title: "⛔ LIMITE DE 12 SERVIÇOS ATINGIDO",
        description: `${officer} já possui ${totalEscalas} serviços no mês e está BLOQUEADO para novas escalas!`
      });
      return; // Interrompe aqui - não permite de forma alguma
    }
    
    // Se passou pela verificação, podemos adicionar o militar
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      
      if (!newSchedule[currentMonthKey]) {
        newSchedule[currentMonthKey] = {};
      }
      
      if (!newSchedule[currentMonthKey][dayKey]) {
        newSchedule[currentMonthKey][dayKey] = [null, null]; // Apenas 2 posições para Escola Segura
      }
      
      newSchedule[currentMonthKey][dayKey][position] = officer;
      
      return newSchedule;
    });
  };
  
  const saveSchedule = async () => {
    try {
      // Save to localStorage
      saveLocalStorageSchedule(STORAGE_KEY, schedule);
      
      // Salvar no servidor
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      const monthSchedule = schedule[monthKey] || {};
      
      await apiRequest(
        'POST',
        '/api/schedule',
        {
          operation: 'escolaSegura', // Operação Escola Segura
          year: currentDate.getFullYear(),
          month: currentDate.getMonth(),
          data: monthSchedule
        }
      );
      
      toast({
        title: "Escala salva com sucesso!",
        description: "Suas alterações foram salvas",
      });
    } catch (error) {
      console.error("Erro ao salvar escala:", error);
      toast({
        title: "Erro ao salvar a escala",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };
  
  const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

  return (
    <div className="min-h-screen font-sans">
      {/* Header com título e seletor de mês - versão moderna e colorida para Escola Segura */}
      <header className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 py-8 mb-6 shadow-xl relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-500 opacity-20 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-indigo-600 opacity-20 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500 opacity-10 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-wrap justify-between items-center">
            {/* Título e subtítulo com design moderno */}
            <div className="relative z-10 bg-white/10 p-4 rounded-2xl backdrop-blur-md shadow-lg border border-white/20 max-w-2xl">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center mb-1 bg-purple-700/30 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-1.5"></span>
                  <span className="text-xs text-purple-100 font-medium tracking-wide">OPERAÇÃO ESCOLA SEGURA</span>
                </div>
              </div>
              
              <div className="flex flex-col items-start">
                <h1 className="text-4xl font-extrabold text-purple-100 leading-tight mb-0">ESCOLA SEGURA</h1>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1.5">•</span>
                  <span className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-100 to-indigo-200">Extraordinário</span>
                </div>
              </div>
            </div>
            
            {/* Seletor de mês com estilo premium */}
            <div className="mt-4 md:mt-0 transform translate-y-4 md:translate-y-0">
              <MonthSelector
                currentDate={currentDate}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Controles do calendário com estilo roxo/púrpura para Escola Segura */}
        <div className="mb-8">
          <div className="bg-white p-4 rounded-xl shadow-lg border border-purple-100">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Botão de salvar escala */}
              <button
                onClick={saveSchedule}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 
                  text-white px-5 py-2.5 rounded-xl flex items-center 
                  transition-all duration-200 shadow-md hover:shadow-lg
                  active:shadow-inner active:translate-y-0.5 transform"
              >
                <Save className="h-4 w-4 mr-2 drop-shadow-sm" />
                <span className="font-medium">Salvar</span>
              </button>
              
              {/* Botões de ações e análises */}
              <div className="flex gap-2 ml-1">
                <div>
                  <ResumoEscala
                    schedule={schedule}
                    currentDate={currentDate}
                    combinedSchedules={combinedSchedules}
                    operationType="escolaSegura"
                  />
                </div>
                
                <div>
                  <ResumoGuarnicao 
                    schedule={schedule}
                    currentDate={currentDate}
                    combinedSchedules={combinedSchedules}
                    operationType="escolaSegura"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Título informativo sobre dias escolares */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 border-b border-purple-300 pb-2 inline-block px-4">
            Escala <span className="text-purple-700">Escola Segura</span> - Somente Dias Úteis
          </h2>
        </div>
        
        {/* Cards organizados por semana */}
        {isLoadingSchedules || isLoading ? (
          <div className="py-20 text-center text-gray-500">
            Carregando calendário...
          </div>
        ) : (
          <div>
            {/* Processo para organizar os dias em semanas (segunda a sexta) */}
            {(() => {
              // Obter dias úteis do mês (segunda a sexta)
              const diasUteis = Array.from({ length: monthData.days }, (_, i) => i + 1)
                .map(day => {
                  const weekday = getWeekdayName(day, currentDate.getMonth(), currentDate.getFullYear());
                  return { day, weekday };
                })
                .filter(({ weekday }) => weekday !== "Sábado" && weekday !== "Domingo");
              
              // Agrupar os dias por semana
              const semanas = [];
              let semanaAtual = [];
              
              diasUteis.forEach(dia => {
                if (dia.weekday === "Segunda-feira" && semanaAtual.length > 0) {
                  semanas.push([...semanaAtual]);
                  semanaAtual = [];
                }
                semanaAtual.push(dia);
              });
              
              // Adicionar a última semana
              if (semanaAtual.length > 0) {
                semanas.push(semanaAtual);
              }
              
              // Renderizar as semanas
              return semanas.map((semana, semanaIndex) => (
                <div key={`semana-${semanaIndex}`} className="mb-10">
                  {/* Cabeçalho da semana */}
                  <div className="mb-4 border-b border-purple-300 pb-2">
                    <h3 className="text-lg font-semibold text-purple-800 px-2 inline-block">
                      Semana {semanaIndex + 1}
                    </h3>
                  </div>
                  
                  {/* Grid de dias da semana (flexbox para melhor alinhamento) */}
                  <div className="flex flex-wrap gap-4">
                    {semana.map(({ day, weekday }) => {
                      const dayKey = `${day}`;
                      const savedSelections = schedule[currentMonthKey]?.[dayKey] || [null, null];
                      
                      return (
                        <div key={`day-${day}`} className="flex-1 min-w-[250px]">
                          <CalendarCardEscolaSegura
                            day={day}
                            month={currentDate.getMonth()}
                            year={currentDate.getFullYear()}
                            weekday={weekday}
                            officers={officers}
                            savedSelections={savedSelections}
                            onOfficerChange={handleOfficerChange}
                            schedule={schedule}
                            combinedSchedules={combinedSchedules}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </main>
    </div>
  );
}