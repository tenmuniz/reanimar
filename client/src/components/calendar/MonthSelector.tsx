import { formatMonthYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, CalendarCheck } from "lucide-react";

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
    <div className="flex items-center justify-between w-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPreviousMonth}
        className="p-1.5 bg-amber-700/70 hover:bg-amber-700 rounded-xl text-white transition-colors duration-200
        shadow-md hover:shadow-lg active:shadow-inner active:translate-y-0.5 transform"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center justify-center
        bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-2.5 rounded-2xl
        shadow-lg transform hover:scale-105 transition-all duration-300
        border border-amber-400/30">
        <CalendarCheck className="h-6 w-6 mr-3 text-white drop-shadow-md" />
        <div className="flex flex-col items-center">
          <span className="font-extrabold text-xl text-white tracking-wider leading-tight
            drop-shadow-md bg-gradient-to-r from-white to-amber-100 text-transparent bg-clip-text">
            {monthName}
          </span>
          <span className="text-sm font-medium text-amber-100 tracking-widest">
            {year}
          </span>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextMonth}
        className="p-1.5 bg-amber-700/70 hover:bg-amber-700 rounded-xl text-white transition-colors duration-200
        shadow-md hover:shadow-lg active:shadow-inner active:translate-y-0.5 transform"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
