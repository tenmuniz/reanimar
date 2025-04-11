import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWeekdayClass, formatMonthYear } from "@/lib/utils";
import { CombinedSchedules } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { List, RefreshCw, Shield, BookOpen } from "lucide-react";

// Componente de visualização de escala para um dia específico
function VisualizacaoCard({ 
  day, 
  month, 
  year, 
  weekday, 
  oficiais,
  tipo
}: { 
  day: number; 
  month: number; 
  year: number; 
  weekday: string; 
  oficiais: (string | null)[]; 
  tipo: 'pmf' | 'escolaSegura';
}) {
  const weekdayClass = getWeekdayClass(weekday);
  let maxOfficers = tipo === 'pmf' ? 3 : 2;
  
  const countOfficers = oficiais.filter(Boolean).length;
  
  let cardBgClass = "bg-white";
  let statusText = "";
  
  if (countOfficers === 0) {
    statusText = "Sem escala";
    cardBgClass = "bg-gray-50";
  } else if (countOfficers < maxOfficers) {
    statusText = "Incompleto";
    cardBgClass = "bg-amber-50";
  } else {
    statusText = "Completo";
    cardBgClass = "bg-green-50";
  }
  
  return (
    <Card className={`${cardBgClass} border-2 shadow-lg hover:shadow-xl transition-all duration-200 h-full`}>
      <CardHeader className={`${weekdayClass} py-2 px-3`}>
        <div className="flex justify-between items-center">
          <div className="font-bold">{day}</div>
          <div className="text-xs">{weekday}</div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="mb-2">
          <Badge variant={countOfficers === maxOfficers ? "default" : countOfficers > 0 ? "secondary" : "outline"}>
            {statusText}
          </Badge>
        </div>
        <div className="space-y-1">
          {oficiais.map((oficial, index) => (
            <div key={index} className="text-sm p-1 rounded bg-gray-50">
              {oficial || <span className="text-gray-400">Não escalado</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de visualização por oficial
function VisualizacaoPorOficial({ 
  combinedSchedules, 
  currentDate 
}: { 
  combinedSchedules: CombinedSchedules; 
  currentDate: Date 
}) {
  // Ordenar oficiais por nome
  const oficiais = new Set<string>();
  
  // Obter todos os oficiais únicos
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  
  // PMF
  if (combinedSchedules.pmf[year]?.[month]) {
    Object.values(combinedSchedules.pmf[year][month]).forEach(dayOfficers => {
      dayOfficers.forEach(officer => {
        if (officer) oficiais.add(officer);
      });
    });
  }
  
  // Escola Segura
  if (combinedSchedules.escolaSegura[year]?.[month]) {
    Object.values(combinedSchedules.escolaSegura[year][month]).forEach(dayOfficers => {
      dayOfficers.forEach(officer => {
        if (officer) oficiais.add(officer);
      });
    });
  }
  
  const listaOficiais = Array.from(oficiais).sort();
  
  // Para cada oficial, listar os dias de PMF e Escola Segura
  const diasPorOficial: Record<string, { pmf: number[], escolaSegura: number[] }> = {};
  
  listaOficiais.forEach(oficial => {
    diasPorOficial[oficial] = {
      pmf: [],
      escolaSegura: []
    };
    
    // PMF
    if (combinedSchedules.pmf[year]?.[month]) {
      Object.entries(combinedSchedules.pmf[year][month]).forEach(([day, officers]) => {
        if (officers.includes(oficial)) {
          diasPorOficial[oficial].pmf.push(parseInt(day));
        }
      });
    }
    
    // Escola Segura
    if (combinedSchedules.escolaSegura[year]?.[month]) {
      Object.entries(combinedSchedules.escolaSegura[year][month]).forEach(([day, officers]) => {
        if (officers.includes(oficial)) {
          diasPorOficial[oficial].escolaSegura.push(parseInt(day));
        }
      });
    }
  });
  
  return (
    <div className="space-y-4">
      {listaOficiais.map(oficial => (
        <Card key={oficial} className="shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">{oficial}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Polícia Mais Forte */}
              <div>
                <div className="flex items-center mb-2">
                  <Shield className="mr-2 h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold">Polícia Mais Forte</h4>
                  <Badge variant="outline" className="ml-2">
                    {diasPorOficial[oficial].pmf.length} dias
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {diasPorOficial[oficial].pmf.length > 0 ? (
                    diasPorOficial[oficial].pmf.sort((a, b) => a - b).map(dia => (
                      <Badge key={`pmf-${dia}`} variant="secondary">
                        {dia}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">Nenhuma escala</span>
                  )}
                </div>
              </div>
              
              {/* Escola Segura */}
              <div>
                <div className="flex items-center mb-2">
                  <BookOpen className="mr-2 h-4 w-4 text-green-600" />
                  <h4 className="font-semibold">Escola Segura</h4>
                  <Badge variant="outline" className="ml-2">
                    {diasPorOficial[oficial].escolaSegura.length} dias
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {diasPorOficial[oficial].escolaSegura.length > 0 ? (
                    diasPorOficial[oficial].escolaSegura.sort((a, b) => a - b).map(dia => (
                      <Badge key={`es-${dia}`} variant="secondary">
                        {dia}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">Nenhuma escala</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Total de escalas */}
            <div className="mt-4 pt-2 border-t flex items-center">
              <Badge variant="outline" className="bg-gray-50">
                Total: {diasPorOficial[oficial].pmf.length + diasPorOficial[oficial].escolaSegura.length} escalas
              </Badge>
              
              {diasPorOficial[oficial].pmf.length + diasPorOficial[oficial].escolaSegura.length >= 12 && (
                <Badge variant="destructive" className="ml-2">
                  Limite atingido
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Componente principal de visualização
export default function Visualizacao() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Configurar atualização automática a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, []);
  
  // Obter dados das escalas combinadas
  const { data: combinedSchedulesData, isLoading } = useQuery<{ schedules: CombinedSchedules }>({
    queryKey: ['/api/combined-schedules', refreshKey, { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1 }],
    queryFn: async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await fetch(`/api/combined-schedules?year=${year}&month=${month}`);
      
      if (!res.ok) {
        throw new Error('Falha ao buscar escalas');
      }
      
      return res.json();
    }
  });
  
  const combinedSchedules = combinedSchedulesData?.schedules || { pmf: {}, escolaSegura: {} };
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  
  // Calcular dias do mês
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Atualizado",
      description: "Os dados de escala foram atualizados.",
      duration: 3000,
    });
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 text-transparent bg-clip-text">
            Escalas de Operações - {formatMonthYear(currentDate)}
          </h1>
          <p className="text-gray-500 mt-1">
            Visualize as escalas de Polícia Mais Forte e Escola Segura
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm transition-colors"
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
          <span className="ml-3 text-gray-500">Carregando escalas...</span>
        </div>
      ) : (
        <Tabs defaultValue="pmf">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="pmf" className="flex items-center">
                <Shield className="mr-1 h-4 w-4" />
                <span>Polícia Mais Forte</span>
              </TabsTrigger>
              <TabsTrigger value="escolaSegura" className="flex items-center">
                <BookOpen className="mr-1 h-4 w-4" />
                <span>Escola Segura</span>
              </TabsTrigger>
              <TabsTrigger value="porOficial" className="flex items-center">
                <List className="mr-1 h-4 w-4" />
                <span>Por Oficial</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="pmf">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              {days.map(day => {
                const weekday = new Date(year, month - 1, day).toLocaleDateString('pt-BR', { weekday: 'short' });
                const officers = combinedSchedules.pmf[year]?.[month]?.[day] || [null, null, null];
                
                return (
                  <VisualizacaoCard 
                    key={`pmf-${day}`}
                    day={day}
                    month={month}
                    year={year}
                    weekday={weekday}
                    oficiais={officers}
                    tipo="pmf"
                  />
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="escolaSegura">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              {days.map(day => {
                const weekday = new Date(year, month - 1, day).toLocaleDateString('pt-BR', { weekday: 'short' });
                const officers = combinedSchedules.escolaSegura[year]?.[month]?.[day] || [null, null];
                
                return (
                  <VisualizacaoCard 
                    key={`es-${day}`}
                    day={day}
                    month={month}
                    year={year}
                    weekday={weekday}
                    oficiais={officers}
                    tipo="escolaSegura"
                  />
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="porOficial">
            <VisualizacaoPorOficial 
              combinedSchedules={combinedSchedules}
              currentDate={currentDate}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}