import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

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
    <div className="w-full flex flex-col items-center space-y-4 mb-10">
      {/* Banner de mês/ano completamente redesenhado */}
      <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 py-5 px-6 rounded-lg shadow-xl 
                    flex items-center justify-between relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        
        {/* Texto e ícone */}
        <div className="flex items-center z-10">
          <CalendarIcon className="h-7 w-7 text-white mr-3" />
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-wider">{monthName}</h2>
            <p className="text-white/80 text-sm">{year}</p>
          </div>
        </div>
        
        {/* Controles de navegação */}
        <div className="flex items-center space-x-3 z-10">
          <button
            onClick={onPreviousMonth}
            className="w-9 h-9 flex items-center justify-center rounded-lg 
                      bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={onNextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-lg 
                      bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Indicador de status */}
      <div className="bg-gray-100 px-3 py-1.5 rounded-full shadow-inner flex items-center text-xs font-medium text-gray-600">
        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
        Escala sendo construída
      </div>
    </div>
  );
}
