import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Calendar, CheckCircle, ClipboardList, FileText, GraduationCap, Building2 } from "lucide-react";
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
        <div className="mb-2 relative">
          <div className="absolute -top-10 -left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white relative z-10">
            Verificador de Conflitos de Escalas
          </h1>
        </div>
        <p className="text-blue-100 mb-6 max-w-3xl text-lg">
          Esta ferramenta verifica automaticamente se há militares escalados em operações extras
          que também estão de serviço na escala ordinária da 20ª CIPM no mesmo dia.
        </p>
        
        <div className="flex mt-4">
          <button
            onClick={() => verificarConflitos()}
            disabled={isVerificando}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center backdrop-blur-md border border-amber-500/30 disabled:opacity-70 disabled:pointer-events-none transform hover:scale-[1.02]"
          >
            <AlertCircle className="h-5 w-5 mr-2" />
            {isVerificando ? "Verificando..." : "Verificar Conflitos Agora"}
          </button>
        </div>
        
        {isVerificando && (
          <div className="mt-4 flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-lg border border-white/20 shadow-lg animate-pulse">
            <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
            <span className="text-white font-medium">Verificando conflitos...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden relative">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">
                Escala Ordinária
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-blue-100 text-sm">
              Baseada no Quadro de Distribuição de GU para Abril 2025 da 20ª CIPM.
              <span className="block mt-1 bg-white/10 backdrop-blur-md px-2 py-1.5 rounded-md border border-white/20 shadow-md">
                <span className="text-xs font-medium text-white">Guarnições: </span>
                <span className="ml-1 bg-amber-500/80 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">ALFA</span>
                <span className="ml-1 bg-red-500/80 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">BRAVO</span>
                <span className="ml-1 bg-indigo-500/80 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">CHARLIE</span>
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden relative">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">
                Operação PMF
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-blue-100 text-sm">
              Escala de Operação Polícia Mais Forte (PMF), com dados registrados no sistema.
              <span className="block mt-1 bg-white/10 backdrop-blur-md px-2 py-1.5 rounded-md inline-flex items-center border border-white/20">
                <span className="text-xs font-medium text-white">Permite até </span>
                <span className="mx-1 inline-flex items-center justify-center h-5 w-5 bg-blue-600 rounded-full text-xs font-bold text-white border border-blue-400 shadow-inner">3</span>
                <span className="text-xs font-medium text-white"> militares por dia</span>
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden relative">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-2 rounded-lg shadow-md">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white">
                Operação Escola Segura
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-purple-100 text-sm">
              Escala de Operação Escola Segura, com dados registrados no sistema.
              <span className="block mt-1 bg-white/10 backdrop-blur-md px-2 py-1.5 rounded-md inline-flex items-center border border-white/20">
                <span className="text-xs font-medium text-white">Permite até </span>
                <span className="mx-1 inline-flex items-center justify-center h-5 w-5 bg-purple-600 rounded-full text-xs font-bold text-white border border-purple-400 shadow-inner">2</span>
                <span className="text-xs font-medium text-white"> militares por dia</span>
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
        
      <div className="mx-auto max-w-2xl mb-8">
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden relative">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-2 rounded-lg shadow-md">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-white">
                Verificação de Inconsistências
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-amber-100 text-sm leading-relaxed">
              O sistema verifica dia a dia os conflitos, identificando militares escalados 
              em operações (PMF ou Escola Segura) que também estão de serviço na escala ordinária no mesmo dia.
              <span className="block mt-2 text-white/80 text-xs bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-md">
                Militares não podem ser escalados em operações extras no mesmo dia em que estão de serviço ordinário.
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resultados exibidos diretamente quando há conflitos (sem diálogo) */}
      {open && conflitos.length > 0 && (
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-6 animate-fade-in-down overflow-hidden relative">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-start mb-4 relative">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-red-500 to-red-700 p-2 rounded-lg shadow-lg mr-3">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-red-200">
                Resultado da Verificação de Conflitos
              </h2>
            </div>
            <button
              onClick={fecharDialogo}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
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
          
          <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-md rounded-xl border border-red-500/30 mb-4 shadow-xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="flex items-center mb-2">
              <div className="bg-red-600 rounded-full p-1.5 mr-2 shadow-md">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div className="text-white font-bold text-lg">Atenção! Conflitos encontrados</div>
            </div>
            <div className="text-red-100 pl-9">
              Foram encontrados <span className="font-bold text-white">{conflitos.length}</span> conflitos entre a escala ordinária e as operações extras.
              <span className="block mt-1 bg-red-600/20 rounded-md px-3 py-1.5 text-white/90 font-medium text-sm border border-red-500/30">
                Militares não podem estar escalados em dois serviços no mesmo dia. Resolva estes conflitos antes de finalizar as escalas.
              </span>
            </div>
          </div>
          
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Filtrar por nome do militar..."
              value={filtroMilitar}
              onChange={(e) => setFiltroMilitar(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white/10 backdrop-blur-md rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-white font-medium shadow-md placeholder-white/60"
            />
            <div className="absolute left-4 top-3.5 text-white/70">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="rounded-xl border border-white/20 overflow-hidden bg-white/10 backdrop-blur-md shadow-xl">
            <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/5">
              <Table>
                <TableHeader className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[80px] text-center font-bold text-white border-b border-white/10">Dia</TableHead>
                    <TableHead className="font-bold text-white border-b border-white/10">Militar</TableHead>
                    <TableHead className="w-[180px] font-bold text-white border-b border-white/10">Guarnição</TableHead>
                    <TableHead className="w-[120px] text-center font-bold text-white border-b border-white/10">Operação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conflitrosFiltrados.map((conflito, index) => (
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell className="text-center font-medium">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 border-2 border-blue-300 text-white font-bold shadow-lg relative overflow-hidden transform hover:scale-110 transition-all duration-300" style={{boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)"}}>
                          <span className="absolute inset-0 bg-white opacity-20 animate-pulse-slow"></span>
                          <span className="relative z-10 flex flex-col leading-none">
                            <span className="text-lg">{conflito.dia}</span>
                            <span className="text-[10px] mt-[-2px] opacity-80">ABR</span>
                          </span>
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
                          <div className={`relative inline-flex items-center px-3 py-1.5 rounded-full shadow-md font-bold ${
                              conflito.guarnicaoOrdinaria === "ALFA" 
                                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white" 
                                : conflito.guarnicaoOrdinaria === "BRAVO" 
                                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white" 
                                  : conflito.guarnicaoOrdinaria === "CHARLIE" 
                                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"
                                    : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                            } overflow-hidden`} style={{
                              boxShadow: conflito.guarnicaoOrdinaria === "ALFA" 
                                ? "0 4px 6px -1px rgba(245, 158, 11, 0.3), 0 2px 4px -2px rgba(245, 158, 11, 0.3)" 
                                : conflito.guarnicaoOrdinaria === "BRAVO"
                                  ? "0 4px 6px -1px rgba(239, 68, 68, 0.3), 0 2px 4px -2px rgba(239, 68, 68, 0.3)" 
                                  : "0 4px 6px -1px rgba(79, 70, 229, 0.3), 0 2px 4px -2px rgba(79, 70, 229, 0.3)"
                            }}>
                              <span className="absolute inset-0 bg-white/20 rounded-full"></span>
                              {conflito.guarnicaoOrdinaria === "ALFA" && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5">
                                  <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
                                </svg>
                              )}
                              {conflito.guarnicaoOrdinaria === "BRAVO" && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5">
                                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm-4.34 7.964a.75.75 0 01-1.061-1.06 5.236 5.236 0 013.73-1.538 5.236 5.236 0 013.695 1.538.75.75 0 11-1.061 1.06 3.736 3.736 0 00-2.639-1.098 3.736 3.736 0 00-2.664 1.098z" clipRule="evenodd" />
                                </svg>
                              )}
                              {conflito.guarnicaoOrdinaria === "CHARLIE" && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5">
                                  <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
                                </svg>
                              )}
                              {conflito.guarnicaoOrdinaria}
                            </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full shadow-md font-medium ${
                          conflito.operacao === "PMF" 
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
                            : "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                        } relative overflow-hidden shine-effect`} style={{
                          boxShadow: conflito.operacao === "PMF" 
                            ? "0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -2px rgba(59, 130, 246, 0.3)" 
                            : "0 4px 6px -1px rgba(124, 58, 237, 0.3), 0 2px 4px -2px rgba(124, 58, 237, 0.3)"
                        }}>
                          {conflito.operacao === "PMF" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5">
                              <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                              <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
                              <path d="M12 7.875a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5">
                              <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                              <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                              <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
                            </svg>
                          )}
                          {conflito.operacao === "PMF" ? "PMF" : "E.SEGURA"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="mt-3 flex justify-center text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-2 py-2 rounded-full text-white shadow-md relative overflow-hidden shine-effect animate-float">
              <div className="flex items-center px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center mr-3 shadow-inner border border-blue-500">
                  <span className="text-white font-bold">{conflitos.length}</span>
                </div>
                <span className="font-bold mr-1">Conflitos encontrados</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-1 text-yellow-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 shadow-xl overflow-hidden relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-center mb-2">
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-2 rounded-lg shadow-md mr-2">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-white font-bold text-lg">
                Recomendação
              </h3>
            </div>
            
            <p className="text-amber-100 ml-10">
              Remova estes militares das escalas de operações extras nos dias em que já estão escalados 
              em seu serviço ordinário, conforme indicado acima.
            </p>
            
            <div className="mt-3 ml-10 flex flex-wrap gap-2">
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-500/30 text-white flex items-center">
                <Building2 className="h-4 w-4 mr-1.5 text-blue-400" />
                <span className="text-sm font-medium">PMF</span>
              </div>
              <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-500/30 text-white flex items-center">
                <GraduationCap className="h-4 w-4 mr-1.5 text-purple-400" />
                <span className="text-sm font-medium">E.SEGURA</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mensagem de sucesso quando não há conflitos */}
      {open && conflitos.length === 0 && (
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-6 animate-fade-in-down overflow-hidden relative">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-start mb-4 relative">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-500 to-green-700 p-2 rounded-lg shadow-lg mr-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-200">
                Verificação Concluída
              </h2>
            </div>
            <button
              onClick={fecharDialogo}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
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
          
          <div className="py-8 text-center relative">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl border border-green-400/50 animate-pulse-slow overflow-hidden relative">
              <div className="absolute inset-0 bg-white/20"></div>
              <CheckCircle className="h-14 w-14 text-white relative z-10" />
            </div>
            
            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-md rounded-xl border border-green-500/30 mb-6 shadow-xl p-4 relative overflow-hidden max-w-xl mx-auto">
              <div className="absolute inset-0 bg-white/5"></div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhum conflito encontrado</h3>
              <p className="text-green-100">
                Não foram identificados conflitos entre a escala ordinária da 20ª CIPM e as operações extras.
                Todos os militares estão escalados corretamente sem sobreposição de serviços.
              </p>
            </div>
            
            <div className="flex justify-center gap-3 max-w-lg mx-auto">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="bg-blue-600 rounded-full p-1.5 shadow-md">
                    <Building2 className="h-4 w-4 text-white" /> 
                  </div>
                  <span className="text-white font-bold">PMF</span>
                </div>
                <div className="text-blue-100 text-sm text-center">
                  Operação Polícia Mais Forte sem conflitos com escala ordinária
                </div>
              </div>
              
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="bg-purple-600 rounded-full p-1.5 shadow-md">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white font-bold">E.SEGURA</span>
                </div>
                <div className="text-purple-100 text-sm text-center">
                  Operação Escola Segura sem conflitos com escala ordinária
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}