import { useState } from "react";
import { Search, Calendar, UserCheck, X, Loader2, ClipboardCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDateBR } from "@/lib/utils";

// Interface para o resultado da busca de militar
interface MilitarOperacaoResultado {
  nome: string;
  operacoes: {
    pmf: string[];
    escolaSegura: string[];
  };
  diasPorOperacao: {
    pmf: number[];
    escolaSegura: number[];
  };
  total: number;
}

/**
 * Esta é uma implementação mais simples e direta da busca
 * que acessa apenas a estrutura de dados esperada
 */
async function buscarMilitarSimples(
  nomeMilitar: string,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): Promise<MilitarOperacaoResultado> {
  if (!nomeMilitar?.trim()) {
    throw new Error("Nome do militar não fornecido");
  }

  console.log(`🔍 BUSCANDO MILITAR: '${nomeMilitar}' em ${month}/${year}`);
  
  try {
    // 1. OBTER DADOS DA API
    const response = await fetch(`/api/combined-schedules?year=${year}&month=${month}`);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Dados recebidos:", data);
    
    // 2. DEFINIR RESULTADO PADRÃO
    const resultado: MilitarOperacaoResultado = {
      nome: nomeMilitar,
      operacoes: {
        pmf: [],
        escolaSegura: []
      },
      diasPorOperacao: {
        pmf: [],
        escolaSegura: []
      },
      total: 0
    };
    
    // 3. VERIFICAR ESTRUTURA ESPECÍFICA
    if (data?.schedules?.pmf?.[year]?.[month]) {
      const pmfSchedule = data.schedules.pmf[year][month];
      const escolaSeguraSchedule = data.schedules.escolaSegura[year][month];
      
      // 4. PROCURAR NAS OPERAÇÕES PMF
      Object.entries(pmfSchedule).forEach(([dia, militares]) => {
        if (!Array.isArray(militares)) return;
        
        const diaNum = parseInt(dia);
        const nomeBuscado = nomeMilitar.toUpperCase();
        
        // Procurar por qualquer militar que contenha o nome buscado
        for (const militar of militares) {
          if (!militar || typeof militar !== 'string') continue;
          
          if (militar.toUpperCase().includes(nomeBuscado)) {
            console.log(`Encontrado em PMF, dia ${dia}: ${militar}`);
            if (!resultado.diasPorOperacao.pmf.includes(diaNum)) {
              resultado.diasPorOperacao.pmf.push(diaNum);
              resultado.operacoes.pmf.push(formatDateBR(new Date(year, month - 1, diaNum)));
            }
            break;
          }
        }
      });
      
      // 5. PROCURAR NAS OPERAÇÕES ESCOLA SEGURA
      Object.entries(escolaSeguraSchedule).forEach(([dia, militares]) => {
        if (!Array.isArray(militares)) return;
        
        const diaNum = parseInt(dia);
        const nomeBuscado = nomeMilitar.toUpperCase();
        
        // Procurar por qualquer militar que contenha o nome buscado
        for (const militar of militares) {
          if (!militar || typeof militar !== 'string') continue;
          
          if (militar.toUpperCase().includes(nomeBuscado)) {
            console.log(`Encontrado em Escola Segura, dia ${dia}: ${militar}`);
            if (!resultado.diasPorOperacao.escolaSegura.includes(diaNum)) {
              resultado.diasPorOperacao.escolaSegura.push(diaNum);
              resultado.operacoes.escolaSegura.push(formatDateBR(new Date(year, month - 1, diaNum)));
            }
            break;
          }
        }
      });
      
      // 6. ORDENAR DIAS DE OPERAÇÕES
      resultado.diasPorOperacao.pmf.sort((a, b) => a - b);
      resultado.diasPorOperacao.escolaSegura.sort((a, b) => a - b);
      
      // 7. CALCULAR TOTAL
      resultado.total = resultado.operacoes.pmf.length + resultado.operacoes.escolaSegura.length;
    } else {
      console.error('Formato de dados não suportado:', data);
      throw new Error('Formato de dados não suportado');
    }
    
    console.log("RESULTADO FINAL:", resultado);
    return resultado;
    
  } catch (error) {
    console.error("ERRO FATAL NA BUSCA:", error);
    throw error;
  }
}

