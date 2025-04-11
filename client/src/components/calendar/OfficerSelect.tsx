import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OfficerSelectProps {
  position: number;
  officers: string[];
  selectedOfficer: string | null;
  disabledOfficers: string[];
  onChange: (value: string | null) => void;
}

// Define a special placeholder constant
const PLACEHOLDER_VALUE = "placeholder";

export default function OfficerSelect({
  position,
  officers,
  selectedOfficer,
  disabledOfficers,
  onChange,
}: OfficerSelectProps) {
  const handleChange = (value: string) => {
    onChange(value === PLACEHOLDER_VALUE ? null : value);
  };

  return (
    <div className="officer-select">
      <Label className="block text-sm font-medium text-gray-700 mb-1">
        Policial {position}
      </Label>
      <Select
        value={selectedOfficer || PLACEHOLDER_VALUE}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 text-sm">
          <SelectValue placeholder="-- Selecione um policial --" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={PLACEHOLDER_VALUE}>-- Selecione um policial --</SelectItem>
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
