import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Calendar, Users, User, Info, Clock, Shield, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Guarnicoes() {
  // Corrige erro "Invalid prop `data-replit-metadata` supplied to `React.Fragment`"
  const { user } = useAuth();
  const [monthYear] = useState('ABRIL 2025');

  // Definição de tipo para evitar erros de tipagem
  type GuarnicaoType = {
    militares: string[];
    diasServico: string[];
    folga?: string;
    horarioTroca: string;
    color: string;
    gradient: string;
    lightBg: string;
    darkBg: string;
    lightText: string;
    darkText: string;
    border: string;
  };

  // Dados das guarnições (sistema 7x14 - 7 dias de serviço por 14 de folga)
  const guarnicoes: Record<string, GuarnicaoType> = {
    ALFA: {
      militares: [
        "2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", 
        "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", 
        "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"
      ],
      // Períodos de 7 dias com troca na quinta-feira
      diasServico: ["10", "11", "12", "13", "14", "15", "16", "17", "01/05", "02/05", "03/05", "04/05"],
      folga: "17/04 a 01/05", // 14 dias de folga após o serviço
      horarioTroca: "quinta-feira",
      color: "#FFC107", // amarelo
      gradient: "from-yellow-500 to-amber-600",
      lightBg: "bg-amber-100",
      darkBg: "bg-amber-800",
      lightText: "text-amber-900", // texto mais escuro para melhor legibilidade
      darkText: "text-black", // texto preto para melhor contraste no fundo amarelo
      border: "border-amber-300"
    },
    BRAVO: {
      militares: [
        "1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON",
        "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"
      ],
      // Períodos de 7 dias com troca na quinta-feira
      diasServico: ["04", "05", "06", "07", "08", "09", "24", "25", "26", "27", "28", "29", "30"],
      folga: "10/04 a 24/04", // 14 dias de folga após o serviço
      horarioTroca: "quinta-feira",
      color: "#4CAF50", // verde
      gradient: "from-green-600 to-emerald-700",
      lightBg: "bg-green-100",
      darkBg: "bg-green-800",
      lightText: "text-green-900", // texto mais escuro para melhor legibilidade
      darkText: "text-white", // texto branco para melhor contraste no fundo verde
      border: "border-green-300"
    },
    CHARLIE: {
      militares: [
        "2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO",
        "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"
      ],
      // Períodos de 7 dias com troca na quinta-feira
      diasServico: ["01", "02", "03", "18", "19", "20", "21", "22", "23", "24"],
      folga: "03/04 a 17/04", // 14 dias de folga após o serviço
      horarioTroca: "quinta-feira",
      color: "#2196F3", // azul
      gradient: "from-blue-600 to-blue-800",
      lightBg: "bg-blue-100",
      darkBg: "bg-blue-800",
      lightText: "text-blue-900", // texto mais escuro para melhor legibilidade
      darkText: "text-white", // texto branco para melhor contraste no fundo azul
      border: "border-blue-300"
    },
    EXPEDIENTE: {
      militares: [
        "CAP QOPM MUNIZ", "1º TEN QOPM MONTEIRO", "TEN VANILSON", "SUB TEN ANDRÉ", "3º SGT PM CUNHA", 
        "3º SGT PM CARAVELAS", "CB PM TONI", "SD PM S. CORRÊA", "SD PM RODRIGUES"
      ],
      diasServico: ["Segunda a Sexta (expediente administrativo)"],
      horarioTroca: "N/A",
      color: "#9C27B0", // roxo
      gradient: "from-purple-600 to-indigo-700",
      lightBg: "bg-purple-100",
      darkBg: "bg-purple-800",
      lightText: "text-purple-900", // texto mais escuro para melhor legibilidade
      darkText: "text-white", // texto branco para melhor contraste no fundo roxo
      border: "border-purple-300"
    }
  };

  // Datas completas do mês de abril 2025 e início de maio
  const diasMes = [
    // Semana 1
    {dia: "01/04", diaSemana: "TER", 
      status: {
        CHARLIE: "SERVIÇO", // Serviço até 03/04 (quinta)
        BRAVO: "SERVIÇO",   // Começou serviço em 28/03 (quinta anterior)
        ALFA: "FOLGA"       // Em folga até 10/04 (próxima quinta)
      }
    },
    {dia: "02/04", diaSemana: "QUA", 
      status: {
        CHARLIE: "SERVIÇO", 
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    {dia: "03/04", diaSemana: "QUI", 
      status: {
        CHARLIE: "TROCA", // Último dia de CHARLIE -> troca para folga
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    {dia: "04/04", diaSemana: "SEX", 
      status: {
        CHARLIE: "FOLGA", // Começa folga após troca de quinta
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    {dia: "05/04", diaSemana: "SAB", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    {dia: "06/04", diaSemana: "DOM", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    {dia: "07/04", diaSemana: "SEG", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    
    // Semana 2
    {dia: "08/04", diaSemana: "TER", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    {dia: "09/04", diaSemana: "QUA", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    {dia: "10/04", diaSemana: "QUI", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "TROCA", // Último dia de BRAVO -> troca para folga
        ALFA: "TROCA"   // ALFA entra em serviço
      }
    },
    {dia: "11/04", diaSemana: "SEX", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "FOLGA", // Começa folga após troca
        ALFA: "SERVIÇO" // Começa serviço após troca
      }
    },
    {dia: "12/04", diaSemana: "SAB", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "FOLGA", 
        ALFA: "SERVIÇO"
      }
    },
    {dia: "13/04", diaSemana: "DOM", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "FOLGA", 
        ALFA: "SERVIÇO"
      }
    },
    {dia: "14/04", diaSemana: "SEG", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "FOLGA", 
        ALFA: "SERVIÇO"
      }
    },
    
    // Semana 3
    {dia: "15/04", diaSemana: "TER", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "FOLGA", 
        ALFA: "SERVIÇO"
      }
    },
    {dia: "16/04", diaSemana: "QUA", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "FOLGA", 
        ALFA: "SERVIÇO"
      }
    },
    {dia: "17/04", diaSemana: "QUI", 
      status: {
        CHARLIE: "TROCA", // CHARLIE entra de serviço
        BRAVO: "FOLGA", 
        ALFA: "TROCA"     // Último dia de ALFA -> troca para folga
      }
    },
    {dia: "18/04", diaSemana: "SEX", 
      status: {
        CHARLIE: "SERVIÇO", // Começa serviço após troca
        BRAVO: "FOLGA", 
        ALFA: "FOLGA"       // Começa folga após troca
      }
    },
    {dia: "19/04", diaSemana: "SAB", 
      status: {
        CHARLIE: "SERVIÇO", 
        BRAVO: "FOLGA", 
        ALFA: "FOLGA"
      }
    },
    {dia: "20/04", diaSemana: "DOM", 
      status: {
        CHARLIE: "SERVIÇO", 
        BRAVO: "FOLGA", 
        ALFA: "FOLGA"
      }
    },
    {dia: "21/04", diaSemana: "SEG", 
      status: {
        CHARLIE: "SERVIÇO", 
        BRAVO: "FOLGA", 
        ALFA: "FOLGA"
      }
    },
    
    // Semana 4
    {dia: "22/04", diaSemana: "TER", 
      status: {
        CHARLIE: "SERVIÇO", 
        BRAVO: "FOLGA", 
        ALFA: "FOLGA"
      }
    },
    {dia: "23/04", diaSemana: "QUA", 
      status: {
        CHARLIE: "SERVIÇO", 
        BRAVO: "FOLGA", 
        ALFA: "FOLGA"
      }
    },
    {dia: "24/04", diaSemana: "QUI", 
      status: {
        CHARLIE: "TROCA", // Último dia de CHARLIE -> troca para folga
        BRAVO: "TROCA",   // BRAVO entra de serviço
        ALFA: "FOLGA"
      }
    },
    {dia: "25/04", diaSemana: "SEX", 
      status: {
        CHARLIE: "FOLGA",  // Começa folga após troca
        BRAVO: "SERVIÇO",  // Começa serviço após troca
        ALFA: "FOLGA"
      }
    },
    {dia: "26/04", diaSemana: "SAB", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    {dia: "27/04", diaSemana: "DOM", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    {dia: "28/04", diaSemana: "SEG", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    
    // Semana 5
    {dia: "29/04", diaSemana: "TER", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    {dia: "30/04", diaSemana: "QUA", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "SERVIÇO", 
        ALFA: "FOLGA"
      }
    },
    {dia: "01/05", diaSemana: "QUI", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "TROCA",   // Último dia de BRAVO -> troca para folga
        ALFA: "TROCA"     // ALFA entra em serviço
      }
    },
    {dia: "02/05", diaSemana: "SEX", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "FOLGA", 
        ALFA: "SERVIÇO"
      }
    },
    {dia: "03/05", diaSemana: "SAB", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "FOLGA", 
        ALFA: "SERVIÇO"
      }
    },
    {dia: "04/05", diaSemana: "DOM", 
      status: {
        CHARLIE: "FOLGA", 
        BRAVO: "FOLGA", 
        ALFA: "SERVIÇO"
      }
    },
  ];

  // Informações adicionais
  const informacoesAdicionais = [
    {
      titulo: "Licença Especial",
      militares: ["2º SGT PM A. TAVARES (EXPEDIENTE)"]
    },
    {
      titulo: "Férias",
      militares: ["CB PM ALAX (BRAVO)", "CB PM VELOSO (BRAVO)"]
    }
  ];

  // Função para obter a cor de background baseada na guarnição
  const getBgColor = (guarnicao: string): string => {
    switch (guarnicao) {
      case "ALFA": return "bg-amber-400";
      case "BRAVO": return "bg-green-500";
      case "CHARLIE": return "bg-blue-500";
      default: return "bg-gray-200";
    }
  };

  // Função para obter o texto da cor baseado na guarnição
  const getTextColor = (guarnicao: string): string => {
    switch (guarnicao) {
      case "ALFA": return "text-amber-900";
      case "BRAVO": return "text-green-900";
      case "CHARLIE": return "text-blue-900";
      default: return "text-gray-900";
    }
  };

  // Função para obter badge customizado baseado na guarnição
  const getGuarnicaoBadge = (guarnicao: string) => {
    const styles = {
      ALFA: "bg-amber-400 text-amber-900 border-amber-500",
      BRAVO: "bg-green-500 text-green-900 border-green-500",
      CHARLIE: "bg-blue-500 text-blue-900 border-blue-500",
      EXPEDIENTE: "bg-purple-500 text-purple-900 border-purple-500"
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`font-bold px-2 text-xs ${styles[guarnicao as keyof typeof styles]}`}
      >
        {guarnicao}
      </Badge>
    );
  };

  // Função para renderizar os militares
  const renderMilitares = (militares: string[], guarnicao: string) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
        {militares.map((militar, index) => (
          <div 
            key={index} 
            className={`flex items-center py-2 px-3 rounded-md ${guarnicoes[guarnicao as keyof typeof guarnicoes].lightBg} border ${guarnicoes[guarnicao as keyof typeof guarnicoes].border}`}
          >
            <User className={`h-5 w-5 mr-2 ${guarnicoes[guarnicao as keyof typeof guarnicoes].lightText}`} />
            <span className="font-medium">{militar}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render da tabela do quadro de distribuição com destaque para sistema 7x14 e trocas nas quintas-feiras
  const renderDistribuicaoTable = () => {
    // Agrupar dias em semanas para facilitar a visualização
    const semanas = [];
    for (let i = 0; i < diasMes.length; i += 7) {
      semanas.push(diasMes.slice(i, i + 7));
    }

    // Função para determinar se um dia é troca de guarnição (quinta-feira)
    const isDiaTrocaGuarnicao = (diaSemana: string) => diaSemana === "QUI";

    // Cores para cada status
    const statusColors: Record<string, { bg: string, text: string, border: string }> = {
      "SERVIÇO": { bg: "bg-green-500", text: "text-white", border: "border-green-600" },
      "FOLGA": { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-300" },
      "TROCA": { bg: "bg-red-500", text: "text-white", border: "border-red-600" }
    };

    // Cores para cada guarnição
    const guarnicaoColors: Record<string, { bg: string, lightBg: string, text: string, darkText: string }> = {
      "ALFA": { bg: "bg-amber-500", lightBg: "bg-amber-100", text: "text-white", darkText: "text-amber-900" },
      "BRAVO": { bg: "bg-green-600", lightBg: "bg-green-100", text: "text-white", darkText: "text-green-900" },
      "CHARLIE": { bg: "bg-blue-600", lightBg: "bg-blue-100", text: "text-white", darkText: "text-blue-900" }
    };

    return (
      <div className="overflow-auto">
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-900/30 backdrop-blur-sm p-5">
            <div className="flex items-center mb-3">
              <div className="bg-white p-1.5 rounded-md mr-3 shadow-md">
                <Clock className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="font-bold text-white text-xl">Sistema de Escala 7x14</h3>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg mb-4">
              <p className="text-white font-medium">
                • Cada guarnição trabalha <strong>7 dias consecutivos</strong> e folga <strong>14 dias</strong>.<br/>
                • <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-black animate-pulse">ATENÇÃO</span> <span className="text-white font-bold">A troca de guarnição ocorre TODA QUINTA-FEIRA</span>
              </p>
              
              <div className="bg-black/20 rounded-lg p-3 mt-3 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-white font-bold">DIAS DE TROCA:</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {diasMes
                    .filter(d => d.diaSemana === "QUI")
                    .map((dia, index) => (
                      <div key={index} className="bg-blue-700 text-white text-center py-1 px-2 rounded-md border border-white/20 shadow-inner">
                        <span className="text-xs font-bold">{dia.dia}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
              {Object.keys(guarnicoes)
                .filter(g => g !== "EXPEDIENTE")
                .map((guarnicao) => {
                  // Seleciona estilos personalizados para cada guarnição
                  let cardBg = "";
                  let headerBg = "";
                  
                  switch(guarnicao) {
                    case "ALFA":
                      cardBg = "bg-amber-100";
                      headerBg = "bg-amber-500";
                      break;
                    case "BRAVO":
                      cardBg = "bg-green-100"; 
                      headerBg = "bg-green-600";
                      break;
                    case "CHARLIE":
                      cardBg = "bg-blue-100";
                      headerBg = "bg-blue-600";
                      break;
                  }
                  
                  return (
                    <div key={guarnicao} className={`rounded-lg overflow-hidden shadow-md border border-white/30`}>
                      <div className={`${headerBg} text-white py-2 px-3 font-bold text-center`}>
                        GUARNIÇÃO {guarnicao}
                      </div>
                      <div className={`${cardBg} p-3 text-black`}>
                        <div className="flex flex-col space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Serviço:</span>
                            <span className="bg-white px-2 py-0.5 rounded-md border shadow-sm">7 dias</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Folga:</span> 
                            <span className="bg-white px-2 py-0.5 rounded-md border shadow-sm">{guarnicoes[guarnicao]?.folga || "14 dias"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Troca:</span>
                            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md border border-red-200 shadow-sm font-bold">quinta-feira</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Militares:</span>
                            <span className="bg-white px-2 py-0.5 rounded-md border shadow-sm">{guarnicoes[guarnicao].militares.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>

            {/* Legenda do quadro */}
            <div className="mt-4 bg-black/20 backdrop-blur-md p-3 rounded-lg border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-white"></div>
                <span className="text-white font-bold">LEGENDA:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2 bg-green-500 text-white p-1.5 rounded border border-green-600">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                  <span className="text-xs font-bold">SERVIÇO</span>
                </div>
                <div className="flex items-center gap-2 bg-red-500 text-white p-1.5 rounded border border-red-600">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                  <span className="text-xs font-bold">TROCA</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-200 text-gray-800 p-1.5 rounded border border-gray-300">
                  <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                  <span className="text-xs font-bold">FOLGA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela com novo formato de guarnições com visibilidade clara do status */}
        <div className="mb-10 overflow-x-auto">
          <Table className="border rounded-lg shadow-lg">
            <TableCaption className="text-xl font-bold caption-top mb-4">
              QUADRO DE DISTRIBUIÇÃO DE GUARNIÇÕES / {monthYear} - SEDE
            </TableCaption>
            
            {/* Cabeçalho com as guarnições */}
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="text-center font-bold py-2 w-16">Data</TableHead>
                <TableHead className="text-center font-bold py-2 w-16">Dia</TableHead>
                <TableHead className="text-center bg-amber-500 text-white font-bold py-2">ALFA</TableHead>
                <TableHead className="text-center bg-green-600 text-white font-bold py-2">BRAVO</TableHead>
                <TableHead className="text-center bg-blue-600 text-white font-bold py-2">CHARLIE</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {semanas.map((semana, semanaIndex) => (
                <React.Fragment key={semanaIndex}>
                  {/* Cabeçalho da semana */}
                  <TableRow>
                    <TableHead colSpan={5} className="text-center bg-gray-100 font-bold py-2">
                      Semana {semanaIndex + 1}
                    </TableHead>
                  </TableRow>
                  
                  {/* Dias da semana */}
                  {semana.map((dia, diaIndex) => {
                    const isTrocaDia = isDiaTrocaGuarnicao(dia.diaSemana);
                    
                    return (
                      <TableRow 
                        key={diaIndex} 
                        className={isTrocaDia ? 'bg-red-50' : diaIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                      >
                        {/* Coluna de data */}
                        <TableCell 
                          className={`text-center font-bold ${isTrocaDia ? 'bg-blue-700 text-white' : ''}`}
                        >
                          {dia.dia}
                        </TableCell>
                        
                        {/* Coluna de dia da semana */}
                        <TableCell 
                          className={`text-center ${isTrocaDia ? 'bg-blue-600 text-white font-bold' : 'font-medium'}`}
                        >
                          {dia.diaSemana}
                          {isTrocaDia && <div className="text-[10px] font-black bg-red-100 text-red-600 px-1 mt-1 rounded-full animate-pulse">TROCA</div>}
                        </TableCell>
                        
                        {/* Status de cada guarnição */}
                        {["ALFA", "BRAVO", "CHARLIE"].map((guarnicao) => {
                          const status = dia.status[guarnicao];
                          const statusColor = statusColors[status] || { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-300" };
                          const guarnicaoColor = guarnicaoColors[guarnicao];
                          
                          return (
                            <TableCell 
                              key={guarnicao} 
                              className="p-1"
                            >
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div 
                                      className={`
                                        ${statusColor.bg} ${statusColor.text} 
                                        rounded-md p-2 text-center font-bold 
                                        border ${statusColor.border}
                                        ${status === "TROCA" ? 'animate-pulse' : ''}
                                      `}
                                    >
                                      {status === "TROCA" && (
                                        <div className="text-xs mb-1 bg-white/20 rounded px-1 py-0.5">
                                          {status === "TROCA" && dia.status[guarnicao] === "TROCA" ? 
                                            (Object.entries(dia.status).some(([g, s]) => g !== guarnicao && s === "TROCA") ? "ENTRA" : "SAI") : 
                                            status
                                          }
                                        </div>
                                      )}
                                      <div className={`text-sm ${status === "FOLGA" ? "opacity-50" : ""}`}>
                                        {status}
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-800 text-white border-0 p-3">
                                    <div className="text-xs">
                                      <div className="font-bold mb-1">Guarnição {guarnicao}</div>
                                      <div>Status: {status}</div>
                                      <div>Militares: {guarnicoes[guarnicao].militares.length}</div>
                                      {guarnicao !== "EXPEDIENTE" && guarnicoes[guarnicao].folga && (
                                        <div>Período de folga: {guarnicoes[guarnicao].folga}</div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 max-w-[1200px]">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-2 bg-blue-100 rounded-full">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quadro de Guarnições</h1>
          <p className="text-gray-500">Visualize a distribuição das guarnições e efetivo por equipe</p>
        </div>
      </div>

      <Tabs defaultValue="quadro" className="mb-8">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="quadro">Quadro Geral</TabsTrigger>
          <TabsTrigger value="guarnicoes">Guarnições</TabsTrigger>
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
        </TabsList>

        {/* Tab: Quadro Geral */}
        <TabsContent value="quadro" className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Quadro de Distribuição de Guarnições</h2>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {Object.keys(guarnicoes).map((guarnicao) => (
                  <div 
                    key={guarnicao} 
                    className={`p-3 rounded-lg flex space-x-2 items-center border ${guarnicoes[guarnicao as keyof typeof guarnicoes].border} ${guarnicoes[guarnicao as keyof typeof guarnicoes].lightBg}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${guarnicoes[guarnicao as keyof typeof guarnicoes].gradient}`}></div>
                    <div className="font-semibold">{guarnicao}</div>
                    <div className="text-sm text-gray-600">
                      ({guarnicoes[guarnicao as keyof typeof guarnicoes].militares.length} militares)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {renderDistribuicaoTable()}
          </div>
        </TabsContent>

        {/* Tab: Guarnições */}
        <TabsContent value="guarnicoes" className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Composição das Guarnições</h2>
            </div>

            <Accordion type="single" collapsible className="w-full" defaultValue="ALFA">
              {Object.keys(guarnicoes).map((guarnicao) => (
                <AccordionItem key={guarnicao} value={guarnicao} className="border rounded-lg mb-4 overflow-hidden">
                  <AccordionTrigger 
                    className={`p-4 bg-gradient-to-r ${guarnicoes[guarnicao as keyof typeof guarnicoes].gradient} text-white hover:no-underline hover:brightness-105`}
                  >
                    <div className="flex items-center">
                      <div className="bg-white bg-opacity-20 rounded-full p-1 mr-3">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xl">Guarnição {guarnicao}</div>
                        <div className="text-sm opacity-90">
                          {guarnicoes[guarnicao as keyof typeof guarnicoes].militares.length} militares
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="p-4 bg-white">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-600 mr-2" />
                          <h3 className="font-semibold text-lg">Composição</h3>
                        </div>
                        {renderMilitares(guarnicoes[guarnicao as keyof typeof guarnicoes].militares, guarnicao)}
                      </div>
                      
                      <div className="md:w-1/3">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                          <h3 className="font-semibold text-lg">Dias de Serviço</h3>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {guarnicoes[guarnicao as keyof typeof guarnicoes].diasServico.map((dia, index) => (
                            <div 
                              key={index} 
                              className={`rounded-md p-2 text-center font-medium ${guarnicoes[guarnicao as keyof typeof guarnicoes].lightBg} border ${guarnicoes[guarnicao as keyof typeof guarnicoes].border}`}
                            >
                              {dia}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        {/* Tab: Informações */}
        <TabsContent value="informacoes" className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Informações Adicionais</h2>
            </div>

            <div className="space-y-6">
              {informacoesAdicionais.map((info, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-bold text-lg mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                    {info.titulo}
                  </h3>
                  <ul className="space-y-2">
                    {info.militares.map((militar, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>{militar}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  Legenda de Funções
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">CHEFE DO P1 E P3</Badge>
                    <span className="text-sm">1º TEN QOPM MONTEIRO</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800 border-green-300">CHEFE DO P2 E P4</Badge>
                    <span className="text-sm">TEN VANILSON</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">AUXILIAR DO P4</Badge>
                    <span className="text-sm">CB PM TONI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300">ESTAFETA</Badge>
                    <span className="text-sm">SD PM S. CORRÊA</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 text-blue-800">Total de Efetivo</h3>
                  <p className="text-blue-700">
                    O efetivo total da 20ª CIPM é de 30 Policiais Militares, distribuídos em 3 equipes 
                    de serviço ordinário (ALFA, BRAVO e CHARLIE) mais o pessoal do expediente administrativo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}