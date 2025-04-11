import { useState, useEffect } from "react";
import { formatMonthYear } from "@/lib/utils";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileWarning, Download, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  servicoOrdinario,
  operationType = 'pmf',
}: VerificadorInconsistenciasProps) {
  const [open, setOpen] = useState(false);
  const [inconsistencias, setInconsistencias] = useState<Inconsistencia[]>([]);
  
  // Mapear militares para suas guarnições
  const getGuarnicaoMilitar = (nome: string): string => {
    // ALFA
    if (nome.includes("PEIXOTO") || nome.includes("RODRIGO") || 
        nome.includes("LEDO") || nome.includes("NUNES") || 
        nome.includes("AMARAL") || nome.includes("CARLA") || 
        nome.includes("FELIPE") || nome.includes("BARROS") || 
        nome.includes("A. SILVA") || nome.includes("LUAN") || 
        nome.includes("NAVARRO")) {
      return "ALFA";
    } 
    // BRAVO
    else if (nome.includes("OLIMAR") || nome.includes("FÁBIO") || 
            nome.includes("ANA CLEIDE") || nome.includes("GLEIDSON") || 
            nome.includes("CARLOS EDUARDO") || nome.includes("NEGRÃO") || 
            nome.includes("BRASIL") || nome.includes("MARVÃO") || 
            nome.includes("IDELVAN")) {
      return "BRAVO";
    } 
    // CHARLIE
    else if (nome.includes("PINHEIRO") || nome.includes("RAFAEL") || 
            nome.includes("MIQUEIAS") || nome.includes("M. PAIXÃO") || 
            nome.includes("CHAGAS") || nome.includes("CARVALHO") || 
            nome.includes("GOVEIA") || nome.includes("ALMEIDA") || 
            nome.includes("PATRIK") || nome.includes("GUIMARÃES")) {
      return "CHARLIE";
    }
    // EXPEDIENTE e outros
    return "OUTROS";
  };
  
  // Análise das inconsistências
  const verificarInconsistencias = () => {
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const inconsistenciasEncontradas: Inconsistencia[] = [];
    
    // Se não temos serviço ordinário para verificar, não há como encontrar inconsistências
    if (!servicoOrdinario) {
      setInconsistencias([]);
      return;
    }
    
    // Se não temos agenda, não há inconsistências
    const monthSchedule = schedule[currentMonthKey] || {};
    if (Object.keys(monthSchedule).length === 0) {
      setInconsistencias([]);
      return;
    }
    
    // Verificar cada dia da operação atual (PMF ou Escola Segura)
    Object.entries(monthSchedule).forEach(([dia, oficiais]) => {
      // Obter os militares escalados para este dia
      const militaresEscalados = (oficiais as (string | null)[]).filter(
        (militar): militar is string => militar !== null
      );
      
      // Verificar a escala ordinária para este dia
      const guarnicoesOrdinariasNoDia = servicoOrdinario[dia] || {};
      
      // Para cada militar escalado, verificar se está também no serviço ordinário
      militaresEscalados.forEach(militar => {
        const guarnicaoMilitar = getGuarnicaoMilitar(militar);
        
        // Verificar se a guarnição deste militar está escalada no serviço ordinário deste dia
        Object.entries(guarnicoesOrdinariasNoDia).forEach(([guarnicao, _]) => {
          if (guarnicaoMilitar === guarnicao) {
            inconsistenciasEncontradas.push({
              dia: parseInt(dia),
              militar,
              guarnicaoOrdinaria: guarnicao,
              operacao: operationType === 'pmf' ? 'Polícia Mais Forte' : 'Escola Segura'
            });
          }
        });
      });
    });
    
    // Se temos escala combinada, verificar também a outra operação
    if (combinedSchedules) {
      const outraOperacao = operationType === 'pmf' ? 'escolaSegura' : 'pmf';
      const outraSchedule = combinedSchedules[outraOperacao] || {};
      const outraMonthSchedule = outraSchedule[currentMonthKey] || {};
      
      // Verificar militares desta operação que estão também na outra operação no mesmo dia
      Object.entries(monthSchedule).forEach(([dia, oficiais]) => {
        const militaresEscalados = (oficiais as (string | null)[]).filter(
          (militar): militar is string => militar !== null
        );
        
        const outraDiaSchedule = outraMonthSchedule[dia] || [];
        const outraMilitares = (outraDiaSchedule as (string | null)[]).filter(
          (militar): militar is string => militar !== null
        );
        
        // Verificar sobreposição de militares nas duas operações
        militaresEscalados.forEach(militar => {
          if (outraMilitares.includes(militar)) {
            inconsistenciasEncontradas.push({
              dia: parseInt(dia),
              militar,
              guarnicaoOrdinaria: 'N/A',
              operacao: 'Ambas (PMF e Escola Segura)'
            });
          }
        });
      });
    }
    
    // Ordenar por dia e salvar
    setInconsistencias(
      inconsistenciasEncontradas.sort((a, b) => a.dia - b.dia)
    );
  };
  
  // Verificar inconsistências quando o diálogo for aberto
  useEffect(() => {
    if (open) {
      verificarInconsistencias();
    }
  }, [open, schedule, combinedSchedules, servicoOrdinario]);
  
  // Nome do mês para exibição
  const mesAno = formatMonthYear(currentDate);
  
  // Função para imprimir o relatório
  const handlePrint = () => {
    // Abrir uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir o relatório.');
      return;
    }
    
    // Título do relatório
    const tituloOperacao = operationType === 'escolaSegura' ? 'ESCOLA SEGURA' : 'POLÍCIA MAIS FORTE';
    
    // Conteúdo HTML da página de impressão
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Inconsistências - ${tituloOperacao} - ${mesAno}</title>
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
            color: #d32f2f;
          }
          .resumo {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            background: #fef2f2;
            padding: 12px;
            border-radius: 5px;
            border: 1px solid #ffcdd2;
          }
          .resumo-item {
            text-align: center;
            flex: 1;
          }
          .resumo-valor {
            font-size: 24px;
            font-weight: bold;
            color: #d32f2f;
          }
          .resumo-label {
            font-size: 14px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border: 1px solid #ddd;
          }
          th {
            background-color: #d32f2f;
            color: white;
            padding: 10px;
            text-align: left;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #fff5f5;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .warning-badge {
            display: inline-block;
            background-color: #FFC107;
            color: #333;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
          }
          .error-badge {
            display: inline-block;
            background-color: #F44336;
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
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
        <h1>${tituloOperacao}</h1>
        <h2>RELATÓRIO DE INCONSISTÊNCIAS - ${mesAno.toUpperCase()}</h2>
        
        <div class="resumo">
          <div class="resumo-item">
            <div class="resumo-valor">${inconsistencias.length}</div>
            <div class="resumo-label">Inconsistências Encontradas</div>
          </div>
        </div>
        
        ${inconsistencias.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th style="width: 15%">Dia</th>
                <th style="width: 30%">Militar</th>
                <th style="width: 20%">Guarnição</th>
                <th style="width: 35%">Problema</th>
              </tr>
            </thead>
            <tbody>
              ${inconsistencias.map(inconsistencia => `
                <tr>
                  <td>${inconsistencia.dia}</td>
                  <td>${inconsistencia.militar}</td>
                  <td>${inconsistencia.guarnicaoOrdinaria}</td>
                  <td>
                    ${inconsistencia.operacao === 'Ambas (PMF e Escola Segura)' 
                      ? `<span class="error-badge">Escalado em duas operações extras</span>`
                      : `<span class="warning-badge">Escalado no serviço ordinário e ${inconsistencia.operacao}</span>`
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <div style="text-align: center; padding: 40px; color: #2e7d32; font-weight: bold;">
            Nenhuma inconsistência encontrada. Todas as escalas parecem estar corretas.
          </div>
        `}
        
        <div class="footer">
          <p>Sistema de Escalas ${operationType === 'escolaSegura' ? 'ESCOLA SEGURA' : 'PMF'} | Verificador de Inconsistências</p>
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative group overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 
          text-white font-bold px-5 py-3 rounded-lg flex items-center transform transition-all duration-200 
          border border-amber-400 shadow-[0_8px_0_rgb(194,65,12),0_15px_20px_rgba(0,0,0,0.3)]
          hover:shadow-[0_4px_0_rgb(194,65,12),0_8px_15px_rgba(0,0,0,0.3)]
          active:translate-y-4 active:shadow-[0_0px_0_rgb(194,65,12),0_0px_10px_rgba(0,0,0,0.2)]"
      >
        {/* Efeito de brilho no hover */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/30 to-white/0 
          transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        
        <AlertTriangle className="h-5 w-5 mr-2 drop-shadow-lg" />
        <span>Verificar</span>
      </button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] bg-gradient-to-br from-amber-900 to-orange-900 text-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl font-bold text-center text-white mb-4">
              <FileWarning className="h-6 w-6 mr-2 text-amber-300" />
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 text-transparent bg-clip-text">
                VERIFICADOR DE INCONSISTÊNCIAS - {mesAno.toUpperCase()}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {/* Botão de Impressão */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={handlePrint}
              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Relatório
            </Button>
          </div>
          
          {/* Explicação */}
          <div className="bg-amber-800/50 p-4 rounded-lg mb-4 text-sm">
            <p>Este verificador identifica possíveis inconsistências nas escalas:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Militares escalados no serviço ordinário e na operação {operationType === 'pmf' ? 'Polícia Mais Forte' : 'Escola Segura'} no mesmo dia</li>
              <li>Militares escalados nas operações PMF e Escola Segura simultaneamente</li>
            </ul>
          </div>
          
          {/* Estatísticas */}
          <div className="bg-amber-800/50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-r from-amber-700 to-amber-800 p-3 rounded-lg text-center">
                <p className="text-amber-200 text-sm">Inconsistências Encontradas</p>
                <p className="text-2xl font-bold text-white">{inconsistencias.length}</p>
              </div>
            </div>
          </div>
          
          {/* Lista de inconsistências */}
          <div className="space-y-3 max-h-[350px] overflow-auto pr-2">
            {inconsistencias.length === 0 ? (
              <div className="p-8 text-center bg-gradient-to-r from-green-700/30 to-green-800/30 rounded-lg">
                <p className="text-green-300 font-bold text-lg">Nenhuma inconsistência encontrada</p>
                <p className="text-green-400/80 mt-2">Todas as escalas parecem estar corretas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-amber-800/60 text-left">
                      <th className="p-2 rounded-tl-md">Dia</th>
                      <th className="p-2">Militar</th>
                      <th className="p-2">Guarnição</th>
                      <th className="p-2 rounded-tr-md">Problema</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inconsistencias.map((item, index) => (
                      <tr 
                        key={`inconsistencia-${index}`} 
                        className={`${index % 2 === 0 ? 'bg-amber-800/20' : 'bg-amber-800/30'} hover:bg-amber-700/40 transition-colors`}
                      >
                        <td className="p-2 border-t border-amber-700/30">{item.dia}</td>
                        <td className="p-2 border-t border-amber-700/30 font-medium">{item.militar}</td>
                        <td className="p-2 border-t border-amber-700/30">{item.guarnicaoOrdinaria}</td>
                        <td className="p-2 border-t border-amber-700/30">
                          {item.operacao === 'Ambas (PMF e Escola Segura)' ? (
                            <Badge variant="destructive" className="bg-red-600">
                              Escalado em duas operações extras
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-600/50 text-white border-amber-500">
                              Escalado no serviço ordinário e {item.operacao}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Legenda */}
          <div className="bg-amber-800/40 p-3 rounded-lg text-xs mt-2">
            <div className="text-center text-amber-200 border-t border-amber-700 pt-2 mt-1">
              <AlertTriangle className="inline-block h-4 w-4 mr-1 mb-1" />
              Dados referentes ao mês de {mesAno} | <strong className="text-white">Verificador de Inconsistências</strong>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}