import { formatMonthYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPreviousMonth}
        className="p-2 hover:bg-blue-700 rounded-l text-white"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="font-medium px-4 text-white">{formatMonthYear(currentDate)}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextMonth}
        className="p-2 hover:bg-blue-700 rounded-r text-white"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
