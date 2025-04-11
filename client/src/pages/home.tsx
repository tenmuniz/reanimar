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
      // Save to localStorage
      saveLocalStorageSchedule(STORAGE_KEY, schedule);
      
      // Salvar no servidor
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
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header - Versão redesenhada com layout mais limpo */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white border-b-4 border-yellow-500 shadow-2xl relative overflow-hidden">
        {/* Padrões de fundo para dar sensação de profundidade */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+R3JpZDwvdGl0bGU+PHBhdGggZD0iTTYwIDYwSDBWMGg2MHY2MHptLTI2LThIMjZ2LTRoOHY0em0tOC0yNGg4djRoLTh2LTR6bTI0IDE2aC00djhoLTh2NGg4djhoNHYtOGg4di00aC04di04em0wLTE2djRoLTR2LTRoNHptLTI0LThWNGg4djRoLThWOHptMjQtNGgtOHY4aDR2NGg0VjR6bS0yNCAyMGg4djRoLTh2LTR6bTAgMTZ2LTRoOHY0aC04eiIgZmlsbD0iIzIwMzQ3YiIgZmlsbC1vcGFjaXR5PSIwLjIiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')]"
          style={{ opacity: 0.1 }}></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/40"></div>
        
        {/* Efeito de brilho no topo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-white to-blue-400 opacity-50"></div>
        
        <div className="container mx-auto px-4 py-6 flex flex-row items-center justify-between relative z-10">
          <div className="mr-4">
            {/* Título e subtítulo */}
            <div className="mb-1">
              {/* Título principal com efeito de brilho e sombra */}
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-300 to-white">
                  POLÍCIA MAIS FORTE
                </span>
              </h1>
            </div>
            
            {/* Subtítulo com efeito de profundidade */}
            <div className="bg-blue-800/50 px-4 py-1 rounded-lg shadow-inner transform skew-x-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-shadow-lg">
                SISTEMA DE ESCALA <span className="text-yellow-300">PMF</span>
              </h2>
            </div>
            
            {/* Badge 20ª CIPM */}
            <div className="mt-2">
              <span className="bg-yellow-500 text-blue-900 font-bold px-4 py-1 rounded-full shadow-md border border-yellow-400">
                20ª CIPM
              </span>
            </div>
          </div>
          
          {/* Seletor de mês com efeito neomórfico */}
          <div className="bg-gradient-to-b from-blue-800 to-blue-950 px-5 py-3 rounded-lg border border-blue-700 shadow-[inset_0_1px_4px_rgba(0,0,0,0.6),0_10px_20px_rgba(0,0,0,0.2)] w-64">
            <MonthSelector
              currentDate={currentDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
            />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Calendar controls - Versão melhorada com efeitos 3D */}
        <div className="mb-8 relative">
          {/* Barra decorativa para agrupar os controles */}
          <div className="absolute -left-4 -right-4 h-20 bg-gradient-to-r from-blue-800/10 via-blue-700/10 to-blue-800/10 rounded-lg -z-10 shadow-inner"></div>
          
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start items-center py-3">
            {/* Botão de salvar com efeito 3D */}
            <button
              onClick={saveSchedule}
              className="relative group overflow-hidden bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 
                text-white font-bold px-5 py-3 rounded-lg flex items-center transform transition-all duration-200 
                border border-green-400 shadow-[0_8px_0_rgb(22,101,52),0_15px_20px_rgba(0,0,0,0.3)]
                hover:shadow-[0_4px_0_rgb(22,101,52),0_8px_15px_rgba(0,0,0,0.3)]
                active:translate-y-4 active:shadow-[0_0px_0_rgb(22,101,52),0_0px_10px_rgba(0,0,0,0.2)]"
            >
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/30 to-white/0 
                transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <Save className="h-5 w-5 mr-2 drop-shadow-lg" />
              <span>Salvar Escala</span>
            </button>
            
            {/* Botões para os diálogos com estilo neomórfico */}
            <div className="flex gap-3 ml-2">
              <div className="transform hover:scale-105 active:scale-95 transition-transform duration-200">
                <ResumoEscala
                  schedule={schedule}
                  currentDate={currentDate}
                  combinedSchedules={combinedSchedules}
                />
              </div>
              
              <div className="transform hover:scale-105 active:scale-95 transition-transform duration-200">
                <ResumoGuarnicao 
                  schedule={schedule}
                  currentDate={currentDate}
                  combinedSchedules={combinedSchedules}
                />
              </div>
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
