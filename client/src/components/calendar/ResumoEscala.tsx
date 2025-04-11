import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, Calendar, FileText, Printer, Award, Users, Search } from "lucide-react";
import { MonthSchedule, CombinedSchedules } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

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
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Função para filtrar militares com base no termo de busca
  const filteredMilitares = () => {
    return Object.entries(resumoData).filter(([militar]) => 
      searchTerm === "" || militar.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  // HOOK CRÍTICO: Atualizar o resumo sempre que schedule mudar ou o modal for aberto
  useEffect(() => {
    if (open) {
      console.log("🔄 RESUMO ABERTO - Forçando atualização com os dados mais recentes");
      // Verificação crítica: logging dos dados para garantir que temos os dados corretos
      console.log("📊 DADOS DISPONÍVEIS PARA RESUMO:");
      console.log("📅 Data atual:", currentDate);
      console.log("📋 Schedule:", schedule);
      console.log("🔄 Atualizando resumo agora...");
      
      // Importante: regenerar sempre que abrir o modal ou quando os dados mudarem
      generateResumo();
    } else {
      // Limpar o termo de busca quando o modal for fechado
      setSearchTerm("");
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
            <div class="resumo-valor" style="font-size: ${militaresMaisEscalados.length > 2 ? '18px' : '24px'}">
              ${militaresMaisEscalados.length > 0 
                ? militaresMaisEscalados.map(m => m.nome).join('<br />') 
                : "Nenhum"
              }
            </div>
            <div class="resumo-label">
              ${militaresMaisEscalados.length === 1 ? "Militar Mais Escalado" : "Militares Mais Escalados"}
              ${militaresMaisEscalados.length > 0 ? `(${militaresMaisEscalados[0].total} dias)` : ""}
            </div>
          </div>
          <div class="resumo-item">
            <div class="resumo-valor">${totalMilitares}</div>
            <div class="resumo-label">Militares Escalados</div>
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
  
  // REIMPLEMENTAÇÃO TOTAL DO RESUMO - Garantir contagem precisa
  const generateResumo = () => {
    // Chave do mês atual
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    
    // Obtém os dados do schedule atual - importante ter os dados mais recentes
    const monthSchedule = schedule[currentMonthKey] || {};
    
    // Debug: mostrar os dados recebidos
    console.log("DADOS DE SCHEDULE RECEBIDOS:", monthSchedule);
    
    // Objeto para armazenar todas as escalas por militar - declarado como let para poder reinicializar
    let militaresDias: Record<string, { 
      dias: number[], 
      total: number,
      excedeuLimite: boolean,
      posto: number,
      operacoes: {
        pmf: number
      }
    }> = {};
    
    // ALGORITMO COMPLETAMENTE REESCRITO COM ABORDAGEM SUPER SIMPLES
    // Para ter certeza absoluta da contagem
    
    // Limpar contadores existentes
    Object.keys(militaresDias).forEach(key => {
      delete militaresDias[key];
    });
    
    // Pegar dados mais recentes
    const scheduleToProcess = monthSchedule;
    
    console.log("PROCESSANDO DADOS DA ESCALA:", scheduleToProcess);
    
    // Criar um contador simples de dias escalados por militar
    const contador: Record<string, { dias: number[], total: number }> = {};
    
    // Iterar sobre cada dia do mês no schedule
    if (scheduleToProcess) {
      Object.entries(scheduleToProcess).forEach(([day, daySchedule]) => {
        // Converter para número
        const dayNum = parseInt(day, 10);
        
        // Verificar cada posição no dia
        (daySchedule as (string | null)[]).forEach(militar => {
          // Só processar se houver um militar escalado
          if (militar) {
            // Inicializar contador para este militar se ainda não existe
            if (!contador[militar]) {
              contador[militar] = {
                dias: [],
                total: 0
              };
            }
            
            // Adicionar apenas se ainda não contabilizamos este dia
            if (!contador[militar].dias.includes(dayNum)) {
              contador[militar].dias.push(dayNum);
              contador[militar].total++;
            }
          }
        });
      });
    }
    
    // Log detalhado para verificação
    console.log("CONTAGEM FINAL DE SERVIÇOS:", 
      Object.entries(contador)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([militar, dados]) => `${militar}: ${dados.total} serviços [${dados.dias.join(',')}]`)
    );
    
    // Especial: verificar e destacar CAP QOPM MUNIZ (o militar com problemas)
    const dadosCapMuniz = contador["CAP QOPM MUNIZ"];
    if (dadosCapMuniz) {
      console.log("⚠️ VERIFICAÇÃO ESPECIAL - CAP QOPM MUNIZ:", 
        `Total: ${dadosCapMuniz.total} serviços em dias: ${dadosCapMuniz.dias.join(', ')}`);
    }
    
    // Converter para o formato militaresDias para exibição no Resumo
    Object.entries(contador).forEach(([militar, dados]) => {
      militaresDias[militar] = {
        dias: dados.dias,
        total: dados.total,
        excedeuLimite: dados.total >= 12, // Regra rígida: 12 é o limite absoluto
        posto: getPosto(militar),
        operacoes: {
          pmf: dados.total
        }
      };
      
      // Alertas importantes quando o limite é atingido
      if (dados.total > 12) {
        console.error(`🚨 LIMITE EXCEDIDO: ${militar} tem ${dados.total} serviços (máximo: 12)`);
      } else if (dados.total === 12) {
        console.warn(`⚠️ LIMITE MÁXIMO: ${militar} atingiu exatamente 12 serviços`);
      }
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
  
  // Calculate totals and find most scheduled officer and group
  const totalEscalas = Object.values(resumoData).reduce((sum, militar) => sum + militar.total, 0);
  const totalMilitares = Object.keys(resumoData).length;
  
  // Encontrar TODOS os militares mais escalados (podem existir vários com o mesmo número máximo)
  const militaresMaisEscalados: { nome: string, total: number }[] = [];
  let maxEscalas = 0;
  
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
    // Verificar se é um dos militares mais escalados
    if (dados.total > maxEscalas) {
      // Novo máximo encontrado, limpar a lista anterior e adicionar este militar
      militaresMaisEscalados.length = 0;
      militaresMaisEscalados.push({ nome, total: dados.total });
      maxEscalas = dados.total;
    } else if (dados.total === maxEscalas && maxEscalas > 0) {
      // Outro militar com o mesmo número máximo de escalas
      militaresMaisEscalados.push({ nome, total: dados.total });
    }
    
    // Acumular estatísticas por grupo
    const grupo = getGrupoMilitar(nome);
    if (grupo !== "OUTROS" && estatisticasPorGrupo[grupo]) {
      estatisticasPorGrupo[grupo].total += dados.total;
      estatisticasPorGrupo[grupo].militares += 1;
    }
  });
  
  // Não precisamos mais calcular o grupo mais escalado, pois removemos essa exibição
  
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
          
          {/* Estatísticas dos Militares Mais Escalados */}
          <div className="flex justify-center mb-6">
            <div className="bg-blue-700 p-4 rounded-lg shadow-inner flex flex-col items-center w-2/3">
              <span className="text-blue-200 font-medium flex items-center">
                <Award className="h-4 w-4 mr-1" />
                {militaresMaisEscalados.length === 1 ? "Militar Mais Escalado" : "Militares Mais Escalados"}
              </span>
              
              {militaresMaisEscalados.length === 0 ? (
                <span className="text-xl font-bold text-white my-1">Nenhum</span>
              ) : (
                <>
                  <div className="flex flex-col items-center mt-2 w-full">
                    {militaresMaisEscalados.map((militar, index) => (
                      <div 
                        key={index} 
                        className="text-center bg-blue-800/50 rounded-md py-1 px-3 mb-1 w-full"
                      >
                        <span className="text-lg font-bold text-white">{militar.nome}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-yellow-300 text-sm font-medium mt-2">
                    {militaresMaisEscalados[0].total} dias
                    {militaresMaisEscalados[0].total === 12 && " (Limite máximo)"}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Campo de busca de militar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-300" />
              <Input
                placeholder="Buscar militar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-blue-700/30 border-blue-600 text-white placeholder:text-blue-300"
              />
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
            ) : filteredMilitares().length === 0 ? (
              <div className="p-4 text-center text-blue-200">
                Nenhum militar encontrado com o termo &quot;{searchTerm}&quot;
              </div>
            ) : (
              filteredMilitares().map(([militar, dados], index) => {
                // Classe do background com base na paridade
                const bgClass = index % 2 === 0 
                  ? 'bg-blue-800/40' 
                  : 'bg-blue-800/20';
                
                // Classe do contador com base no limite
                const countClass = dados.total > 12
                  ? "bg-red-600" // ERRO: Vermelho para quem excedeu o limite
                  : dados.total === 12
                    ? "bg-yellow-600" // Amarelo para quem atingiu o limite exato
                    : "bg-green-600"; // Verde para quem está abaixo do limite
                
                // Flag de erro de limite excedido
                const limiteExcedido = dados.total > 12;
                
                return (
                  <div 
                    key={militar} 
                    className={`flex items-center text-sm px-2 py-3 rounded mb-1 ${bgClass} ${
                      limiteExcedido ? 'border-l-4 border-red-500 pl-1' : ''
                    }`}
                  >
                    <div className="w-[50%] font-medium text-white">
                      {/* Sempre mostramos o nome do militar normalmente, já que bloqueamos antes os que excedem o limite */}
                      <div className="flex items-center">
                        {militar}
                        {dados.total >= 12 && (
                          <span className="ml-1 bg-yellow-600 text-white text-[9px] px-1 py-0.5 rounded">LIMITE ATINGIDO</span>
                        )}
                      </div>
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
            <div className="flex items-center justify-around mb-2">
              <div className="font-medium text-yellow-300 flex items-center">
                <span className="inline-block h-3 w-3 bg-yellow-600 rounded-full mr-1"></span>
                <span>Limite atingido (12 dias)</span>
              </div>
              <div className="font-medium text-green-300 flex items-center">
                <span className="inline-block h-3 w-3 bg-green-600 rounded-full mr-1"></span>
                <span>Dentro do limite (abaixo de 12 dias)</span>
              </div>
            </div>
            <div className="text-center text-blue-200 border-t border-blue-700 pt-2 mt-1">
              <Calendar className="inline-block h-4 w-4 mr-1 mb-1" />
              Dados referentes ao mês de {mesAno} | <strong className="text-white">REGRA RÍGIDA: MÁXIMO 12 SERVIÇOS POR MILITAR</strong>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}