import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Clock, Activity } from "lucide-react";

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

  // Dia atual
  const currentDay = new Date().getDate();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  // Calcular progresso do mês (para a barra de progresso)
  const progressPercent = Math.round((currentDay / daysInMonth) * 100);

  return (
    <div className="mb-8">
      {/* Card flutuante com sombra 3D */}
      <div className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl">
        {/* Fundo com gradiente vibrante */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600"></div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-32 -mb-32 blur-xl"></div>
        
        {/* Conteúdo principal */}
        <div className="relative z-10 p-8">
          <div className="flex justify-between items-start">
            {/* Data e progresso */}
            <div>
              <div className="flex items-center mb-1">
                <Activity className="h-4 w-4 text-teal-300 mr-2" />
                <span className="text-xs font-medium text-white/80">Progresso do mês: {progressPercent}%</span>
              </div>
              
              <h2 className="text-4xl font-black text-white tracking-tight mb-1">{monthName}</h2>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-white/70 mr-2" />
                <span className="text-white/80 text-sm font-medium">{year}</span>
              </div>
              
              {/* Barra de progresso */}
              <div className="mt-3 w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-300 to-emerald-400 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            
            {/* Ícone de calendário grande */}
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl shadow-inner">
              <Calendar className="h-10 w-10 text-white" />
            </div>
          </div>
          
          {/* Navegação de mês */}
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
                <span className="text-xs font-medium text-white/80">Escala ativa</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onPreviousMonth}
                className="flex items-center justify-center w-9 h-9 rounded-full 
                          bg-white/10 hover:bg-white/20 transition-all
                          text-white shadow-inner"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <button
                onClick={onNextMonth}
                className="flex items-center justify-center w-9 h-9 rounded-full 
                          bg-white/10 hover:bg-white/20 transition-all
                          text-white shadow-inner"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
