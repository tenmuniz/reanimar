import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getMonthData, getWeekdayName } from "@/lib/utils";
import { MonthSchedule, OfficersResponse, CombinedSchedules } from "@/lib/types";
import { MilitarStorage, EscalaStorage } from "@/lib/storage";
import { SupabaseMilitarStorage, SupabaseEscalaStorage } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Save, Users } from "lucide-react";
import CalendarCard from "@/components/calendar/CalendarCard";
import MonthSelector from "@/components/calendar/MonthSelector";
import ResumoEscala from "@/components/calendar/ResumoEscala";
import ResumoGuarnicao from "@/components/calendar/ResumoGuarnicao";
import VerificadorInconsistencias from "@/components/calendar/VerificadorInconsistencias";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

// API endpoint for officers
const OFFICERS_ENDPOINT = "/api/officers";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<MonthSchedule>({});
  // Simplificamos para usar apenas PMF
  const [combinedSchedules, setCombinedSchedules] = useState<CombinedSchedules>({
    pmf: {},
    escolaSegura: {} // Mantemos por compatibilidade, mas não será usado
  });
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [officers, setOfficers] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Buscar oficiais da API como fallback
  const { data: officersData, isLoading: isLoadingFromAPI } = useQuery<OfficersResponse>({
    queryKey: [OFFICERS_ENDPOINT],
    enabled: true,
  });
  
  // Carregar militares do Supabase ou do localStorage como fallback
  useEffect(() => {
    const loadMilitares = async () => {
      try {
        // Primeiro tenta carregar do Supabase
        const supabaseMilitares = await SupabaseMilitarStorage.getActiveMilitarNames();
        
        if (supabaseMilitares.length > 0) {
          // Se encontrou militares no Supabase, usa eles
          setOfficers(supabaseMilitares);
          console.log('Militares carregados do Supabase:', supabaseMilitares.length);
          setIsOffline(false);
        } else {
          // Se não encontrou no Supabase, tenta carregar do localStorage
          const localMilitares = MilitarStorage.getActiveMilitarNames();
          
          if (localMilitares.length > 0) {
            // Se encontrou militares no localStorage, usa eles
            setOfficers(localMilitares);
            console.log('Militares carregados do localStorage:', localMilitares.length);
            setIsOffline(true);
            
            // Tenta sincronizar com o Supabase se estiver online
            const militares = MilitarStorage.getActiveMilitares();
            SupabaseMilitarStorage.importFromOfficersAPI(militares.map(m => m.nome))
              .then(() => {
                console.log('Militares sincronizados com o Supabase');
                setIsOffline(false);
              })
              .catch(err => {
                console.error('Erro ao sincronizar militares com o Supabase:', err);
              });
          } else if (officersData?.officers && officersData.officers.length > 0) {
            // Se não encontrou em nenhum lugar mas tem na API, usa os da API
            setOfficers(officersData.officers);
            console.log('Militares carregados da API:', officersData.officers.length);
            
            // Importar para o localStorage e tentar para o Supabase
            MilitarStorage.importFromOfficersAPI(officersData.officers);
            
            // Tentar importar para o Supabase também
            SupabaseMilitarStorage.importFromOfficersAPI(officersData.officers)
              .then(() => {
                console.log('Militares importados para o Supabase');
                setIsOffline(false);
              })
              .catch(err => {
                console.error('Erro ao importar militares para o Supabase:', err);
                setIsOffline(true);
              });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar militares:', error);
        
        // Em caso de erro, tenta carregar do localStorage
        const localMilitares = MilitarStorage.getActiveMilitarNames();
        
        if (localMilitares.length > 0) {
          setOfficers(localMilitares);
          console.log('Militares carregados do localStorage (após erro):', localMilitares.length);
        } else if (officersData?.officers && officersData.officers.length > 0) {
          setOfficers(officersData.officers);
          MilitarStorage.importFromOfficersAPI(officersData.officers);
        }
        
        setIsOffline(true);
      }
    };
    
    loadMilitares();
    
    // Adicionar listener para o evento de atualização de militar
    const handleMilitarUpdated = () => {
      console.log('Evento de atualização de militar detectado na página principal. Recarregando militares...');
      loadMilitares();
    };
    
    // Registrar o listener
    window.addEventListener('militar_updated', handleMilitarUpdated);
    
    // Limpeza do listener quando o componente for desmontado
    return () => {
      window.removeEventListener('militar_updated', handleMilitarUpdated);
    };
  }, [officersData]);
  
  // Get current month data
  const monthData = getMonthData(currentDate.getFullYear(), currentDate.getMonth());
  
  // Buscar agenda das escalas
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoadingSchedules(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Tentar primeiro buscar do Supabase
        try {
          const supabaseEscalaPMF = await SupabaseEscalaStorage.getEscalaMes('pmf', year, month);
          
          if (Object.keys(supabaseEscalaPMF).length > 0) {
            // Se encontrou dados no Supabase
            const monthKey = `${year}-${month}`;
            setSchedule({ [monthKey]: supabaseEscalaPMF });
            
            // Salvar também no localStorage para uso offline
            EscalaStorage.saveEscalaMes('pmf', year, month, supabaseEscalaPMF);
            
            // Buscar dados combinados do Supabase
            const pmfData = await SupabaseEscalaStorage.getEscala('pmf');
            const escolaSeguraData = await SupabaseEscalaStorage.getEscala('escolaSegura');
            
            setCombinedSchedules({
              pmf: pmfData,
              escolaSegura: escolaSeguraData
            });
            
            setIsOffline(false);
            setIsLoadingSchedules(false);
            return;
          }
        } catch (supabaseError) {
          console.error("Erro ao buscar dados do Supabase:", supabaseError);
        }
        
        // Fallback para buscar da API
        try {
          const pmfResponse = await fetch(`/api/schedule?operation=pmf&year=${year}&month=${month}`);
          if (pmfResponse.ok) {
            const pmfData = await pmfResponse.json();
            
            if (Object.keys(pmfData.schedule).length > 0) {
              // Se veio do servidor, salvar também no localStorage
              const monthKey = `${year}-${month}`;
              setSchedule({ [monthKey]: pmfData.schedule });
              
              // Salvar no armazenamento local
              EscalaStorage.saveEscalaMes('pmf', year, month, pmfData.schedule);
              
              // Tentar salvar no Supabase também
              try {
                await SupabaseEscalaStorage.saveEscalaMes('pmf', year, month, pmfData.schedule);
                setIsOffline(false);
              } catch (saveError) {
                console.error("Erro ao salvar no Supabase:", saveError);
                setIsOffline(true);
              }
            }
            
            // Buscar agenda combinada (PMF + Escola Segura)
            const combinedResponse = await fetch(`/api/combined-schedules?year=${year}&month=${month}`);
            if (combinedResponse.ok) {
              const combinedData = await combinedResponse.json();
              setCombinedSchedules(combinedData.schedules);
            }
            
            setIsLoadingSchedules(false);
            return;
          }
        } catch (apiError) {
          console.error("Erro ao buscar dados da API:", apiError);
        }
        
        // Último recurso: usar dados locais
        const localEscala = EscalaStorage.getEscalaMes('pmf', year, month);
        const monthKey = `${year}-${month}`;
        
        if (Object.keys(localEscala).length > 0) {
          setSchedule({ [monthKey]: localEscala });
          
          // Também tentar carregar as escalas combinadas do localStorage
          const pmfData = EscalaStorage.getEscala('pmf');
          const escolaSeguraData = EscalaStorage.getEscala('escolaSegura');
          
          setCombinedSchedules({
            pmf: pmfData,
            escolaSegura: escolaSeguraData
          });
        } else {
          setSchedule({});
        }
        
        setIsOffline(true);
        setIsLoadingSchedules(false);
      } catch (error) {
        console.error("Erro geral ao carregar agendas:", error);
        setIsLoadingSchedules(false);
        setIsOffline(true);
        
        // Em caso de erro, tentar usar dados locais
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const localEscala = EscalaStorage.getEscalaMes('pmf', year, month);
        const monthKey = `${year}-${month}`;
        
        if (Object.keys(localEscala).length > 0) {
          setSchedule({ [monthKey]: localEscala });
        } else {
          setSchedule({});
        }
      }
    };
    
    fetchSchedules();
  }, [currentDate]);
  
  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  // BLOQUEIO TOTAL: esta função é o último ponto de controle antes de adicionar um militar à escala
  const handleOfficerChange = async (day: number, position: number, officer: string | null) => {
    const dayKey = `${day}`;
    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    
    // Se estiver removendo um militar (officer = null), sempre permitimos
    if (officer === null) {
      setSchedule((prev) => {
        const newSchedule = { ...prev };
        
        if (!newSchedule[currentMonthKey]) {
          newSchedule[currentMonthKey] = {};
        }
        
        if (!newSchedule[currentMonthKey][dayKey]) {
          newSchedule[currentMonthKey][dayKey] = [null, null, null];
        }
        
        newSchedule[currentMonthKey][dayKey][position] = null;
        
        return newSchedule;
      });
      
      // Salvar no localStorage também
      EscalaStorage.atualizarMilitarNaEscala(
        'pmf', 
        currentDate.getFullYear(), 
        currentDate.getMonth(), 
        day, 
        position, 
        null
      );
      
      // Tentar salvar no Supabase também, mas não bloqueia a UI
      try {
        await SupabaseEscalaStorage.atualizarMilitarNaEscala(
          'pmf', 
          currentDate.getFullYear(), 
          currentDate.getMonth(), 
          day, 
          position, 
          null
        );
        setIsOffline(false);
      } catch (error) {
        console.error("Erro ao atualizar militar na escala do Supabase:", error);
        setIsOffline(true);
      }
      
      return;
    }
    
    // VERIFICAÇÃO CRÍTICA DE LIMITE: Este é o último ponto de verificação
    // Vamos calcular o total de escalas do militar no mês inteiro
    
    // 1. Calcular total atual do militar em todos os dias
    const pmfSchedule = combinedSchedules?.pmf?.[currentMonthKey] || {};
    let totalEscalas = 0;
    
    // Contar em todos os dias do mês
    Object.values(pmfSchedule).forEach((dayOfficers: any) => {
      if (Array.isArray(dayOfficers)) {
        // Adiciona +1 para cada aparição do militar
        dayOfficers.forEach(off => {
          if (off === officer) {
            totalEscalas++;
          }
        });
      }
    });
    
    // Verificar também na agenda local que ainda não foi salva no servidor
    // Exceto o próprio dia atual que estamos modificando
    const localSchedule = schedule[currentMonthKey] || {};
    Object.entries(localSchedule).forEach(([checkDay, dayOfficers]) => {
      // Ignorar o dia atual que estamos modificando para evitar contagem dupla
      if (checkDay !== dayKey && Array.isArray(dayOfficers)) {
        dayOfficers.forEach(off => {
          if (off === officer) {
            totalEscalas++;
          }
        });
      }
    });
    
    // BLOQUEIO CRÍTICO: Impedir completamente a adição se já atingiu o limite
    const MAX_ESCALAS_POR_OFICIAL = 10;
    if (totalEscalas >= MAX_ESCALAS_POR_OFICIAL) {
      // Bloquear completamente e mostrar toast de erro
      toast({
        title: "Limite de escalas excedido",
        description: `O militar ${officer} já está escalado ${totalEscalas} vezes neste mês. O limite máximo é de ${MAX_ESCALAS_POR_OFICIAL} escalas.`,
        variant: "destructive",
      });
      
      return;
    }
    
    // Atualizar estado local
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      
      if (!newSchedule[currentMonthKey]) {
        newSchedule[currentMonthKey] = {};
      }
      
      if (!newSchedule[currentMonthKey][dayKey]) {
        newSchedule[currentMonthKey][dayKey] = [null, null, null];
      }
      
      newSchedule[currentMonthKey][dayKey][position] = officer;
      
      return newSchedule;
    });
    
    // Salvar no localStorage
    EscalaStorage.atualizarMilitarNaEscala(
      'pmf', 
      currentDate.getFullYear(), 
      currentDate.getMonth(), 
      day, 
      position, 
      officer
    );
    
    // Tentar salvar no Supabase também, mas não bloquear a UI
    try {
      await SupabaseEscalaStorage.atualizarMilitarNaEscala(
        'pmf', 
        currentDate.getFullYear(), 
        currentDate.getMonth(), 
        day, 
        position, 
        officer
      );
      setIsOffline(false);
    } catch (error) {
      console.error("Erro ao atualizar militar na escala do Supabase:", error);
      setIsOffline(true);
    }
  };
  
  const saveSchedule = async () => {
    const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const dataToSave = schedule[monthKey] || {};
    
    // Não salvar se não houver dados
    if (Object.keys(dataToSave).length === 0) {
      toast({
        title: "Nada para salvar",
        description: "Não há alterações para salvar na escala atual.",
        variant: "default",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Primeiro salvamos no localStorage para garantir persistência local
      EscalaStorage.saveEscalaMes(
        'pmf',
        currentDate.getFullYear(),
        currentDate.getMonth(),
        dataToSave
      );
      
      // Tentamos salvar no Supabase
      try {
        await SupabaseEscalaStorage.saveEscalaMes(
          'pmf',
          currentDate.getFullYear(),
          currentDate.getMonth(),
          dataToSave
        );
        
        setIsOffline(false);
        toast({
          title: "Salvo com sucesso",
          description: "A escala foi salva no Supabase e está disponível online.",
          variant: "default",
        });
      } catch (supabaseError) {
        console.error("Erro ao salvar no Supabase:", supabaseError);
        setIsOffline(true);
        
        // Se falhar o Supabase, tentamos o servidor da API
        try {
          // Criar objeto para a API
          const requestBody = {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth(),
            schedule: dataToSave,
          };
          
          // Salvar na API
          const response = await apiRequest(
            "POST",
            `/api/schedule?operation=pmf`,
            requestBody
          );
          
          if (!response.ok) throw new Error("Falha ao salvar na API");
          
          toast({
            title: "Salvo com sucesso",
            description: "A escala foi salva localmente e no servidor.",
            variant: "default",
          });
        } catch (apiError) {
          console.error("Erro ao salvar na API:", apiError);
          
          // Se ambos falharem, avisamos que foi salvo apenas localmente
          toast({
            title: "Salvo apenas localmente",
            description: "A escala foi salva apenas no seu dispositivo. Sincronize quando estiver online.",
            variant: "warning",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao salvar escala:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a escala. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Renderizar o componente principal
  return (
    <div className="flex flex-col gap-6">
      {/* Header principal com o título do sistema e descrição */}
      <header className="bg-gradient-to-br from-[#0a2f6b] via-[#143d8a] to-[#1e3a8a] py-8 mb-4 shadow-xl relative overflow-hidden rounded-3xl">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-start max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shadow-sm"></div>
              <span className="text-xs tracking-wide text-white/80 font-medium">
                20ª Companhia Independente de Polícia Militar – Muaná / Ponta de Pedras
              </span>
            </div>
            
            <div className="relative">
              <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-white to-blue-100
                  drop-shadow-[0_2px_2px_rgba(0,100,255,0.3)]">
                  POLÍCIA MAIS FORTE
                </span>
              </h1>
              
              <div className="absolute -bottom-1 left-0 w-full h-3 bg-gradient-to-b from-blue-300/20 to-transparent blur-sm"></div>
            </div>
            
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-100">
                Gerenciamento de Escalas
              </span>
              <div className="h-px flex-grow bg-gradient-to-r from-blue-400/50 via-white/30 to-transparent"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Ações e seletor de mês */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex flex-col-reverse md:flex-row gap-3 w-full lg:w-auto">
          <Button 
            variant="outline" 
            onClick={handlePreviousMonth}
            className="text-white border-white/20 bg-white/10 hover:bg-white/20 shadow-md"
          >
            Mês Anterior
          </Button>

          <div className="bg-gradient-to-r from-blue-800/60 to-indigo-800/60 backdrop-blur-md rounded-xl shadow-lg py-3 px-4 flex items-center justify-center border border-white/10">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-xs text-blue-200 mt-1">
                {isLoadingSchedules 
                  ? "Carregando dados..."
                  : isOffline 
                    ? "Modo offline (dados locais)" 
                    : "Sincronizado com o servidor"}
              </p>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleNextMonth}
            className="text-white border-white/20 bg-white/10 hover:bg-white/20 shadow-md"
          >
            Próximo Mês
          </Button>
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
          <Button 
            variant="outline" 
            disabled={isLoadingSchedules}
            onClick={saveSchedule}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md flex-1 lg:flex-none"
          >
            {isSaving ? "Salvando..." : "Salvar Escala"}
          </Button>
        </div>
      </div>

      {/* Calendário com Grid Responsivo e Cards */}
      <div className="calendar-grid">
        {/* Seção de informações sobre a contagem de dias */}
        <div className="bg-gradient-to-r from-indigo-600/10 to-blue-600/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="text-white">
              <h3 className="text-lg font-semibold">Escala de {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
              <p className="text-sm text-blue-200">
                Selecione os militares para cada posição nos dias do mês
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-lg px-4 py-2 border border-white/10">
                <div className="text-sm text-blue-200">Dias</div>
                <div className="text-xl font-bold text-white">{monthData.days}</div>
              </div>
              
              <div className="bg-white/10 rounded-lg px-4 py-2 border border-white/10">
                <div className="text-sm text-blue-200">Posições</div>
                <div className="text-xl font-bold text-white">3</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Grid responsivo de cards de dia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-auto">
          {Array.from({ length: monthData.days }).map((_, index) => {
            const day = index + 1;
            const weekday = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            ).toLocaleDateString("pt-BR", { weekday: "short" });
            
            const savedSelections =
              schedule[`${currentDate.getFullYear()}-${currentDate.getMonth()}`]?.[
                day.toString()
              ] || [null, null, null];
            
            return (
              <CalendarCard
                key={`card-${day}`}
                day={day}
                month={currentDate.getMonth()}
                year={currentDate.getFullYear()}
                weekday={weekday}
                officers={officers}
                savedSelections={savedSelections}
                onOfficerChange={handleOfficerChange}
                combinedSchedules={combinedSchedules}
              />
            );
          })}
        </div>
      </div>

      {/* Rodapé com informações adicionais */}
      <div className="mt-10 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center text-blue-200 text-sm">
        <p>
          Sistema de Gerenciamento de Escalas
          <span className="mx-2">•</span>
          20ª CIPM
          <span className="mx-2">•</span>
          <span className={isOffline ? 'text-red-400' : 'text-green-400'}>
            {isOffline ? 'Modo Offline' : 'Conectado ao Servidor'}
          </span>
        </p>
      </div>
    </div>
  );
}
