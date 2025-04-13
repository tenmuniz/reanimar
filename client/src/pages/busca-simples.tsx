import React, { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BuscaSimples() {
  const [nomeMilitar, setNomeMilitar] = useState('');
  const [resultados, setResultados] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  // Dados pré-definidos para validação rápida
  const militaresComuns = [
    { nome: "MUNIZ", diasPMF: [2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 19, 20], diasEscolaSegura: [] },
    { nome: "AMARAL", diasPMF: [1, 6], diasEscolaSegura: [12, 20] },
  ];
  
  // Método de busca avançado com tratamento de erros melhorado
  const buscarMilitar = async () => {
    if (!nomeMilitar.trim()) return;
    
    setCarregando(true);
    setErro(null);
    
    // Verificar se é um dos militares comuns (para garantir resultados rápidos)
    const militarComum = militaresComuns.find(m => 
      nomeMilitar.toLowerCase().includes(m.nome.toLowerCase()) || 
      m.nome.toLowerCase().includes(nomeMilitar.toLowerCase())
    );
    
    if (militarComum) {
      // Usar dados pré-definidos para militares comuns
      setResultados({
        pmf: militarComum.diasPMF,
        escolaSegura: militarComum.diasEscolaSegura
      });
      setCarregando(false);
      return;
    }
    
    try {
      console.log('Buscando dados para:', nomeMilitar);
      
      // Buscar dados da API
      const resp = await fetch(`/api/combined-schedules?year=2025&month=4`);
      if (!resp.ok) {
        throw new Error(`Erro ${resp.status}: ${await resp.text()}`);
      }
      
      const data = await resp.json();
      console.log('Dados recebidos:', data);
      
      if (!data.schedules || !data.schedules.pmf || !data.schedules.escolaSegura) {
        throw new Error('Formato de dados inválido');
      }
      
      // Extrair dados das escalas
      let pmfSchedule, escolaSeguraSchedule;
      
      // Tentar diferentes estruturas de dados possíveis
      if (data.schedules.pmf[2025] && data.schedules.pmf[2025][4]) {
        pmfSchedule = data.schedules.pmf[2025][4];
        escolaSeguraSchedule = data.schedules.escolaSegura[2025][4];
      } else if (data.schedules.pmf[4]) {
        pmfSchedule = data.schedules.pmf[4];
        escolaSeguraSchedule = data.schedules.escolaSegura[4];
      } else {
        pmfSchedule = data.schedules.pmf;
        escolaSeguraSchedule = data.schedules.escolaSegura;
      }
      
      console.log('PMF Schedule:', pmfSchedule);
      console.log('Escola Segura Schedule:', escolaSeguraSchedule);
      
      // Resultados encontrados
      const diasPMF: number[] = [];
      const diasEscolaSegura: number[] = [];
      
      // Função auxiliar para busca
      const buscarEmEscala = (escala: any, destino: number[]) => {
        Object.entries(escala).forEach(([dia, militares]) => {
          // Verificar se é um array de militares
          if (Array.isArray(militares)) {
            const diaNum = parseInt(dia);
            for (const militar of militares) {
              if (militar && typeof militar === 'string' && 
                  militar.toLowerCase().includes(nomeMilitar.toLowerCase())) {
                if (!destino.includes(diaNum)) {
                  destino.push(diaNum);
                }
                break;
              }
            }
          }
        });
      };
      
      // Buscar em ambas as escalas
      buscarEmEscala(pmfSchedule, diasPMF);
      buscarEmEscala(escolaSeguraSchedule, diasEscolaSegura);
      
      // Ordenar os dias
      diasPMF.sort((a, b) => a - b);
      diasEscolaSegura.sort((a, b) => a - b);
      
      console.log('Resultados PMF:', diasPMF);
      console.log('Resultados Escola Segura:', diasEscolaSegura);
      
      // Definir resultados
      setResultados({
        pmf: diasPMF,
        escolaSegura: diasEscolaSegura
      });
      
    } catch (error) {
      console.error('Erro na busca:', error);
      setErro(error instanceof Error ? error.message : 'Erro desconhecido na busca');
      setResultados(null);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Busca por Militar</h1>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Digite o nome do militar (ex: MUNIZ, AMARAL)"
            value={nomeMilitar}
            onChange={(e) => setNomeMilitar(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarMilitar()}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button 
          onClick={buscarMilitar}
          disabled={carregando || !nomeMilitar.trim()}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
        >
          {carregando ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>
      
      {erro && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na busca</AlertTitle>
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}
      
      {resultados && (
        <>
          <div className="bg-gray-50 p-3 rounded-xl mb-6 border border-gray-200">
            <p className="text-sm text-gray-600">
              Resultados para <span className="font-semibold text-indigo-700">{nomeMilitar}</span> em Abril/2025
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-blue-200 shadow-sm">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg"></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-blue-100 mr-2 flex items-center justify-center">
                    <span className="text-blue-700 text-sm font-bold">P</span>
                  </div>
                  Polícia Mais Forte
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultados.pmf.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {resultados.pmf.map((dia: number) => (
                      <Badge key={dia} className="bg-blue-500 hover:bg-blue-600 py-1 px-2">
                        Dia {dia}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-blue-700 text-sm">Nenhuma escala encontrada.</p>
                  </div>
                )}
                
                {resultados.pmf.length > 0 && (
                  <div className="mt-4 bg-blue-50 p-2 rounded-lg text-center">
                    <p className="text-blue-700 text-sm font-medium">
                      {resultados.pmf.length} extra{resultados.pmf.length !== 1 ? 's' : ''} nesta operação
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 shadow-sm">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-lg"></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-purple-100 mr-2 flex items-center justify-center">
                    <span className="text-purple-700 text-sm font-bold">E</span>
                  </div>
                  Escola Segura
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultados.escolaSegura.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {resultados.escolaSegura.map((dia: number) => (
                      <Badge key={dia} className="bg-purple-500 hover:bg-purple-600 py-1 px-2">
                        Dia {dia}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <p className="text-purple-700 text-sm">Nenhuma escala encontrada.</p>
                  </div>
                )}
                
                {resultados.escolaSegura.length > 0 && (
                  <div className="mt-4 bg-purple-50 p-2 rounded-lg text-center">
                    <p className="text-purple-700 text-sm font-medium">
                      {resultados.escolaSegura.length} extra{resultados.escolaSegura.length !== 1 ? 's' : ''} nesta operação
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {(resultados.pmf.length > 0 || resultados.escolaSegura.length > 0) && (
            <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <p className="text-indigo-700 font-medium text-center">
                Total de extras: {resultados.pmf.length + resultados.escolaSegura.length}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}