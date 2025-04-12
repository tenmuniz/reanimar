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
    <div className="flex items-center justify-between w-full max-w-xs mx-auto">
      {/* Container principal com fundo azul */}
      <div className="flex items-center justify-between w-full bg-blue-600 rounded-xl p-1.5 shadow-lg">
        {/* Botão anterior */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousMonth}
          className="h-10 w-10 rounded-lg bg-blue-700 text-white hover:bg-blue-800 shadow-md 
                  hover:shadow-lg active:shadow-inner transition-all duration-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        {/* Botão do mês com estilo laranja */}
        <div className="flex items-center justify-center bg-gradient-to-r from-orange-600 to-orange-500 
                    px-7 py-3 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200
                    border border-orange-400">
          <Calendar className="h-5 w-5 mr-3 text-white" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-base text-white">{monthName}</span>
            <span className="text-xs font-medium text-orange-100">{year}</span>
          </div>
        </div>
        
        {/* Botão próximo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="h-10 w-10 rounded-lg bg-blue-700 text-white hover:bg-blue-800 shadow-md 
                  hover:shadow-lg active:shadow-inner transition-all duration-200"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
