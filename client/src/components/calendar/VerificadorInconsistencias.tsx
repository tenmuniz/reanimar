import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Search, Calendar } from "lucide-react";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface VerificadorInconsistenciasProps {
  schedule: MonthSchedule;
  currentDate: Date;
  combinedSchedules?: CombinedSchedules;
  servicoOrdinario?: Record<string, Record<string, string[]>>; // Escala ordinária: { '1': ['CHARLIE'], '2': ['BRAVO'], ... }
  operationType?: 'pmf' | 'escolaSegura';
}

interface Inconsistencia {
  dia: number;
  militar: string;
  guarnicaoOrdinaria: string;
  operacao: string;
}

export default function VerificadorInconsistencias({
  schedule,
  currentDate,
  combinedSchedules,
  servicoOrdinario = {},
  operationType = 'pmf'
}: VerificadorInconsistenciasProps) {
  const [open, setOpen] = useState(false);
  const [inconsistencias, setInconsistencias] = useState<Inconsistencia[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Atualizar inconsistências quando o modal for aberto ou mudar os dados
  useEffect(() => {
    if (open) {
      console.log("Verificador aberto - verificando inconsistências");
      verificarInconsistencias();
    }
  }, [open, schedule, combinedSchedules, currentDate]);
  
  // Função para filtrar inconsistências com base no termo de busca
  const filteredInconsistencias = () => {
    return inconsistencias.filter((inconsistencia) => 
      searchTerm === "" || 
      inconsistencia.militar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inconsistencia.guarnicaoOrdinaria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Função simulada para obter a guarnição ordinária de um militar em um dia específico
  const getGuarnicaoOrdinaria = (militar: string, dia: number): string => {
    // Em um sistema real, isso seria uma consulta ao banco de dados ou API
    // Para simplificar, vamos simular algumas atribuições de guarnição
    
    const guarnicoes = ["ALFA", "BRAVO", "CHARLIE"];
    
    if (militar.includes("MUNIZ") || militar.includes("MONTEIRO")) {
      return "EXPEDIENTE";
    }
    
    if (servicoOrdinario[dia]) {
      const guarnicoesDoDia = servicoOrdinario[dia];
      
      for (const [guarnicao, militares] of Object.entries(guarnicoesDoDia)) {
        if (militares.includes(militar)) {
          return guarnicao;
        }
      }
    }
    
    // Se o militar contém partes do nome que indicam a guarnição dele
    if (militar.includes("PEIXOTO") || militar.includes("RODRIGO") || 
        militar.includes("LEDO") || militar.includes("NUNES") || 
        militar.includes("AMARAL") || militar.includes("CARLA") || 
        militar.includes("FELIPE") || militar.includes("BARROS") || 
        militar.includes("A. SILVA") || militar.includes("LUAN") || 
        militar.includes("NAVARRO")) {
      return "ALFA";
    } else if (militar.includes("OLIMAR") || militar.includes("FÁBIO") || 
               militar.includes("ANA CLEIDE") || militar.includes("GLEIDSON") || 
               militar.includes("CARLOS EDUARDO") || militar.includes("NEGRÃO") || 
               militar.includes("BRASIL") || militar.includes("MARVÃO") || 
               militar.includes("IDELVAN")) {
      return "BRAVO";
    } else if (militar.includes("PINHEIRO") || militar.includes("RAFAEL") || 
               militar.includes("MIQUEIAS") || militar.includes("M. PAIXÃO") || 
               militar.includes("CHAGAS") || militar.includes("CARVALHO") || 
               militar.includes("GOVEIA") || militar.includes("ALMEIDA") || 
               militar.includes("PATRIK") || militar.includes("GUIMARÃES")) {
      return "CHARLIE";
    }
    
    // Simulação de guarnição com base no dia
    return guarnicoes[dia % guarnicoes.length];
  };

  // Função para verificar inconsistências na escala
  const verificarInconsistencias = () => {
    const listaInconsistencias: Inconsistencia[] = [];
    
    // Chave do mês atual
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
    
    // Obter a escala do mês atual
    const currentSchedule = schedule[currentMonthKey] || {};
    
    // Verificar se temos dados combinados de PMF e Escola Segura
    const escolaSchedule = combinedSchedules?.escolaSegura?.[currentMonthKey] || {};
    
    // Dicionário para rastrear dias que cada militar está escalado em cada tipo de operação
    const militaresEscalados: Record<string, { pmf: number[], escolaSegura: number[] }> = {};
    
    // Processar escala PMF
    Object.entries(currentSchedule).forEach(([day, daySchedule]) => {
      const dayNum = parseInt(day, 10);
      
      if (Array.isArray(daySchedule)) {
        daySchedule.forEach(militar => {
          if (militar) {
            // Inicializar o registro se não existir
            if (!militaresEscalados[militar]) {
              militaresEscalados[militar] = { pmf: [], escolaSegura: [] };
            }
            
            // Adicionar dia à operação PMF
            militaresEscalados[militar].pmf.push(dayNum);
            
            // Verificar se há conflito com escala ordinária
            const guarnicaoOrdinaria = getGuarnicaoOrdinaria(militar, dayNum);
            
            if (guarnicaoOrdinaria !== "EXPEDIENTE") {
              listaInconsistencias.push({
                dia: dayNum,
                militar,
                guarnicaoOrdinaria,
                operacao: "PMF"
              });
            }
          }
        });
      }
    });
    
    // Processar escala Escola Segura, se disponível
    Object.entries(escolaSchedule).forEach(([day, daySchedule]) => {
      const dayNum = parseInt(day, 10);
      
      if (Array.isArray(daySchedule)) {
        daySchedule.forEach(militar => {
          if (militar) {
            // Inicializar o registro se não existir
            if (!militaresEscalados[militar]) {
              militaresEscalados[militar] = { pmf: [], escolaSegura: [] };
            }
            
            // Adicionar dia à operação Escola Segura
            militaresEscalados[militar].escolaSegura.push(dayNum);
            
            // Verificar se há conflito com escala ordinária
            const guarnicaoOrdinaria = getGuarnicaoOrdinaria(militar, dayNum);
            
            if (guarnicaoOrdinaria !== "EXPEDIENTE") {
              listaInconsistencias.push({
                dia: dayNum,
                militar,
                guarnicaoOrdinaria,
                operacao: "ESCOLA SEGURA"
              });
            }
          }
        });
      }
    });
    
    // Verificar inconsistências entre PMF e Escola Segura (militar escalado no mesmo dia em ambas operações)
    Object.entries(militaresEscalados).forEach(([militar, operacoes]) => {
      operacoes.pmf.forEach(dia => {
        if (operacoes.escolaSegura.includes(dia)) {
          listaInconsistencias.push({
            dia,
            militar,
            guarnicaoOrdinaria: getGuarnicaoOrdinaria(militar, dia),
            operacao: "PMF + ESCOLA SEGURA"
          });
        }
      });
    });
    
    // Ordenar por dia e depois por operação
    listaInconsistencias.sort((a, b) => {
      if (a.dia !== b.dia) {
        return a.dia - b.dia;
      }
      return a.operacao.localeCompare(b.operacao);
    });
    
    setInconsistencias(listaInconsistencias);
  };

  // Get the month name for display
  const mesAno = formatMonthYear(currentDate);
  
  // Obter a contagem de inconsistências por tipo
  const contagens = {
    pmf: inconsistencias.filter(inc => inc.operacao === "PMF").length,
    escolaSegura: inconsistencias.filter(inc => inc.operacao === "ESCOLA SEGURA").length,
    ambas: inconsistencias.filter(inc => inc.operacao === "PMF + ESCOLA SEGURA").length,
    total: inconsistencias.length
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 
          text-white px-4 py-2.5 rounded-xl flex items-center 
          transition-all duration-200 shadow-md hover:shadow-lg
          active:shadow-inner active:translate-y-0.5 transform"
      >
        <AlertCircle className="h-4 w-4 mr-2 drop-shadow-sm" />
        <span className="font-medium">Verificar</span>
        
        {inconsistencias.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold animate-pulse shadow-md">
            {inconsistencias.length}
          </span>
        )}
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-amber-900 to-amber-800 text-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl font-bold text-center text-white mb-4">
              <AlertCircle className="h-6 w-6 mr-2 text-amber-300" />
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 text-transparent bg-clip-text">
                VERIFICADOR DE CONFLITOS - {mesAno.toUpperCase()}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {/* Estatísticas de Inconsistências */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-amber-700/70 p-3 rounded-lg shadow-inner flex flex-col items-center">
              <span className="text-amber-200 text-xs font-medium mb-1">Total</span>
              <span className="text-2xl font-bold text-white">{contagens.total}</span>
            </div>
            
            <div className="bg-amber-700/70 p-3 rounded-lg shadow-inner flex flex-col items-center">
              <span className="text-amber-200 text-xs font-medium mb-1">PMF</span>
              <span className="text-2xl font-bold text-white">{contagens.pmf}</span>
            </div>
            
            <div className="bg-amber-700/70 p-3 rounded-lg shadow-inner flex flex-col items-center">
              <span className="text-amber-200 text-xs font-medium mb-1">E. Segura</span>
              <span className="text-2xl font-bold text-white">{contagens.escolaSegura}</span>
            </div>
            
            <div className="bg-amber-700/70 p-3 rounded-lg shadow-inner flex flex-col items-center">
              <span className="text-amber-200 text-xs font-medium mb-1">Duplicadas</span>
              <span className="text-2xl font-bold text-white">{contagens.ambas}</span>
            </div>
          </div>
          
          {/* Campo de busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-amber-300" />
              <Input
                placeholder="Buscar militar ou guarnição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-amber-700/30 border-amber-600 text-white placeholder:text-amber-300"
              />
            </div>
          </div>
          
          {/* Lista de inconsistências */}
          <div className="bg-amber-800/40 rounded-lg p-2 mb-4 max-h-[350px] overflow-auto">
            <div className="flex font-bold text-sm text-amber-100 px-2 py-1 mb-1 border-b border-amber-700">
              <div className="w-[15%]">Dia</div>
              <div className="w-[35%]">Militar</div>
              <div className="w-[25%]">Serviço Ordinário</div>
              <div className="w-[25%]">Operação</div>
            </div>
            
            {inconsistencias.length === 0 ? (
              <div className="p-4 text-center text-amber-200">
                Nenhuma inconsistência encontrada para este mês
              </div>
            ) : filteredInconsistencias().length === 0 ? (
              <div className="p-4 text-center text-amber-200">
                Nenhuma inconsistência encontrada com o termo &quot;{searchTerm}&quot;
              </div>
            ) : (
              filteredInconsistencias().map((inconsistencia, index) => {
                // Classe do background com base na paridade
                const bgClass = index % 2 === 0 
                  ? 'bg-amber-800/40' 
                  : 'bg-amber-800/20';
                
                // Cor do tipo de inconsistência
                const tipoClass = 
                  inconsistencia.operacao === "PMF" ? "bg-green-700" :
                  inconsistencia.operacao === "ESCOLA SEGURA" ? "bg-blue-700" :
                  "bg-red-700";
                
                return (
                  <div 
                    key={`${inconsistencia.militar}-${inconsistencia.dia}-${inconsistencia.operacao}`} 
                    className={`flex items-center text-sm px-2 py-2 rounded mb-1 ${bgClass}`}
                  >
                    <div className="w-[15%] flex items-center justify-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 bg-amber-700 rounded-full font-medium">
                        {inconsistencia.dia}
                      </span>
                    </div>
                    <div className="w-[35%] font-medium text-white">
                      {inconsistencia.militar}
                    </div>
                    <div className="w-[25%]">
                      <span className="inline-block bg-amber-700 px-2 py-0.5 rounded text-xs">
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
          <div className="bg-amber-800/40 p-3 rounded-lg text-xs">
            <div className="flex flex-wrap items-center justify-around mb-2 gap-2">
              <div className="font-medium text-amber-200 flex items-center">
                <span className="inline-block h-3 w-3 bg-green-700 rounded-full mr-1"></span>
                <span>PMF no dia de serviço ordinário</span>
              </div>
              <div className="font-medium text-amber-200 flex items-center">
                <span className="inline-block h-3 w-3 bg-blue-700 rounded-full mr-1"></span>
                <span>Escola Segura no dia de serviço ordinário</span>
              </div>
              <div className="font-medium text-amber-200 flex items-center">
                <span className="inline-block h-3 w-3 bg-red-700 rounded-full mr-1"></span>
                <span>PMF e Escola Segura no mesmo dia</span>
              </div>
            </div>
            <div className="text-center text-amber-200 border-t border-amber-700 pt-2 mt-1">
              <Calendar className="inline-block h-4 w-4 mr-1 mb-1" />
              Dados referentes ao mês de {mesAno} | <strong className="text-white">REGRA: Não escalar militares em dias de serviço ordinário</strong>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}