import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CombinedSchedules } from '@/lib/types';

interface ConflictBadgeProps {
  className?: string;
}

export default function ConflictBadge({ className = "" }: ConflictBadgeProps) {
  const [conflictsCount, setConflictsCount] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  // Configurada para abril de 2025 (mesmo que a página principal)
  const currentDate = new Date(2025, 3, 1); // Abril 2025 (mês indexado em 0, então 3 = abril)

  // Estrutura da escala ordinária de abril 2025
  const escalaOrdinaria: Record<string, Record<string, string[]>> = {
    // CHARLIE nos dias 1, 2, 3, 18, 19, 20, 21, 22, 23, 24 (Charlie)
    "1": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
    "2": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
    "3": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
    "18": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
    "19": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
    "20": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
    "21": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
    "22": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
    "23": { "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"] },
    "24": { 
      "CHARLIE": ["2º SGT PM PINHEIRO", "3º SGT PM RAFAEL", "CB PM MIQUEIAS", "CB PM M. PAIXÃO", "SD PM CHAGAS", "SD PM CARVALHO", "SD PM GOVEIA", "SD PM ALMEIDA", "SD PM PATRIK", "SD PM GUIMARÃES"],
      "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"]
    },

    // BRAVO nos dias 4, 5, 6, 7, 8, 9, 24, 25, 26, 27, 28, 29, 30
    "4": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
    "5": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
    "6": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
    "7": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
    "8": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
    "9": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
    "25": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
    "26": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
    "27": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
    "28": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
    "29": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },
    "30": { "BRAVO": ["1º SGT PM OLIMAR", "2º SGT PM FÁBIO", "3º SGT PM ANA CLEIDE", "3º SGT PM GLEIDSON", "3º SGT PM CARLOS EDUARDO", "3º SGT PM NEGRÃO", "CB PM BRASIL", "SD PM MARVÃO", "SD PM IDELVAN"] },

    // ALFA nos dias 10, 11, 12, 13, 14, 15, 16, 17
    "10": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
    "11": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
    "12": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
    "13": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
    "14": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
    "15": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
    "16": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] },
    "17": { "ALFA": ["2º SGT PM PEIXOTO", "3º SGT PM RODRIGO", "3º SGT PM LEDO", "3º SGT PM NUNES", "3º SGT AMARAL", "CB CARLA", "CB PM FELIPE", "CB PM BARROS", "CB PM A. SILVA", "SD PM LUAN", "SD PM NAVARRO"] }
  };

  // Buscar dados das escalas com a URL específica para o mês/ano
  const { data: combinedSchedulesData } = useQuery<{ schedules: CombinedSchedules }>({
    queryKey: ["/api/combined-schedules", currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: async () => {
      const response = await fetch(
        `/api/combined-schedules?year=${currentDate.getFullYear()}&month=${currentDate.getMonth()}`
      );
      if (!response.ok) {
        throw new Error("Erro ao carregar dados das escalas combinadas");
      }
      return response.json();
    },
    refetchInterval: 5000 // Atualizar a cada 5 segundos
  });

  // Função para verificar se um militar está escalado em determinado dia
  function isMilitarEscaladoNoDia(militar: string, dia: number): string | null {
    // Verificar APENAS nas guarnições ALFA, BRAVO e CHARLIE (excluindo EXPEDIENTE)
    if (escalaOrdinaria[dia.toString()]) {
      for (const equipe of Object.keys(escalaOrdinaria[dia.toString()])) {
        // Verificar apenas se a equipe for ALFA, BRAVO ou CHARLIE
        if ((equipe === "ALFA" || equipe === "BRAVO" || equipe === "CHARLIE") && 
            escalaOrdinaria[dia.toString()][equipe].includes(militar)) {
          return equipe;
        }
      }
    }
    
    return null;
  }

  // Verificar conflitos quando os dados estiverem disponíveis
  useEffect(() => {
    if (!combinedSchedulesData?.schedules) return;
    
    try {
      // Contador de conflitos
      let count = 0;
      console.log("Verificando conflitos para badge...");
      
      // Obtém os dados da escala PMF - Abril 2025
      const pmfSchedule = 
        combinedSchedulesData.schedules.pmf["2025-3"] || 
        combinedSchedulesData.schedules.pmf["2025-4"] || 
        combinedSchedulesData.schedules.pmf || {}; 
      
      // Obtém os dados da escala Escola Segura - Abril 2025
      const escolaSeguraSchedule = 
        combinedSchedulesData.schedules.escolaSegura["2025-3"] || 
        combinedSchedulesData.schedules.escolaSegura["2025-4"] || 
        combinedSchedulesData.schedules.escolaSegura || {};
      
      console.log("PMF Schedule:", pmfSchedule);
      console.log("Escola Segura Schedule:", escolaSeguraSchedule);
      
      // Para cada dia no mês
      for (let dia = 1; dia <= 30; dia++) {
        const dayKey = String(dia);
        
        // Verifica se há militares escalados na PMF neste dia
        if (pmfSchedule[dayKey]) {
          // Para cada militar escalado na PMF
          pmfSchedule[dayKey].forEach((militar: string | null) => {
            if (militar) {
              // Verificar se este militar está escalado na escala ordinária
              const escalaOrdinariaStatus = isMilitarEscaladoNoDia(militar, dia);
              
              if (escalaOrdinariaStatus) {
                // CONFLITO ENCONTRADO
                count++;
                console.log(`CONFLITO para badge: ${militar} está no serviço ${escalaOrdinariaStatus} e na PMF no dia ${dia}`);
              }
            }
          });
        }
        
        // Verifica se há militares escalados na Escola Segura neste dia
        if (escolaSeguraSchedule[dayKey]) {
          // Para cada militar escalado na Escola Segura
          escolaSeguraSchedule[dayKey].forEach((militar: string | null) => {
            if (militar) {
              // Verificar se este militar está escalado na escala ordinária
              const escalaOrdinariaStatus = isMilitarEscaladoNoDia(militar, dia);
              
              if (escalaOrdinariaStatus) {
                // CONFLITO ENCONTRADO
                count++;
                console.log(`CONFLITO para badge: ${militar} está no serviço ${escalaOrdinariaStatus} e na Escola Segura no dia ${dia}`);
              }
            }
          });
        }
      }
      
      // Atualizar contagem de conflitos
      console.log(`Total de conflitos para badge: ${count}`);
      setConflictsCount(count);
      
      // Forçar ativação da piscagem se houver conflitos
      setIsBlinking(count > 0);
    } catch (error) {
      console.error("Erro ao contar conflitos para badge:", error);
    }
  }, [combinedSchedulesData]);

  // Para testes, sempre exibir o badge (mesmo sem conflitos)
  // Remova estas linhas depois
  useEffect(() => {
    console.log("Badge ativado com", conflictsCount, "conflitos");
    // Forçar pelo menos um conflito para testes
    if (conflictsCount === 0) {
      setConflictsCount(8);
      setIsBlinking(true);
    }
  }, [conflictsCount]);

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