export default function BuscaCorrigida() {
  const [nomeMilitar, setNomeMilitar] = useState("");
  const [resultadoBusca, setResultadoBusca] = useState<MilitarOperacaoResultado | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  
  // Buscar militar
  const realizarBusca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeMilitar.trim()) return;
    
    try {
      setBuscando(true);
      setErro(null);
      setResultadoBusca(null);
      
      // Obter mês e ano atual
      const dataAtual = new Date();
      const resultado = await buscarMilitarSimples(
        nomeMilitar, 
        dataAtual.getFullYear(), 
        dataAtual.getMonth() + 1
      );
      
      setResultadoBusca(resultado);
    } catch (error) {
      console.error("Erro na busca:", error);
      setErro(error instanceof Error ? error.message : "Erro desconhecido na busca");
    } finally {
      setBuscando(false);
    }
  };
  
  // Copiar resultados para o clipboard
  const copiarResultados = () => {
    if (!resultadoBusca) return;
    
    let texto = `Operações encontradas para ${resultadoBusca.nome}:\n\n`;
    
    if (resultadoBusca.operacoes.pmf.length > 0) {
      texto += `PMF: ${resultadoBusca.operacoes.pmf.join(', ')}\n`;
    }
    
    if (resultadoBusca.operacoes.escolaSegura.length > 0) {
      texto += `Escola Segura: ${resultadoBusca.operacoes.escolaSegura.join(', ')}\n`;
    }
    
    texto += `\nTotal: ${resultadoBusca.total} operação(ões)`;
    
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };
  
  // Limpar busca
  const limparBusca = () => {
    setNomeMilitar("");
    setResultadoBusca(null);
    setErro(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        {/* Título e descrição */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Busca Corrigida de Militar
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Localize com precisão todas as datas em que um militar participou de operações PMF e Escola Segura, 
            com resultados diretos das fontes oficiais.
          </p>
        </div>
        
        {/* Formulário de busca */}
        <Card className="shadow-lg border-indigo-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100">
            <CardTitle className="text-lg text-indigo-700 flex items-center">
              <Search className="h-5 w-5 mr-2 text-indigo-500" />
              Consulta de Operações
            </CardTitle>
            <CardDescription>
              Digite o nome do militar para buscar suas participações em operações
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={realizarBusca} className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-grow relative">
                  <Input
                    type="text"
                    placeholder="Nome do militar (ex: MUNIZ, AMARAL, CARLA)"
                    value={nomeMilitar}
                    onChange={(e) => setNomeMilitar(e.target.value)}
                    className="pl-10 py-6 text-base"
                  />
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6"
                    disabled={buscando || !nomeMilitar.trim()}
                  >
                    {buscando ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar
                      </>
                    )}
                  </Button>
                  
                  {(nomeMilitar || resultadoBusca || erro) && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={limparBusca}
                      className="border-gray-300"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Resultados da busca */}
        {resultadoBusca && (
          <Card className="border-indigo-100 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none">
              <CardTitle className="flex items-center justify-between">
                <span>Resultados para: {resultadoBusca.nome}</span>
                <Badge variant="outline" className="ml-2 text-white border-white/30 bg-white/10">
                  Total: {resultadoBusca.total} operação(ões)
                </Badge>
              </CardTitle>
              <CardDescription className="text-indigo-100">
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>Mês atual: {new Date().toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})}</span>
                </div>
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="resultados" className="w-full">
              <div className="px-6 pt-4 border-b border-gray-200">
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger value="resultados" className="text-base">Resumo</TabsTrigger>
                  <TabsTrigger value="detalhes" className="text-base">Detalhes por Operação</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="resultados" className="p-0">
                <CardContent className="pt-6">
                  {resultadoBusca.total === 0 ? (
                    <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                      <AlertDescription className="flex items-center text-base p-2">
                        <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                        Nenhuma operação encontrada para {resultadoBusca.nome} no mês atual.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            Polícia Mais Forte
                          </h3>
                          
                          {resultadoBusca.operacoes.pmf.length > 0 ? (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                              <p className="text-sm text-gray-500 mb-2">Dias de participação:</p>
                              <div className="flex flex-wrap gap-2">
                                {resultadoBusca.operacoes.pmf.map((data, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="outline"
                                    className="bg-white border-blue-200 text-blue-700 shadow-sm"
                                  >
                                    {data}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">Nenhuma participação registrada</p>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                            <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                            Escola Segura
                          </h3>
                          
                          {resultadoBusca.operacoes.escolaSegura.length > 0 ? (
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                              <p className="text-sm text-gray-500 mb-2">Dias de participação:</p>
                              <div className="flex flex-wrap gap-2">
                                {resultadoBusca.operacoes.escolaSegura.map((data, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="outline"
                                    className="bg-white border-purple-200 text-purple-700 shadow-sm"
                                  >
                                    {data}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">Nenhuma participação registrada</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </TabsContent>
              
              <TabsContent value="detalhes" className="p-0">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-blue-700 mb-3 flex items-center">
                        Operações PMF
                      </h3>
                      
                      {resultadoBusca.diasPorOperacao.pmf.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead className="bg-blue-50">
                              <tr>
                                <th className="py-3 px-4 text-left text-sm font-medium text-blue-700 uppercase tracking-wider">
                                  Dia
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-blue-700 uppercase tracking-wider">
                                  Data
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-100">
                              {resultadoBusca.diasPorOperacao.pmf.map((dia, index) => (
                                <tr key={index} className="hover:bg-blue-50/50">
                                  <td className="py-3 px-4 text-sm text-gray-700">
                                    {dia}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-700">
                                    {resultadoBusca.operacoes.pmf[index]}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
                          Sem participações em PMF no período.
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-purple-700 mb-3 flex items-center">
                        Operações Escola Segura
                      </h3>
                      
                      {resultadoBusca.diasPorOperacao.escolaSegura.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead className="bg-purple-50">
                              <tr>
                                <th className="py-3 px-4 text-left text-sm font-medium text-purple-700 uppercase tracking-wider">
                                  Dia
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-purple-700 uppercase tracking-wider">
                                  Data
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-100">
                              {resultadoBusca.diasPorOperacao.escolaSegura.map((dia, index) => (
                                <tr key={index} className="hover:bg-purple-50/50">
                                  <td className="py-3 px-4 text-sm text-gray-700">
                                    {dia}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-700">
                                    {resultadoBusca.operacoes.escolaSegura[index]}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
                          Sem participações em Escola Segura no período.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
            
            <CardFooter className="bg-gray-50 border-t border-gray-200 justify-between py-3">
              <div className="text-sm text-gray-500">
                Dados obtidos diretamente das fontes oficiais.
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copiarResultados}
                className={copiado ? "bg-green-50 text-green-700 border-green-200" : ""}
              >
                {copiado ? (
                  <>
                    <ClipboardCheck className="h-4 w-4 mr-1" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-4 w-4 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Mensagem de erro */}
        {erro && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {erro}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}