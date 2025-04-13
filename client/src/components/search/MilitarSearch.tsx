import React, { useState } from 'react';
import { Search, Calendar, Shield, GraduationCap } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMonthYear } from "@/lib/utils";

// Interface simplificada para resultados da busca
interface Resultado {
  operacao: 'pmf' | 'escolaSegura';
  dias: number[];
}

export default function MilitarSearch() {
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Dados fixos para o mês atual (abril 2025)
  const mesAtual = 4;
  const anoAtual = 2025;

  // Função para buscar um militar nas operações
  const buscarMilitar = async () => {
    if (!termoBusca.trim()) return;
    
    setBuscando(true);
    setErro(null);
    setResultados([]);
    
    try {
      // Buscar na operação PMF
      const resPmf = await fetch(`/api/schedule?operation=pmf&year=${anoAtual}&month=${mesAtual}`);
      if (!resPmf.ok) throw new Error('Falha ao buscar escala PMF');
      
      // Buscar na operação Escola Segura
      const resEscola = await fetch(`/api/schedule?operation=escolaSegura&year=${anoAtual}&month=${mesAtual}`);
      if (!resEscola.ok) throw new Error('Falha ao buscar escala Escola Segura');
      
      const dataPmf = await resPmf.json();
      const dataEscola = await resEscola.json();
      
      const resultadosFinais: Resultado[] = [];
      const termoBuscaNormalizado = termoBusca.toLowerCase().trim();
      
      // Verificar PMF
      const diasPmf: number[] = [];
      if (dataPmf?.schedule?.[anoAtual]?.[mesAtual]) {
        const escalaPmf = dataPmf.schedule[anoAtual][mesAtual];
        
        Object.entries(escalaPmf).forEach(([dia, militares]) => {
          const diaNum = parseInt(dia, 10);
          const listaMilitares = militares as (string | null)[];
          
          if (listaMilitares.some(militar => 
            militar && militar.toLowerCase().includes(termoBuscaNormalizado)
          )) {
            diasPmf.push(diaNum);
          }
        });
        
        if (diasPmf.length > 0) {
          resultadosFinais.push({
            operacao: 'pmf',
            dias: diasPmf.sort((a, b) => a - b)
          });
        }
      }
      
      // Verificar Escola Segura
      const diasEscola: number[] = [];
      if (dataEscola?.schedule?.[anoAtual]?.[mesAtual]) {
        const escalaEscola = dataEscola.schedule[anoAtual][mesAtual];
        
        Object.entries(escalaEscola).forEach(([dia, militares]) => {
          const diaNum = parseInt(dia, 10);
          const listaMilitares = militares as (string | null)[];
          
          if (listaMilitares.some(militar => 
            militar && militar.toLowerCase().includes(termoBuscaNormalizado)
          )) {
            diasEscola.push(diaNum);
          }
        });
        
        if (diasEscola.length > 0) {
          resultadosFinais.push({
            operacao: 'escolaSegura',
            dias: diasEscola.sort((a, b) => a - b)
          });
        }
      }
      
      setResultados(resultadosFinais);
    } catch (error) {
      console.error('Erro na busca:', error);
      setErro('Ocorreu um erro ao buscar as escalas. Tente novamente.');
    } finally {
      setBuscando(false);
    }
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
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarMilitar()}
              className="pl-10 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-800 h-10 shadow-sm"
            />
          </div>
          <Button 
            onClick={buscarMilitar}
            disabled={buscando || !termoBusca}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            {buscando ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>

        {erro && (
          <Alert className="mb-6 bg-red-50 border-red-200 dark:bg-slate-800 dark:border-red-800">
            <AlertTitle className="text-red-600 dark:text-red-400 flex items-center">
              Erro na busca
            </AlertTitle>
            <AlertDescription className="text-red-600/80 dark:text-red-400/80">
              {erro}
            </AlertDescription>
          </Alert>
        )}

        {resultados.length > 0 ? (
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
                  {resultados.map((resultado, index) => (
                    <CartaoResultado 
                      key={index} 
                      resultado={resultado} 
                      mes={mesAtual} 
                      ano={anoAtual} 
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="pmf" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {resultados
                    .filter(resultado => resultado.operacao === 'pmf')
                    .map((resultado, index) => (
                      <CartaoResultado 
                        key={index} 
                        resultado={resultado} 
                        mes={mesAtual} 
                        ano={anoAtual} 
                      />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="escolaSegura" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {resultados
                    .filter(resultado => resultado.operacao === 'escolaSegura')
                    .map((resultado, index) => (
                      <CartaoResultado 
                        key={index} 
                        resultado={resultado} 
                        mes={mesAtual} 
                        ano={anoAtual} 
                      />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : termoBusca && !buscando ? (
          <Alert className="bg-orange-50 border-orange-200 dark:bg-slate-800 dark:border-orange-800">
            <AlertTitle className="text-orange-600 dark:text-orange-400 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Nenhum resultado encontrado
            </AlertTitle>
            <AlertDescription className="text-orange-600/80 dark:text-orange-400/80">
              Não foi encontrada nenhuma escala para "{termoBusca}".
              Verifique se digitou o nome corretamente ou tente outro termo.
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CartaoResultado({ 
  resultado, 
  mes, 
  ano 
}: { 
  resultado: Resultado;
  mes: number;
  ano: number;
}) {
  const isEscolaSegura = resultado.operacao === 'escolaSegura';
  
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
              {formatMonthYear(new Date(ano, mes - 1))}
            </CardDescription>
          </div>
          <Badge className={`${
            isEscolaSegura 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' 
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
          }`}>
            {resultado.dias.length} {resultado.dias.length === 1 ? 'dia' : 'dias'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-1">
          {resultado.dias.map(dia => (
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