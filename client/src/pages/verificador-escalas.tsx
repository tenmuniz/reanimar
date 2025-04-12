import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, CheckCircle, ClipboardList, FileText } from "lucide-react";
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
  // Verificar expediente (esses estão em expediente todos os dias úteis)
  if (militaresExpediente.includes(militar) && dia >= 1 && dia <= 30) {
    // Verificar se é fim de semana (sábado ou domingo)
    const data = new Date(2025, 3, dia); // Abril é mês 3 (zero-indexed)
    const diaSemana = data.getDay(); // 0 = Domingo, 6 = Sábado
    
    if (diaSemana !== 0 && diaSemana !== 6) {
      return "EXPEDIENTE";
    }
  }
  
  // Verificar nas escalas normais
  if (escalaOrdinaria[dia.toString()]) {
    for (const equipe of Object.keys(escalaOrdinaria[dia.toString()])) {
      if (escalaOrdinaria[dia.toString()][equipe].includes(militar)) {
        return equipe;
      }
    }
  }
  
  return null;
}

export default function VerificadorEscalas() {
  const [open, setOpen] = useState(false);
  const [conflitos, setConflitos] = useState<ConflitosEscala[]>([]);
  const [isVerificando, setIsVerificando] = useState(false);
  const [filtroMilitar, setFiltroMilitar] = useState("");

  // Configurada para abril de 2025
  const [currentDate] = useState(new Date(2025, 3, 1)); // Abril 2025 (mês indexado em 0, então 3 = abril)

  // Obter dados da escala PMF
  const { data: combinedSchedulesData } = useQuery<{ schedules: CombinedSchedules }>({
    queryKey: ["/api/combined-schedules", currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: async () => {
      const response = await fetch(
        `/api/combined-schedules?year=${currentDate.getFullYear()}&month=${currentDate.getMonth()}`
      );
      if (!response.ok) {
        throw new Error("Erro ao carregar dados das escalas combinadas");
      }
      return response.json();
    }
  });

  const verificarConflitos = () => {
    setIsVerificando(true);
    const conflitosEncontrados: ConflitosEscala[] = [];
    
    if (!combinedSchedulesData?.schedules) {
      toast({
        title: "Erro ao verificar conflitos",
        description: "Não foi possível carregar os dados das escalas.",
        variant: "destructive"
      });
      setIsVerificando(false);
      return;
    }
    
    // Obtém os dados da escala PMF
    const monthKey = "2025-3"; // Abril 2025
    const pmfSchedule = combinedSchedulesData.schedules.pmf[monthKey] || {};
    
    // Para cada dia no mês
    for (let dia = 1; dia <= 30; dia++) {
      const dayKey = String(dia);
      
      // Verifica se há militares escalados na PMF neste dia
      if (pmfSchedule[dayKey]) {
        // Para cada militar escalado na PMF
        pmfSchedule[dayKey].forEach(militar => {
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
    }
    
    // Ordenar conflitos por dia
    conflitosEncontrados.sort((a, b) => a.dia - b.dia);
    
    // Atualizar estado com conflitos encontrados
    setConflitos(conflitosEncontrados);
    setIsVerificando(false);
    
    // Abrir o diálogo com resultados
    setOpen(true);
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
          Esta ferramenta verifica se há militares escalados na Operação PMF que também estão de serviço na escala ordinária da 20ª CIPM no mesmo dia.
        </p>
        
        <Button 
          onClick={verificarConflitos}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <ClipboardList className="h-5 w-5 mr-1" />
          Verificar Conflitos de Escala
        </Button>
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
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-700 flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5" /> Verificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              O sistema verifica dia a dia os conflitos, identificando militares escalados 
              na operação PMF que também estão na escala ordinária no mesmo dia.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de resultados */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl font-bold mb-4">
              <ClipboardList className="h-6 w-6 mr-2 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-700 to-blue-600 text-transparent bg-clip-text">
                Resultado da Verificação de Conflitos
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {conflitos.length > 0 ? (
            <>
              <div className="mb-6">
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atenção! Conflitos encontrados</AlertTitle>
                  <AlertDescription>
                    Foram encontrados {conflitos.length} conflitos entre a escala ordinária e a operação PMF.
                    Militares não podem estar escalados em dois serviços no mesmo dia.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filtrar por nome do militar..."
                      value={filtroMilitar}
                      onChange={(e) => setFiltroMilitar(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-100">
                      <TableRow>
                        <TableHead className="w-[80px] text-center font-medium">Dia</TableHead>
                        <TableHead className="font-medium">Militar</TableHead>
                        <TableHead className="w-[180px] font-medium">Guarnição</TableHead>
                        <TableHead className="w-[120px] text-center font-medium">Operação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conflitrosFiltrados.map((conflito, index) => (
                        <TableRow key={index} className="hover:bg-slate-50">
                          <TableCell className="text-center font-medium">
                            {conflito.dia}/04
                          </TableCell>
                          <TableCell>{conflito.militar}</TableCell>
                          <TableCell>
                            <Badge variant={
                              conflito.guarnicaoOrdinaria === "ALFA" ? "secondary" :
                              conflito.guarnicaoOrdinaria === "BRAVO" ? "destructive" :
                              conflito.guarnicaoOrdinaria === "CHARLIE" ? "default" :
                              "outline"
                            }>
                              {conflito.guarnicaoOrdinaria}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-blue-600">
                              {conflito.operacao}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="text-amber-800 font-medium mb-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Recomendação
                </h3>
                <p className="text-amber-700 text-sm">
                  Recomenda-se remover estes militares da escala da operação PMF nos dias em que 
                  já estão escalados em seu serviço ordinário, para evitar conflitos de escalas.
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Nenhum conflito encontrado</h3>
              <p className="text-gray-600 max-w-lg mx-auto">
                Não foram identificados conflitos entre a escala ordinária da 20ª CIPM e a operação PMF.
                Todos os militares estão escalados corretamente sem sobreposição de serviços.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}