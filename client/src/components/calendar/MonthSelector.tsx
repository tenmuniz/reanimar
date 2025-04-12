import { formatMonthYear } from "@/lib/utils";
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
    <div className="flex items-center justify-between w-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPreviousMonth}
        className="p-1.5 bg-blue-700/50 hover:bg-blue-700 rounded-lg text-white transition-colors duration-200"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center bg-blue-800/50 px-3 py-1.5 rounded-md">
        <Calendar className="h-5 w-5 mr-2 text-blue-200" />
        <div className="flex flex-col items-center">
          <span className="font-bold text-sm text-white tracking-wide leading-tight">
            {monthName}
          </span>
          <span className="text-xs text-blue-200">
            {year}
          </span>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextMonth}
        className="p-1.5 bg-blue-700/50 hover:bg-blue-700 rounded-lg text-white transition-colors duration-200"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
