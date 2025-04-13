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

// Diálogos removidos
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
  School,
  Filter,
} from "lucide-react";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
// Import do jsPDF removido

export default function Relatorios() {
  // Hooks
  const { toast } = useToast();
  const [periodoSelecionado, setPeriodoSelecionado] = useState("atual");
  const [tipoOperacao, setTipoOperacao] = useState("todos");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [filtroTabelaMilitares, setFiltroTabelaMilitares] = useState("total"); // Filtro para tabela de militares
  
  // Obter data atual para o ano e mês
  const currentDate = new Date();
  
  // Lógica para gerenciar o período selecionado
  const [yearMonth, setYearMonth] = useState({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth()
  });
  
  // Atualizar year/month conforme o período selecionado
  useEffect(() => {
    const today = new Date();
    
    switch(periodoSelecionado) {
      case "atual":
        setYearMonth({
          year: today.getFullYear(),
          month: today.getMonth()
        });
        break;
      case "anterior":
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        setYearMonth({
          year: lastMonth.getFullYear(),
          month: lastMonth.getMonth()
        });
        break;
      case "trimestre":
        // Mantém o mês atual, mas indica visualmente que estamos mostrando dados do trimestre
        setYearMonth({
          year: today.getFullYear(),
          month: today.getMonth()
        });
        break;
      default:
        break;
    }
  }, [periodoSelecionado]);
  
  const currentYear = yearMonth.year;
  const currentMonth = yearMonth.month;
  
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
    
    // Definir o período a ser analisado com base na seleção
    let hoje = new Date();
    let mes = hoje.getMonth();
    let ano = hoje.getFullYear();
    
    // Ajustar período com base na seleção
    if (periodoSelecionado === "anterior") {
      // Mês anterior
      if (mes === 0) {
        mes = 11;
        ano--;
      } else {
        mes--;
      }
    } else if (periodoSelecionado === "trimestre") {
      // Usando mês atual, mas considerando 3 meses
      // A lógica de processamento será ajustada para considerar 3 meses
    }
    
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
      name: nome, // Nome completo com posto e graduação
      displayName: nome.split(' ').slice(-1)[0], // Pega o último nome para exibir na lista
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
  // Contagem manual de extras utilizados para cada operação
  let contadorPMF = 0;
  let contadorES = 0;
  
  // Contar extras da PMF
  Object.values(pmfSchedule).forEach(escalaDia => {
    if (Array.isArray(escalaDia)) {
      contadorPMF += escalaDia.filter(militar => militar !== null).length;
    }
  });
  
  // Contar extras da Escola Segura
  Object.values(escolaSeguraSchedule).forEach(escalaDia => {
    if (Array.isArray(escalaDia)) {
      contadorES += escalaDia.filter(militar => militar !== null).length;
    }
  });
  
  // Atualizar contadores com os valores reais
  const totalEscalasPMF = contadorPMF;
  const totalEscolasSegura = contadorES;
  const totalEscalas = totalEscalasPMF + totalEscolasSegura;
  
  console.log("Contagem real de extras PMF:", totalEscalasPMF);
  console.log("Contagem real de extras Escola Segura:", totalEscolasSegura);
  console.log("Total real de extras:", totalEscalas);
  
  // Calcular máximos possíveis e disponibilizados
  // Data atual para comparação
  const today = new Date();
  const diaAtual = today.getDate();
  const mesAtual = today.getMonth();
  const anoAtual = today.getFullYear();
  
  // Capacidade total fixa
  const capacidadeTotalPMF = 90; // Total de extras disponíveis para PMF (3 por dia * 30 dias)
  const capacidadeTotalES = 44;  // Total de extras disponíveis para Escola Segura (conforme solicitação)
  const capacidadeTotalGeral = capacidadeTotalPMF + capacidadeTotalES;
  
  // Calcular dias no mês e dias úteis
  const diasNoMes = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Determinar dias úteis (excluindo fins de semana) no mês
  const diasUteisNoMes = Array.from(Array(diasNoMes).keys())
    .map(i => i + 1)
    .filter(dia => {
      const data = new Date(currentYear, currentMonth, dia);
      const diaDaSemana = data.getDay();
      return diaDaSemana !== 0 && diaDaSemana !== 6; // Excluir domingo (0) e sábado (6)
    });
  
  // Calcular dias e dias úteis já transcorridos (para mês atual)
  let diasDecorridos = 0;
  let diasUteisDecorridos = 0;
  
  if (currentYear === anoAtual && currentMonth === mesAtual) {
    // Se estamos no mês atual, conta apenas até o dia atual
    diasDecorridos = diaAtual;
    diasUteisDecorridos = diasUteisNoMes.filter(dia => dia <= diaAtual).length;
  } else if (currentYear < anoAtual || (currentYear === anoAtual && currentMonth < mesAtual)) {
    // Se estamos em um mês passado, todos os dias já transcorreram
    diasDecorridos = diasNoMes;
    diasUteisDecorridos = diasUteisNoMes.length;
  }
  // Se estamos em um mês futuro, ambos ficam como 0
  
  // Extras totais disponibilizados até a data atual (capacidade já disponibilizada)
  const extrasDisponibilizadosPMF = 3 * diasDecorridos; // PMF 3 vagas todos os dias
  const extrasDisponibilizadosES = 2 * diasUteisDecorridos; // ES 2 vagas em dias úteis
  const totalExtrasDisponibilizados = extrasDisponibilizadosPMF + extrasDisponibilizadosES;
  
  // Percentual de preenchimento baseado no que já foi disponibilizado
  const percentualOcupacaoPMF = Math.round((totalEscalasPMF / capacidadeTotalPMF) * 100);
  const percentualOcupacaoES = Math.round((totalEscolasSegura / capacidadeTotalES) * 100);
  const percentualOcupacao = Math.round((totalEscalas / capacidadeTotalGeral) * 100);
  
  // Percentuais de utilização (baseados no que já foi disponibilizado)
  const percentualUtilizacaoPMF = extrasDisponibilizadosPMF > 0 ? 
    Math.round((totalEscalasPMF / extrasDisponibilizadosPMF) * 100) : 0;
  const percentualUtilizacaoES = extrasDisponibilizadosES > 0 ? 
    Math.round((totalEscolasSegura / extrasDisponibilizadosES) * 100) : 0;
  const percentualUtilizacaoTotal = totalExtrasDisponibilizados > 0 ? 
    Math.round((totalEscalas / totalExtrasDisponibilizados) * 100) : 0;
  
  // Vagas restantes (do total mensal)
  const restantesPMF = capacidadeTotalPMF - totalEscalasPMF;
  const restantesES = capacidadeTotalES - totalEscolasSegura;
  const restantesTotal = restantesPMF + restantesES;
  
  // Calcular militares próximos ao limite
  const militaresProximosLimite = Object.entries(dadosMilitares)
    .filter(([_, dados]) => dados.total >= 10 && dados.total < 12)
    .length;
  
  // Calcular militares no limite
  const militaresNoLimite = Object.entries(dadosMilitares)
    .filter(([_, dados]) => dados.total >= 12)
    .length;
    
  // Função auxiliar para formatar data
  const formatarData = () => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[currentMonth]} de ${currentYear}`;
  };

  // Funções de exportação de PDF removidas
  
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Relatórios e Analytics</h1>
          <p className="text-gray-500">Visualize estatísticas e análises das operações extraordinárias</p>
        </div>
      </div>
      
      {/* Cartão GCJOs Restantes que mostra o total de 134 */}
      <div className="mb-6">
        <div className="bg-green-50 rounded-lg border border-green-100 p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-green-100 rounded-full p-2">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-green-700 mb-1">GCJOs Restantes</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-3xl font-bold text-green-800">
                {restantesPMF}
              </p>
              <span className="text-sm font-normal text-green-600">PMF</span>
              
              {/* Barra de progresso para PMF */}
              <div className="mt-2 w-full bg-green-200 rounded-full h-1.5">
                <div 
                  className="bg-green-600 h-1.5 rounded-full" 
                  style={{width: `${(totalEscalasPMF / capacidadeTotalPMF) * 100}%`}}
                />
              </div>
              <p className="text-xs text-green-600 mt-1">{percentualOcupacaoPMF}% utilizado</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-800">
                {restantesES}
              </p>
              <span className="text-sm font-normal text-purple-600">Escola Segura</span>
              
              {/* Barra de progresso para Escola Segura */}
              <div className="mt-2 w-full bg-purple-200 rounded-full h-1.5">
                <div 
                  className="bg-purple-600 h-1.5 rounded-full" 
                  style={{width: `${(totalEscolasSegura / capacidadeTotalES) * 100}%`}}
                />
              </div>
              <p className="text-xs text-purple-600 mt-1">{percentualOcupacaoES}% utilizado</p>
            </div>
          </div>
          
          {/* Barra de progresso geral */}
          <div className="mt-4 pt-3 border-t border-green-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Total restante:</span>
              <span className="text-lg font-bold text-green-800">{restantesTotal} de 134</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{width: `${(totalEscalas / capacidadeTotalGeral) * 100}%`}}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">{percentualOcupacao}% dos extras utilizados</p>
          </div>
          
          <h4 className="text-sm font-semibold text-gray-800 mt-3 mb-2">Extras Restantes do Mês</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-100 rounded-md p-2 border border-green-200 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full bg-green-600 text-white text-xs font-bold py-0.5">
                RESTANTES
              </div>
              <span className="block text-lg font-bold text-green-700 mt-3">{restantesPMF}</span>
              <div className="flex items-center justify-center">
                <span className="text-xs font-medium text-green-600">PMF</span>
                <span className="text-xs text-green-500 ml-1">(de 90)</span>
              </div>
            </div>
            <div className="bg-purple-100 rounded-md p-2 border border-purple-200 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full bg-purple-600 text-white text-xs font-bold py-0.5">
                RESTANTES
              </div>
              <span className="block text-lg font-bold text-purple-700 mt-3">{restantesES}</span>
              <div className="flex items-center justify-center">
                <span className="text-xs font-medium text-purple-600">ES</span>
                <span className="text-xs text-purple-500 ml-1">(de 44)</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-md p-2 border border-blue-100 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs font-bold py-0.5">
                RESTANTES
              </div>
              <span className="block text-lg font-bold text-blue-700 mt-3">{restantesTotal}</span>
              <div className="flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">Total</span>
                <span className="text-xs text-blue-500 ml-1">(de 134)</span>
              </div>
            </div>
          </div>
        </div>
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
                                <span className="font-bold">{militar.name}</span>
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
                    <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full shadow-sm border border-gray-200">
                      <Users className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Total de</span>
                      <span className="text-lg font-bold text-blue-600 mx-1.5">{Object.values(dadosMilitares).length}</span>
                      <span className="text-sm font-medium text-gray-700">militares</span>
                    </div>
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
                <Select 
                  value={filtroTabelaMilitares} 
                  onValueChange={setFiltroTabelaMilitares}
                >
                  <SelectTrigger className="w-[180px] border-purple-200 bg-purple-50/50">
                    <Filter className="h-4 w-4 mr-2 text-purple-600" />
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">Total de Extras</SelectItem>
                    <SelectItem value="pmf">Polícia Mais Forte</SelectItem>
                    <SelectItem value="es">Escola Segura</SelectItem>
                    <SelectItem value="alfa">Ordem Alfabética</SelectItem>
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
                      .sort((a, b) => {
                        switch(filtroTabelaMilitares) {
                          case 'pmf':
                            return b[1].pmf - a[1].pmf;
                          case 'es':
                            return b[1].escolaSegura - a[1].escolaSegura;
                          case 'alfa':
                            return a[0].localeCompare(b[0]);
                          default:
                            return b[1].total - a[1].total;
                        }
                      })
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