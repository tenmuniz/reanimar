import { useState, useEffect } from "react";
import { Shield, School, Calendar, Printer, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthSelector from "@/components/calendar/MonthSelector";
import { Badge } from "@/components/ui/badge";
import { getMonthData, formatMonthYear, getWeekdayName, getLocalStorageSchedule } from "@/lib/utils";
import { OfficersResponse, MonthSchedule, CombinedSchedules } from "@/lib/types";

// Componente de card para visualização de escalas
function VisualizacaoCard({ 
  day, 
  month, 
  year, 
  weekday, 
  pmfOfficers, 
  escolaSeguraOfficers 
}: { 
  day: number; 
  month: number; 
  year: number; 
  weekday: string; 
  pmfOfficers: (string | null)[]; 
  escolaSeguraOfficers: (string | null)[] 
}) {
  const isWeekend = weekday === 'Sábado' || weekday === 'Domingo';
  const isPMFVazio = pmfOfficers.every(officer => officer === null);
  const isEscolaSeguraVazio = escolaSeguraOfficers.every(officer => officer === null);

  return (
    <Card className={`shadow-md ${isWeekend ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
      <CardHeader className="pb-3 pt-3 px-3 bg-gradient-to-br from-gray-50 to-gray-100 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-sm font-bold flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-600" />
              <span>{day}</span>
              <span className="text-xs text-gray-500 ml-2">({weekday})</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {format(new Date(year, month - 1, day), 'dd/MM/yyyy')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 py-3 space-y-3">
        {/* Polícia Mais Forte */}
        <div>
          <div className="flex items-center space-x-1 mb-1">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-800">Polícia Mais Forte</span>
          </div>
          
          <div className="space-y-1">
            {isPMFVazio ? (
              <div className="text-xs text-gray-400 italic">Sem escalas para este dia</div>
            ) : (
              pmfOfficers.map((officer, index) => (
                officer && (
                  <div key={`pmf-${index}`} className="flex items-center">
                    <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                      {officer}
                    </Badge>
                  </div>
                )
              ))
            )}
          </div>
        </div>

        {/* Escola Segura */}
        <div>
          <div className="flex items-center space-x-1 mb-1">
            <School className="h-4 w-4 text-green-600" />
            <span className="text-xs font-semibold text-green-800">Escola Segura</span>
          </div>
          
          <div className="space-y-1">
            {isEscolaSeguraVazio ? (
              <div className="text-xs text-gray-400 italic">Sem escalas para este dia</div>
            ) : (
              escolaSeguraOfficers.map((officer, index) => (
                officer && (
                  <div key={`es-${index}`} className="flex items-center">
                    <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                      {officer}
                    </Badge>
                  </div>
                )
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para visualizar escalas por oficial
function VisualizacaoPorOficial({ 
  combinedSchedules, 
  officers, 
  currentDate 
}: { 
  combinedSchedules: CombinedSchedules; 
  officers: string[]; 
  currentDate: Date 
}) {
  // Função para obter todos os dias em que um militar está escalado
  const getDiasEscalados = (militar: string) => {
    const diasPMF: number[] = [];
    const diasEscolaSegura: number[] = [];
    
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    // Verificar em PMF
    if (combinedSchedules.pmf[monthKey]) {
      Object.entries(combinedSchedules.pmf[monthKey]).forEach(([dia, oficiais]) => {
        if (oficiais.includes(militar)) {
          diasPMF.push(parseInt(dia));
        }
      });
    }
    
    // Verificar em Escola Segura
    if (combinedSchedules.escolaSegura[monthKey]) {
      Object.entries(combinedSchedules.escolaSegura[monthKey]).forEach(([dia, oficiais]) => {
        if (oficiais.includes(militar)) {
          diasEscolaSegura.push(parseInt(dia));
        }
      });
    }
    
    return { diasPMF, diasEscolaSegura };
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-600" />
            Visualização por Militar
          </CardTitle>
          <CardDescription>
            Escalas de {formatMonthYear(currentDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {officers.map((oficial) => {
              const { diasPMF, diasEscolaSegura } = getDiasEscalados(oficial);
              const totalEscalas = diasPMF.length + diasEscolaSegura.length;
              
              // Pular militares sem escala
              if (totalEscalas === 0) return null;
              
              return (
                <Card key={oficial} className="shadow-sm">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-bold">{oficial}</CardTitle>
                    <CardDescription className="text-xs">
                      Total de escalas: {totalEscalas}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="space-y-2">
                      {diasPMF.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-1 mb-1">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-800">Polícia Mais Forte</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {diasPMF.sort((a, b) => a - b).map((dia) => (
                              <Badge key={`pmf-${dia}`} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                                Dia {dia}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {diasEscolaSegura.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-1 mb-1">
                            <School className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-semibold text-green-800">Escola Segura</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {diasEscolaSegura.sort((a, b) => a - b).map((dia) => (
                              <Badge key={`es-${dia}`} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                                Dia {dia}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Função para imprimir a página
function handlePrint() {
  window.print();
}

export default function Visualizacao() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState("calendario");
  
  // Obter oficiais
  const { data: officersData } = useQuery<OfficersResponse>({
    queryKey: ["/api/officers"],
  });

  // Obter agendas combinadas
  const { data: combinedSchedulesData, isLoading } = useQuery<{ schedules: CombinedSchedules }>({
    queryKey: ["/api/combined-schedules", currentDate.getFullYear(), currentDate.getMonth() + 1],
  });

  const officers = officersData?.officers || [];
  const combinedSchedules = combinedSchedulesData?.schedules || { pmf: {}, escolaSegura: {} };
  
  // Month data
  const monthData = getMonthData(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1
  );

  // Handler para navegação entre meses
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

  // Construir dias para visualização
  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
  const pmfSchedule = combinedSchedules.pmf[monthKey] || {};
  const escolaSeguraSchedule = combinedSchedules.escolaSegura[monthKey] || {};
  
  const days = Array.from({ length: monthData.days }, (_, i) => {
    const day = i + 1;
    return {
      day,
      weekday: getWeekdayName(day, currentDate.getMonth() + 1, currentDate.getFullYear()),
      pmfOfficers: pmfSchedule[day] || Array(3).fill(null),
      escolaSeguraOfficers: escolaSeguraSchedule[day] || Array(2).fill(null)
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">20ª CIPM - Visualização de Escalas</h1>
        <p className="text-gray-600">Sistema de Consulta de Operações</p>
        
        <div className="mt-4 flex flex-col md:flex-row justify-between items-center">
          <MonthSelector
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />
          
          <Button
            onClick={handlePrint}
            className="mt-2 md:mt-0 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Escala
          </Button>
        </div>
      </div>

      {/* Tabs para alternar visualizações */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendario" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="por-oficial" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Por Militar
          </TabsTrigger>
        </TabsList>
        
        {/* Visualização por calendário */}
        <TabsContent value="calendario" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {days.map((dayInfo) => (
              <VisualizacaoCard
                key={dayInfo.day}
                day={dayInfo.day}
                month={currentDate.getMonth() + 1}
                year={currentDate.getFullYear()}
                weekday={dayInfo.weekday}
                pmfOfficers={dayInfo.pmfOfficers}
                escolaSeguraOfficers={dayInfo.escolaSeguraOfficers}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Visualização por oficial */}
        <TabsContent value="por-oficial" className="space-y-6">
          <VisualizacaoPorOficial
            combinedSchedules={combinedSchedules}
            officers={officers}
            currentDate={currentDate}
          />
        </TabsContent>
      </Tabs>
      
      {/* Informações adicionais */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          <span className="font-semibold">Nota:</span> Este é um módulo somente de visualização.
          Para editar as escalas, acesse o sistema administrativo.
        </p>
      </div>
    </div>
  );
}