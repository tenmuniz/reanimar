import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  BarChart,
  PieChart,
  DonutChart,
  BarList,
} from "@/components/ui/charts";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Activity,
  Users,
  Shield,
  FileText,
  ChevronRight,
  BarChart4,
  PieChart as PieChartIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Award,
  Clock,
  Download,
} from "lucide-react";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";

export default function Relatorios() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("atual");
  const [tipoOperacao, setTipoOperacao] = useState("todos");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Obter data atual para o ano e mês
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Buscar dados combinados com ano e mês específicos
  const { data: combinedSchedulesData, isLoading } = useQuery<{ schedules: CombinedSchedules }>({
    queryKey: [`/api/combined-schedules?year=${currentYear}&month=${currentMonth}`],
    refetchOnWindowFocus: false,
  });

  const { data: officersData } = useQuery<{ officers: string[] }>({
    queryKey: ["/api/officers"],
    refetchOnWindowFocus: false,
  });
  
  // Buscar escalas da PMF para o mês atual
  const { data: pmfScheduleData } = useQuery<{ schedule: Record<string, (string | null)[]> }>({
    queryKey: [`/api/schedule?operation=pmf&year=${currentYear}&month=${currentMonth}`],
    refetchOnWindowFocus: false,
  });
  
  // Buscar escalas da Escola Segura para o mês atual
  const { data: escolaSeguraScheduleData } = useQuery<{ schedule: Record<string, (string | null)[]> }>({
    queryKey: [`/api/schedule?operation=escolaSegura&year=${currentYear}&month=${currentMonth}`],
    refetchOnWindowFocus: false,
  });
  
  // Efeito para detectar quando os dados estão carregados
  useEffect(() => {
    if (pmfScheduleData && escolaSeguraScheduleData && officersData) {
      setIsInitialLoading(false);
    }
  }, [pmfScheduleData, escolaSeguraScheduleData, officersData]);
  
  // Se os dados combinados não estiverem disponíveis, usar os dados individuais
  const schedules = combinedSchedulesData?.schedules || {
    pmf: pmfScheduleData?.schedule || {},
    escolaSegura: escolaSeguraScheduleData?.schedule || {}
  };
  
  const pmfSchedule = schedules.pmf || {};
  const escolaSeguraSchedule = schedules.escolaSegura || {};
  const officers = officersData?.officers || [];
  
  // Função para gerar dados para gráficos com base nas escalas
  const gerarDadosPorMilitar = () => {
    const militares: Record<string, {pmf: number, escolaSegura: number, total: number}> = {};
    
    // Processar escala PMF
    Object.entries(pmfSchedule).forEach(([dia, escalasDia]) => {
      if (Array.isArray(escalasDia)) {
        escalasDia.forEach(militar => {
          if (militar) {
            if (!militares[militar]) {
              militares[militar] = {pmf: 0, escolaSegura: 0, total: 0};
            }
            militares[militar].pmf += 1;
            militares[militar].total += 1;
          }
        });
      }
    });
    
    // Processar escala Escola Segura
    Object.entries(escolaSeguraSchedule).forEach(([dia, escalasDia]) => {
      if (Array.isArray(escalasDia)) {
        escalasDia.forEach(militar => {
          if (militar) {
            if (!militares[militar]) {
              militares[militar] = {pmf: 0, escolaSegura: 0, total: 0};
            }
            militares[militar].escolaSegura += 1;
            militares[militar].total += 1;
          }
        });
      }
    });
    
    return militares;
  };
  
  const gerarDadosPorDia = () => {
    const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const dadosPorDiaSemana = diasSemana.map(dia => ({ name: dia, pmf: 0, escolaSegura: 0 }));
    
    const hoje = new Date();
    const mes = hoje.getMonth();
    const ano = hoje.getFullYear();
    
    // Processar escala PMF
    Object.entries(pmfSchedule).forEach(([diaStr, escalasDia]) => {
      if (Array.isArray(escalasDia)) {
        const dia = parseInt(diaStr);
        const data = new Date(ano, mes, dia);
        const diaSemana = data.getDay();
        
        // Contar militares escalados
        const militaresEscalados = escalasDia.filter(militar => militar !== null).length;
        dadosPorDiaSemana[diaSemana].pmf += militaresEscalados;
      }
    });
    
    // Processar escala Escola Segura
    Object.entries(escolaSeguraSchedule).forEach(([diaStr, escalasDia]) => {
      if (Array.isArray(escalasDia)) {
        const dia = parseInt(diaStr);
        const data = new Date(ano, mes, dia);
        const diaSemana = data.getDay();
        
        // Contar militares escalados
        const militaresEscalados = escalasDia.filter(militar => militar !== null).length;
        dadosPorDiaSemana[diaSemana].escolaSegura += militaresEscalados;
      }
    });
    
    return dadosPorDiaSemana;
  };

  // Preparar dados para visualização
  const dadosMilitares = gerarDadosPorMilitar();
  const dadosPorDia = gerarDadosPorDia();
  
  // Dados para o gráfico de barras dos militares mais escalados
  const topMilitares = Object.entries(dadosMilitares)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([nome, dados]) => ({
      name: nome.split(' ').slice(-1)[0], // Pega o último nome para economizar espaço
      value: dados.total,
      color: dados.total > 10 ? 'var(--color-amber-500)' : 'var(--color-blue-500)'
    }));
  
  // Dados para o gráfico de distribuição por operação
  const dadosOperacoes = [
    { name: 'Polícia Mais Forte', value: Object.values(dadosMilitares).reduce((sum, atual) => sum + atual.pmf, 0) },
    { name: 'Escola Segura', value: Object.values(dadosMilitares).reduce((sum, atual) => sum + atual.escolaSegura, 0) }
  ];
  
  // Dados para o gráfico de linha de tendência de escalas no mês
  const dadosTendencia = Array(30).fill(0).map((_, i) => {
    const diaKey = String(i+1);
    
    // Verificar se há escalas para o dia e se é array
    const diaPmf = pmfSchedule[diaKey] && Array.isArray(pmfSchedule[diaKey]) 
      ? pmfSchedule[diaKey].filter(m => m !== null).length 
      : 0;
      
    const diaES = escolaSeguraSchedule[diaKey] && Array.isArray(escolaSeguraSchedule[diaKey])
      ? escolaSeguraSchedule[diaKey].filter(m => m !== null).length 
      : 0;
      
    return {
      date: `${i+1}`,
      "Polícia Mais Forte": diaPmf,
      "Escola Segura": diaES
    };
  });
  
  // Dados para o gráfico de distribuição por dia da semana
  const dadosDistribuicao = dadosPorDia.map(dia => ({
    name: dia.name.substring(0, 3),
    "Polícia Mais Forte": dia.pmf,
    "Escola Segura": dia.escolaSegura
  }));
  
  // Calcular total de escalas e máximo possível
  const totalEscalasPMF = Object.values(dadosMilitares).reduce((sum, atual) => sum + atual.pmf, 0);
  const totalEscolasSegura = Object.values(dadosMilitares).reduce((sum, atual) => sum + atual.escolaSegura, 0);
  const totalEscalas = totalEscalasPMF + totalEscolasSegura;
  
  // Calcular máximos possíveis
  const diasNoMes = 30;
  const posicoesPerDay = {
    pmf: 3, // PMF tem 3 posições por dia
    escolaSegura: 2 // Escola Segura tem 2 posições por dia
  };
  
  const maximoEscalasPMF = diasNoMes * posicoesPerDay.pmf;
  const maximoEscolasSegura = diasNoMes * posicoesPerDay.escolaSegura;
  const maximoEscalasTotal = maximoEscalasPMF + maximoEscolasSegura;
  
  const percentualOcupacaoPMF = Math.round((totalEscalasPMF / maximoEscalasPMF) * 100);
  const percentualOcupacaoES = Math.round((totalEscolasSegura / maximoEscolasSegura) * 100);
  const percentualOcupacao = Math.round((totalEscalas / maximoEscalasTotal) * 100);
  
  const restantesPMF = maximoEscalasPMF - totalEscalasPMF;
  const restantesES = maximoEscolasSegura - totalEscolasSegura;
  const restantesTotal = maximoEscalasTotal - totalEscalas;
  
  // Calcular militares próximos ao limite
  const militaresProximosLimite = Object.entries(dadosMilitares)
    .filter(([_, dados]) => dados.total >= 10 && dados.total < 12)
    .length;
  
  // Calcular militares no limite
  const militaresNoLimite = Object.entries(dadosMilitares)
    .filter(([_, dados]) => dados.total >= 12)
    .length;
  
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Relatórios e Analytics</h1>
          <p className="text-gray-500">Visualize estatísticas e análises das operações extraordinárias</p>
        </div>
        <div className="flex space-x-3">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atual">Mês Atual</SelectItem>
              <SelectItem value="anterior">Mês Anterior</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={tipoOperacao} onValueChange={setTipoOperacao}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de Operação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Operações</SelectItem>
              <SelectItem value="pmf">Polícia Mais Forte</SelectItem>
              <SelectItem value="es">Escola Segura</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total de GCJO</p>
                <h3 className="text-2xl font-bold text-blue-800">{totalEscalas}</h3>
                <div className="text-xs flex items-center gap-1 text-blue-600 mt-1">
                  <span className="bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                    PMF: {totalEscalasPMF}
                  </span>
                  <span className="bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200 text-purple-600">
                    ES: {totalEscolasSegura}
                  </span>
                </div>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Activity className="h-6 w-6 text-blue-700" />
              </div>
            </div>
            <div className="mt-3 flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Total:</span>
                <Progress className="bg-blue-100" value={percentualOcupacao} />
                <span className="text-xs text-gray-500 w-12 text-right">{percentualOcupacao}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">PMF:</span>
                <Progress className="bg-blue-100" value={percentualOcupacaoPMF} />
                <span className="text-xs text-gray-500 w-12 text-right">{percentualOcupacaoPMF}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">E. Segura:</span>
                <Progress className="bg-purple-100" value={percentualOcupacaoES} />
                <span className="text-xs text-gray-500 w-12 text-right">{percentualOcupacaoES}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">GCJOs Restantes</p>
                <h3 className="text-2xl font-bold text-green-800">{restantesTotal}</h3>
                <div className="text-xs flex items-center gap-1 text-green-600 mt-1">
                  <span className="bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 text-blue-600">
                    PMF: {restantesPMF}
                  </span>
                  <span className="bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200 text-purple-600">
                    ES: {restantesES}
                  </span>
                </div>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-700" />
              </div>
            </div>
            <div className="flex flex-col mt-3 bg-green-50 rounded-lg p-2 border border-green-200">
              <h4 className="text-xs font-medium text-green-700 mb-1">Capacidade Máxima</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center bg-white rounded p-1 shadow-sm">
                  <span className="text-xs text-gray-500">PMF</span>
                  <span className="text-sm font-medium text-blue-600">{maximoEscalasPMF}</span>
                </div>
                <div className="flex flex-col items-center bg-white rounded p-1 shadow-sm">
                  <span className="text-xs text-gray-500">E.S.</span>
                  <span className="text-sm font-medium text-purple-600">{maximoEscolasSegura}</span>
                </div>
                <div className="flex flex-col items-center bg-white rounded p-1 shadow-sm">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-sm font-medium text-green-600">{maximoEscalasTotal}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">Próximo ao Limite</p>
                <h3 className="text-2xl font-bold text-amber-800">{militaresProximosLimite}</h3>
                <p className="text-xs text-amber-600 mt-1">
                  Militares com 10-11 escalas
                </p>
              </div>
              <div className="bg-amber-200 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-700" />
              </div>
            </div>
            
            <div className="mt-3">
              <div className="text-xs mb-1 font-medium text-amber-700">Distribuição de Carga</div>
              <div className="flex items-center gap-2">
                <Progress 
                  className="bg-amber-100" 
                  value={(militaresProximosLimite / Object.keys(dadosMilitares).length) * 100} 
                />
                <span className="text-xs text-gray-500">{Math.round((militaresProximosLimite / Object.keys(dadosMilitares).length) * 100)}%</span>
              </div>
              
              <div className="grid grid-cols-3 mt-2 gap-1 text-center">
                <div className="text-xs bg-green-50 p-1 rounded border border-green-100 text-green-700">
                  <div>{Object.values(dadosMilitares).filter(d => d.total < 7).length}</div>
                  <div className="text-[10px]">Baixa</div>
                </div>
                <div className="text-xs bg-amber-50 p-1 rounded border border-amber-100 text-amber-700">
                  <div>{Object.values(dadosMilitares).filter(d => d.total >= 7 && d.total <= 9).length}</div>
                  <div className="text-[10px]">Média</div>
                </div>
                <div className="text-xs bg-red-50 p-1 rounded border border-red-100 text-red-700">
                  <div>{militaresProximosLimite + militaresNoLimite}</div>
                  <div className="text-[10px]">Alta</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">No Limite</p>
                <h3 className="text-2xl font-bold text-red-800">{militaresNoLimite}</h3>
                <p className="text-xs text-red-600 mt-1">
                  Militares com 12+ escalas
                </p>
              </div>
              <div className="bg-red-200 p-3 rounded-full">
                <Clock className="h-6 w-6 text-red-700" />
              </div>
            </div>
            
            <div className="mt-3 flex flex-col space-y-2">
              <div className="flex flex-col">
                <div className="text-xs mb-1 font-medium text-red-700">Status de Alertas</div>
                <div className="flex items-center gap-2">
                  <Progress 
                    className="bg-red-100" 
                    value={(militaresNoLimite / Object.keys(dadosMilitares).length) * 100} 
                  />
                  <span className="text-xs text-gray-500">{Math.round((militaresNoLimite / Object.keys(dadosMilitares).length) * 100)}%</span>
                </div>
              </div>
              
              {militaresNoLimite > 0 ? (
                <div className="text-xs bg-red-100 p-2 rounded border border-red-200 text-red-700">
                  <div className="font-medium mb-1">⚠️ Ação Requerida</div>
                  <div>Há {militaresNoLimite} {militaresNoLimite === 1 ? 'militar' : 'militares'} que atingiram o limite máximo de GCJOs permitido.</div>
                </div>
              ) : (
                <div className="text-xs bg-green-100 p-2 rounded border border-green-200 text-green-700">
                  <div className="font-medium mb-1">✅ Situação Normal</div>
                  <div>Não há militares que atingiram o limite máximo de GCJOs.</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs de diferentes visualizações */}
      <Tabs defaultValue="distribuicao" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="distribuicao" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Distribuição de Extras</span>
          </TabsTrigger>
        </TabsList>
        

        
        {/* Conteúdo de Distribuição de Extras */}
        <TabsContent value="distribuicao" className="space-y-4">
          {/* Cards na primeira linha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Top 10 Militares Mais Escalados</CardTitle>
                <CardDescription>Ranking de militares com mais extras no período</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <div className="h-full w-full flex flex-col p-4">
                  {/* Ranking customizado de militares */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {topMilitares.map((militar, i) => {
                      const percentWidth = (militar.value / topMilitares[0].value) * 100;
                      
                      return (
                        <div key={i} className="flex items-center space-x-2">
                          <div className="w-5 flex justify-center">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${i < 3 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                              {i + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium truncate max-w-[70%]" title={militar.name}>
                                {militar.name}
                              </span>
                              <span className="text-lg font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-lg shadow-sm">
                                {militar.value}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${percentWidth}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Distribuição de Extras</CardTitle>
                <CardDescription>Militares agrupados por faixas de extras</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <div className="h-full w-full flex flex-col">
                  {/* Gráfico de distribuição customizado */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-[250px]">
                      {/* Criar um gráfico de barras horizontal simplificado */}
                      <div className="space-y-4">
                        {[
                          { name: '1-3 Extras', value: Object.values(dadosMilitares).filter(d => d.total >= 1 && d.total <= 3).length, color: "#2563eb" },
                          { name: '4-6 Extras', value: Object.values(dadosMilitares).filter(d => d.total >= 4 && d.total <= 6).length, color: "#06b6d4" },
                          { name: '7-9 Extras', value: Object.values(dadosMilitares).filter(d => d.total >= 7 && d.total <= 9).length, color: "#0d9488" },
                          { name: '10-11 Extras', value: Object.values(dadosMilitares).filter(d => d.total >= 10 && d.total <= 11).length, color: "#f59e0b" },
                          { name: '12+ Extras', value: Object.values(dadosMilitares).filter(d => d.total >= 12).length, color: "#ef4444" }
                        ].map((item, i) => {
                          // Calcular o máximo para definir as larguras relativas
                          const max = Math.max(
                            Object.values(dadosMilitares).filter(d => d.total >= 1 && d.total <= 3).length,
                            Object.values(dadosMilitares).filter(d => d.total >= 4 && d.total <= 6).length,
                            Object.values(dadosMilitares).filter(d => d.total >= 7 && d.total <= 9).length,
                            Object.values(dadosMilitares).filter(d => d.total >= 10 && d.total <= 11).length,
                            Object.values(dadosMilitares).filter(d => d.total >= 12).length
                          );
                          
                          const percentWidth = (item.value / max) * 100;
                          
                          return (
                            <div key={i} className="flex items-center">
                              <div className="w-24 text-sm truncate" title={item.name}>
                                {item.name}
                              </div>
                              <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden">
                                <div 
                                  className="h-full rounded-md flex items-center justify-end px-2 text-xs text-white font-medium transition-all relative overflow-visible"
                                  style={{ 
                                    width: `${Math.max(5, percentWidth)}%`, 
                                    backgroundColor: item.color 
                                  }}
                                >
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                                    <span className="text-white font-bold text-sm drop-shadow-md">{item.value}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <div className="text-xs text-gray-500">Total de {Object.values(dadosMilitares).length} militares</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sugestões de Otimização */}
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Sugestões de Otimização</CardTitle>
                <CardDescription>Recomendações para melhor distribuição de carga</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <h4 className="text-md font-semibold text-blue-700 mb-2 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Redistribuição de Carga
                    </h4>
                    <p className="text-sm text-blue-600 mb-3">
                      {militaresNoLimite > 0 
                        ? (
                          <span className="font-semibold">
                            <span className="inline-flex items-center justify-center bg-blue-600 text-white text-lg rounded-full h-8 w-8 mr-1">
                              {militaresNoLimite}
                            </span> 
                            militares atingiram o limite e devem ser removidos das próximas escalas.
                          </span>
                        ) 
                        : "Nenhum militar atingiu o limite máximo de extras."
                      }
                    </p>
                    <ul className="space-y-2">
                      {Object.entries(dadosMilitares)
                        .filter(([_, dados]) => dados.total >= 12)
                        .slice(0, 3)
                        .map(([nome, dados]) => (
                          <li key={nome} className="text-sm flex items-center bg-red-50 p-2 rounded-lg border border-red-100">
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                            <span><b>{nome}</b> já possui <span className="text-red-600 font-bold text-base">{dados.total}</span> extras (limite atingido)</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                  
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <h4 className="text-md font-semibold text-green-700 mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Militares Menos Utilizados
                    </h4>
                    <p className="text-sm text-green-600 mb-3 font-semibold">
                      Considere utilizar os seguintes militares nas próximas escalas:
                    </p>
                    <ul className="space-y-2">
                      {Object.entries(dadosMilitares)
                        .filter(([_, dados]) => dados.total < 5)
                        .sort((a, b) => a[1].total - b[1].total)
                        .slice(0, 5)
                        .map(([nome, dados]) => (
                          <li key={nome} className="text-sm flex items-center bg-green-50 p-2 rounded-lg border border-green-100">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="flex-1 flex justify-between items-center">
                              <b>{nome}</b>
                              <span className="inline-flex items-center justify-center bg-green-600 text-white text-sm font-bold rounded-full h-6 w-6 ml-2">
                                {dados.total}
                              </span>
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabela de distribuição por tipo de operação */}
          <div>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Distribuição por Tipo de Operação</CardTitle>
                  <CardDescription>Comparativo entre as operações para cada militar</CardDescription>
                </div>
                <Select defaultValue="total">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordernar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">Total de Extras</SelectItem>
                    <SelectItem value="pmf">Polícia Mais Forte</SelectItem>
                    <SelectItem value="es">Escola Segura</SelectItem>
                    <SelectItem value="alfa">Orderm Alfabética</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="h-[350px] overflow-y-auto px-0">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b">
                      <th className="text-left p-3">Militar</th>
                      <th className="text-center p-3">PMF</th>
                      <th className="text-center p-3">Escola Segura</th>
                      <th className="text-center p-3">Total</th>
                      <th className="text-center p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(dadosMilitares)
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([nome, dados], index) => (
                        <tr key={nome} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                          <td className="p-3 font-medium">{nome}</td>
                          <td className="p-3 text-center">
                            <span className="bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded inline-block min-w-[30px]">
                              {dados.pmf}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="bg-purple-100 text-purple-700 font-medium px-2 py-0.5 rounded inline-block min-w-[30px]">
                              {dados.escolaSegura}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="bg-gray-100 text-gray-800 font-bold px-3 py-1 rounded-lg shadow-sm inline-block min-w-[40px]">
                              {dados.total}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {dados.total >= 12 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                <Clock className="h-3 w-3 mr-1" /> Limite atingido
                              </span>
                            ) : dados.total >= 10 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                <AlertTriangle className="h-3 w-3 mr-1" /> Próximo ao limite
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" /> Disponível
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        

      </Tabs>
    </div>
  );
}