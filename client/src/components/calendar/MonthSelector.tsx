import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Clock, TrendingUp, Shield, Activity, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

interface MonthSelectorProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export default function MonthSelector({
  currentDate,
  onPreviousMonth,
  onNextMonth,
}: MonthSelectorProps) {
  // Get month name and year separately for styling
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
  const year = currentDate.getFullYear();

  // Obter o mês e ano atualmente visualizados
  const viewMonth = currentDate.getMonth();
  const viewYear = currentDate.getFullYear();
  
  // Dia atual (para o mês atual) ou último dia (para meses passados) ou primeiro dia (para meses futuros)
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  
  // Total de dias no mês visualizado
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  
  // Cálculo dinâmico do progresso baseado no mês que está sendo visualizado
  let progressPercent = 0;
  
  if (viewYear < todayYear || (viewYear === todayYear && viewMonth < todayMonth)) {
    // Mês já passou - progresso 100%
    progressPercent = 100;
  } else if (viewYear > todayYear || (viewYear === todayYear && viewMonth > todayMonth)) {
    // Mês ainda não chegou - progresso 0%
    progressPercent = 0;
  } else {
    // Mês atual - calcular progresso baseado no dia atual
    progressPercent = Math.round((todayDay / daysInMonth) * 100);
  }
  
  // Dia a mostrar (dia atual para mês atual, último dia para meses passados, ou 1 para meses futuros)
  const currentDay = (viewYear === todayYear && viewMonth === todayMonth) ? 
    todayDay : 
    (viewYear < todayYear || (viewYear === todayYear && viewMonth < todayMonth)) ? 
      daysInMonth : 1;
  
  // Determinar as cores com base na página atual
  const [location] = useLocation();
  const isEscolaSegura = location === "/escola-segura";
  
  // Estado para animação do percentual
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Animar o progresso ao carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [progressPercent]);
  
  // Cores e estilos dinâmicos baseados na página
  const baseColorFrom = isEscolaSegura ? "from-purple-600" : "from-blue-600";
  const baseColorTo = isEscolaSegura ? "to-indigo-700" : "to-blue-800";
  const accentColor = isEscolaSegura ? "purple" : "blue";
  const glowColor = isEscolaSegura ? "rgba(147, 51, 234, 0.3)" : "rgba(37, 99, 235, 0.3)";
  const progressBarColor = isEscolaSegura ? "bg-gradient-to-r from-purple-300 to-indigo-400" : "bg-gradient-to-r from-blue-300 to-cyan-400";
  const highlightColor = isEscolaSegura ? "bg-purple-400" : "bg-blue-400";
  const activeIcon = isEscolaSegura ? <BookOpen className="h-4 w-4 text-white" /> : <Shield className="h-4 w-4 text-white" />;
  
  // Estilos calculados para a parte de trás do cartão (efeito 3D)
  const cardStyle = {
    background: `linear-gradient(135deg, ${isEscolaSegura ? '#8b5cf6' : '#3b82f6'} 0%, ${isEscolaSegura ? '#6366f1' : '#1d4ed8'} 100%)`,
    boxShadow: `0 25px 50px -12px ${glowColor}`,
  };
  
  return (
    <div className="flex justify-end mb-8">
      {/* Card container com efeitos 3D e detalhes premium */}
      <div 
        className="relative max-w-xs will-change-transform transition-all duration-500 hover:translate-y-[-5px]"
        style={{ perspective: "1000px" }}
      >
        {/* Partículas decorativas (círculos flutuantes) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[24px]">
          <div className={`absolute -top-6 -right-6 h-16 w-16 rounded-full opacity-20 bg-white blur-xl`}></div>
          <div className={`absolute top-[40%] -left-3 h-8 w-8 rounded-full opacity-10 bg-white blur-lg`}></div>
          <div className={`absolute -bottom-4 right-[30%] h-10 w-10 rounded-full opacity-15 bg-white blur-xl`}></div>
        </div>
        
        {/* Cartão externo com efeito glassmorphism */}
        <div 
          className={`relative overflow-hidden rounded-[24px] border border-white/10 backdrop-blur-sm p-5`}
          style={cardStyle}
        >
          {/* Conteúdo principal */}
          <div className="relative z-10">
            {/* Cabeçalho - Status e progresso */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-white/80" />
                <span className="text-xs font-medium text-white">
                  Progresso: <span className="font-bold">{progressPercent}%</span>
                </span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 rounded-full px-2 py-0.5">
                <Clock className="h-3 w-3 text-white/80" />
                <span className="text-[10px] font-medium text-white/90">Dia {currentDay}/{daysInMonth}</span>
              </div>
            </div>
            
            {/* Título principal - Mês e ano */}
            <div className="flex items-start mb-4">
              <div className="flex-1">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/80 tracking-wide leading-none mb-0.5">
                  {monthName}
                </h2>
                <div className="flex items-center">
                  <span className="font-semibold text-white/70 text-sm mr-2">{year}</span>
                  <div className="flex bg-white/10 rounded-md py-0.5 px-1.5 border border-white/20">
                    <Calendar className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Barra de progresso estilizada */}
            <div className="mb-4 relative">
              {/* Indicador percentual centrado na barra de progresso */}
              <div className="absolute z-20 inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg"
                  style={{
                    transform: `translateX(${(animatedProgress / 100 * (100 - 6))}%)`,
                    transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <div className={`w-4 h-4 rounded-full ${isEscolaSegura ? 'bg-purple-300' : 'bg-blue-300'} flex items-center justify-center`}>
                    <Activity className="h-2.5 w-2.5 text-indigo-900" />
                  </div>
                </div>
              </div>
              
              {/* Barra de progresso com gradiente e efeito de brilho */}
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full ${progressBarColor} rounded-full relative z-10`}
                  style={{ 
                    width: `${animatedProgress}%`,
                    transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: `0 0 10px ${isEscolaSegura ? 'rgba(167, 139, 250, 0.5)' : 'rgba(96, 165, 250, 0.5)'}` 
                  }}
                >
                  {/* Efeito de brilho na barra de progresso */}
                  <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
                    <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent to-white/30 animate-shine"></div>
                  </div>
                </div>
                
                {/* Marcadores de referência */}
                <div className="absolute inset-0 flex justify-between px-1">
                  <div className="w-0.5 h-full bg-white/5"></div>
                  <div className="w-0.5 h-full bg-white/5"></div>
                  <div className="w-0.5 h-full bg-white/5"></div>
                </div>
              </div>
            </div>
            
            {/* Rodapé - Status e navegação */}
            <div className="flex items-center justify-between">
              {/* Indicador de status ativo com efeito pulsante */}
              <div className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20`}>
                <div className="relative">
                  <div className={`absolute w-full h-full rounded-full ${isEscolaSegura ? 'bg-purple-400' : 'bg-blue-400'} opacity-30 animate-ping-slow`}></div>
                  <div className={`relative w-2 h-2 rounded-full ${isEscolaSegura ? 'bg-purple-300' : 'bg-blue-300'}`}></div>
                </div>
                <span className="text-xs font-medium text-white">Escala ativa</span>
              </div>
              
              {/* Botões de navegação estilizados */}
              <div className="flex space-x-2">
                <button
                  onClick={onPreviousMonth}
                  className={`flex items-center justify-center w-8 h-8 rounded-xl
                            bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300 text-white
                            hover:shadow-lg hover:shadow-${accentColor}-500/20 focus:outline-none focus:ring-2 focus:ring-white/20`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <button
                  onClick={onNextMonth}
                  className={`flex items-center justify-center w-8 h-8 rounded-xl
                            bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300 text-white
                            hover:shadow-lg hover:shadow-${accentColor}-500/20 focus:outline-none focus:ring-2 focus:ring-white/20`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
