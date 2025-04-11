import { useState, useEffect } from "react";
import { Calendar, CalendarPlus, BookOpen, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { getMonthData, getWeekdayName, formatMonthYear, getLocalStorageSchedule, saveLocalStorageSchedule } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { MonthSchedule, DaySchedule, MonthData, CombinedSchedules } from "@/lib/types";
import CalendarCardEscolaSegura from "@/components/calendar/CalendarCardEscolaSegura";
import MonthSelector from "@/components/calendar/MonthSelector";
import ResumoEscala from "@/components/calendar/ResumoEscala";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EscolaSegura() {
  const { toast } = useToast();
  const [officers, setOfficers] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [monthData, setMonthData] = useState<MonthData>({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
    days: 0,
    firstDayOfWeek: 0
  });
  const [schedule, setSchedule] = useState<MonthSchedule>({});
  const [combinedSchedules, setCombinedSchedules] = useState<CombinedSchedules>({
    pmf: {},
    escolaSegura: {}
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Buscar a lista de oficiais
  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const response = await fetch('/api/officers');
        if (!response.ok) throw new Error("Erro ao buscar oficiais");
        
        const data = await response.json();
        setOfficers(data.officers);
      } catch (error) {
        console.error("Erro ao carregar lista de oficiais:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar lista de oficiais",
          variant: "destructive",
        });
      }
    };
    
    fetchOfficers();
  }, [toast]);

  // Atualizar dados do mês quando a data mudar
  useEffect(() => {
    const newMonthData = getMonthData(currentDate.getFullYear(), currentDate.getMonth());
    setMonthData(newMonthData);
    setLoading(true);
    
    // Buscar agenda salva para este mês
    const fetchSchedule = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Buscar agenda combinada do servidor (PMF + Escola Segura)
        const response = await fetch(`/api/combined-schedules?year=${year}&month=${month}`);
        if (!response.ok) throw new Error("Erro ao buscar agendas combinadas");
        
        const data = await response.json();
        setCombinedSchedules(data.schedules);
        
        // Buscar agenda específica da Escola Segura
        const escolaResponse = await fetch(`/api/schedule?operation=escolaSegura&year=${year}&month=${month}`);
        if (!escolaResponse.ok) throw new Error("Erro ao buscar agenda da Escola Segura");
        
        const escolaData = await escolaResponse.json();
        
        // Verificar se temos dados salvos, caso contrário criar estrutura vazia
        if (Object.keys(escolaData.schedule).length > 0) {
          setSchedule({ [`${year}-${month}`]: escolaData.schedule });
        } else {
          setSchedule({ [`${year}-${month}`]: {} });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar agenda:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados da agenda",
          variant: "destructive",
        });
        
        // Em caso de erro, criar uma estrutura vazia
        setSchedule({ [`${currentDate.getFullYear()}-${currentDate.getMonth()}`]: {} });
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, [currentDate, toast]);

  // Navegar para o mês anterior
  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };

  // Navegar para o próximo mês
  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };

  // Atualizar escala quando um oficial é selecionado
  const handleOfficerChange = (day: number, position: number, officer: string | null) => {
    const monthKey = `${monthData.year}-${monthData.month}`;
    const currentMonthSchedule = { ...(schedule[monthKey] || {}) };
    
    // Inicializa o dia se necessário
    if (!currentMonthSchedule[day]) {
      currentMonthSchedule[day] = Array(2).fill(null);  // 2 posições para Escola Segura
    }
    
    // Atualiza a posição específica
    currentMonthSchedule[day][position] = officer;
    
    // Atualiza o estado
    setSchedule({
      ...schedule,
      [monthKey]: currentMonthSchedule
    });
  };

  // Salvar escala no servidor
  const saveSchedule = async () => {
    try {
      setIsSaving(true);
      const monthKey = `${monthData.year}-${monthData.month}`;
      const monthSchedule = schedule[monthKey] || {};
      
      // Envia para o servidor
      await apiRequest(
        'POST',
        '/api/schedule',
        {
          operation: 'escolaSegura',
          year: monthData.year,
          month: monthData.month,
          data: monthSchedule
        }
      );
      
      toast({
        title: "Salvo com sucesso",
        description: "A escala da Escola Segura foi salva",
      });
      
      setIsSaving(false);
    } catch (error) {
      console.error("Erro ao salvar escala:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar a escala",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  // Gerar cards do calendário
  const generateCalendarCards = () => {
    const cards: React.ReactNode[] = [];
    const monthKey = `${monthData.year}-${monthData.month}`;
    const currentMonthSchedule = schedule[monthKey] || {};
    
    // Armazenar as posições de grid para dias úteis
    let gridPositions: { day: number; position: number; weekday: string }[] = [];
    
    // Calcular posições de grid para apenas dias úteis
    let currentGridPos = 0;
    for (let day = 1; day <= monthData.days; day++) {
      const weekday = getWeekdayName(day, monthData.month, monthData.year);
      
      // Se for o primeiro dia do mês, adicione os espaços vazios iniciais
      if (day === 1) {
        currentGridPos = monthData.firstDayOfWeek;
      }
      
      // Verificar se é dia útil (não é final de semana)
      if (weekday !== 'Dom' && weekday !== 'Sáb') {
        gridPositions.push({
          day,
          position: currentGridPos,
          weekday
        });
      }
      
      // Avançar para o próximo dia da semana
      currentGridPos = (currentGridPos + 1) % 7;
    }
    
    // Criar array de tamanho 7 x (número de semanas necessárias)
    const totalWeeks = Math.ceil((gridPositions.length > 0 ? 
      gridPositions[gridPositions.length - 1].position + 1 : 0) / 7);
    const totalCells = totalWeeks * 7;
    
    // Inicializar todas as células como vazias
    const allCells = Array(totalCells).fill(null);
    
    // Adicionar os dias úteis nas posições corretas
    gridPositions.forEach(({ day, position, weekday }) => {
      const savedSelections = currentMonthSchedule[day] || Array(2).fill(null);
      
      allCells[position] = (
        <CalendarCardEscolaSegura
          key={`day-${day}`}
          day={day}
          month={monthData.month}
          year={monthData.year}
          weekday={weekday}
          officers={officers}
          savedSelections={savedSelections}
          onOfficerChange={handleOfficerChange}
          combinedSchedules={combinedSchedules}
        />
      );
    });
    
    // Converter as células para o layout final
    allCells.forEach((cell, index) => {
      if (cell === null) {
        cards.push(<div key={`empty-${index}`} className="h-28 md:h-36"></div>);
      } else {
        cards.push(cell);
      }
    });
    
    return cards;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header - Redesenhado para combinar com o estilo da página inicial */}
      <header className="bg-gradient-to-r from-green-900 via-green-700 to-green-800 text-white border-b-4 border-yellow-500 shadow-2xl relative overflow-hidden">
        {/* Padrões de fundo para dar sensação de profundidade */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+R3JpZDwvdGl0bGU+PHBhdGggZD0iTTYwIDYwSDBWMGg2MHY2MHptLTI2LThIMjZ2LTRoOHY0em0tOC0yNGg4djRoLTh2LTR6bTI0IDE2aC00djhoLTh2NGg4djhoNHYtOGg4di00aC04di04em0wLTE2djRoLTR2LTRoNHptLTI0LThWNGg4djRoLThWOHptMjQtNGgtOHY4aDR2NGg0VjR6bS0yNCAyMGg4djRoLTh2LTR6bTAgMTZ2LTRoOHY0aC04eiIgZmlsbD0iIzE4NTUzMyIgZmlsbC1vcGFjaXR5PSIwLjIiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')]"
          style={{ opacity: 0.1 }}></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/40"></div>
        
        {/* Efeito de brilho no topo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-white to-green-400 opacity-50"></div>
        
        <div className="container mx-auto px-4 py-6 flex flex-row items-center justify-between relative z-10">
          <div className="mr-4">
            {/* Destaque para 20ª CIPM e Escola Segura */}
            <div className="flex items-baseline mb-2">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-[0_0_30px_rgba(22,163,74,0.5)]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-300 to-white">
                  20ª CIPM
                </span>
              </h1>
              <span className="ml-2 bg-green-700 text-white font-bold px-3 py-1 rounded-md shadow-lg text-xs">
                ESCOLA SEGURA
              </span>
            </div>
            
            {/* Subtítulo com efeito de profundidade */}
            <div className="bg-green-800/50 px-4 py-2 rounded-lg shadow-inner transform skew-x-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-shadow-lg flex items-center">
                SISTEMA DE ESCALA 
                <span className="ml-2 bg-yellow-500 text-green-900 font-bold text-sm px-2 py-0.5 rounded-full shadow-md border border-yellow-400">
                  PMF
                </span>
              </h2>
            </div>
          </div>
          
          {/* Seletor de mês com efeito neomórfico */}
          <div className="bg-gradient-to-b from-green-800 to-green-950 px-5 py-3 rounded-lg border border-green-700 shadow-[inset_0_1px_4px_rgba(0,0,0,0.6),0_10px_20px_rgba(0,0,0,0.2)] w-64">
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
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-lg font-medium text-gray-800">
              Escala mensal de serviço - Escola Segura
            </h2>
            <p className="text-sm text-gray-600">
              Selecione até 2 policiais por dia (dias úteis apenas)
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Botão de salvar com efeito 3D */}
            <button
              onClick={saveSchedule}
              disabled={isSaving}
              className="relative group overflow-hidden bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 
                text-white font-bold px-5 py-3 rounded-lg flex items-center transform transition-all duration-200 
                border border-green-400 shadow-[0_8px_0_rgb(22,101,52),0_15px_20px_rgba(0,0,0,0.3)]
                hover:shadow-[0_4px_0_rgb(22,101,52),0_8px_15px_rgba(0,0,0,0.3)]
                active:translate-y-4 active:shadow-[0_0px_0_rgb(22,101,52),0_0px_10px_rgba(0,0,0,0.2)]
                disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/30 to-white/0 
                transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <CalendarPlus className="h-5 w-5 mr-2 drop-shadow-lg" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Escala'}</span>
            </button>
            
            {/* Botão para ResumoEscala com estilo neomórfico */}
            <div className="transform hover:scale-105 active:scale-95 transition-transform duration-200">
              <ResumoEscala 
                schedule={schedule} 
                currentDate={currentDate} 
                combinedSchedules={combinedSchedules}
              />
            </div>
          </div>
        </div>
      
        {/* Barra decorativa para agrupar os controles */}
        <div className="mb-8 relative">
          <div className="absolute -left-4 -right-4 h-full bg-gradient-to-r from-green-800/10 via-green-700/10 to-green-800/10 rounded-lg -z-10 shadow-inner"></div>
          
          <div className="relative bg-gradient-to-r from-green-100 to-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-md overflow-hidden">
            {/* Faixa decorativa */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 shadow-inner"></div>
            
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full shadow-inner mr-4 flex-shrink-0">
                <BookOpen className="h-6 w-6 text-green-700" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-1">Operação Escola Segura</h3>
                <p className="text-green-800">
                  Esta operação permite escalar até <strong>2 policiais por dia</strong>, somente em dias úteis.
                </p>
                <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 rounded-r-md">
                  <p className="text-yellow-800 font-medium text-sm">
                    Importante: O limite de <span className="font-bold">12 escalas extras no mês</span> é compartilhado entre PMF e Escola Segura.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      
        <div className="grid grid-cols-7 gap-4">
          {/* Cabeçalhos dos dias da semana - destacando dias úteis */}
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className={`text-center font-medium text-sm ${
              day === "Dom" || day === "Sáb" 
                ? "text-gray-300" // Finais de semana em cinza claro
                : "text-gray-700" // Dias úteis em cinza escuro
            }`}>
              {day}
            </div>
          ))}
          
          {loading ? (
            <div className="col-span-7 py-12 text-center text-gray-500">
              Carregando calendário...
            </div>
          ) : (
            generateCalendarCards()
          )}
        </div>
      </main>
    </div>
  );
}