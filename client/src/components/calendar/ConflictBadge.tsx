import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CombinedSchedules } from '@/lib/types';

interface ConflictBadgeProps {
  className?: string;
}

export default function ConflictBadge({ className = "" }: ConflictBadgeProps) {
  const [conflictsCount, setConflictsCount] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  // Buscar dados das escalas
  const { data: combinedSchedulesData } = useQuery<{ schedules: CombinedSchedules }>({
    queryKey: ['/api/combined-schedules'],
  });

  // Função para verificar se um militar está escalado em determinado dia na escala ordinária
  const isMilitarEscaladoNoDia = (militar: string, dia: number): boolean => {
    // Simplificar e melhorar a detecção de conflitos
    // Regras do serviço ordinário para este mês
    const servicoOrdinario: Record<string, number[]> = {
      'ALFA': [1, 2, 3, 24, 25, 26, 27, 28, 29, 30],
      'BRAVO': [4, 5, 6, 7, 8, 9, 25, 26, 27, 28, 29, 30],
      'CHARLIE': [1, 2, 3, 18, 19, 20, 21, 22, 23, 24]
    };
    
    // Lista de militares por guarnição
    const guarnicoes: Record<string, string[]> = {
      'ALFA': [
        "CB PM FELIPE", "3º SGT PM RODRIGO", "SD PM GOVEIA", 
        "3º SGT PM ANA CLEIDE", "SD PM CARVALHO"
      ],
      'BRAVO': [
        "3º SGT PM CARLOS EDUARDO", "SD PM LUAN", "3º SGT PM GLEIDSON",
        "CB PM BARROS", "SD PM S. CORREA"
      ],
      'CHARLIE': [
        "SD PM PATRIK", "CB PM BRASIL", "CB PM M. PAIXÃO", 
        "SD PM NAVARRO", "SD PM MARVÃO"
      ]
    };
    
    // Verificar se o militar está em alguma guarnição
    for (const [guarnicao, militares] of Object.entries(guarnicoes)) {
      if (militares.includes(militar)) {
        // Se o militar é desta guarnição, verificar se está de serviço no dia
        if (servicoOrdinario[guarnicao]?.includes(dia)) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Verificar conflitos quando os dados estiverem disponíveis
  useEffect(() => {
    if (!combinedSchedulesData?.schedules) return;
    
    try {
      // Contador de conflitos
      let count = 0;
      
      // Data atual para obter a chave correta
      const currentDate = new Date();
      const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      
      // Obter as escalas
      const pmfData = combinedSchedulesData.schedules?.pmf[currentMonthKey] || {};
      const escolaData = combinedSchedulesData.schedules?.escolaSegura[currentMonthKey] || {};
      
      // Para cada dia do mês
      for (let dia = 1; dia <= 31; dia++) {
        const dayStr = dia.toString();
        
        // Verificar PMF
        if (pmfData[dayStr]) {
          const militaresPMF = pmfData[dayStr].filter((m: string | null) => m !== null) as string[];
          
          for (const militar of militaresPMF) {
            if (isMilitarEscaladoNoDia(militar, dia)) {
              count++;
            }
            
            // Verificar se o militar também está na escala da Escola Segura no mesmo dia
            if (escolaData[dayStr] && escolaData[dayStr].includes(militar)) {
              count++;
            }
          }
        }
        
        // Verificar Escola Segura (militares que não estão em PMF)
        if (escolaData[dayStr]) {
          const militaresEscola = escolaData[dayStr].filter((m: string | null) => m !== null) as string[];
          
          for (const militar of militaresEscola) {
            // Ignorar militares já verificados na PMF
            if (pmfData[dayStr] && pmfData[dayStr].includes(militar)) {
              continue;
            }
            
            if (isMilitarEscaladoNoDia(militar, dia)) {
              count++;
            }
          }
        }
      }
      
      // Atualizar contagem de conflitos
      setConflictsCount(count);
      
      // Ativar piscagem se houver conflitos
      setIsBlinking(count > 0);
    } catch (error) {
      console.error("Erro ao contar conflitos:", error);
    }
  }, [combinedSchedulesData]);

  // Se não tiver conflitos, não exibir o badge
  if (conflictsCount === 0) {
    return null;
  }

  return (
    <div className={`absolute -top-2 -right-2 ${className}`}>
      <div className="relative">
        <div className={`absolute inset-0 bg-red-400 rounded-full blur-sm ${isBlinking ? 'animate-pulse' : ''}`}></div>
        <span className={`relative flex items-center justify-center w-6 h-6 bg-gradient-to-br from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-lg border border-red-400 ${isBlinking ? 'animate-bounce' : ''}`}>
          {conflictsCount}
        </span>
      </div>
    </div>
  );
}