import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useLocation } from "wouter";

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
  
  // Determinar as cores com base na página atual
  const [location] = useLocation();
  const isEscolaSegura = location === "/escola-segura";
  
  // Cores dinâmicas baseadas na página
  const bgExterno = isEscolaSegura ? "bg-purple-600" : "bg-blue-600";
  const bgInterno = isEscolaSegura ? "bg-purple-500" : "bg-blue-500";
  const bgBarraVazia = isEscolaSegura ? "bg-purple-400/30" : "bg-blue-400/30";
  const bgBarraCheia = isEscolaSegura ? "bg-purple-300" : "bg-blue-300";
  const bgStatus = isEscolaSegura ? "bg-purple-400/20" : "bg-blue-400/20";
  const indicadorCor = isEscolaSegura ? "bg-purple-200" : "bg-blue-200";
  const textoCor = isEscolaSegura ? "text-purple-100" : "text-blue-100";

  return (
    <div className="flex justify-end mb-8">
      {/* Container exterior com fundo dinâmico baseado na página */}
      <div className={`relative ${bgExterno} rounded-3xl overflow-hidden shadow-xl p-4 max-w-xs`}>
        {/* Card interno com fundo mais claro */}
        <div className={`${bgInterno} rounded-2xl overflow-hidden shadow-inner`}>
          {/* Conteúdo principal */}
          <div className="p-4">
            {/* Progresso do mês */}
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                <span className="text-xs font-medium text-white">
                  Progresso do mês: {progressPercent}%
                </span>
              </div>
            </div>
            
            {/* Mês e ano */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-4xl font-bold text-white tracking-wide leading-none mb-1">
                  {monthName}
                </h2>
                <p className="text-sm text-white/80">
                  {year}
                </p>
              </div>
              
              {/* Ícone de calendário */}
              <div className="p-2 bg-white/15 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
            
            {/* Barra de progresso */}
            <div className={`h-1 ${bgBarraVazia} rounded-full overflow-hidden mb-4`}>
              <div 
                className={`h-full ${bgBarraCheia}`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            
            {/* Status e botões de navegação */}
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center px-2 py-1 ${bgStatus} rounded-full`}>
                <span className={`w-1.5 h-1.5 rounded-full ${indicadorCor} mr-1.5`}></span>
                <span className={`text-xs ${textoCor}`}>Escala ativa</span>
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={onPreviousMonth}
                  className="flex items-center justify-center w-7 h-7 rounded-full
                            bg-white/10 hover:bg-white/20 transition-all text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <button
                  onClick={onNextMonth}
                  className="flex items-center justify-center w-7 h-7 rounded-full
                            bg-white/10 hover:bg-white/20 transition-all text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
