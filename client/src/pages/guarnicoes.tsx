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

  // Dados das guarnições (sistema 7x14 - 7 dias de serviço por 14 de folga)
  const guarnicoes = {
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
      darkText: "text-white",
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
      darkText: "text-white",
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
      darkText: "text-white",
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
      darkText: "text-white",
      border: "border-purple-300"
    }
  };

  // Dados do quadro de distribuição
  const diasMes = [
    {dia: "01/04", diaSemana: "TER", guarnicao: ["CHARLIE", "BRAVO"]},
    {dia: "02/04", diaSemana: "QUA", guarnicao: ["CHARLIE"]},
    {dia: "03/04", diaSemana: "QUI", guarnicao: ["CHARLIE"]},
    {dia: "04/04", diaSemana: "SEX", guarnicao: ["BRAVO"]},
    {dia: "05/04", diaSemana: "SAB", guarnicao: ["BRAVO"]},
    {dia: "06/04", diaSemana: "DOM", guarnicao: ["BRAVO"]},
    {dia: "07/04", diaSemana: "SEG", guarnicao: ["BRAVO"]},
    {dia: "08/04", diaSemana: "TER", guarnicao: ["BRAVO"]},
    {dia: "09/04", diaSemana: "QUA", guarnicao: ["BRAVO", "ALFA"]},
    {dia: "10/04", diaSemana: "QUI", guarnicao: ["ALFA"]},
    {dia: "11/04", diaSemana: "SEX", guarnicao: ["ALFA"]},
    {dia: "12/04", diaSemana: "SAB", guarnicao: ["ALFA"]},
    {dia: "13/04", diaSemana: "DOM", guarnicao: ["ALFA"]},
    {dia: "14/04", diaSemana: "SEG", guarnicao: ["ALFA"]},
    {dia: "15/04", diaSemana: "TER", guarnicao: ["ALFA"]},
    {dia: "16/04", diaSemana: "QUA", guarnicao: ["ALFA"]},
    {dia: "17/04", diaSemana: "QUI", guarnicao: ["ALFA", "CHARLIE"]},
    {dia: "18/04", diaSemana: "SEX", guarnicao: ["CHARLIE"]},
    {dia: "19/04", diaSemana: "SAB", guarnicao: ["CHARLIE"]},
    {dia: "20/04", diaSemana: "DOM", guarnicao: ["CHARLIE"]},
    {dia: "21/04", diaSemana: "SEG", guarnicao: ["CHARLIE"]},
    {dia: "22/04", diaSemana: "TER", guarnicao: ["CHARLIE"]},
    {dia: "23/04", diaSemana: "QUA", guarnicao: ["CHARLIE"]},
    {dia: "24/04", diaSemana: "QUI", guarnicao: ["CHARLIE", "BRAVO"]},
    {dia: "25/04", diaSemana: "SEX", guarnicao: ["BRAVO"]},
    {dia: "26/04", diaSemana: "SAB", guarnicao: ["BRAVO"]},
    {dia: "27/04", diaSemana: "DOM", guarnicao: ["BRAVO"]},
    {dia: "28/04", diaSemana: "SEG", guarnicao: ["BRAVO"]},
    {dia: "29/04", diaSemana: "TER", guarnicao: ["BRAVO"]},
    {dia: "30/04", diaSemana: "QUA", guarnicao: ["BRAVO"]},
    {dia: "01/05", diaSemana: "QUI", guarnicao: ["BRAVO", "ALFA"]},
    {dia: "02/05", diaSemana: "SEX", guarnicao: ["ALFA"]},
    {dia: "03/05", diaSemana: "SAB", guarnicao: ["ALFA"]},
    {dia: "04/05", diaSemana: "DOM", guarnicao: ["ALFA"]}
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

    return (
      <div className="overflow-x-auto">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 p-1 rounded-md mr-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-blue-800">Sistema de Escala 7x14</h3>
          </div>
          <p className="text-blue-700 text-sm">
            Cada guarnição trabalha 7 dias consecutivos e folga 14 dias. <span className="font-bold">A troca de guarnição ocorre toda quinta-feira</span>.
          </p>
          
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.keys(guarnicoes).filter(g => g !== "EXPEDIENTE").map((guarnicao) => (
              <div 
                key={guarnicao} 
                className={`p-2 rounded-md border ${guarnicoes[guarnicao as keyof typeof guarnicoes].border}`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${guarnicoes[guarnicao as keyof typeof guarnicoes].gradient}`}></div>
                  <span className="font-bold">{guarnicao}</span>
                </div>
                <div className="flex flex-col text-xs">
                  <span><span className="font-medium">Serviço:</span> 7 dias</span>
                  <span><span className="font-medium">Folga:</span> {guarnicoes[guarnicao as keyof typeof guarnicoes].folga}</span>
                  <span><span className="font-medium">Troca:</span> quinta-feira</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Table className="border rounded-lg shadow-sm">
          <TableCaption className="text-lg font-bold caption-top mb-4">
            QUADRO DE DISTRIBUIÇÃO DE GUARNIÇÕES / {monthYear} - SEDE
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={7} className="text-center bg-gray-100 font-bold py-3">
                Semana 1
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semanas.map((semana, semanaIndex) => (
              <React.Fragment key={semanaIndex}>
                {semanaIndex > 0 && (
                  <TableRow>
                    <TableHead colSpan={7} className="text-center bg-gray-100 font-bold py-3">
                      Semana {semanaIndex + 1}
                    </TableHead>
                  </TableRow>
                )}
                <TableRow>
                  {semana.map((dia, diaIndex) => {
                    const isTrocaDia = isDiaTrocaGuarnicao(dia.diaSemana);
                    return (
                      <TableCell 
                        key={diaIndex} 
                        className={`p-0 border ${isTrocaDia ? 'border-blue-400 border-2' : ''}`}
                      >
                        <div className="flex flex-col">
                          <div className={`${isTrocaDia ? 'bg-blue-100 text-blue-800' : 'bg-gray-200'} font-medium text-center p-1`}>
                            {dia.dia.split('/').join('/')}
                            <div className={`text-xs ${isTrocaDia ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>
                              {dia.diaSemana}
                              {isTrocaDia && <span className="ml-1">↺</span>}
                            </div>
                          </div>
                          <div className="min-h-20 p-1">
                            {dia.guarnicao.map((g, i) => (
                              <TooltipProvider key={i}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div 
                                      className={`text-center font-bold p-1 mb-1 ${getBgColor(g)} rounded shadow-sm border border-white/20`}
                                    >
                                      <span className={guarnicoes[g as keyof typeof guarnicoes].darkText}>
                                        {g}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-800 text-white border-0 p-3">
                                    <div className="text-xs">
                                      <div className="font-bold mb-1">Guarnição {g}</div>
                                      <div>Militares: {guarnicoes[g as keyof typeof guarnicoes].militares.length}</div>
                                      {g !== "EXPEDIENTE" && (
                                        <>
                                          <div>Folga: {guarnicoes[g as keyof typeof guarnicoes].folga}</div>
                                          <div>Troca: {guarnicoes[g as keyof typeof guarnicoes].horarioTroca}</div>
                                        </>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                            {dia.guarnicao.length === 2 && (
                              <div className="text-xs text-center mt-1 bg-yellow-100 text-yellow-800 py-0.5 px-1 rounded">
                                Dia de troca
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
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