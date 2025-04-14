import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getMonthData, getWeekdayName, getLocalStorageSchedule, saveLocalStorageSchedule } from "@/lib/utils";
import { MonthSchedule, OfficersResponse, CombinedSchedules } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import CalendarCard from "@/components/calendar/CalendarCard";
import MonthSelector from "@/components/calendar/MonthSelector";
import ResumoEscala from "@/components/calendar/ResumoEscala";
import ResumoGuarnicao from "@/components/calendar/ResumoGuarnicao";
import VerificadorInconsistencias from "@/components/calendar/VerificadorInconsistencias";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";


// API endpoint for officers
const OFFICERS_ENDPOINT = "/api/officers";
const STORAGE_KEY = "pmfSchedule";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<MonthSchedule>({});
  // Simplificamos para usar apenas PMF
  const [combinedSchedules, setCombinedSchedules] = useState<CombinedSchedules>({
    pmf: {},
    escolaSegura: {} // Mantemos por compatibilidade, mas não será usado
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
        
        // Buscar agenda específica da PMF
        const pmfResponse = await fetch(`/api/schedule?operation=pmf&year=${year}&month=${month}`);
        if (!pmfResponse.ok) throw new Error("Erro ao buscar agenda da PMF");
        
        const pmfData = await pmfResponse.json();
        if (Object.keys(pmfData.schedule).length > 0) {
          setSchedule({ [`${year}-${month}`]: pmfData.schedule });
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
          newSchedule[currentMonthKey][dayKey] = [null, null, null];
        }
        
        newSchedule[currentMonthKey][dayKey][position] = null;
        
        return newSchedule;
      });
      return;
    }
    
    // VERIFICAÇÃO CRÍTICA DE LIMITE: Este é o último ponto de verificação
    // Vamos calcular o total de escalas do militar no mês inteiro
    
    // 1. Calcular total atual do militar em todos os dias
    const pmfSchedule = combinedSchedules?.pmf?.[currentMonthKey] || {};
    let totalEscalas = 0;
    
    // Contar em todos os dias do mês
    Object.values(pmfSchedule).forEach((dayOfficers: any) => {
      if (Array.isArray(dayOfficers)) {
        // Adiciona +1 para cada aparição do militar
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
        newSchedule[currentMonthKey][dayKey] = [null, null, null];
      }
      
      newSchedule[currentMonthKey][dayKey][position] = officer;
      
      return newSchedule;
    });
  };
  
  const saveSchedule = async () => {
    try {
      // Salvar no servidor primeiro (persistência principal)
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      const monthSchedule = schedule[monthKey] || {};
      
      await apiRequest(
        'POST',
        '/api/schedule',
        {
          operation: 'pmf', // Operação PMF
          year: currentDate.getFullYear(),
          month: currentDate.getMonth(),
          data: monthSchedule
        }
      );
      
      // Backup no localStorage apenas como fallback
      saveLocalStorageSchedule(STORAGE_KEY, schedule);
      
      // Notificar sucesso
      toast({
        title: "Escala salva com sucesso!",
        description: "Suas alterações foram salvas no banco de dados e estarão disponíveis em todos os dispositivos",
        duration: 5000,
      });
      
      // Atualizar dados combinados
      const combinedResponse = await fetch(`/api/combined-schedules?year=${currentDate.getFullYear()}&month=${currentDate.getMonth()}`);
      if (combinedResponse.ok) {
        const combinedData = await combinedResponse.json();
        setCombinedSchedules(combinedData.schedules);
      }
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
      {/* Header com título e seletor de mês - versão premium e luxuosa */}
      <header className="bg-gradient-to-br from-[#0a2f6b] via-[#143d8a] to-[#1e3a8a] py-8 mb-6 shadow-xl relative overflow-hidden rounded-3xl">
        {/* Elementos decorativos de fundo aprimorados */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {/* Espaço reservado para elementos decorativos futuros */}
          
          {/* Cores institucionais mais vibrantes em círculos luminosos */}
          <div className="absolute -top-10 -left-10 w-80 h-80 bg-gradient-to-br from-blue-600 to-blue-400 opacity-10 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-gradient-to-br from-indigo-700 to-blue-500 opacity-10 rounded-full filter blur-3xl animate-pulse-slow"></div>
          
          {/* Silhueta de viatura com baixa opacidade */}
          <div className="absolute right-10 bottom-0 w-72 h-28 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNzAgMjVIMTYwTDE0MCA1MEgzMEwxMCA3MEg1QzUgNzAgNSA3NSAxMCA3NUgxOTBDMTk1IDc1IDE5NSA3MCAxOTUgNzBIMTgwTDE3MCAyNVoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik0zMCA1MEg3MEw4MCAzMEgxMzBMMTQwIDUwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjcwIiByPSIxMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PGNpcmNsZSBjeD0iMTYwIiBjeT0iNzAiIHI9IjEwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] 
            bg-no-repeat opacity-5 bg-contain bg-right-bottom"></div>
          
          {/* Elementos gráficos adicionais */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/15 to-transparent"></div>
          
          {/* Padrão geométrico sutil */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0yNSAzMGgyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIgLz4KICAgIDxwYXRoIGQ9Ik0yMCAzMGgyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIgLz4KICAgIDxwYXRoIGQ9Ik0zMCAzMGgyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIgLz4KICAgIDxwYXRoIGQ9Ik0zNSAzMGgyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIgLz4KICAgIDxwYXRoIGQ9Ik00MCAzMGgyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIgLz4KICAgIDxwYXRoIGQ9Ik0zMCAyNXYyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIgLz4KICAgIDxwYXRoIGQ9Ik0zMCAyMHYyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIgLz4KICAgIDxwYXRoIGQ9Ik0zMCAzNXYyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIgLz4KICAgIDxwYXRoIGQ9Ik0zMCA0MHYyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIgLz4KPC9zdmc+')]
            opacity-20"></div>
          

        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-wrap justify-between items-center">
            {/* Conteúdo principal modernizado */}
            <div className="relative z-10 p-5 rounded-3xl max-w-2xl">
              <div className="flex items-start gap-6">

                
                {/* Conteúdo textual modernizado */}
                <div className="flex flex-col items-start max-w-md">
                  {/* Identificação institucional */}
                  <div className="flex flex-col mb-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shadow-sm"></div>
                      <span className="text-xs tracking-wide text-white/80 font-medium">
                        20ª Companhia Independente de Polícia Militar – Muaná / Ponta de Pedras
                      </span>
                    </div>
                  </div>
                  
                  {/* Título principal com efeito de brilho reduzido em altura */}
                  <div className="relative">
                    <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-white to-blue-100
                        drop-shadow-[0_2px_2px_rgba(0,100,255,0.3)]">
                        POLÍCIA MAIS FORTE
                      </span>
                    </h1>
                    
                    {/* Reflexo sutil mais discreto */}
                    <div className="absolute -bottom-1 left-0 w-full h-3 bg-gradient-to-b from-blue-300/20 to-transparent blur-sm"></div>
                  </div>
                  
                  {/* Linha com subtítulo */}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-100">
                      Extraordinário
                    </span>
                    <div className="h-px flex-grow bg-gradient-to-r from-blue-400/50 via-white/30 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seletor de mês com estilo premium */}
            <div className="mt-4 md:mt-0">
              <MonthSelector
                currentDate={currentDate}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* SEÇÃO REDESENHADA: Dois cards principais de operações */}
      <div className="mb-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CARD 1: POLÍCIA MAIS FORTE - Estilo Limpo baseado na imagem */}
          <div className="bg-blue-700 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              {/* Cabeçalho com título e número */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Polícia Mais Forte</h3>
                  <p className="text-sm text-blue-200">Operação PMF - GCJO</p>
                </div>
                <div className="bg-blue-800 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
              </div>
              
              {/* Descrição */}
              <p className="text-sm text-blue-100 mb-6">
                Operações ostensivas de policiamento ordinário reforçado, patrulhamento 
                motorizado e saturação em pontos estratégicos com foco na prevenção criminal.
              </p>
              
              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-2xl font-bold text-white">{Object.keys(combinedSchedules?.pmf || {}).length}</div>
                  <div className="text-xs text-blue-200">Dias programados</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">90</div>
                  <div className="text-xs text-blue-200">Vagas totais</div>
                </div>
              </div>
              
              {/* Botão */}
              <a href="/" className="block text-center bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium">
                Acessar Operação 
                <svg className="inline-block w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </a>
            </div>
          </div>
          
          {/* CARD 2: ESCOLA SEGURA - Estilo Limpo baseado na imagem */}
          <div className="bg-purple-700 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              {/* Cabeçalho com título e número */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Escola Segura</h3>
                  <p className="text-sm text-purple-200">Proteção ao ambiente escolar</p>
                </div>
                <div className="bg-purple-800 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
              </div>
              
              {/* Descrição */}
              <p className="text-sm text-purple-100 mb-6">
                Operações preventivas focadas no patrulhamento escolar, proteção de estudantes e prevenção 
                à violência no ambiente educacional com interação comunitária.
              </p>
              
              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-2xl font-bold text-white">{Object.keys(combinedSchedules?.escolaSegura || {}).length}</div>
                  <div className="text-xs text-purple-200">Dias programados</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">44</div>
                  <div className="text-xs text-purple-200">Vagas totais</div>
                </div>
              </div>
              
              {/* Botão */}
              <a href="/escola-segura" className="block text-center bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-lg font-medium">
                Acessar Operação
                <svg className="inline-block w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="container mx-auto px-4 mb-8">
        {/* Barra de botões e ações */}
        <div className="bg-white p-4 mb-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Botão de salvar escala */}
            <button
              onClick={saveSchedule}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
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
                />
              </div>
              
              <div>
                <ResumoGuarnicao 
                  schedule={schedule}
                  currentDate={currentDate}
                  combinedSchedules={combinedSchedules}
                  operationType="pmf"
                />
              </div>
              
              {/* Remoção do botão de verificar conforme solicitado */}
            </div>
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoadingSchedules || isLoading ? (
            <div className="col-span-full py-20 text-center text-gray-500">
              Carregando calendário...
            </div>
          ) : (
            Array.from({ length: monthData.days }, (_, i) => i + 1).map((day) => {
              const weekday = getWeekdayName(
                day,
                currentDate.getMonth(),
                currentDate.getFullYear()
              );
              
              // Get saved selections for this day
              const dayKey = `${day}`;
              const savedSelections = schedule[currentMonthKey]?.[dayKey] || [null, null, null];
              
              return (
                <CalendarCard
                  key={`day-${day}`}
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
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
