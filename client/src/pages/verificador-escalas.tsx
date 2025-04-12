import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Calendar, CheckCircle, ClipboardList, FileText, GraduationCap } from "lucide-react";
import { CombinedSchedules, MonthSchedule } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";

// Interface para conflitos entre escalas
interface ConflitosEscala {
  dia: number;
  militar: string;
  guarnicaoOrdinaria: string;
  operacao: string;
}

// Estrutura da escala ordinária de abril 2025 baseada na imagem
const escalaOrdinaria: Record<string, Record<string, string[]>> = {
  // CHARLIE nos dias 1, 2, 3, 18, 19, 20, 21, 22, 23, 24 (Charlie)
  "1": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
  "2": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
  "3": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
  "18": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
  "19": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
  "20": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
  "21": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
  "22": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
  "23": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
  "24": { 
    "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"],
    "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"]
  },

  // BRAVO nos dias 4, 5, 6, 7, 8, 9, 24, 25, 26, 27, 28, 29, 30
  "4": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
  "5": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
  "6": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
  "7": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
  "8": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
  "9": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
  "25": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
  "26": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
  "27": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
  "28": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
  "29": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
  "30": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },

  // ALFA nos dias 10, 11, 12, 13, 14, 15, 16, 17
  "10": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
  "11": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
  "12": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
  "13": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
  "14": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
  "15": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
  "16": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
  "17": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
};

// Expediente
const militaresExpediente = [
  "CAP QOPM MUNIZ",
  "1º TEN QOPM MONTEIRO",
  "TEN VANILSON",
  "SUB TEN ANDRÉ",
  "3º SGT PM CUNHA",
  "3º SGT PM CARAVELAS",
  "CB PM TONI",
  "SD PM S. CORREA",
  "SD PM RODRIGUES"
];

// Função para obter o nome da equipe (ALFA, BRAVO, CHARLIE) para cada dia
function getEquipeByDia(dia: number): string[] {
  const equipesNoDia: string[] = [];
  
  if (escalaOrdinaria[dia.toString()]) {
    Object.keys(escalaOrdinaria[dia.toString()]).forEach(equipe => {
      equipesNoDia.push(equipe);
    });
  }
  
  return equipesNoDia;
}

// Função para verificar se um militar está escalado em determinado dia
function isMilitarEscaladoNoDia(militar: string, dia: number): string | null {
  // Verificar APENAS nas guarnições ALFA, BRAVO e CHARLIE (excluindo EXPEDIENTE)
  if (escalaOrdinaria[dia.toString()]) {
    for (const equipe of Object.keys(escalaOrdinaria[dia.toString()])) {
      // Verificar apenas se a equipe for ALFA, BRAVO ou CHARLIE
      if ((equipe === "ALFA" || equipe === "BRAVO" || equipe === "CHARLIE") && 
          escalaOrdinaria[dia.toString()][equipe].includes(militar)) {
        return equipe;
      }
    }
  }
  
  return null;
}

