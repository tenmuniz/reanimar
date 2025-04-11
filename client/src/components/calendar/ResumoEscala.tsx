import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, Calendar, FileText } from "lucide-react";
import { MonthSchedule } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";

interface ResumoEscalaProps {
  schedule: MonthSchedule;
  currentDate: Date;
}

interface MilitarEscalaData {
  dias: number[];
  total: number;
  excedeuLimite: boolean;
  posto: number;
}

export default function ResumoEscala({ schedule, currentDate }: ResumoEscalaProps) {
  const [open, setOpen] = useState(false);
  const [resumoData, setResumoData] = useState<Record<string, MilitarEscalaData>>({});
  
  // Compute summary whenever the schedule changes or the modal is opened
  useEffect(() => {
    if (open) {
      generateResumo();
    }
  }, [open, schedule, currentDate]);
  
  // Função para extrair o posto/graduação de um militar
  const getPosto = (nome: string): number => {
    // Ordem de antiguidade - quanto menor o número, mais antigo
    const postos: Record<string, number> = {
      "CEL PM": 1,
      "TEN CEL PM": 2,
      "MAJ PM": 3,
      "CAP": 4,
      "CAP PM": 4,
      "CAP QOPM": 4,
      "1º TEN": 5,
      "1º TEN PM": 5,
      "1º TEN QOPM": 5,
      "2º TEN PM": 6,
      "TEN": 7,
      "ASP OF PM": 8,
      "SUB TEN": 9,
      "SUB TEN PM": 9,
      "1º SGT": 10,
      "1º SGT PM": 10,
      "2º SGT": 11,
      "2º SGT PM": 11,
      "3º SGT": 12,
      "3º SGT PM": 12,
      "CB": 13,
      "CB PM": 13,
      "SD": 14,
      "SD PM": 14
    };
    
    // Verificar qual posto está presente no nome
    for (const [posto, valor] of Object.entries(postos)) {
      if (nome.includes(posto)) {
        return valor;
      }
    }
    
    return 99; // Caso não encontre nenhum posto conhecido
  };

  // Generate summary data from the schedule
  const generateResumo = () => {
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const monthSchedule = schedule[currentMonthKey] || {};
    
    const militaresDias: Record<string, { 
      dias: number[], 
      total: number,
      excedeuLimite: boolean,
      posto: number
    }> = {};
    
    // Percorrer cada dia do mês
    Object.entries(monthSchedule).forEach(([day, officers]) => {
      // Processar cada militar escalado no dia
      officers.forEach(officer => {
        if (officer) {
          if (!militaresDias[officer]) {
            militaresDias[officer] = { 
              dias: [], 
              total: 0,
              excedeuLimite: false,
              posto: getPosto(officer)
            };
          }
          
          const dayNum = parseInt(day, 10);
          if (!militaresDias[officer].dias.includes(dayNum)) {
            militaresDias[officer].dias.push(dayNum);
            militaresDias[officer].total += 1;
            
            // Verificar se excedeu o limite de 12 dias
            if (militaresDias[officer].total > 12) {
              militaresDias[officer].excedeuLimite = true;
            }
          }
        }
      });
    });
    
    // Ordenar por antiguidade (posto/graduação) e depois por total de dias
    const ordenado = Object.fromEntries(
      Object.entries(militaresDias)
        .sort((a, b) => {
          // Primeiro por antiguidade (posto mais antigo primeiro)
          if (a[1].posto !== b[1].posto) {
            return a[1].posto - b[1].posto;
          }
          // Em caso de mesmo posto, ordena por total de dias (decrescente)
          return b[1].total - a[1].total;
        })
    );
    
    setResumoData(ordenado);
  };
  
  // Get the month name for display
  const mesAno = formatMonthYear(currentDate);
  
  // Calculate totals
  const totalEscalas = Object.values(resumoData).reduce((sum, militar) => sum + militar.total, 0);
  const totalMilitares = Object.keys(resumoData).length;
  
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center shadow-sm transition"
      >
        <BarChart3 className="h-5 w-5 mr-1" />
        Resumo
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-blue-900 to-blue-800 text-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl font-bold text-center text-white mb-4">
              <FileText className="h-6 w-6 mr-2 text-yellow-300" />
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-transparent bg-clip-text">
                RESUMO DE ESCALA - {mesAno.toUpperCase()}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {/* Estatísticas gerais */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-700 p-4 rounded-lg shadow-inner flex flex-col items-center">
              <span className="text-blue-200 font-medium">Total de Escalas</span>
              <span className="text-3xl font-bold text-white">{totalEscalas}</span>
            </div>
            <div className="bg-blue-700 p-4 rounded-lg shadow-inner flex flex-col items-center">
              <span className="text-blue-200 font-medium">Militares Escalados</span>
              <span className="text-3xl font-bold text-white">{totalMilitares}</span>
            </div>
          </div>
          
          {/* Lista de militares */}
          <div className="bg-blue-700/50 rounded-lg p-2 mb-4 max-h-[350px] overflow-auto">
            <div className="flex font-bold text-sm text-blue-100 px-2 py-1 mb-1 border-b border-blue-500">
              <div className="w-[50%]">Policial</div>
              <div className="w-[35%]">Dias Escalados</div>
              <div className="w-[15%] text-center">Total</div>
            </div>
            
            {Object.keys(resumoData).length === 0 ? (
              <div className="p-4 text-center text-blue-200">
                Nenhum militar escalado para este mês
              </div>
            ) : (
              Object.entries(resumoData).map(([militar, dados], index) => {
                // Classe do background com base na paridade e status de limite
                const bgClass = dados.excedeuLimite
                  ? 'bg-red-900/60' // Fundo vermelho para militares que excederam o limite
                  : index % 2 === 0 
                    ? 'bg-blue-800/40' 
                    : 'bg-blue-800/20';
                
                // Classe do contador com base no limite
                const countClass = dados.excedeuLimite
                  ? "bg-red-600" // Vermelho para quem excedeu
                  : dados.total === 12
                    ? "bg-yellow-600" // Amarelo para quem atingiu o limite exato
                    : "bg-green-600"; // Verde para quem está abaixo do limite
                
                return (
                  <div 
                    key={militar} 
                    className={`flex items-center text-sm px-2 py-3 rounded mb-1 ${bgClass}`}
                  >
                    <div className="w-[50%] font-medium text-white">
                      {militar}
                      {dados.excedeuLimite && (
                        <div className="text-xs font-normal text-red-300 mt-1">
                          Limite de 12 dias excedido!
                        </div>
                      )}
                    </div>
                    <div className="w-[35%] flex flex-wrap">
                      {dados.dias.sort((a, b) => a - b).map((dia, idx) => {
                        // Alterar cor dos círculos após o 12º dia
                        const isExcedido = idx >= 12;
                        const circleBgClass = isExcedido 
                          ? "bg-red-600" 
                          : "bg-blue-600";
                        
                        return (
                          <span 
                            key={`${militar}-dia-${dia}`} 
                            className={`inline-flex items-center justify-center h-6 w-6 mr-1 mb-1 ${circleBgClass} rounded-full text-xs ${
                              isExcedido ? 'border border-red-300 font-bold' : ''
                            }`}
                            title={isExcedido ? "Dia excedente ao limite mensal" : ""}
                          >
                            {dia}
                          </span>
                        );
                      })}
                    </div>
                    <div className="w-[15%] text-center">
                      <span className={`inline-block ${countClass} text-white rounded-full px-3 py-1 font-bold`}>
                        {dados.total}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Legenda e informações sobre limite */}
          <div className="bg-blue-800/40 p-3 rounded-lg text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-yellow-300 flex items-center">
                <span className="inline-block h-3 w-3 bg-red-600 rounded-full mr-1"></span>
                <span>Limite excedido (acima de 12 dias)</span>
              </div>
              <div className="font-medium text-yellow-300 flex items-center">
                <span className="inline-block h-3 w-3 bg-yellow-600 rounded-full mr-1"></span>
                <span>Limite atingido (12 dias)</span>
              </div>
              <div className="font-medium text-yellow-300 flex items-center">
                <span className="inline-block h-3 w-3 bg-green-600 rounded-full mr-1"></span>
                <span>Dentro do limite (abaixo de 12 dias)</span>
              </div>
            </div>
            <div className="text-center text-blue-200 border-t border-blue-700 pt-2 mt-1">
              <Calendar className="inline-block h-4 w-4 mr-1 mb-1" />
              Dados referentes ao mês de {mesAno} | Limite máximo: 12 extras por militar
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}