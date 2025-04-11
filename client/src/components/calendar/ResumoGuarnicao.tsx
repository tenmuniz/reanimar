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
import { Input } from "@/components/ui/input";
import { BarChart2, Shield, Calendar, Search, MapPin, Users, Printer } from "lucide-react";

interface ResumoGuarnicaoProps {
  schedule: MonthSchedule;
  currentDate: Date;
  combinedSchedules?: CombinedSchedules;
}

export default function ResumoGuarnicao({
  schedule,
  currentDate,
  combinedSchedules,
}: ResumoGuarnicaoProps) {
  const [open, setOpen] = useState(false);
  const [resumoData, setResumoData] = useState<Record<string, { total: number; militares: string[] }>>({});
  const [activeGuarnicao, setActiveGuarnicao] = useState<string | null>(null);

  // Função para identificar o grupo de um militar (mesma do ResumoEscala)
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

  // Função para calcular estatísticas por guarnição
  const generateResumoGuarnicoes = () => {
    // Chave do mês atual
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    
    // Obtém os dados do schedule atual
    const monthSchedule = schedule[currentMonthKey] || {};
    
    // Inicializar contadores por guarnição
    const guarnicoes: Record<string, { total: number; militares: string[] }> = {
      "EXPEDIENTE": { total: 0, militares: [] },
      "ALFA": { total: 0, militares: [] },
      "BRAVO": { total: 0, militares: [] },
      "CHARLIE": { total: 0, militares: [] },
      "OUTROS": { total: 0, militares: [] }
    };
    
    // Criar um contador temporário para cada militar
    const militarContador: Record<string, number> = {};
    
    // Iterar sobre cada dia do mês no schedule
    if (monthSchedule) {
      Object.entries(monthSchedule).forEach(([day, daySchedule]) => {
        // Verificar cada posição no dia
        (daySchedule as (string | null)[]).forEach(militar => {
          // Só processar se houver um militar escalado
          if (militar) {
            // Incrementar contador do militar
            militarContador[militar] = (militarContador[militar] || 0) + 1;
            
            // Identificar a guarnição do militar
            const grupo = getGrupoMilitar(militar);
            
            // Adicionar à lista de militares da guarnição se ainda não estiver
            if (!guarnicoes[grupo].militares.includes(militar)) {
              guarnicoes[grupo].militares.push(militar);
            }
          }
        });
      });
    }
    
    // Calcular o total por guarnição com base no contador individual
    Object.entries(militarContador).forEach(([militar, total]) => {
      const grupo = getGrupoMilitar(militar);
      guarnicoes[grupo].total += total;
    });
    
    // Atualizar o estado
    setResumoData(guarnicoes);
  };
  
  // Gerar resumo quando o componente montar ou quando schedule/date mudar
  useEffect(() => {
    if (open) {
      generateResumoGuarnicoes();
    }
  }, [open, schedule, currentDate]);
  
  // Get the month name for display
  const mesAno = formatMonthYear(currentDate);
  
  // Calcular o total geral de GCJO
  const totalGCJO = Object.values(resumoData).reduce((sum, guarnicao) => sum + guarnicao.total, 0);
  
  // Filtrar guarnições com base na seleção ativa
  const filteredGuarnicoes = () => {
    if (!activeGuarnicao) return Object.entries(resumoData).filter(([nome, _]) => nome !== "OUTROS");
    
    return Object.entries(resumoData).filter(([nome, _]) => 
      nome === activeGuarnicao
    );
  };

  // Função para ordenar por hierarquia (mais antigo para mais moderno)
  const ordernarPorHierarquia = (militares: string[]): string[] => {
    const hierarquiaPrefixos = [
      "CAP QOPM", "1º TEN QOPM", "TEN", "SUB TEN", "1º SGT PM", 
      "2º SGT PM", "3º SGT PM", "CB PM", "SD PM"
    ];
    
    return [...militares].sort((a, b) => {
      // Obter o prefixo da patente para cada militar
      const prefixoA = hierarquiaPrefixos.find(prefixo => a.startsWith(prefixo)) || "";
      const prefixoB = hierarquiaPrefixos.find(prefixo => b.startsWith(prefixo)) || "";
      
      // Calcular o índice de cada prefixo na lista de hierarquia
      const rankA = hierarquiaPrefixos.indexOf(prefixoA);
      const rankB = hierarquiaPrefixos.indexOf(prefixoB);
      
      // Ordenar primeiro por patente (do maior ao menor rank)
      if (rankA !== rankB) {
        // Quanto menor o índice, maior a hierarquia
        return rankA - rankB;
      }
      
      // Se mesma patente, ordenar alfabeticamente pelo nome
      return a.localeCompare(b);
    });
  };
  
  // Função para gerar uma cor de destaque para cada guarnição
  const getGuarnicaoColor = (guarnicao: string): string => {
    switch (guarnicao) {
      case "EXPEDIENTE": return "from-orange-400 to-amber-600"; // Laranja/âmbar
      case "ALFA": return "from-blue-500 to-indigo-600"; // Azul/índigo
      case "BRAVO": return "from-green-500 to-emerald-600"; // Verde/esmeralda
      case "CHARLIE": return "from-purple-500 to-fuchsia-600"; // Roxo/fúcsia
      default: return "from-gray-500 to-gray-700"; // Cinza para outros
    }
  };
  
  // Função para obter ícone para cada guarnição
  const getGuarnicaoIcon = (guarnicao: string) => {
    switch (guarnicao) {
      case "EXPEDIENTE": return <Shield className="h-5 w-5" />;
      case "ALFA": return <MapPin className="h-5 w-5" />;
      case "BRAVO": return <Users className="h-5 w-5" />;
      case "CHARLIE": return <Calendar className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };
  
  // Função para obter as datas em que um militar está escalado
  const getMilitarDates = (militar: string): number[] => {
    const dias: number[] = [];
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const monthSchedule = schedule[currentMonthKey] || {};
    
    Object.entries(monthSchedule).forEach(([day, oficiais]) => {
      if ((oficiais as (string | null)[]).includes(militar)) {
        dias.push(parseInt(day));
      }
    });
    
    return dias.sort((a, b) => a - b);
  };

  // Função para impressão do relatório
  const handlePrint = () => {
    // Guarnicao específica a ser impressa (null para todas)
    const guarnicaoFilter = activeGuarnicao;
    
    // Abrir uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir o relatório.');
      return;
    }
    
    // Função para gerar cor CSS para cada guarnição
    const getGuarnicaoColorCSS = (guarnicao: string): string => {
      switch (guarnicao) {
        case "EXPEDIENTE": return "#f97316"; // laranja-500
        case "ALFA": return "#3b82f6"; // azul-500
        case "BRAVO": return "#10b981"; // esmeralda-500
        case "CHARLIE": return "#8b5cf6"; // roxo-500
        default: return "#6b7280"; // cinza-500
      }
    };

    // Classe CSS baseada na guarnição
    const getRowClass = (guarnicao: string): string => {
      return guarnicao.toLowerCase().includes('alfa') ? 'guarnicao-alpha' :
             guarnicao.toLowerCase().includes('bravo') ? 'guarnicao-bravo' :
             guarnicao.toLowerCase().includes('charlie') ? 'guarnicao-charlie' :
             'guarnicao-expediente';
    };
    
    // Filtrar guarnições para o relatório
    const guarnicoesParaRelatorio = Object.entries(resumoData)
      .filter(([nome, dados]) => 
        dados.militares.length > 0 && 
        (guarnicaoFilter === null || nome === guarnicaoFilter)
      )
      .sort((a, b) => {
        // Se uma guarnição específica está selecionada, ela deve vir primeiro
        if (guarnicaoFilter) {
          if (a[0] === guarnicaoFilter) return -1;
          if (b[0] === guarnicaoFilter) return 1;
        }
        // Caso contrário, ordem por total de GCJO
        return b[1].total - a[1].total;
      });
    
    // Título do relatório baseado na seleção
    const titleGuarnicao = guarnicaoFilter 
      ? `GUARNIÇÃO ${guarnicaoFilter}` 
      : "TODAS AS GUARNIÇÕES";
    
    // Estilo especial para o cabeçalho baseado na guarnição selecionada
    const headerStyle = guarnicaoFilter 
      ? `background-color: ${getGuarnicaoColorCSS(guarnicaoFilter)}; color: white;` 
      : 'background-color: #03396c; color: white;';
    
    // Conteúdo HTML da página de impressão
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de ${titleGuarnicao} - PMF - ${mesAno}</title>
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
            color: ${guarnicaoFilter ? getGuarnicaoColorCSS(guarnicaoFilter) : '#005b96'};
          }
          .resumo {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            background: ${guarnicaoFilter ? `${getGuarnicaoColorCSS(guarnicaoFilter)}10` : '#f0f8ff'};
            padding: 12px;
            border-radius: 5px;
            border: 1px solid ${guarnicaoFilter ? `${getGuarnicaoColorCSS(guarnicaoFilter)}30` : '#cce5ff'};
          }
          .resumo-item {
            text-align: center;
            flex: 1;
          }
          .resumo-valor {
            font-size: 24px;
            font-weight: bold;
            color: ${guarnicaoFilter ? getGuarnicaoColorCSS(guarnicaoFilter) : '#03396c'};
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
            ${headerStyle}
            padding: 10px;
            text-align: left;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: ${guarnicaoFilter ? `${getGuarnicaoColorCSS(guarnicaoFilter)}08` : '#f2f7ff'};
          }
          .guarnicao-row {
            font-weight: bold;
            background-color: ${guarnicaoFilter ? `${getGuarnicaoColorCSS(guarnicaoFilter)}20` : '#e6f2ff'};
          }
          .guarnicao-alpha { background-color: #dbeafe; }
          .guarnicao-bravo { background-color: #d1fae5; }
          .guarnicao-charlie { background-color: #f3e8ff; }
          .guarnicao-expediente { background-color: #fff7ed; }
          .militar-row {
            font-weight: normal;
          }
          .militar-name {
            font-weight: bold;
          }
          .day-chip {
            display: inline-block;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            background-color: ${guarnicaoFilter ? getGuarnicaoColorCSS(guarnicaoFilter) : '#03396c'};
            color: white;
            text-align: center;
            font-size: 11px;
            line-height: 22px;
            margin: 0 2px;
          }
          .days-container {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
          .total-value {
            display: inline-block;
            background-color: ${guarnicaoFilter ? getGuarnicaoColorCSS(guarnicaoFilter) : '#28a745'};
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-top: 30px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid ${guarnicaoFilter ? getGuarnicaoColorCSS(guarnicaoFilter) : '#03396c'};
            color: ${guarnicaoFilter ? getGuarnicaoColorCSS(guarnicaoFilter) : '#03396c'};
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
        <h2>RELATÓRIO DE ${titleGuarnicao} - ${mesAno.toUpperCase()}</h2>
        
        <div class="resumo">
          <div class="resumo-item">
            <div class="resumo-valor">${guarnicaoFilter ? 
              resumoData[guarnicaoFilter]?.total || 0 : 
              totalGCJO}</div>
            <div class="resumo-label">Quantidade de GCJO</div>
          </div>
          <div class="resumo-item">
            <div class="resumo-valor">${guarnicaoFilter ? 
              resumoData[guarnicaoFilter]?.militares.length || 0 : 
              Object.values(resumoData).reduce((sum, guarnicao) => sum + guarnicao.militares.length, 0)
            }</div>
            <div class="resumo-label">Militares Escalados</div>
          </div>
          ${guarnicaoFilter ? '' : `
          <div class="resumo-item">
            <div class="resumo-valor">${guarnicoesParaRelatorio.length}</div>
            <div class="resumo-label">Guarnições Ativas</div>
          </div>`}
        </div>
        
        ${guarnicoesParaRelatorio.map(([guarnicao, dados]) => {
          // Classe CSS baseada na guarnição
          const rowClass = getRowClass(guarnicao);
          
          return `
            <div class="section-title">${guarnicao} <span class="total-value">${dados.total} GCJO</span></div>
            <table>
              <thead>
                <tr>
                  <th style="width: 30%">Militar</th>
                  <th style="width: 15%">GCJO</th>
                  <th style="width: 55%">Dias Escalados</th>
                </tr>
              </thead>
              <tbody>
                ${ordernarPorHierarquia(dados.militares).map(militar => {
                  // Encontrar no contador quantos serviços este militar tem
                  const militarContador = Object.entries(schedule[`${currentDate.getFullYear()}-${currentDate.getMonth()}`] || {})
                    .flatMap(([_, oficiais]) => oficiais)
                    .filter(oficial => oficial === militar).length;
                  
                  // Obter dias em que o militar está escalado
                  const diasEscalados = getMilitarDates(militar);
                  
                  return `
                    <tr class="militar-row">
                      <td class="militar-name">${militar}</td>
                      <td><span class="total-value">${militarContador}</span></td>
                      <td>
                        <div class="days-container">
                          ${diasEscalados.map(dia => 
                            `<span class="day-chip">${dia}</span>`
                          ).join('')}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `;
        }).join('')}
        
        <div class="footer">
          <p>Sistema de Escalas PMF | Estatísticas por Guarnição</p>
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
        className="relative group overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 
          text-white font-bold px-5 py-3 rounded-lg flex items-center transform transition-all duration-200 
          border border-cyan-400 shadow-[0_8px_0_rgb(8,145,178),0_15px_20px_rgba(0,0,0,0.3)]
          hover:shadow-[0_4px_0_rgb(8,145,178),0_8px_15px_rgba(0,0,0,0.3)]
          active:translate-y-4 active:shadow-[0_0px_0_rgb(8,145,178),0_0px_10px_rgba(0,0,0,0.2)]"
      >
        {/* Efeito de brilho no hover */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/30 to-white/0 
          transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        
        <BarChart2 className="h-5 w-5 mr-2 drop-shadow-lg" />
        <span>Guarnição</span>
      </button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-indigo-900 to-purple-900 text-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl font-bold text-center text-white mb-4">
              <Shield className="h-6 w-6 mr-2 text-cyan-300" />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text">
                RESUMO POR GUARNIÇÃO - {mesAno.toUpperCase()}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {/* Botão de Impressão */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Relatório
            </Button>
          </div>
          
          {/* Botões de filtro por guarnição */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            <Button 
              onClick={() => setActiveGuarnicao(activeGuarnicao === "EXPEDIENTE" ? null : "EXPEDIENTE")}
              className={`flex items-center justify-center ${
                activeGuarnicao === "EXPEDIENTE" 
                  ? "bg-gradient-to-r from-orange-500 to-amber-600" 
                  : "bg-gradient-to-r from-orange-400/80 to-amber-500/80 hover:from-orange-500 hover:to-amber-600"
              }`}
            >
              <Shield className="h-4 w-4 mr-1.5" />
              EXPEDIENTE
            </Button>
            <Button 
              onClick={() => setActiveGuarnicao(activeGuarnicao === "ALFA" ? null : "ALFA")}
              className={`flex items-center justify-center ${
                activeGuarnicao === "ALFA" 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700" 
                  : "bg-gradient-to-r from-blue-500/80 to-indigo-600/80 hover:from-blue-600 hover:to-indigo-700"
              }`}
            >
              <MapPin className="h-4 w-4 mr-1.5" />
              ALFA
            </Button>
            <Button 
              onClick={() => setActiveGuarnicao(activeGuarnicao === "BRAVO" ? null : "BRAVO")}
              className={`flex items-center justify-center ${
                activeGuarnicao === "BRAVO" 
                  ? "bg-gradient-to-r from-green-600 to-emerald-700" 
                  : "bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600 hover:to-emerald-700"
              }`}
            >
              <Users className="h-4 w-4 mr-1.5" />
              BRAVO
            </Button>
            <Button 
              onClick={() => setActiveGuarnicao(activeGuarnicao === "CHARLIE" ? null : "CHARLIE")}
              className={`flex items-center justify-center ${
                activeGuarnicao === "CHARLIE" 
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-700" 
                  : "bg-gradient-to-r from-purple-500/80 to-fuchsia-600/80 hover:from-purple-600 hover:to-fuchsia-700"
              }`}
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              CHARLIE
            </Button>
          </div>
          
          {/* Estatísticas Gerais */}
          <div className="bg-indigo-800/50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 p-3 rounded-lg text-center">
                <p className="text-indigo-200 text-sm">Total de GCJO</p>
                <p className="text-2xl font-bold text-white">{totalGCJO}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-700 to-purple-800 p-3 rounded-lg text-center">
                <p className="text-purple-200 text-sm">Militares Escalados</p>
                <p className="text-2xl font-bold text-white">
                  {Object.values(resumoData).reduce((sum, guarnicao) => sum + guarnicao.militares.length, 0)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Lista de guarnições */}
          <div className="space-y-3 max-h-[350px] overflow-auto pr-2">
            {Object.keys(resumoData).length === 0 ? (
              <div className="p-4 text-center text-indigo-200">
                Nenhuma guarnição com policiais escalados para este mês
              </div>
            ) : filteredGuarnicoes().length === 0 ? (
              <div className="p-4 text-center text-indigo-200">
                Nenhuma guarnição com dados para este filtro
              </div>
            ) : (
              filteredGuarnicoes()
                .filter(([_, dados]) => dados.militares.length > 0) // Mostrar apenas guarnições com militares
                .sort((a, b) => b[1].total - a[1].total) // Ordenar por total de GCJO
                .map(([guarnicao, dados]) => {
                  // Percentual para a barra de progresso
                  const percentual = Math.round((dados.total / totalGCJO) * 100) || 0;
                  
                  return (
                    <div 
                      key={guarnicao} 
                      className="bg-indigo-700/40 rounded-lg p-3 hover:bg-indigo-700/60 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full bg-gradient-to-r ${getGuarnicaoColor(guarnicao)} mr-3`}>
                            {getGuarnicaoIcon(guarnicao)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{guarnicao}</h3>
                            <p className="text-indigo-200 text-sm">{dados.militares.length} militares escalados</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold">{dados.total}</span>
                          <span className="text-indigo-200 text-sm block">GCJO</span>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{percentual}% do total</span>
                          <span>{dados.total} GCJO</span>
                        </div>
                        <div className="bg-indigo-800/50 rounded-full h-2 w-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${getGuarnicaoColor(guarnicao)}`} 
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Lista de militares expandida */}
                      <div className="mt-3 space-y-1 pl-2 border-l-2 border-indigo-500/30">
                        {ordernarPorHierarquia(dados.militares).map(militar => {
                          // Encontrar no contador quantos serviços este militar tem
                          const militarContador = Object.entries(schedule[`${currentDate.getFullYear()}-${currentDate.getMonth()}`] || {})
                            .flatMap(([_, oficiais]) => oficiais)
                            .filter(oficial => oficial === militar).length;
                          
                          return (
                            <div key={militar} className="flex justify-between items-center text-sm bg-indigo-800/40 p-1.5 rounded">
                              <span>{militar}</span>
                              <span className="px-2 py-0.5 bg-indigo-800 rounded-full text-xs">
                                {militarContador} GCJO
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
          
          {/* Legenda informativa */}
          <div className="bg-indigo-800/40 p-3 rounded-lg text-xs mt-2">
            <div className="text-center text-indigo-200 border-t border-indigo-700 pt-2 mt-1">
              <Calendar className="inline-block h-4 w-4 mr-1 mb-1" />
              Dados referentes ao mês de {mesAno} | <strong className="text-white">Estatísticas por Guarnição</strong>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}