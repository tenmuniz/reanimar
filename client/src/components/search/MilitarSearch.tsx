import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, Shield, GraduationCap } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfficersResponse, CombinedSchedules } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";

interface SearchResult {
  operacao: 'pmf' | 'escolaSegura';
  dias: number[];
  mes: number;
  ano: number;
}

export default function MilitarSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Obter a data atual para a busca inicial
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Carregar dados diretamente para PMF e Escola Segura separadamente
  const { data: pmfData } = useQuery({
    queryKey: ['/api/schedule', 'pmf', currentYear, currentMonth],
    queryFn: async () => {
      const res = await fetch(`/api/schedule?operation=pmf&year=${currentYear}&month=${currentMonth}`);
      if (!res.ok) {
        throw new Error('Falha ao buscar agenda PMF');
      }
      return res.json();
    }
  });

  const { data: escolaSeguraData } = useQuery({
    queryKey: ['/api/schedule', 'escolaSegura', currentYear, currentMonth],
    queryFn: async () => {
      const res = await fetch(`/api/schedule?operation=escolaSegura&year=${currentYear}&month=${currentMonth}`);
      if (!res.ok) {
        throw new Error('Falha ao buscar agenda Escola Segura');
      }
      return res.json();
    }
  });

  const handleSearch = () => {
    if (!searchTerm) return;
    
    setIsSearching(true);
    console.log("Iniciando busca por:", searchTerm);
    
    const results: SearchResult[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    // Buscar em PMF - Verificar dados antes de buscar
    console.log("PMF Data:", pmfData);
    
    try {
      if (pmfData?.schedule?.["2025"]?.["4"]) {
        console.log("Encontrei dados de PMF para 2025/4");
        const pmfSchedule = pmfData.schedule["2025"]["4"];
        const pmfDays: number[] = [];
        
        // Debug - Mostrando todas as datas disponíveis no PMF
        console.log("Dias disponíveis em PMF:", Object.keys(pmfSchedule));
        console.log("Exemplo de dados do dia 7:", pmfSchedule["7"]);
        
        // Verificando cada dia
        for (const [dayStr, officers] of Object.entries(pmfSchedule)) {
          const day = parseInt(dayStr, 10);
          const officersList = officers as (string | null)[];
          
          // Verificando cada oficial neste dia
          for (const officer of officersList) {
            if (officer && officer.toLowerCase().includes(lowerSearchTerm)) {
              console.log(`Encontrei ${searchTerm} em PMF no dia ${day}:`, officer);
              pmfDays.push(day);
              break; // Passamos para o próximo dia
            }
          }
        }
        
        if (pmfDays.length > 0) {
          results.push({
            operacao: 'pmf',
            dias: pmfDays.sort((a, b) => a - b),
            mes: 4, // Fixo em abril para o teste
            ano: 2025 // Fixo em 2025 para o teste
          });
        }
      } else {
        console.log("Dados PMF não encontrados na estrutura esperada");
      }
    } catch (error) {
      console.error("Erro ao processar dados PMF:", error);
    }
    
    // Buscar em Escola Segura - Verificar dados antes de buscar
    console.log("Escola Segura Data:", escolaSeguraData);
    
    try {
      if (escolaSeguraData?.schedule?.["2025"]?.["4"]) {
        console.log("Encontrei dados de Escola Segura para 2025/4");
        const esSchedule = escolaSeguraData.schedule["2025"]["4"];
        const esDays: number[] = [];
        
        // Debug - Mostrando todas as datas disponíveis na Escola Segura
        console.log("Dias disponíveis em Escola Segura:", Object.keys(esSchedule));
        
        // Verificando cada dia
        for (const [dayStr, officers] of Object.entries(esSchedule)) {
          const day = parseInt(dayStr, 10);
          const officersList = officers as (string | null)[];
          
          // Verificando cada oficial neste dia
          for (const officer of officersList) {
            if (officer && officer.toLowerCase().includes(lowerSearchTerm)) {
              console.log(`Encontrei ${searchTerm} em Escola Segura no dia ${day}:`, officer);
              esDays.push(day);
              break; // Passamos para o próximo dia
            }
          }
        }
        
        if (esDays.length > 0) {
          results.push({
            operacao: 'escolaSegura',
            dias: esDays.sort((a, b) => a - b),
            mes: 4, // Fixo em abril para o teste
            ano: 2025 // Fixo em 2025 para o teste
          });
        }
      } else {
        console.log("Dados Escola Segura não encontrados na estrutura esperada");
      }
    } catch (error) {
      console.error("Erro ao processar dados Escola Segura:", error);
    }
    
    console.log("Resultados finais:", results);
    setSearchResults(results);
    setIsSearching(false);
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-violet-400">
          Busca por Militar
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Encontre em quais datas e operações o militar está escalado
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-2 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Digite o nome do militar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-800 h-10 shadow-sm"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !searchTerm}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            Buscar
          </Button>
        </div>

        {searchResults.length > 0 ? (
          <div className="mt-4 space-y-6">
            <Tabs defaultValue="todos" className="w-full">
              <TabsList className="w-full bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <TabsTrigger 
                  value="todos" 
                  className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
                >
                  Todas as Operações
                </TabsTrigger>
                <TabsTrigger 
                  value="pmf" 
                  className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  PMF
                </TabsTrigger>
                <TabsTrigger 
                  value="escolaSegura" 
                  className="text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white"
                >
                  Escola Segura
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="todos" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {searchResults.map((result, index) => (
                    <ResultCard key={index} result={result} searchTerm={searchTerm} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="pmf" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {searchResults
                    .filter(result => result.operacao === 'pmf')
                    .map((result, index) => (
                      <ResultCard key={index} result={result} searchTerm={searchTerm} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="escolaSegura" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {searchResults
                    .filter(result => result.operacao === 'escolaSegura')
                    .map((result, index) => (
                      <ResultCard key={index} result={result} searchTerm={searchTerm} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : searchTerm && !isSearching ? (
          <Alert className="bg-orange-50 border-orange-200 dark:bg-slate-800 dark:border-orange-800">
            <AlertTitle className="text-orange-600 dark:text-orange-400 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Nenhum resultado encontrado
            </AlertTitle>
            <AlertDescription className="text-orange-600/80 dark:text-orange-400/80">
              Não foi encontrada nenhuma escala para "{searchTerm}".
              Verifique se digitou o nome corretamente ou tente outro termo.
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ResultCard({ result, searchTerm }: { result: SearchResult; searchTerm: string }) {
  const isEscolaSegura = result.operacao === 'escolaSegura';
  
  return (
    <Card className={`overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-lg ${
      isEscolaSegura 
        ? 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-slate-900'
        : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-slate-900'
    }`}>
      <div className={`h-2 ${
        isEscolaSegura 
          ? 'bg-gradient-to-r from-purple-500 to-violet-500' 
          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
      }`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={`text-lg font-bold flex items-center ${
              isEscolaSegura ? 'text-purple-700 dark:text-purple-400' : 'text-blue-700 dark:text-blue-400'
            }`}>
              {isEscolaSegura ? (
                <GraduationCap className="h-5 w-5 mr-2 inline-block" />
              ) : (
                <Shield className="h-5 w-5 mr-2 inline-block" />
              )}
              {isEscolaSegura ? 'Escola Segura' : 'Polícia Mais Forte'}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {formatMonthYear(new Date(result.ano, result.mes - 1))}
            </CardDescription>
          </div>
          <Badge className={`${
            isEscolaSegura 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' 
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
          }`}>
            {result.dias.length} {result.dias.length === 1 ? 'dia' : 'dias'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-1">
          {result.dias.map(dia => (
            <Badge 
              key={dia} 
              className={`
                text-white font-semibold py-1 px-3 rounded-full
                ${isEscolaSegura 
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                }
              `}
            >
              Dia {dia}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}