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
      {/* Container principal idêntico à imagem de referência */}
      <div className="flex items-center justify-between w-full bg-blue-600 rounded-2xl p-2 shadow-lg">
        {/* Botão anterior */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousMonth}
          className="h-10 w-10 flex items-center justify-center rounded-full text-white
                  hover:bg-blue-500/20 transition-all duration-200 border-none shadow-none"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        {/* Botão central do mês - EXATAMENTE igual à imagem */}
        <div className="flex items-center justify-center bg-orange-500
                    py-3 px-5 rounded-xl shadow-md transform hover:scale-105 transition-all duration-200
                    border border-orange-400">
          <div className="flex items-center justify-center">
            <Calendar className="h-5 w-5 mr-2 text-white" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-lg text-white leading-tight">{monthName}</span>
              <span className="text-xs font-medium text-white/80">{year}</span>
            </div>
          </div>
        </div>
        
        {/* Botão próximo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="h-10 w-10 flex items-center justify-center rounded-full text-white
                  hover:bg-blue-500/20 transition-all duration-200 border-none shadow-none"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