export default function VerificadorEscalas() {
  const [open, setOpen] = useState(false);
  const [modo, setModo] = useState<'demo' | 'real'>('demo'); // Modo 'demo' para testes, 'real' para verificação em produção
  const [conflitos, setConflitos] = useState<ConflitosEscala[]>([]);
  const [isVerificando, setIsVerificando] = useState(false);
  const [filtroMilitar, setFiltroMilitar] = useState("");
  const [filtroOperacao, setFiltroOperacao] = useState<'todas' | 'pmf' | 'escolaSegura'>('todas');
  const [autoVerificacao, setAutoVerificacao] = useState(true); // Verificação automática ativa por padrão

  // Configurada para abril de 2025
  const [currentDate] = useState(new Date(2025, 3, 1)); // Abril 2025 (mês indexado em 0, então 3 = abril)

  // Obter dados da escala PMF
  const { data: combinedSchedulesData, dataUpdatedAt, refetch } = useQuery<{ schedules: CombinedSchedules }>({
    queryKey: ["/api/combined-schedules", currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: async () => {
      const response = await fetch(
        `/api/combined-schedules?year=${currentDate.getFullYear()}&month=${currentDate.getMonth()}`
      );
      if (!response.ok) {
        throw new Error("Erro ao carregar dados das escalas combinadas");
      }
      return response.json();
    },
    // Atualizar a cada 5 segundos para verificar mudanças
    refetchInterval: 5000
  });

  const verificarConflitos = async () => {
    setIsVerificando(true);
    
    try {
      // Forçar uma atualização dos dados antes de verificar
      await refetch();
      
      if (!combinedSchedulesData?.schedules) {
        toast({
          title: "Erro ao verificar conflitos",
          description: "Não foi possível carregar os dados das escalas.",
          variant: "destructive"
        });
        setIsVerificando(false);
        return;
      }
      
      const conflitosEncontrados: ConflitosEscala[] = [];
      
      // Obtém os dados da escala PMF - Abril 2025
      // Em algumas consultas o formato retornado pode variar entre "2025-3" e "2025-4" 
      // (zero-based vs one-based)
      const pmfSchedule = 
        combinedSchedulesData.schedules.pmf["2025-3"] || 
        combinedSchedulesData.schedules.pmf["2025-4"] || 
        combinedSchedulesData.schedules.pmf || {}; 
      
      console.log("Dados brutos combinados:", combinedSchedulesData.schedules);
      console.log("Dados brutos PMF:", combinedSchedulesData.schedules.pmf);
      console.log("Dados da escala PMF:", pmfSchedule);
      
      // Para cada dia no mês
      for (let dia = 1; dia <= 30; dia++) {
        const dayKey = String(dia);
        
        // Verifica se há militares escalados na PMF neste dia
        if (pmfSchedule[dayKey]) {
          console.log(`Verificando dia ${dia}:`, pmfSchedule[dayKey]);
          
          // Para cada militar escalado na PMF
          pmfSchedule[dayKey].forEach((militar, index) => {
            if (militar) {
              // Verificar se este militar está escalado na escala ordinária
              const escalaOrdinariaStatus = isMilitarEscaladoNoDia(militar, dia);
              
              console.log(`Militar ${militar} no dia ${dia}: status=${escalaOrdinariaStatus}`);
              
              if (escalaOrdinariaStatus) {
                // CONFLITO ENCONTRADO
                conflitosEncontrados.push({
                  dia,
                  militar,
                  guarnicaoOrdinaria: escalaOrdinariaStatus,
                  operacao: "PMF"
                });
                console.log(`CONFLITO: ${militar} está no serviço ${escalaOrdinariaStatus} e na PMF no dia ${dia}`);
              }
            }
          });
        }
      }
      
      // Ordenar conflitos por dia
      conflitosEncontrados.sort((a, b) => a.dia - b.dia);
      
      // Atualizar estado com conflitos encontrados
      setConflitos(conflitosEncontrados);
      console.log(`Total de conflitos encontrados: ${conflitosEncontrados.length}`);
      
      // Abrir o diálogo com resultados
      setOpen(true);
    } catch (error) {
      console.error("Erro ao verificar conflitos:", error);
      toast({
        title: "Erro ao verificar conflitos",
        description: "Ocorreu um erro ao processar os dados das escalas.",
        variant: "destructive"
      });
    } finally {
      setIsVerificando(false);
    }
  };

  // Função para verificar conflitos automaticamente quando os dados mudam
  const verificarConflitosAutomatico = useCallback(() => {
    if (!autoVerificacao || !combinedSchedulesData?.schedules) return;
    
    // Se o diálogo estiver aberto, desativar verificação automática para evitar loops
    if (open && conflitos.length === 0) {
      setOpen(false);
    }
    
    const conflitosEncontrados: ConflitosEscala[] = [];
    
    try {
      // Obtém os dados da escala PMF - Abril 2025
      const pmfSchedule = 
        combinedSchedulesData.schedules.pmf["2025-3"] || 
        combinedSchedulesData.schedules.pmf["2025-4"] || 
        combinedSchedulesData.schedules.pmf || {}; 
      
      // Obtém os dados da escala Escola Segura - Abril 2025
      const escolaSeguraSchedule = 
        combinedSchedulesData.schedules.escolaSegura["2025-3"] || 
        combinedSchedulesData.schedules.escolaSegura["2025-4"] || 
        combinedSchedulesData.schedules.escolaSegura || {};
      
      console.log("Dados da escala Escola Segura:", escolaSeguraSchedule);
      
      // Para cada dia no mês
      for (let dia = 1; dia <= 30; dia++) {
        const dayKey = String(dia);
        
        // Verifica se há militares escalados na PMF neste dia
        if (pmfSchedule[dayKey]) {
          // Para cada militar escalado na PMF
          pmfSchedule[dayKey].forEach((militar, index) => {
            if (militar) {
              // Verificar se este militar está escalado na escala ordinária
              const escalaOrdinariaStatus = isMilitarEscaladoNoDia(militar, dia);
              
              if (escalaOrdinariaStatus) {
                // CONFLITO ENCONTRADO
                conflitosEncontrados.push({
                  dia,
                  militar,
                  guarnicaoOrdinaria: escalaOrdinariaStatus,
                  operacao: "PMF"
                });
              }
            }
          });
        }
        
        // Verifica se há militares escalados na Escola Segura neste dia
        if (escolaSeguraSchedule[dayKey]) {
          // Para cada militar escalado na Escola Segura
          escolaSeguraSchedule[dayKey].forEach((militar, index) => {
            if (militar) {
              // Verificar se este militar está escalado na escala ordinária
              const escalaOrdinariaStatus = isMilitarEscaladoNoDia(militar, dia);
              
              if (escalaOrdinariaStatus) {
                // CONFLITO ENCONTRADO
                conflitosEncontrados.push({
                  dia,
                  militar,
                  guarnicaoOrdinaria: escalaOrdinariaStatus,
                  operacao: "ESCOLA SEGURA"
                });
              }
            }
          });
        }
      }
      
      // Ordenar conflitos por dia
      conflitosEncontrados.sort((a, b) => a.dia - b.dia);
      
      // Atualizar estado com conflitos encontrados
      setConflitos(conflitosEncontrados);
      
      // Se houver conflitos e o diálogo não estiver aberto, abri-lo
      if (conflitosEncontrados.length > 0 && !open) {
        setOpen(true);
      }
    } catch (error) {
      console.error("Erro na verificação automática:", error);
    }
  }, [combinedSchedulesData, autoVerificacao, open]);

  // Executar verificação automática quando os dados da escala são atualizados
  useEffect(() => {
    verificarConflitosAutomatico();
  }, [dataUpdatedAt, verificarConflitosAutomatico]);
  
  // Verificar conflitos automaticamente ao carregar a página
  useEffect(() => {
    const verificarInicial = async () => {
      setIsVerificando(true);
      try {
        await refetch();
        // Abrir os resultados automaticamente
        setOpen(true);
        verificarConflitosAutomatico();
      } finally {
        setIsVerificando(false);
      }
    };
    
    verificarInicial();
  }, [refetch]);
  
  // Função para fechar o diálogo 
  const fecharDialogo = () => {
    setOpen(false);
  };

  // Filtrar conflitos pelo nome do militar
  const conflitrosFiltrados = filtroMilitar 
    ? conflitos.filter(c => c.militar.toLowerCase().includes(filtroMilitar.toLowerCase()))
    : conflitos;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center justify-center mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-700 to-blue-500 text-transparent bg-clip-text">
          Verificador de Conflitos de Escalas
        </h1>
        <p className="text-gray-600 mb-6 max-w-2xl">
          Esta ferramenta verifica automaticamente se há militares escalados na Operação PMF que também estão de serviço na escala ordinária da 20ª CIPM no mesmo dia.
        </p>
        
        {isVerificando && (
          <div className="flex items-center justify-center space-x-2 bg-blue-50 px-6 py-3 rounded-lg border border-blue-200">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="text-blue-700 font-medium">Verificando conflitos...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-700 flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" /> Escala Ordinária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              Baseada no Quadro de Distribuição de GU para Abril 2025 da 20ª CIPM.
              Inclui militares das guarnições ALFA, BRAVO, CHARLIE e do Expediente.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-700 flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" /> Operação PMF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              Escala de Operação Polícia Mais Forte (PMF), com dados registrados no sistema.
              Permite até 3 militares por dia.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-700 flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" /> Operação Escola Segura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              Escala de Operação Escola Segura, com dados registrados no sistema.
              Permite até 2 militares por dia.
            </p>
          </CardContent>
        </Card>
      </div>
        
      <div className="mx-auto max-w-2xl mb-8">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-700 flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5" /> Verificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              O sistema verifica dia a dia os conflitos, identificando militares escalados 
              em operações (PMF ou Escola Segura) que também estão de serviço na escala ordinária no mesmo dia.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resultados exibidos diretamente quando há conflitos (sem diálogo) */}
      {open && conflitos.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fade-in-down">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <ClipboardList className="h-6 w-6 mr-2 text-blue-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 text-transparent bg-clip-text">
                Resultado da Verificação de Conflitos
              </h2>
            </div>
            <button
              onClick={fecharDialogo}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <Alert variant="destructive" className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 mb-4 shadow-md">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800 font-bold text-lg">Atenção! Conflitos encontrados</AlertTitle>
            <AlertDescription className="text-red-700">
              Foram encontrados <span className="font-bold">{conflitos.length}</span> conflitos entre a escala ordinária e as operações PMF/Escola Segura.
              <span className="block mt-1">Militares não podem estar escalados em dois serviços no mesmo dia.</span>
            </AlertDescription>
          </Alert>
          
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Filtrar por nome do militar..."
              value={filtroMilitar}
              onChange={(e) => setFiltroMilitar(e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 bg-gradient-to-r from-blue-50 to-white text-blue-800 font-medium shadow-sm"
            />
            <div className="absolute left-4 top-3.5 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="rounded-lg border overflow-hidden">
            <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50">
              <Table>
                <TableHeader className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[80px] text-center font-bold text-blue-800">Dia</TableHead>
                    <TableHead className="font-bold text-blue-800">Militar</TableHead>
                    <TableHead className="w-[180px] font-bold text-blue-800">Guarnição</TableHead>
                    <TableHead className="w-[120px] text-center font-bold text-blue-800">Operação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conflitrosFiltrados.map((conflito, index) => (
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell className="text-center font-medium">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 text-blue-700 font-bold shadow-sm">
                          {conflito.dia}/04
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-700">
                          {conflito.militar.split(' ').slice(0, 2).join(' ')}
                          <span className="font-normal text-slate-500 ml-1">
                            {conflito.militar.split(' ').slice(2).join(' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-start">
                          <Badge variant="outline" 
                            className={
                              conflito.guarnicaoOrdinaria === "ALFA" ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200" :
                              conflito.guarnicaoOrdinaria === "BRAVO" ? "bg-red-100 text-red-800 border-red-300 hover:bg-red-200" :
                              conflito.guarnicaoOrdinaria === "CHARLIE" ? "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200" :
                              "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                            }>
                            {conflito.guarnicaoOrdinaria}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" 
                          className={conflito.operacao === "PMF" ? 
                          "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 shadow-sm" : 
                          "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 shadow-sm"}>
                          {conflito.operacao === "PMF" ? "PMF" : "E.SEGURA"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="mt-3 flex justify-center text-center">
            <p className="text-blue-600 bg-blue-50 py-2 px-4 rounded-full border border-blue-200 shadow-sm text-sm font-medium">
              <span className="mr-1">📋</span> Total: {conflitos.length} conflitos encontrados
            </p>
          </div>
          
          <div className="mt-4 bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200 shadow-md">
            <h3 className="text-amber-800 font-bold mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
              Recomendação
            </h3>
            <p className="text-amber-700">
              Recomenda-se remover estes militares das escalas de operações especiais nos dias em que 
              já estão escalados em seu serviço ordinário, conforme indicado acima.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                PMF
              </Badge>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                E.SEGURA
              </Badge>
            </div>
          </div>
        </div>
      )}
      
      {/* Mensagem de sucesso quando não há conflitos */}
      {open && conflitos.length === 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fade-in-down">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 text-transparent bg-clip-text">
                Verificação Concluída
              </h2>
            </div>
            <button
              onClick={fecharDialogo}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          <div className="py-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full mx-auto flex items-center justify-center mb-4 shadow-md border border-green-200">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">Nenhum conflito encontrado</h3>
            <p className="text-gray-600 max-w-lg mx-auto">
              Não foram identificados conflitos entre a escala ordinária da 20ª CIPM e as operações PMF/Escola Segura.
              Todos os militares estão escalados corretamente sem sobreposição de serviços.
              
              <div className="mt-4 flex justify-center gap-3">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1">
                  PMF
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 px-3 py-1">
                  E.SEGURA
                </Badge>
              </div>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}