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
        className="p-2 hover:bg-blue-700 rounded-full text-white"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <div className="flex items-center">
        <Calendar className="h-6 w-6 mr-2 text-yellow-300" />
        <div className="text-center">
          <span className="font-bold text-2xl text-white tracking-wide">
            {monthName}
          </span>
          <span className="font-bold text-xl text-yellow-300 ml-2">
            {year}
          </span>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextMonth}
        className="p-2 hover:bg-blue-700 rounded-full text-white"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
