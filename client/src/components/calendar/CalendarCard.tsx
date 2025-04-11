import { useState, useEffect } from "react";
import { DaySchedule } from "@/lib/types";
import { getWeekdayClass } from "@/lib/utils";
import OfficerSelect from "./OfficerSelect";

interface CalendarCardProps {
  day: number;
  month: number;
  year: number;
  weekday: string;
  officers: string[];
  savedSelections: (string | null)[];
  onOfficerChange: (day: number, position: number, officer: string | null) => void;
}

export default function CalendarCard({
  day,
  month,
  year,
  weekday,
  officers,
  savedSelections,
  onOfficerChange,
}: CalendarCardProps) {
  const [selections, setSelections] = useState<(string | null)[]>(
    savedSelections || [null, null, null]
  );

  useEffect(() => {
    if (savedSelections) {
      setSelections(savedSelections);
    }
  }, [savedSelections]);

  const handleOfficerChange = (position: number, officer: string | null) => {
    const newSelections = [...selections];
    newSelections[position] = officer;
    setSelections(newSelections);
    onOfficerChange(day, position, officer);
  };

  // Get the selected officers for this day to disable them in other dropdowns
  const selectedOfficers = selections.filter(Boolean) as string[];

  const weekdayClass = getWeekdayClass(weekday);

  return (
    <div className="day-card bg-white rounded-lg shadow-sm overflow-hidden" id={`dia-${day}`}>
      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Dia {day}</h3>
        <span className={`text-xs font-medium ${weekdayClass} px-2 py-1 rounded`}>
          {weekday}
        </span>
      </div>
      <div className="p-4 space-y-3">
        {[0, 1, 2].map((position) => (
          <OfficerSelect
            key={`day-${day}-position-${position}`}
            position={position + 1}
            officers={officers}
            selectedOfficer={selections[position]}
            disabledOfficers={selectedOfficers.filter(
              (officer) => officer !== selections[position]
            )}
            onChange={(value) => handleOfficerChange(position, value)}
          />
        ))}
      </div>
    </div>
  );
}
