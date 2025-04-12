import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

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

  return (
    <div className="flex items-center justify-center w-full max-w-xs mx-auto mb-6">
      {/* Design completamente novo sem fundo azul */}
      <div className="flex items-center justify-center">
        {/* Botão anterior com novo design */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousMonth}
          className="h-12 w-12 flex items-center justify-center rounded-full 
                  text-slate-700 bg-white hover:bg-slate-100 transition-all duration-200 
                  mr-2 shadow-md hover:shadow-lg border border-slate-200"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        {/* Botão central do mês com degradê vistoso */}
        <div className="relative flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600
                    py-4 px-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300
                    border-2 border-orange-300 overflow-hidden">
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shine-effect"></div>
          
          {/* Conteúdo */}
          <div className="flex items-center justify-center z-10">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-extrabold text-xl text-white leading-tight drop-shadow-sm tracking-wide">
                {monthName}
              </span>
              <span className="text-sm font-medium text-white/90 tracking-wider">
                {year}
              </span>
            </div>
          </div>
        </div>
        
        {/* Botão próximo com novo design */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="h-12 w-12 flex items-center justify-center rounded-full 
                  text-slate-700 bg-white hover:bg-slate-100 transition-all duration-200 
                  ml-2 shadow-md hover:shadow-lg border border-slate-200"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
