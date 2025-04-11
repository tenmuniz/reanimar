import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, Calendar, FileText, Printer, Award, Users } from "lucide-react";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ResumoEscalaProps {
  schedule: MonthSchedule;
  currentDate: Date;
  combinedSchedules?: CombinedSchedules; // Agendas combinadas para cálculo do limite 12
}

interface MilitarEscalaData {
  dias: number[];
  total: number;
  excedeuLimite: boolean;
  posto: number;
}

export default function ResumoEscala({ schedule, currentDate, combinedSchedules }: ResumoEscalaProps) {
  const [open, setOpen] = useState(false);
  const [resumoData, setResumoData] = useState<Record<string, MilitarEscalaData>>({});
  const { toast } = useToast();
  
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

  // Function to handle printing - cria uma versão para impressão em uma nova janela
  const handlePrint = () => {
    // Cria uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Erro ao abrir janela de impressão",
        description: "Verifique se o navegador permite abrir pop-ups",
        variant: "destructive",
      });
      return;
    }
    
    // Obtém dados dos militares
    const militaresLista = Object.entries(resumoData).map(([nome, dados]) => {
      return {
        nome,
        dias: dados.dias.sort((a, b) => a - b),
        total: dados.total,
        posto: dados.posto
      };
    });
    
    // Conteúdo HTML da página de impressão
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Escala - PMF - ${mesAno}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            text-align: center;
            margin-bottom: 10px;
            color: #03396c;
          }
          h2 {
            text-align: center;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 18px;
            color: #005b96;
          }
          .resumo {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            background: #f0f8ff;
            padding: 10px;
            border-radius: 5px;
          }
          .resumo-item {
            text-align: center;
            flex: 1;
          }
          .resumo-valor {
            font-size: 24px;
            font-weight: bold;
            color: #03396c;
          }
          .resumo-label {
            font-size: 14px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #03396c;
            color: white;
            padding: 10px;
            text-align: left;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f2f7ff;
          }
          .dias-container {
            display: flex;
            flex-wrap: wrap;
          }
          .dia {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #0074d9;
            color: white;
            margin-right: 4px;
            margin-bottom: 4px;
            font-size: 12px;
          }
          .ultimo-dia {
            background-color: #ff851b;
            border: 1px solid #ff5e1b;
            font-weight: bold;
          }
          .total {
            font-weight: bold;
            text-align: center;
          }
          .total-value {
            display: inline-block;
            background-color: #28a745;
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
          }
          .total-max {
            background-color: #ff851b;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            @page {
              size: portrait;
              margin: 1cm;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <h1>POLÍCIA MAIS FORTE</h1>
        <h2>RELATÓRIO DE ESCALA - ${mesAno.toUpperCase()}</h2>
        
        <div class="resumo">
          <div class="resumo-item">
            <div class="resumo-valor">${militarMaisEscalado.nome !== "Nenhum" ? militarMaisEscalado.nome.split(' ').slice(-1)[0] : "Nenhum"}</div>
            <div class="resumo-label">Militar Mais Escalado (${militarMaisEscalado.total} dias)</div>
          </div>
          <div class="resumo-item">
            <div class="resumo-valor">${grupoMaisEscalado.nome}</div>
            <div class="resumo-label">Guarnição Mais Escalada (${grupoMaisEscalado.total} escalas)</div>
          </div>
          <div class="resumo-item">
            <div class="resumo-valor">${totalEscalas}</div>
            <div class="resumo-label">Total de Escalas</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 40%">Policial</th>
              <th style="width: 45%">Dias Escalados</th>
              <th style="width: 15%">Total</th>
            </tr>
          </thead>
          <tbody>
            ${militaresLista.map(militar => `
              <tr>
                <td>${militar.nome}</td>
                <td>
                  <div class="dias-container">
                    ${militar.dias.map((dia, idx) => `
                      <div class="dia ${idx === 11 ? 'ultimo-dia' : ''}" 
                           title="${idx === 11 ? 'Último dia permitido (12º dia)' : 'Dia escalado'}">
                        ${dia}
                      </div>
                    `).join('')}
                  </div>
                </td>
                <td class="total">
                  <span class="total-value ${militar.total === 12 ? 'total-max' : ''}">
                    ${militar.total}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Sistema de Escalas PMF | Limite máximo: 12 extras por policial</p>
          <p>Relatório gerado em: ${new Date().toLocaleString()}</p>
        </div>
        
        <script>
          // Abre a janela de impressão automaticamente
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    // Escreve o conteúdo na nova janela
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };
  
  // Generate summary data from the schedule
  const generateResumo = () => {
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    
    // Schedules para a operação atual
    const monthSchedule = schedule[currentMonthKey] || {};
    
    // Objeto para armazenar todas as escalas por militar
    const militaresDias: Record<string, { 
      dias: number[], 
      total: number,
      excedeuLimite: boolean,
      posto: number,
      operacoes: {
        pmf: number,
        escolaSegura: number
      }
    }> = {};
    
    // Função para processar um schedule e popular militaresDias
    const processSchedule = (scheduleData: any, operacao: 'pmf' | 'escolaSegura') => {
      if (!scheduleData) return;
      
      Object.entries(scheduleData).forEach(([day, officers]) => {
        // Processar cada militar escalado no dia
        (officers as (string | null)[]).forEach((officer: string | null) => {
          if (officer) {
            if (!militaresDias[officer]) {
              militaresDias[officer] = { 
                dias: [], 
                total: 0,
                excedeuLimite: false,
                posto: getPosto(officer),
                operacoes: {
                  pmf: 0,
                  escolaSegura: 0
                }
              };
            }
            
            const dayNum = parseInt(day, 10);
            
            // Adicionar o dia apenas se não estiver já computado para esta operação
            const dayKey = `${operacao}-${dayNum}`;
            if (!militaresDias[officer].dias.includes(dayNum)) {
              militaresDias[officer].dias.push(dayNum);
              militaresDias[officer].total += 1;
              militaresDias[officer].operacoes[operacao] += 1;
            }
          }
        });
      });
    };
    
    // Primeiro, processa o schedule da operação atual
    processSchedule(monthSchedule, schedule === combinedSchedules?.pmf ? 'pmf' : 'escolaSegura');
    
    // Se temos dados combinados, processamos também a outra operação
    if (combinedSchedules) {
      // Determinar se estamos na página PMF ou Escola Segura
      const isCurrentPMF = schedule === combinedSchedules.pmf;
      
      // Processar a outra operação
      if (isCurrentPMF) {
        // Estamos em PMF, então processamos também Escola Segura
        if (combinedSchedules.escolaSegura && combinedSchedules.escolaSegura[currentMonthKey]) {
          processSchedule(combinedSchedules.escolaSegura[currentMonthKey], 'escolaSegura');
        }
      } else {
        // Estamos em Escola Segura, então processamos também PMF
        if (combinedSchedules.pmf && combinedSchedules.pmf[currentMonthKey]) {
          processSchedule(combinedSchedules.pmf[currentMonthKey], 'pmf');
        }
      }
    }
    
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
  
  // Calculate totals and find most scheduled officer and group
  const totalEscalas = Object.values(resumoData).reduce((sum, militar) => sum + militar.total, 0);
  const totalMilitares = Object.keys(resumoData).length;
  
  // Encontrar o militar mais escalado
  let militarMaisEscalado = { nome: "Nenhum", total: 0 };
  
  // Calcular estatísticas por guarnição/grupo
  const estatisticasPorGrupo: Record<string, { total: number, militares: number }> = {
    "EXPEDIENTE": { total: 0, militares: 0 },
    "ALFA": { total: 0, militares: 0 },
    "BRAVO": { total: 0, militares: 0 },
    "CHARLIE": { total: 0, militares: 0 }
  };
  
  // Função para identificar o grupo de um militar
  const getGrupoMilitar = (nome: string): string => {
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
  
  // Processar estatísticas
  Object.entries(resumoData).forEach(([nome, dados]) => {
    // Verificar se é o militar mais escalado
    if (dados.total > militarMaisEscalado.total) {
      militarMaisEscalado = { nome, total: dados.total };
    }
    
    // Acumular estatísticas por grupo
    const grupo = getGrupoMilitar(nome);
    if (grupo !== "OUTROS" && estatisticasPorGrupo[grupo]) {
      estatisticasPorGrupo[grupo].total += dados.total;
      estatisticasPorGrupo[grupo].militares += 1;
    }
  });
  
  // Encontrar o grupo mais escalado
  let grupoMaisEscalado = { nome: "Nenhum", total: 0 };
  Object.entries(estatisticasPorGrupo).forEach(([grupo, dados]) => {
    if (dados.total > grupoMaisEscalado.total) {
      grupoMaisEscalado = { nome: grupo, total: dados.total };
    }
  });
  
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
              <span className="text-blue-200 font-medium flex items-center">
                <Award className="h-4 w-4 mr-1" />
                Militar Mais Escalado
              </span>
              <span className="text-2xl font-bold text-white my-1">{militarMaisEscalado.nome !== "Nenhum" ? militarMaisEscalado.nome.split(' ').slice(-1)[0] : "Nenhum"}</span>
              <span className="text-yellow-300 text-sm font-medium">{militarMaisEscalado.total} dias</span>
            </div>
            <div className="bg-blue-700 p-4 rounded-lg shadow-inner flex flex-col items-center">
              <span className="text-blue-200 font-medium flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Guarnição Mais Escalada
              </span>
              <span className="text-2xl font-bold text-white my-1">{grupoMaisEscalado.nome}</span>
              <span className="text-yellow-300 text-sm font-medium">{grupoMaisEscalado.total} escalas</span>
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
                // Classe do background com base na paridade
                const bgClass = index % 2 === 0 
                  ? 'bg-blue-800/40' 
                  : 'bg-blue-800/20';
                
                // Classe do contador com base no limite
                const countClass = dados.total === 12
                  ? "bg-yellow-600" // Amarelo para quem atingiu o limite exato
                  : "bg-green-600"; // Verde para quem está abaixo do limite
                
                return (
                  <div 
                    key={militar} 
                    className={`flex items-center text-sm px-2 py-3 rounded mb-1 ${bgClass}`}
                  >
                    <div className="w-[50%] font-medium text-white">
                      {militar}
                    </div>
                    <div className="w-[35%] flex flex-wrap">
                      {dados.dias.sort((a, b) => a - b).map((dia, idx) => {
                        // Mudar cor apenas para os dias de limite máximo (12º dia)
                        const isUltimoPermitido = idx === 11; // Índice 11 é o 12º dia (começa em 0)
                        const circleBgClass = isUltimoPermitido 
                          ? "bg-yellow-600" 
                          : "bg-blue-600";
                        
                        return (
                          <span 
                            key={`${militar}-dia-${dia}`} 
                            className={`inline-flex items-center justify-center h-6 w-6 mr-1 mb-1 ${circleBgClass} rounded-full text-xs ${
                              isUltimoPermitido ? 'border border-yellow-300 font-bold' : ''
                            }`}
                            title={isUltimoPermitido ? "Último dia permitido (12º dia)" : ""}
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
                <span className="inline-block h-3 w-3 bg-yellow-600 rounded-full mr-1"></span>
                <span>Limite atingido (12 dias)</span>
              </div>
              <div className="font-medium text-yellow-300 flex items-center">
                <span className="inline-block h-3 w-3 bg-green-600 rounded-full mr-1"></span>
                <span>Dentro do limite (abaixo de 12 dias)</span>
              </div>
              <Button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 flex items-center text-xs"
              >
                <Printer className="h-3 w-3 mr-1" />
                Imprimir Resumo
              </Button>
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