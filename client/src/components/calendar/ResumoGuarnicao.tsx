import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Calendar, FileText } from "lucide-react";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";

interface ResumoGuarnicaoProps {
  schedule: MonthSchedule;
  currentDate: Date;
  combinedSchedules?: CombinedSchedules;
  operationType?: 'pmf' | 'escolaSegura'; // Tipo de operação: PMF (padrão) ou Escola Segura
}

export default function ResumoGuarnicao({
  schedule,
  currentDate,
  combinedSchedules,
  operationType = 'pmf'
}: ResumoGuarnicaoProps) {
  const [open, setOpen] = useState(false);
  const [guarnicoesData, setGuarnicoesData] = useState<Record<string, { dias: number[], total: number }>>({});
  
  // Atualizar os dados sempre que o modal for aberto ou os dados mudarem
  useEffect(() => {
    if (open) {
      console.log("Resumo de guarnições - dados recebidos:", schedule);
      generateResumoGuarnicoes();
    }
  }, [open, schedule, currentDate]);
  
  // Função para identificar a guarnição de um militar
  const getGuarnicaoMilitar = (nome: string): string => {
    if (nome.includes("QOPM") || nome.includes("MONTEIRO") || 
        nome.includes("VANILSON") || nome.includes("ANDRÉ") || 
        nome.includes("CUNHA") || nome.includes("CARAVELAS") || 
        nome.includes("TONI") || nome.includes("CORREA") || 
        nome.includes("RODRIGUES") || nome.includes("TAVARES")) {
      return "EXPEDIENTE";
    } else if (nome.includes("PEIXOTO") || nome.includes("RODRIGO") || 
               nome.includes("LEDO") || nome.includes("NUNES") || 
               nome.includes("AMARAL") || nome.includes("CARLA") || 
               nome.includes("FELIPE") || nome.includes("BARROS") || 
               nome.includes("A. SILVA") || nome.includes("LUAN") || 
               nome.includes("NAVARRO")) {
      return "ALFA";
    } else if (nome.includes("OLIMAR") || nome.includes("FÁBIO") || 
               nome.includes("ANA CLEIDE") || nome.includes("GLEIDSON") || 
               nome.includes("CARLOS EDUARDO") || nome.includes("NEGRÃO") || 
               nome.includes("BRASIL") || nome.includes("MARVÃO") || 
               nome.includes("IDELVAN")) {
      return "BRAVO";
    } else if (nome.includes("PINHEIRO") || nome.includes("RAFAEL") || 
               nome.includes("MIQUEIAS") || nome.includes("M. PAIXÃO") || 
               nome.includes("CHAGAS") || nome.includes("CARVALHO") || 
               nome.includes("GOVEIA") || nome.includes("ALMEIDA") || 
               nome.includes("PATRIK") || nome.includes("GUIMARÃES")) {
      return "CHARLIE";
    }
    return "OUTROS";
  };

  const generateResumoGuarnicoes = () => {
    // Chave do mês atual
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
    
    // Obter dados do mês atual
    const monthSchedule = schedule[currentMonthKey] || {};
    
    // Objeto para armazenar contagem por guarnição
    const guarnicoes: Record<string, { dias: number[], total: number }> = {
      "EXPEDIENTE": { dias: [], total: 0 },
      "ALFA": { dias: [], total: 0 },
      "BRAVO": { dias: [], total: 0 },
      "CHARLIE": { dias: [], total: 0 },
      "OUTROS": { dias: [], total: 0 }
    };
    
    // Analisar cada dia e militar para identificar guarnição
    if (monthSchedule) {
      Object.entries(monthSchedule).forEach(([day, daySchedule]) => {
        const dayNum = parseInt(day, 10);
        
        if (Array.isArray(daySchedule)) {
          daySchedule.forEach(militar => {
            if (militar) {
              const guarnicao = getGuarnicaoMilitar(militar);
              if (!guarnicoes[guarnicao].dias.includes(dayNum)) {
                guarnicoes[guarnicao].dias.push(dayNum);
              }
              guarnicoes[guarnicao].total++;
            }
          });
        }
      });
    }
    
    // Remover guarnição OUTROS se não tiver nenhum registro
    if (guarnicoes["OUTROS"].total === 0) {
      delete guarnicoes["OUTROS"];
    }
    
    setGuarnicoesData(guarnicoes);
  };

  // Obter o nome do mês para exibição
  const mesAno = formatMonthYear(currentDate);
  
  // Calcular o total de escalas
  const totalEscalas = Object.values(guarnicoesData).reduce((sum, guarnicao) => sum + guarnicao.total, 0);
  
  // Encontrar guarnição mais escalada
  let guarnicaoMaisEscalada = "";
  let maxEscalas = 0;
  
  Object.entries(guarnicoesData).forEach(([nome, dados]) => {
    if (dados.total > maxEscalas) {
      guarnicaoMaisEscalada = nome;
      maxEscalas = dados.total;
    }
  });

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 flex items-center px-3 py-2 rounded-md shadow-sm"
      >
        <Users className="h-4 w-4 mr-2 text-blue-600" />
        <span className="font-medium">Guarnição</span>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-indigo-900 to-indigo-800 text-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl font-bold text-center text-white mb-4">
              <FileText className="h-6 w-6 mr-2 text-cyan-300" />
              <span className="bg-gradient-to-r from-cyan-300 to-cyan-500 text-transparent bg-clip-text">
                DISTRIBUIÇÃO POR GUARNIÇÃO - {mesAno.toUpperCase()}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-700 p-4 rounded-lg shadow-inner flex flex-col items-center">
              <span className="text-indigo-200 font-medium mb-1">Total de Escalas</span>
              <span className="text-3xl font-bold text-white">{totalEscalas}</span>
            </div>
            
            <div className="bg-indigo-700 p-4 rounded-lg shadow-inner flex flex-col items-center">
              <span className="text-indigo-200 font-medium mb-1">Guarnição Mais Escalada</span>
              <span className="text-3xl font-bold text-white">
                {guarnicaoMaisEscalada || "N/A"}
              </span>
            </div>
          </div>
          
          {/* Gráfico de Barras Simples */}
          <div className="bg-indigo-800/40 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-center text-indigo-100">
              Distribuição de Escalas
            </h3>
            
            <div className="space-y-4">
              {Object.entries(guarnicoesData)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([guarnicao, dados]) => {
                  // Calcular a porcentagem para a largura da barra
                  const porcentagem = totalEscalas > 0 
                    ? Math.round((dados.total / totalEscalas) * 100) 
                    : 0;
                  
                  // Definir cor com base na guarnição
                  const corBarra = 
                    guarnicao === "EXPEDIENTE" ? "bg-cyan-500" :
                    guarnicao === "ALFA" ? "bg-green-500" :
                    guarnicao === "BRAVO" ? "bg-yellow-500" :
                    guarnicao === "CHARLIE" ? "bg-red-500" :
                    "bg-gray-500";
                  
                  return (
                    <div key={guarnicao} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-indigo-100">{guarnicao}</span>
                        <span className="text-sm font-medium text-indigo-100">
                          {dados.total} ({porcentagem}%)
                        </span>
                      </div>
                      <div className="w-full bg-indigo-950 rounded-full h-4 overflow-hidden">
                        <div 
                          className={`${corBarra} h-4 rounded-full transition-all duration-500`}
                          style={{ width: `${porcentagem}%` }}
                        ></div>
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
          
          {/* Detalhamento por Guarnição */}
          <div className="bg-indigo-800/40 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3 text-center text-indigo-100">
              Detalhamento por Guarnição
            </h3>
            
            {Object.entries(guarnicoesData).length === 0 ? (
              <div className="p-4 text-center text-indigo-200">
                Nenhuma guarnição registrada para este mês
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(guarnicoesData)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([guarnicao, dados]) => {
                    // Definir cor com base na guarnição
                    const corHeader = 
                      guarnicao === "EXPEDIENTE" ? "bg-cyan-700" :
                      guarnicao === "ALFA" ? "bg-green-700" :
                      guarnicao === "BRAVO" ? "bg-yellow-700" :
                      guarnicao === "CHARLIE" ? "bg-red-700" :
                      "bg-gray-700";
                    
                    const corBadge = 
                      guarnicao === "EXPEDIENTE" ? "bg-cyan-500" :
                      guarnicao === "ALFA" ? "bg-green-500" :
                      guarnicao === "BRAVO" ? "bg-yellow-500" :
                      guarnicao === "CHARLIE" ? "bg-red-500" :
                      "bg-gray-500";
                    
                    return (
                      <div 
                        key={guarnicao} 
                        className="bg-indigo-900/40 rounded-lg overflow-hidden border border-indigo-700"
                      >
                        <div className={`${corHeader} p-2 text-center font-bold text-white`}>
                          {guarnicao}
                        </div>
                        <div className="p-3">
                          <div className="flex justify-between mb-2">
                            <span className="text-indigo-200">Total de Escalas:</span>
                            <span className={`${corBadge} text-white px-2 py-0.5 rounded-full text-sm font-medium`}>
                              {dados.total}
                            </span>
                          </div>
                          <div>
                            <span className="text-indigo-200 text-sm">Dias com escalas:</span>
                            <div className="flex flex-wrap mt-1">
                              {dados.dias.sort((a, b) => a - b).map(dia => (
                                <span 
                                  key={`${guarnicao}-dia-${dia}`}
                                  className={`${corBadge} text-white text-xs rounded-full w-6 h-6 flex items-center justify-center m-0.5`}
                                >
                                  {dia}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                })}
              </div>
            )}
          </div>
          
          {/* Legenda e informação */}
          <div className="text-center text-indigo-200 text-xs">
            <Calendar className="inline-block h-4 w-4 mr-1 mb-1" />
            Dados referentes ao mês de {mesAno} | Os militares são agrupados por guarnições conforme escala ordinária
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}