import React, { useState } from "react";
import { Search, Calendar, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buscarMilitar, type MilitarOperacaoResultado } from "@/lib/search-military";

export default function BuscaAvancada() {
  const [nomeMilitar, setNomeMilitar] = useState("");
  const [resultados, setResultados] = useState<MilitarOperacaoResultado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pesquisado, setPesquisado] = useState(false);
  
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();
  
  const realizarBusca = async () => {
    if (!nomeMilitar.trim()) return;
    
    setCarregando(true);
    setErro(null);
    setPesquisado(true);
    
    try {
      const resultado = await buscarMilitar(nomeMilitar, anoAtual, mesAtual);
      setResultados(resultado);
    } catch (error) {
      console.error("Erro na busca:", error);
      setErro(error instanceof Error ? error.message : "Erro desconhecido na busca");
      setResultados(null);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Busca Avançada de Militar</h1>
          <p className="text-gray-600">
            Localize com precisão as operações em que um militar participou.
          </p>
        </div>
        
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center">
              <Search className="h-5 w-5 mr-2 text-indigo-600" />
              Parâmetros de Busca
            </CardTitle>
            <CardDescription>
              Digite o nome completo ou parcial do militar para encontrar suas operações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Nome do militar (ex: MUNIZ, AMARAL, SD CORREA, etc.)"
                  value={nomeMilitar}
                  onChange={(e) => setNomeMilitar(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && realizarBusca()}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button
                onClick={realizarBusca}
                disabled={carregando || !nomeMilitar.trim()}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
              >
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Período: {new Date(anoAtual, mesAtual - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
              </div>
              
              <span className="text-gray-400">A busca é tolerante a abreviações e pequenos erros</span>
            </div>
          </CardContent>
        </Card>
        
        {erro && (
          <Alert variant="destructive" className="mb-6 shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro na busca</AlertTitle>
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}
        
        {pesquisado && !carregando && !erro && !resultados?.total && (
          <Alert className="mb-6 border border-amber-200 bg-amber-50 text-amber-800" variant="default">
            <AlertCircle className="h-4 w-4 text-amber-800" />
            <AlertTitle className="text-amber-800">Nenhum resultado encontrado</AlertTitle>
            <AlertDescription className="text-amber-700">
              Não foram encontradas operações para "<span className="font-semibold">{nomeMilitar}</span>" no período selecionado.
              <br />
              Tente um nome diferente ou verifique se o militar participou de alguma operação.
            </AlertDescription>
          </Alert>
        )}
        
        {resultados && resultados.total > 0 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-1 text-gray-800 flex items-center">
                <span className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                  <ArrowRight className="h-3.5 w-3.5 text-indigo-600" />
                </span>
                Resultados para {resultados.nome}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                Foram encontradas {resultados.total} operação(ões) em {new Date(anoAtual, mesAtual - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {resultados.total > 0 && (
                  <Badge variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                    Total: {resultados.total}
                  </Badge>
                )}
                {resultados.operacoes.pmf.length > 0 && (
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                    PMF: {resultados.operacoes.pmf.length}
                  </Badge>
                )}
                {resultados.operacoes.escolaSegura.length > 0 && (
                  <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
                    Escola Segura: {resultados.operacoes.escolaSegura.length}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className={`shadow-sm ${resultados.operacoes.pmf.length === 0 ? 'opacity-60' : ''}`}>
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <div className="h-6 w-6 rounded-full bg-blue-100 mr-2 flex items-center justify-center">
                      <span className="text-blue-700 text-sm font-bold">P</span>
                    </div>
                    Polícia Mais Forte
                  </CardTitle>
                  <CardDescription>
                    {resultados.operacoes.pmf.length > 0
                      ? `${resultados.operacoes.pmf.length} operação(ões) encontrada(s)`
                      : "Nenhuma operação encontrada"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {resultados.operacoes.pmf.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {resultados.diasPorOperacao.pmf.map((dia) => (
                          <Badge key={dia} className="bg-blue-500 hover:bg-blue-600 py-1 px-2">
                            Dia {dia}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          <span className="font-medium">Datas:</span> {resultados.operacoes.pmf.join(", ")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                      <p className="text-gray-500 text-sm">
                        {resultados.nome} não participou desta operação no período.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className={`shadow-sm ${resultados.operacoes.escolaSegura.length === 0 ? 'opacity-60' : ''}`}>
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-lg"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <div className="h-6 w-6 rounded-full bg-purple-100 mr-2 flex items-center justify-center">
                      <span className="text-purple-700 text-sm font-bold">E</span>
                    </div>
                    Escola Segura
                  </CardTitle>
                  <CardDescription>
                    {resultados.operacoes.escolaSegura.length > 0
                      ? `${resultados.operacoes.escolaSegura.length} operação(ões) encontrada(s)`
                      : "Nenhuma operação encontrada"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {resultados.operacoes.escolaSegura.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {resultados.diasPorOperacao.escolaSegura.map((dia) => (
                          <Badge key={dia} className="bg-purple-500 hover:bg-purple-600 py-1 px-2">
                            Dia {dia}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-purple-800 text-sm">
                          <span className="font-medium">Datas:</span> {resultados.operacoes.escolaSegura.join(", ")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                      <p className="text-gray-500 text-sm">
                        {resultados.nome} não participou desta operação no período.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {resultados.total > 0 && (
              <Card className="bg-indigo-50 border-indigo-100 shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-indigo-800 mb-2">Resumo da participação</h3>
                  <p className="text-indigo-700">
                    {resultados.nome} participou de um total de {resultados.total} operação(ões) extraordinária(s) em {new Date(anoAtual, mesAtual - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.
                  </p>
                </CardContent>
                <CardFooter className="text-xs text-indigo-600 border-t border-indigo-100 pt-3">
                  Dados extraídos diretamente do banco de dados do sistema.
                </CardFooter>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}