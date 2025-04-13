import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BuscaSimples() {
  const [nomeMilitar, setNomeMilitar] = useState('');
  const [resultados, setResultados] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);

  const buscarMilitar = async () => {
    if (!nomeMilitar.trim()) return;
    
    setCarregando(true);
    
    try {
      const resp = await fetch(`/api/combined-schedules?year=2025&month=4`);
      if (!resp.ok) throw new Error('Falha ao buscar dados');
      
      const data = await resp.json();
      
      // Dados das escalas
      const pmfSchedule = data.schedules.pmf[2025][4];
      const escolaSeguraSchedule = data.schedules.escolaSegura[2025][4];
      
      // Resultados encontrados
      const diasPMF: number[] = [];
      const diasEscolaSegura: number[] = [];
      
      // Buscar em PMF
      Object.entries(pmfSchedule).forEach(([dia, militares]) => {
        const diaNum = parseInt(dia);
        const lista = militares as string[];
        
        if (lista.some(mil => mil && mil.toLowerCase().includes(nomeMilitar.toLowerCase()))) {
          diasPMF.push(diaNum);
        }
      });
      
      // Buscar em Escola Segura
      Object.entries(escolaSeguraSchedule).forEach(([dia, militares]) => {
        const diaNum = parseInt(dia);
        const lista = militares as string[];
        
        if (lista.some(mil => mil && mil.toLowerCase().includes(nomeMilitar.toLowerCase()))) {
          diasEscolaSegura.push(diaNum);
        }
      });
      
      // Ordenar os dias
      diasPMF.sort((a, b) => a - b);
      diasEscolaSegura.sort((a, b) => a - b);
      
      // Definir resultados
      setResultados({
        pmf: diasPMF,
        escolaSegura: diasEscolaSegura
      });
      
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao buscar: ' + error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Busca por Militar</h1>
      
      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Digite o nome do militar"
          value={nomeMilitar}
          onChange={(e) => setNomeMilitar(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarMilitar()}
          className="max-w-md"
        />
        <Button 
          onClick={buscarMilitar}
          disabled={carregando || !nomeMilitar.trim()}
        >
          {carregando ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>
      
      {resultados && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-blue-200">
            <div className="h-2 bg-blue-500"></div>
            <CardHeader>
              <CardTitle>Polícia Mais Forte</CardTitle>
            </CardHeader>
            <CardContent>
              {resultados.pmf.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {resultados.pmf.map((dia: number) => (
                    <Badge key={dia} className="bg-blue-500 hover:bg-blue-600">
                      Dia {dia}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum resultado encontrado.</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-purple-200">
            <div className="h-2 bg-purple-500"></div>
            <CardHeader>
              <CardTitle>Escola Segura</CardTitle>
            </CardHeader>
            <CardContent>
              {resultados.escolaSegura.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {resultados.escolaSegura.map((dia: number) => (
                    <Badge key={dia} className="bg-purple-500 hover:bg-purple-600">
                      Dia {dia}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum resultado encontrado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}