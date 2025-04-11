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
    const cards = [];
    const emptyStartDays = monthData.firstDayOfWeek;
    const monthKey = `${monthData.year}-${monthData.month}`;
    const currentMonthSchedule = schedule[monthKey] || {};
    
    // Dias vazios no início (para alinhar o calendário)
    for (let i = 0; i < emptyStartDays; i++) {
      cards.push(
        <div key={`empty-start-${i}`} className="h-28 md:h-36"></div>
      );
    }
    
    // Dias do mês
    for (let day = 1; day <= monthData.days; day++) {
      const weekday = getWeekdayName(day, monthData.month, monthData.year);
      
      // Verificar se é final de semana e pular se for
      if (weekday === 'Dom' || weekday === 'Sáb') {
        continue; // Pula a iteração para finais de semana
      }
      
      const savedSelections = currentMonthSchedule[day] || Array(2).fill(null);
      
      cards.push(
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
    }
    
    return cards;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 flex flex-col items-center">
          <div className="flex items-center mb-4 justify-center">
            <BookOpen className="h-12 w-12 mr-3" />
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1">
                ESCOLA SEGURA
              </h1>
              <div className="text-xl sm:text-2xl font-bold">
                SISTEMA DE ESCALA PMF
              </div>
            </div>
          </div>
          
          <div className="bg-green-900 px-6 py-3 rounded-lg shadow-inner w-full max-w-md mx-auto mt-2">
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
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={saveSchedule}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow-sm transition"
              disabled={isSaving}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Escala'}
            </Button>
            
            <ResumoEscala 
              schedule={schedule} 
              currentDate={currentDate} 
              combinedSchedules={combinedSchedules}
            />
          </div>
        </div>
      
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Operação Escola Segura</AlertTitle>
          <AlertDescription className="text-green-700">
            Esta operação permite escalar até <strong>2 policiais por dia</strong>. Lembre-se que o mesmo policial não pode ultrapassar <strong>12 escalas extras no total</strong> somando PMF e Escola Segura.
          </AlertDescription>
        </Alert>
      
        <div className="grid grid-cols-5 gap-4">
          {/* Apenas dias úteis: Segunda a Sexta */}
          {["Seg", "Ter", "Qua", "Qui", "Sex"].map((day) => (
            <div key={day} className="text-center font-medium text-sm text-gray-500">
              {day}
            </div>
          ))}
          
          {loading ? (
            <div className="col-span-5 py-12 text-center text-gray-500">
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