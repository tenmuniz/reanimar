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
      <div className="flex items-center gap-4">
        {/* Botão anterior - Estilo limpo circular sem fundo */}
        <button
          onClick={onPreviousMonth}
          className="w-12 h-12 flex items-center justify-center rounded-full 
                    bg-white shadow-lg hover:shadow-xl transition-all duration-200
                    border border-gray-200 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        {/* Botão central do mês - Estilo completamente novo */}
        <div 
          className="relative flex items-center justify-center 
                  bg-gradient-to-r from-orange-500 to-orange-400 
                  px-5 py-2.5 rounded-xl shadow-lg
                  overflow-hidden"
        >
          {/* Conteúdo */}
          <div className="flex items-center justify-center z-10">
            {/* Ícone de calendário */}
            <div className="mr-3">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            
            {/* Texto */}
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-wide">{monthName}</span>
              <span className="text-sm text-white/80">{year}</span>
            </div>
          </div>
        </div>
        
        {/* Botão próximo - Estilo limpo circular sem fundo */}
        <button
          onClick={onNextMonth}
          className="w-12 h-12 flex items-center justify-center rounded-full 
                    bg-white shadow-lg hover:shadow-xl transition-all duration-200
                    border border-gray-200 text-gray-600 hover:text-gray-900"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
