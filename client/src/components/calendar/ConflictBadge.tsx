import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { CombinedSchedules } from '@/lib/types';

interface ConflictBadgeProps {
  className?: string;
  count?: number;
}

export default function ConflictBadge({ className = "", count }: ConflictBadgeProps) {
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

  // Usar contagem fornecida externamente se disponível
  useEffect(() => {
    console.log("Badge ativado com", count !== undefined ? count : conflictsCount, "conflitos");
    if (count !== undefined) {
      setConflictsCount(count);
      setIsBlinking(count > 0);
    }
  }, [count, conflictsCount]);

  // Tooltip para exibir a mensagem de alerta estilizada
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className={`absolute -top-2 -right-2 ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        <div className={`absolute inset-0 bg-red-400 rounded-full blur-sm ${isBlinking ? 'animate-pulse' : ''}`}></div>
        <span className={`relative flex items-center justify-center w-6 h-6 bg-gradient-to-br from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-lg border border-red-400 ${isBlinking ? 'animate-bounce' : ''}`}>
          {conflictsCount}
        </span>
      </div>
      
      {/* Tooltip de alerta sofisticado */}
      {showTooltip && conflictsCount > 0 && (
        <div className="absolute right-0 top-8 w-72 z-50 transform translate-x-1/3 pointer-events-none">
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-xl border border-red-400 p-4 text-white">
            <div className="absolute -top-2 -left-2">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full">
                <div className="absolute inset-0 bg-red-500 rounded-full blur-md animate-pulse"></div>
                <span className="relative flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800 w-7 h-7 rounded-full border border-red-400">
                  <AlertCircle className="h-4 w-4 text-white" />
                </span>
              </div>
            </div>
            
            <h3 className="text-center mb-2 font-bold text-lg bg-gradient-to-r from-amber-200 to-red-100 bg-clip-text text-transparent">
              ALERTA DE CONFLITOS
            </h3>
            
            <div className="flex items-center gap-2 mb-2 bg-white/10 backdrop-blur-md p-2 rounded-md border border-white/20">
              <div className="bg-red-500/80 text-white text-xl font-bold rounded-md w-10 h-10 flex items-center justify-center shadow-inner border border-red-400">
                {conflictsCount}
              </div>
              <div>
                <p className="text-sm font-semibold">Conflitos detectados nas escalas</p>
                <p className="text-xs opacity-90">Verificação de serviço ordinário</p>
              </div>
            </div>
            
            <p className="text-sm bg-white/10 backdrop-blur-md p-2 rounded-md border border-white/20 mb-1">
              Militares não podem estar escalados em operações especiais nos mesmos dias em que estão de serviço ordinário.
            </p>
            
            <div className="flex justify-center mt-2">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs border border-white/30 animate-pulse">
                Clique no botão para verificar detalhes
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}