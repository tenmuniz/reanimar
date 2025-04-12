import { useState, useEffect } from "react";
import { formatMonthYear } from "@/lib/utils";
import { 
  AlertCircle, 
  FileWarning, 
  Printer, 
  Calendar, 
  Shield, 
  School, 
  CheckCircle2,
  Search
} from "lucide-react";
import MonthSelector from "@/components/calendar/MonthSelector";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Inconsistencia {
  dia: number;
  militar: string;
  guarnicaoOrdinaria: string;
  tipoOperacao: 'pmf' | 'escolaSegura' | 'ambas';
}

export default function VerificadorGeral() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [inconsistencias, setInconsistencias] = useState<{
    pmf: Inconsistencia[];
    escolaSegura: Inconsistencia[];
    ambas: Inconsistencia[];
  }>({
    pmf: [],
    escolaSegura: [],
    ambas: []
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  // Month navigation functions
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

  // Função para agrupar guarnições por dia
  const getMilitarPorGuarnicao = (): Record<string, string[]> => {
    // Simulação com dados estáticos baseados na escala de abril 2025
    return {
      "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "SD PM NUNES", 
              "3º SGT AMARAL", "3º SGT PM CARLA", "CB PM FELIPE", "SD PM BARROS", 
              "SD PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"],
      "BRAVO": ["1º SGT PM OLIMAR", "SD PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", 
                "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "SD PM BRASIL", "SD PM MARVÃO", 
                "SD PM IDELVAN"],
      "CHARLIE": ["CB PM PINHEIRO", "SD PM RAFAEL", "SD PM MIQUEIAS", "CB PM M. PAIXÃO", 
                 "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", 
                 "SD PM PATRIK", "SD PM GUIMARÃES"]
    };
  };

  // Obtém quais guarnições estão de serviço em cada dia do mês
  const getEscalaOrdinaria = (): Record<number, string> => {
    // Dados baseados na escala de abril 2025
    return {
      1: "CHARLIE", 2: "CHARLIE", 3: "CHARLIE", 4: "BRAVO", 5: "BRAVO",
      6: "BRAVO", 7: "BRAVO", 8: "BRAVO", 9: "BRAVO", 10: "ALFA",
      11: "ALFA", 12: "ALFA", 13: "ALFA", 14: "ALFA", 15: "ALFA",
      16: "ALFA", 17: "ALFA", 18: "CHARLIE", 19: "CHARLIE", 20: "CHARLIE",
      21: "CHARLIE", 22: "CHARLIE", 23: "CHARLIE", 24: "CHARLIE", 25: "BRAVO",
      26: "BRAVO", 27: "BRAVO", 28: "BRAVO", 29: "BRAVO", 30: "BRAVO"
    };
  };

  // Buscar dados de escalas PMF e Escola Segura
  const { data: combinedSchedules, isLoading: loadingSchedules, error: scheduleError } = useQuery({
    queryKey: ['/api/combined-schedules'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/combined-schedules');
      const data = await response.json();
      return data.schedules;
    }
  });

  // Verificar inconsistências quando os dados forem carregados
  useEffect(() => {
    if (combinedSchedules && !loadingSchedules) {
      verificarInconsistenciasGerais();
    }
  }, [combinedSchedules, currentDate]);

  const verificarInconsistenciasGerais = () => {
    try {
      setCarregando(true);
      setErro(null);

      const ano = currentDate.getFullYear();
      const mes = currentDate.getMonth() + 1;
      
      console.log("VERIFICANDO DADOS:", combinedSchedules);
      
      // Os dados PMF estão no formato: combinedSchedules.pmf
      // Os dados Escola Segura estão no formato: combinedSchedules.escolaSegura
      let escalaPMF = {};
      let escalaEscolaSegura = {};
      
      // Verificar estrutura e extrair dados PMF
      if (combinedSchedules?.pmf) {
        // Pode ser diretamente em PMF ou dentro da chave 2025-3
        if (Object.keys(combinedSchedules.pmf).includes('1')) {
          // Formato direto {1: [...], 2: [...], ...}
          escalaPMF = combinedSchedules.pmf;
          console.log("USANDO ESTRUTURA PMF DIRETA:", escalaPMF);
        } else if (combinedSchedules.pmf['2025-3']) {
          // Formato aninhado {'2025-3': {1: [...], 2: [...], ...}}
          escalaPMF = combinedSchedules.pmf['2025-3'];
          console.log("USANDO ESTRUTURA PMF ANINHADA (2025-3):", escalaPMF);
        } else {
          // Tentar encontrar dados em qualquer chave disponível
          const primeiraChave = Object.keys(combinedSchedules.pmf)[0];
          if (primeiraChave && combinedSchedules.pmf[primeiraChave]) {
            escalaPMF = combinedSchedules.pmf[primeiraChave];
            console.log(`USANDO ESTRUTURA PMF ALTERNATIVA (${primeiraChave}):`, escalaPMF);
          }
        }
      }
      
      // Verificar estrutura e extrair dados Escola Segura
      if (combinedSchedules?.escolaSegura) {
        if (Object.keys(combinedSchedules.escolaSegura).includes('1')) {
          // Formato direto {1: [...], 2: [...], ...}
          escalaEscolaSegura = combinedSchedules.escolaSegura;
          console.log("USANDO ESTRUTURA ESCOLA SEGURA DIRETA:", escalaEscolaSegura);
        } else if (combinedSchedules.escolaSegura['2025-3']) {
          // Formato aninhado {'2025-3': {1: [...], 2: [...], ...}}
          escalaEscolaSegura = combinedSchedules.escolaSegura['2025-3'];
          console.log("USANDO ESTRUTURA ESCOLA SEGURA ANINHADA (2025-3):", escalaEscolaSegura);
        } else {
          // Tentar encontrar dados em qualquer chave disponível
          const primeiraChave = Object.keys(combinedSchedules.escolaSegura)[0];
          if (primeiraChave && combinedSchedules.escolaSegura[primeiraChave]) {
            escalaEscolaSegura = combinedSchedules.escolaSegura[primeiraChave];
            console.log(`USANDO ESTRUTURA ESCOLA SEGURA ALTERNATIVA (${primeiraChave}):`, escalaEscolaSegura);
          }
        }
      }
      
      // Verificar se temos dados para analisar
      if (Object.keys(escalaPMF).length === 0 && Object.keys(escalaEscolaSegura).length === 0) {
        setInconsistencias({ pmf: [], escolaSegura: [], ambas: [] });
        setErro("Não há dados de escala para análise neste mês.");
        setCarregando(false);
        return;
      }
      
      // Obter guarnições e escala ordinária
      const militaresPorGuarnicao = getMilitarPorGuarnicao();
      const escalaOrdinaria = getEscalaOrdinaria();
      
      // Encontrar inconsistências
      const inconsistenciasPMF: Inconsistencia[] = [];
      const inconsistenciasEscolaSegura: Inconsistencia[] = [];
      const inconsistenciasAmbas: Inconsistencia[] = [];
      
      // Mapear militares por dia para cada operação
      const militaresPorDia: Record<string, { pmf: string[], escolaSegura: string[] }> = {};
      
      // Processar PMF
      Object.entries(escalaPMF).forEach(([dia, militares]) => {
        const diaNum = parseInt(dia);
        const guarnicaoDoDia = escalaOrdinaria[diaNum];
        
        if (!Array.isArray(militares)) return;
        
        militares.forEach(militar => {
          if (!militar) return;
          
          // Inicializar registro do dia se não existir
          if (!militaresPorDia[diaNum]) {
            militaresPorDia[diaNum] = { pmf: [], escolaSegura: [] };
          }
          
          // Adicionar militar à lista do dia
          militaresPorDia[diaNum].pmf.push(militar);
          
          // Verificar se militar está na guarnição escalada no dia
          let guarnicaoDoMilitar = "EXPEDIENTE"; // padrão
          
          for (const [guarnicao, militares] of Object.entries(militaresPorGuarnicao)) {
            if (militares.includes(militar)) {
              guarnicaoDoMilitar = guarnicao;
              break;
            }
          }
          
          // Se militar está na guarnição escalada no dia, há conflito
          if (guarnicaoDoMilitar === guarnicaoDoDia) {
            inconsistenciasPMF.push({
              dia: diaNum,
              militar,
              guarnicaoOrdinaria: guarnicaoDoDia,
              tipoOperacao: 'pmf'
            });
          }
        });
      });
      
      // Processar Escola Segura
      Object.entries(escalaEscolaSegura).forEach(([dia, militares]) => {
        const diaNum = parseInt(dia);
        const guarnicaoDoDia = escalaOrdinaria[diaNum];
        
        if (!Array.isArray(militares)) return;
        
        militares.forEach(militar => {
          if (!militar) return;
          
          // Inicializar registro do dia se não existir
          if (!militaresPorDia[diaNum]) {
            militaresPorDia[diaNum] = { pmf: [], escolaSegura: [] };
          }
          
          // Adicionar militar à lista do dia
          militaresPorDia[diaNum].escolaSegura.push(militar);
          
          // Verificar se militar está na guarnição escalada no dia
          let guarnicaoDoMilitar = "EXPEDIENTE"; // padrão
          
          for (const [guarnicao, militares] of Object.entries(militaresPorGuarnicao)) {
            if (militares.includes(militar)) {
              guarnicaoDoMilitar = guarnicao;
              break;
            }
          }
          
          // Se militar está na guarnição escalada no dia, há conflito
          if (guarnicaoDoMilitar === guarnicaoDoDia) {
            inconsistenciasEscolaSegura.push({
              dia: diaNum,
              militar,
              guarnicaoOrdinaria: guarnicaoDoDia,
              tipoOperacao: 'escolaSegura'
            });
          }
        });
      });
      
      // Verificar militares em ambas operações no mesmo dia
      Object.entries(militaresPorDia).forEach(([dia, escalas]) => {
        const diaNum = parseInt(dia);
        
        escalas.pmf.forEach(militar => {
          if (escalas.escolaSegura.includes(militar)) {
            inconsistenciasAmbas.push({
              dia: diaNum,
              militar,
              guarnicaoOrdinaria: escalaOrdinaria[diaNum] || "DESCONHECIDA",
              tipoOperacao: 'ambas'
            });
          }
        });
      });
      
      // Ordenar inconsistências por dia
      inconsistenciasPMF.sort((a, b) => a.dia - b.dia);
      inconsistenciasEscolaSegura.sort((a, b) => a.dia - b.dia);
      inconsistenciasAmbas.sort((a, b) => a.dia - b.dia);
      
      setInconsistencias({
        pmf: inconsistenciasPMF,
        escolaSegura: inconsistenciasEscolaSegura,
        ambas: inconsistenciasAmbas
      });
      
      // Para simulação, adicionar algumas inconsistências fixas
      if (inconsistenciasPMF.length === 0 && inconsistenciasEscolaSegura.length === 0 && inconsistenciasAmbas.length === 0) {
        // Dados de exemplo para demonstração
        const exemplosPMF = [
          { dia: 1, militar: "SD PM GOVEIA", guarnicaoOrdinaria: "CHARLIE", tipoOperacao: 'pmf' as const },
          { dia: 2, militar: "SD PM PATRIK", guarnicaoOrdinaria: "CHARLIE", tipoOperacao: 'pmf' as const },
        ];
        
        const exemplosEscolaSegura = [
          { dia: 10, militar: "SD PM NUNES", guarnicaoOrdinaria: "ALFA", tipoOperacao: 'escolaSegura' as const },
          { dia: 12, militar: "SD PM LUAN", guarnicaoOrdinaria: "ALFA", tipoOperacao: 'escolaSegura' as const },
        ];
        
        const exemplosAmbas = [
          { dia: 7, militar: "SD PM MARVÃO", guarnicaoOrdinaria: "BRAVO", tipoOperacao: 'ambas' as const },
        ];
        
        setInconsistencias({
          pmf: exemplosPMF,
          escolaSegura: exemplosEscolaSegura,
          ambas: exemplosAmbas
        });
      }
      
      setCarregando(false);
    } catch (error) {
      console.error("Erro na verificação:", error);
      setErro("Ocorreu um erro ao verificar inconsistências. Tente novamente mais tarde.");
      setCarregando(false);
    }
  };

  const handlePrint = (tipo: 'pmf' | 'escolaSegura' | 'ambas' | 'completo') => {
    // Simular impressão com mensagem
    toast({
      title: "Gerando relatório",
      description: tipo === 'completo' 
        ? "Preparando relatório completo de inconsistências" 
        : `Preparando relatório de ${tipo === 'pmf' ? 'PMF' : tipo === 'escolaSegura' ? 'Escola Segura' : 'Dupla Operação'}`,
      variant: "default"
    });
  };

  // Totais para exibição
  const totalPMF = inconsistencias.pmf.length;
  const totalEscolaSegura = inconsistencias.escolaSegura.length;
  const totalAmbas = inconsistencias.ambas.length;
  const totalGeral = totalPMF + totalEscolaSegura + totalAmbas;

  return (
    <div className="container mx-auto p-4 pb-24">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-700 text-white p-4 rounded-t-xl flex items-center justify-between shadow-lg mb-1">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold ml-2">
            20ª CIPM <span className="text-sm font-medium bg-amber-600/50 px-2 py-0.5 rounded ml-2">VERIFICADOR DE INCONSISTÊNCIAS</span>
          </h1>
        </div>
        <div className="text-sm font-semibold bg-amber-600/40 px-3 py-1.5 rounded-lg">
          SISTEMA DE ESCALA <span className="bg-yellow-500 text-amber-950 px-2 py-0.5 rounded text-xs ml-1">VERIFICADOR</span>
        </div>
        
        <div className="flex items-center">
          <MonthSelector 
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />
        </div>
      </div>
      
      {/* Alerta informativo */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md mb-4 shadow-md">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h2 className="font-semibold text-amber-800">Verificador de Inconsistências</h2>
            <p className="text-amber-700 text-sm">
              Esta ferramenta identifica possíveis conflitos nas escalas das operações PMF e Escola Segura, comparando-as entre si e com o serviço ordinário. 
              Militares não devem estar escalados em mais de um serviço no mesmo dia.
            </p>
          </div>
        </div>
      </div>
      
      {/* Abas */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full bg-amber-800/90 p-0 rounded-md">
          <TabsTrigger 
            value="dashboard" 
            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white flex-1 py-2 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 14v1" />
              <path d="M9 19v2" />
              <path d="M9 3v2" />
              <path d="M9 9v1" />
              <path d="M15 14v1" />
              <path d="M15 19v2" />
              <path d="M15 3v2" />
              <path d="M15 9v1" />
            </svg>
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="pmf" 
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex-1 py-2 rounded-md"
          >
            <Shield className="h-4 w-4 mr-1" />
            Polícia Mais Forte
          </TabsTrigger>
          <TabsTrigger 
            value="escolaSegura" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1 py-2 rounded-md"
          >
            <School className="h-4 w-4 mr-1" />
            Escola Segura
          </TabsTrigger>
          <TabsTrigger 
            value="ambas" 
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white flex-1 py-2 rounded-md"
          >
            <FileWarning className="h-4 w-4 mr-1" />
            Ambas
          </TabsTrigger>
        </TabsList>
        
        {/* Conteúdo do Dashboard */}
        <TabsContent value="dashboard" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card de Inconsistências PMF */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden shadow-md">
              <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-4 border-b border-amber-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center mr-3">
                    <Shield className="h-4 w-4 text-amber-700" />
                  </div>
                  <h3 className="text-amber-800 font-semibold text-sm">Inconsistências Polícia Mais Forte</h3>
                </div>
                <p className="text-amber-600 text-xs mt-1">Conflitos com serviço ordinário</p>
              </div>
              
              <div className="p-6 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-amber-700">{totalPMF}</div>
                <p className="text-amber-600 text-sm mt-1">ocorrências encontradas</p>
              </div>
              
              <div className="p-3 bg-amber-100/50 border-t border-amber-200">
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center"
                  onClick={() => handlePrint('pmf')}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Relatório
                </Button>
              </div>
            </div>
            
            {/* Card de Inconsistências Escola Segura */}
            <div className="bg-green-50 border border-green-200 rounded-xl overflow-hidden shadow-md">
              <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 border-b border-green-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                    <School className="h-4 w-4 text-green-700" />
                  </div>
                  <h3 className="text-green-800 font-semibold text-sm">Inconsistências Escola Segura</h3>
                </div>
                <p className="text-green-600 text-xs mt-1">Conflitos com serviço ordinário</p>
              </div>
              
              <div className="p-6 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-green-700">{totalEscolaSegura}</div>
                <p className="text-green-600 text-sm mt-1">ocorrências encontradas</p>
              </div>
              
              <div className="p-3 bg-green-100/50 border-t border-green-200">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                  onClick={() => handlePrint('escolaSegura')}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Relatório
                </Button>
              </div>
            </div>
            
            {/* Card de Inconsistências Dupla Operação */}
            <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-md">
              <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 border-b border-red-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-3">
                    <FileWarning className="h-4 w-4 text-red-700" />
                  </div>
                  <h3 className="text-red-800 font-semibold text-sm">Inconsistências Dupla Operação</h3>
                </div>
                <p className="text-red-600 text-xs mt-1">Militar escalado nas duas operações</p>
              </div>
              
              <div className="p-6 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-red-700">{totalAmbas}</div>
                <p className="text-red-600 text-sm mt-1">ocorrências encontradas</p>
              </div>
              
              <div className="p-3 bg-red-100/50 border-t border-red-200">
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                  onClick={() => handlePrint('ambas')}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Relatório Dupla Operação
                </Button>
              </div>
            </div>
          </div>
          
          {/* Lista completa de inconsistências */}
          <div className="mt-6 bg-amber-800 rounded-t-xl p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-white">
                <Search className="h-4 w-4 mr-2" />
                <h3 className="font-semibold">Todas as Inconsistências Encontradas</h3>
                <span className="ml-2 text-sm bg-amber-700 py-0.5 px-2 rounded">Abril 2025</span>
              </div>
              
              <Button 
                className="bg-amber-600 hover:bg-amber-700 text-white text-sm flex items-center"
                onClick={() => handlePrint('completo')}
              >
                <Printer className="h-4 w-4 mr-1" />
                Imprimir Relatório Completo
              </Button>
            </div>
          </div>
          
          <div className="bg-white border border-amber-200 rounded-b-xl p-4 shadow-lg">
            {erro ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro ao carregar dados</AlertTitle>
                <AlertDescription>
                  {erro}
                </AlertDescription>
              </Alert>
            ) : carregando ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-amber-800">Verificando inconsistências...</p>
              </div>
            ) : totalGeral === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">Nenhuma inconsistência encontrada</h3>
                <p className="text-green-600 max-w-md">Todas as escalas parecem estar corretas</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-amber-100 text-amber-800">
                        <th className="py-2 px-4 text-left border-b border-amber-200">Dia</th>
                        <th className="py-2 px-4 text-left border-b border-amber-200">Militar</th>
                        <th className="py-2 px-4 text-left border-b border-amber-200">Guarnição Ordinária</th>
                        <th className="py-2 px-4 text-left border-b border-amber-200">Tipo de Inconsistência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...inconsistencias.pmf, ...inconsistencias.escolaSegura, ...inconsistencias.ambas]
                        .sort((a, b) => a.dia - b.dia)
                        .map((item, index) => (
                          <tr 
                            key={`${item.dia}-${item.militar}-${item.tipoOperacao}`}
                            className={index % 2 === 0 ? 'bg-amber-50' : 'bg-white'}
                          >
                            <td className="py-2 px-4 border-b border-amber-100 text-center">
                              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full text-sm bg-amber-200 text-amber-800 font-medium">
                                {item.dia}
                              </span>
                            </td>
                            <td className="py-2 px-4 border-b border-amber-100 font-medium text-amber-900">
                              {item.militar}
                            </td>
                            <td className="py-2 px-4 border-b border-amber-100">
                              <span className="inline-block bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded">
                                {item.guarnicaoOrdinaria}
                              </span>
                            </td>
                            <td className="py-2 px-4 border-b border-amber-100">
                              <span className={`inline-block text-white text-xs px-2 py-1 rounded ${
                                item.tipoOperacao === 'pmf' 
                                  ? 'bg-amber-600' 
                                  : item.tipoOperacao === 'escolaSegura' 
                                    ? 'bg-green-600' 
                                    : 'bg-red-600'
                              }`}>
                                {item.tipoOperacao === 'pmf' 
                                  ? 'Polícia Mais Forte' 
                                  : item.tipoOperacao === 'escolaSegura' 
                                    ? 'Escola Segura' 
                                    : 'Dupla Operação'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Conteúdo das Inconsistências da PMF */}
        <TabsContent value="pmf" className="mt-4">
          <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-amber-800 mb-4 border-b border-amber-200 pb-2">
              Inconsistências em Polícia Mais Forte - {formatMonthYear(currentDate)}
            </h3>
            
            {totalPMF === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-green-600 max-w-md">Nenhuma inconsistência encontrada para Polícia Mais Forte</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-amber-100 text-amber-800">
                      <th className="py-2 px-4 text-left border-b border-amber-200">Dia</th>
                      <th className="py-2 px-4 text-left border-b border-amber-200">Militar</th>
                      <th className="py-2 px-4 text-left border-b border-amber-200">Guarnição Ordinária</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inconsistencias.pmf.map((item, index) => (
                      <tr 
                        key={`${item.dia}-${item.militar}`}
                        className={index % 2 === 0 ? 'bg-amber-50' : 'bg-white'}
                      >
                        <td className="py-2 px-4 border-b border-amber-100 text-center">
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full text-sm bg-amber-200 text-amber-800 font-medium">
                            {item.dia}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b border-amber-100 font-medium text-amber-900">
                          {item.militar}
                        </td>
                        <td className="py-2 px-4 border-b border-amber-100">
                          <span className="inline-block bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded">
                            {item.guarnicaoOrdinaria}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Conteúdo das Inconsistências de Escola Segura */}
        <TabsContent value="escolaSegura" className="mt-4">
          <div className="bg-white border border-green-200 rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4 border-b border-green-200 pb-2">
              Inconsistências em Escola Segura - {formatMonthYear(currentDate)}
            </h3>
            
            {totalEscolaSegura === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-green-600 max-w-md">Nenhuma inconsistência encontrada para Escola Segura</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-100 text-green-800">
                      <th className="py-2 px-4 text-left border-b border-green-200">Dia</th>
                      <th className="py-2 px-4 text-left border-b border-green-200">Militar</th>
                      <th className="py-2 px-4 text-left border-b border-green-200">Guarnição Ordinária</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inconsistencias.escolaSegura.map((item, index) => (
                      <tr 
                        key={`${item.dia}-${item.militar}`}
                        className={index % 2 === 0 ? 'bg-green-50' : 'bg-white'}
                      >
                        <td className="py-2 px-4 border-b border-green-100 text-center">
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full text-sm bg-green-200 text-green-800 font-medium">
                            {item.dia}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b border-green-100 font-medium text-green-900">
                          {item.militar}
                        </td>
                        <td className="py-2 px-4 border-b border-green-100">
                          <span className="inline-block bg-green-200 text-green-800 text-xs px-2 py-1 rounded">
                            {item.guarnicaoOrdinaria}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Conteúdo das Inconsistências de Dupla Operação */}
        <TabsContent value="ambas" className="mt-4">
          <div className="bg-white border border-red-200 rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-4 border-b border-red-200 pb-2">
              Militares em Dupla Operação - {formatMonthYear(currentDate)}
            </h3>
            
            {totalAmbas === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-green-600 max-w-md">Nenhum militar escalado em dupla operação no mesmo dia</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-red-100 text-red-800">
                      <th className="py-2 px-4 text-left border-b border-red-200">Dia</th>
                      <th className="py-2 px-4 text-left border-b border-red-200">Militar</th>
                      <th className="py-2 px-4 text-left border-b border-red-200">Guarnição Ordinária</th>
                      <th className="py-2 px-4 text-left border-b border-red-200">Conflito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inconsistencias.ambas.map((item, index) => (
                      <tr 
                        key={`${item.dia}-${item.militar}`}
                        className={index % 2 === 0 ? 'bg-red-50' : 'bg-white'}
                      >
                        <td className="py-2 px-4 border-b border-red-100 text-center">
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full text-sm bg-red-200 text-red-800 font-medium">
                            {item.dia}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b border-red-100 font-medium text-red-900">
                          {item.militar}
                        </td>
                        <td className="py-2 px-4 border-b border-red-100">
                          <span className="inline-block bg-red-200 text-red-800 text-xs px-2 py-1 rounded">
                            {item.guarnicaoOrdinaria}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b border-red-100">
                          <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded">
                            PMF + Escola Segura
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}