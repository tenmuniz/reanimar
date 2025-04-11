import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OfficerSelectProps {
  position: number;
  officers: string[];
  selectedOfficer: string | null;
  disabledOfficers: string[];
  onChange: (value: string | null) => void;
}

export default function OfficerSelect({
  position,
  officers,
  selectedOfficer,
  disabledOfficers,
  onChange,
}: OfficerSelectProps) {
  const handleChange = (value: string) => {
    onChange(value === "" ? null : value);
  };

  return (
    <div className="officer-select">
      <Label className="block text-sm font-medium text-gray-700 mb-1">
        Policial {position}
      </Label>
      <Select
        value={selectedOfficer || ""}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 text-sm">
          <SelectValue placeholder="-- Selecione um policial --" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">-- Selecione um policial --</SelectItem>
          {officers.map((officer) => (
            <SelectItem
              key={officer}
              value={officer}
              disabled={disabledOfficers.includes(officer)}
            >
              {officer}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
