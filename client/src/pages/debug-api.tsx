import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { debugCombinedSchedules } from "@/lib/debug-combined-schedules";

export default function DebugAPI() {
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResult, setDebugResult] = useState<any>(null);
  const [day14Data, setDay14Data] = useState<string[]>([]);
  const [apiStructure, setApiStructure] = useState<string>("");
  
  useEffect(() => {
    // Carregar a estrutura da API quando o componente montar
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setIsDebugging(true);
      
      // Chamar API directly
      const response = await fetch(`/api/combined-schedules?year=2025&month=4`);
      const data = await response.json();
      setDebugResult(data);
      
      // Verificar os dados do dia 14
      let pmfSchedule = null;
      
      if (data?.schedules?.pmf) {
        // Tentar encontrar o calendario PMF
        if (data.schedules.pmf[2025]?.[4]) {
          pmfSchedule = data.schedules.pmf[2025][4];
        } else if (data.schedules.pmf[4]) {
          pmfSchedule = data.schedules.pmf[4];
        } else if (Object.keys(data.schedules.pmf).some(k => !isNaN(parseInt(k)))) {
          pmfSchedule = data.schedules.pmf;
        }
        
        // Se encontramos, extrair dia 14
        if (pmfSchedule && pmfSchedule[14]) {
          setDay14Data(Array.isArray(pmfSchedule[14]) ? pmfSchedule[14] : []);
          
          // Formatar a estrutura completa para exibição
          const structure = JSON.stringify(data.schedules, null, 2);
          setApiStructure(structure);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsDebugging(false);
    }
  };
  
  const runDebugger = () => {
    debugCombinedSchedules();
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-red-600 to-orange-600 text-transparent bg-clip-text">
          Depurador da API Combined Schedules
        </h1>
        
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <CardTitle className="text-red-800 flex items-center">
              Diagnóstico do Problema da Busca
            </CardTitle>
            <CardDescription>
              Esta ferramenta expõe a estrutura exata da resposta da API e verifica a presença de "CB CARLA" no dia 14 da PMF
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-4">
            <div className="flex space-x-4">
              <Button 
                onClick={loadData}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isDebugging}
              >
                Recarregar Dados da API
              </Button>
              
              <Button
                onClick={runDebugger}
                variant="outline"
                className="border-blue-300"
              >
                Executar Depurador no Console
              </Button>
            </div>
            
            {/* Dados do Dia 14 */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Militares Escalados no Dia 14 da PMF:</h3>
              
              {day14Data.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <ul className="space-y-2">
                    {day14Data.map((militar, index) => (
                      <li key={index} className="flex items-center">
                        <Badge className={militar.includes("CARLA") ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100"}>
                          Índice {index}
                        </Badge>
                        <span className={`ml-2 ${militar.includes("CARLA") ? "font-bold text-green-600" : ""}`}>
                          "{militar}"
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-red-50 text-red-800 rounded p-4 border border-red-200">
                  Nenhum dado encontrado para o dia 14 ou dados em formato inválido
                </div>
              )}
            </div>
            
            {/* Estrutura da API */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Estrutura da Resposta da API:</h3>
              
              {apiStructure ? (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 overflow-auto max-h-96">
                  <pre className="text-xs text-gray-800">{apiStructure}</pre>
                </div>
              ) : (
                <div className="bg-yellow-50 text-yellow-800 rounded p-4 border border-yellow-200">
                  Nenhuma estrutura de API disponível ainda
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="bg-red-50 border-t border-red-100 text-sm text-red-700">
            Os resultados completos detalhados são exibidos no console do navegador.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}