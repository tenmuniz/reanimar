import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getMonthData, getWeekdayName, getLocalStorageSchedule, saveLocalStorageSchedule } from "@/lib/utils";
import { MonthSchedule, OfficersResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Save, Printer } from "lucide-react";
import CalendarCard from "@/components/calendar/CalendarCard";
import MonthSelector from "@/components/calendar/MonthSelector";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

// API endpoint for officers
const OFFICERS_ENDPOINT = "/api/officers";
const STORAGE_KEY = "pmfSchedule";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<MonthSchedule>({});
  
  // Buscar oficiais da API
  const { data: officersData, isLoading } = useQuery<OfficersResponse>({
    queryKey: [OFFICERS_ENDPOINT],
    enabled: true,
  });
  
  const officers = officersData?.officers || [];
  
  // Get current month data
  const monthData = getMonthData(currentDate.getFullYear(), currentDate.getMonth());
  
  useEffect(() => {
    // Load saved schedule from localStorage
    const savedSchedule = getLocalStorageSchedule(STORAGE_KEY);
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    
    if (savedSchedule[currentMonthKey]) {
      setSchedule(savedSchedule);
    } else {
      setSchedule({});
    }
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
  
  const handleOfficerChange = (day: number, position: number, officer: string | null) => {
    const dayKey = `${day}`;
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    
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
      
      // In a real app, save to backend too
      // await apiRequest("POST", "/api/schedule", schedule);
      
      toast({
        title: "Escala salva com sucesso!",
        description: "Suas alterações foram salvas",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar a escala",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-[#1a56db] text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h1 className="text-xl sm:text-2xl font-bold">Escala PMF</h1>
          </div>
          
          <MonthSelector
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Calendar controls */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-lg font-medium text-gray-800">
              Escala mensal de serviço - PMF
            </h2>
            <p className="text-sm text-gray-600">
              Selecione até 3 policiais por dia
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={saveSchedule}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow-sm transition"
            >
              <Save className="h-5 w-5 mr-1" />
              Salvar
            </Button>
            
            <Button
              variant="outline"
              onClick={handlePrint}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center shadow-sm transition"
            >
              <Printer className="h-5 w-5 mr-1" />
              Imprimir
            </Button>
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: monthData.days }, (_, i) => i + 1).map((day) => {
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
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
