import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Inconsistencia {
  dia: number;
  militar: string;
  guarnicaoOrdinaria: string;
  operacao: string;
}

export default function ConflictCounter() {
  const [open, setOpen] = useState(false);
  const [inconsistencias, setInconsistencias] = useState<Inconsistencia[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Buscar conflitos das duas operações
  const { data: combinedSchedulesData } = useQuery<{ schedules: any }>({
    queryKey: ['/api/combined-schedules'],
  });
  
  useEffect(() => {
    if (combinedSchedulesData) {
      // Verificar inconsistências reais com base nas escalas
      verificarInconsistencias();
    }
  }, [combinedSchedulesData]);
  
  // Função para converter nomes de militares para suas guarnições
  const getGuarnicaoOrdinaria = (militar: string, dia: number): string => {
    // Simplificar e melhorar a detecção de conflitos
    // Regras do serviço ordinário para este mês
    const servicoOrdinario: Record<string, number[]> = {
      'ALFA': [1, 2, 3, 24, 25, 26, 27, 28, 29, 30], // ALFA trabalha nos dias 1-3 e 24-30
      'BRAVO': [4, 5, 6, 7, 8, 9, 25, 26, 27, 28, 29, 30], // BRAVO trabalha nos dias 4-9 e 25-30
      'CHARLIE': [1, 2, 3, 18, 19, 20, 21, 22, 23, 24] // CHARLIE trabalha nos dias 1-3 e 18-24
    };
    
    // Lista de militares por guarnição
    const guarnicoes: Record<string, string[]> = {
      'ALFA': [
        "CB PM FELIPE", "3º SGT PM RODRIGO", "SD PM GOVEIA", 
        "3º SGT PM ANA CLEIDE", "SD PM CARVALHO"
      ],
      'BRAVO': [
        "3º SGT PM CARLOS EDUARDO", "SD PM LUAN", "3º SGT PM GLEIDSON",
        "CB PM BARROS", "SD PM S. CORREA"
      ],
      'CHARLIE': [
        "SD PM PATRIK", "CB PM BRASIL", "CB PM M. PAIXÃO", 
        "SD PM NAVARRO", "SD PM MARVÃO"
      ],
      'EXPEDIENTE': [
        "CAP QOPM MUNIZ", "1º TEN QOPM MONTEIRO", "SUB TEN ANDRÉ", 
        "1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "2º SGT PM PINHEIRO", 
        "2º SGT PM A. TAVARES", "3º SGT PM CARAVELAS", "3º SGT AMARAL", 
        "3º SGT PM NEGRÃO", "3º SGT PM LEDO", "3º SGT PM NUNES", 
        "3º SGT PM RAFAEL", "3º SGT PM CUNHA", "TEN VANILSON", 
        "CB PM A. SILVA", "SD PM RODRIGUES", "SD PM ALMEIDA", 
        "SD PM CHAGAS", "CB CARLA"
      ]
    };
    
    // Verificar a guarnição do militar
    for (const [guarnicao, militares] of Object.entries(guarnicoes)) {
      if (militares.includes(militar)) {
        // Se o militar é desta guarnição, verificar se está de serviço no dia
        if (guarnicao !== "EXPEDIENTE" && servicoOrdinario[guarnicao]?.includes(dia)) {
          return guarnicao;
        }
        return guarnicao === "EXPEDIENTE" ? "EXPEDIENTE" : "FOLGA";
      }
    }
    
    // Se não encontrou o militar em nenhuma guarnição
    return "DESCONHECIDO";
  };
  
  // Função para verificar inconsistências nas escalas
  const verificarInconsistencias = () => {
    if (!combinedSchedulesData) return;
    
    const listaInconsistencias: Inconsistencia[] = [];
    const currentDate = new Date();
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    
    const pmfData = combinedSchedulesData.schedules?.pmf[currentMonthKey] || {};
    const escolaData = combinedSchedulesData.schedules?.escolaSegura[currentMonthKey] || {};
    
    // Para cada dia do mês
    for (let dia = 1; dia <= 31; dia++) {
      const dayStr = dia.toString();
      
      // Verificar militares escalados em PMF
      if (pmfData[dayStr]) {
        const militaresPMF = pmfData[dayStr].filter((m: string | null) => m !== null) as string[];
        
        militaresPMF.forEach(militar => {
          // Obter a guarnição ordinária do militar nesse dia
          const guarnicao = getGuarnicaoOrdinaria(militar, dia);
          
          // Se o militar estiver de serviço, é uma inconsistência
          if (guarnicao !== "FOLGA" && guarnicao !== "IGNORA" && guarnicao !== "DESCONHECIDO") {
            listaInconsistencias.push({
              dia,
              militar,
              guarnicaoOrdinaria: guarnicao,
              operacao: "PMF"
            });
          }
          
          // Verificar se o militar também está na escala da Escola Segura no mesmo dia
          if (escolaData[dayStr] && escolaData[dayStr].includes(militar)) {
            listaInconsistencias.push({
              dia,
              militar,
              guarnicaoOrdinaria: guarnicao,
              operacao: "PMF + ESCOLA SEGURA"
            });
          }
        });
      }
      
      // Verificar militares escalados em Escola Segura (que não estão em PMF)
      if (escolaData[dayStr]) {
        const militaresEscola = escolaData[dayStr].filter((m: string | null) => m !== null) as string[];
        
        militaresEscola.forEach(militar => {
          // Ignorar militares já verificados na PMF (para evitar duplicação)
          if (pmfData[dayStr] && pmfData[dayStr].includes(militar)) {
            return; // Já verificado acima como "PMF + ESCOLA SEGURA"
          }
          
          // Obter a guarnição ordinária do militar nesse dia
          const guarnicao = getGuarnicaoOrdinaria(militar, dia);
          
          // Se o militar estiver de serviço, é uma inconsistência
          if (guarnicao !== "FOLGA" && guarnicao !== "IGNORA" && guarnicao !== "DESCONHECIDO") {
            listaInconsistencias.push({
              dia,
              militar,
              guarnicaoOrdinaria: guarnicao,
              operacao: "ESCOLA SEGURA"
            });
          }
        });
      }
    }
    
    // Ordenar por dia e depois por operação
    listaInconsistencias.sort((a, b) => {
      if (a.dia !== b.dia) {
        return a.dia - b.dia;
      }
      return a.operacao.localeCompare(b.operacao);
    });
    
    setInconsistencias(listaInconsistencias);
  };
  
  // Função para filtrar inconsistências com base no termo de busca
  const filteredInconsistencias = () => {
    return inconsistencias.filter((inconsistencia) => 
      searchTerm === "" || 
      inconsistencia.militar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inconsistencia.guarnicaoOrdinaria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  // Obter a contagem de inconsistências por tipo
  const contagens = {
    pmf: inconsistencias.filter(inc => inc.operacao === "PMF").length,
    escolaSegura: inconsistencias.filter(inc => inc.operacao === "ESCOLA SEGURA").length,
    ambas: inconsistencias.filter(inc => inc.operacao === "PMF + ESCOLA SEGURA").length,
    total: inconsistencias.length
  };
  
  // Se não tiver inconsistências, não exibe nada
  if (inconsistencias.length === 0) {
    return null;
  }
  
  return (
    <>
      <div 
        onClick={() => setOpen(true)}
        className="relative flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl rounded-full cursor-pointer hover:bg-white/20 transition-all duration-200"
      >
        <AlertCircle className="h-4 w-4 text-red-400 mr-1.5 animate-pulse" />
        <span className="text-xs font-medium text-white">
          {inconsistencias.length} conflito{inconsistencias.length !== 1 ? 's' : ''}
        </span>
        
        <div className="absolute -top-1 -right-1 animate-bounce">
          <div className="relative">
            <div className="absolute inset-0 bg-red-400 rounded-full blur-sm animate-pulse"></div>
            <span className="relative bg-red-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold shadow-lg border border-red-400">
              {inconsistencias.length}
            </span>
          </div>
        </div>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl font-bold text-center text-white mb-4">
              <AlertCircle className="h-6 w-6 mr-2 text-amber-300" />
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 text-transparent bg-clip-text">
                VERIFICADOR DE CONFLITOS
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {/* Estatísticas de Inconsistências */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl p-3 rounded-lg flex flex-col items-center">
              <span className="text-blue-200 text-xs font-medium mb-1">Total</span>
              <span className="text-2xl font-bold text-white">{contagens.total}</span>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl p-3 rounded-lg flex flex-col items-center">
              <span className="text-green-200 text-xs font-medium mb-1">PMF</span>
              <span className="text-2xl font-bold text-white">{contagens.pmf}</span>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl p-3 rounded-lg flex flex-col items-center">
              <span className="text-purple-200 text-xs font-medium mb-1">E. Segura</span>
              <span className="text-2xl font-bold text-white">{contagens.escolaSegura}</span>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl p-3 rounded-lg flex flex-col items-center">
              <span className="text-red-200 text-xs font-medium mb-1">Duplicadas</span>
              <span className="text-2xl font-bold text-white">{contagens.ambas}</span>
            </div>
          </div>
          
          {/* Campo de busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-300" />
              <Input
                placeholder="Buscar militar ou guarnição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl text-white placeholder:text-blue-300"
              />
            </div>
          </div>
          
          {/* Lista de inconsistências */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl rounded-lg p-2 mb-4 max-h-[350px] overflow-auto">
            <div className="flex font-bold text-sm text-blue-100 px-2 py-1 mb-1 border-b border-white/20">
              <div className="w-[15%]">Dia</div>
              <div className="w-[35%]">Militar</div>
              <div className="w-[25%]">Serviço Ordinário</div>
              <div className="w-[25%]">Operação</div>
            </div>
            
            {filteredInconsistencias().length === 0 ? (
              <div className="p-4 text-center bg-white/5 backdrop-blur-md rounded-lg my-2">
                <div className="text-blue-200 font-medium">Nenhuma inconsistência encontrada</div>
                <div className="text-xs text-white/70 mt-1">Sua busca por &quot;{searchTerm}&quot; não retornou resultados</div>
              </div>
            ) : (
              filteredInconsistencias().map((inconsistencia, index) => {
                // Classe do background com base na paridade
                const bgClass = index % 2 === 0 
                  ? 'bg-white/5 backdrop-blur-md' 
                  : 'bg-white/10 backdrop-blur-md';
                
                // Cor do tipo de inconsistência
                const tipoClass = 
                  inconsistencia.operacao === "PMF" ? "bg-gradient-to-r from-green-600 to-green-700 border border-green-500" :
                  inconsistencia.operacao === "ESCOLA SEGURA" ? "bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-500" :
                  "bg-gradient-to-r from-red-600 to-red-700 border border-red-500";
                
                return (
                  <div 
                    key={`${inconsistencia.militar}-${inconsistencia.dia}-${inconsistencia.operacao}`} 
                    className={`flex items-center text-sm px-2 py-2 rounded mb-1 ${bgClass}`}
                  >
                    <div className="w-[15%] flex items-center justify-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 bg-blue-600 border border-blue-300 shadow-inner rounded-full font-medium text-white">
                        {inconsistencia.dia}
                      </span>
                    </div>
                    <div className="w-[35%] font-medium text-white">
                      {inconsistencia.militar}
                    </div>
                    <div className="w-[25%]">
                      <span className="inline-block bg-white/10 backdrop-blur-md border border-white/10 shadow-md px-2 py-0.5 rounded text-xs">
                        {inconsistencia.guarnicaoOrdinaria}
                      </span>
                    </div>
                    <div className="w-[25%]">
                      <span className={`inline-block ${tipoClass} px-2 py-0.5 rounded text-xs`}>
                        {inconsistencia.operacao}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Legenda e informações */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl p-3 rounded-lg text-xs">
            <div className="flex flex-wrap items-center justify-around mb-2 gap-2">
              <div className="font-medium text-white flex items-center">
                <span className="inline-block h-3 w-3 bg-gradient-to-r from-green-600 to-green-700 rounded-full mr-1 border border-green-500"></span>
                <span>PMF no dia de serviço ordinário</span>
              </div>
              <div className="font-medium text-white flex items-center">
                <span className="inline-block h-3 w-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mr-1 border border-blue-500"></span>
                <span>Escola Segura no dia de serviço ordinário</span>
              </div>
              <div className="font-medium text-white flex items-center">
                <span className="inline-block h-3 w-3 bg-gradient-to-r from-red-600 to-red-700 rounded-full mr-1 border border-red-500"></span>
                <span>PMF e Escola Segura no mesmo dia</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}