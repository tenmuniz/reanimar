import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OfficerSelectProps {
  position: number;
  officers: string[];
  selectedOfficer: string | null;
  disabledOfficers: string[];
  onChange: (value: string | null) => void;
}

// Define a special placeholder constant
const PLACEHOLDER_VALUE = "placeholder";

// Função auxiliar para detectar a qual grupo um policial pertence com base no nome
const getOfficerGroup = (officer: string): string => {
  if (officer.includes("QOPM") || officer.includes("MONTEIRO") || 
      officer.includes("VANILSON") || officer.includes("ANDRÉ") || 
      officer.includes("CUNHA") || officer.includes("CARAVELAS") || 
      officer.includes("TONI") || officer.includes("CORREA") || 
      officer.includes("RODRIGUES") || officer.includes("TAVARES")) {
    return "EXPEDIENTE";
  } else if (officer.includes("PEIXOTO") || officer.includes("RODRIGO") || 
             officer.includes("LEDO") || officer.includes("NUNES") || 
             officer.includes("AMARAL") || officer.includes("CARLA") || 
             officer.includes("FELIPE") || officer.includes("BARROS") || 
             officer.includes("A. SILVA") || officer.includes("LUAN") || 
             officer.includes("NAVARRO")) {
    return "ALFA";
  } else if (officer.includes("OLIMAR") || officer.includes("FÁBIO") || 
             officer.includes("ANA CLEIDE") || officer.includes("GLEIDSON") || 
             officer.includes("CARLOS EDUARDO") || officer.includes("NEGRÃO") || 
             officer.includes("BRASIL") || officer.includes("MARVÃO") || 
             officer.includes("IDELVAN")) {
    return "BRAVO";
  } else if (officer.includes("PINHEIRO") || officer.includes("RAFAEL") || 
             officer.includes("MIQUEIAS") || officer.includes("M. PAIXÃO") || 
             officer.includes("CHAGAS") || officer.includes("CARVALHO") || 
             officer.includes("GOVEIA") || officer.includes("ALMEIDA") || 
             officer.includes("PATRIK") || officer.includes("GUIMARÃES")) {
    return "CHARLIE";
  }
  return "OUTROS";
};

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

  // Agrupando oficiais por categoria
  const groupedOfficers: Record<string, string[]> = {
    EXPEDIENTE: [],
    ALFA: [],
    BRAVO: [],
    CHARLIE: [],
    OUTROS: []
  };

  // Classificando cada policial em seu grupo
  officers.forEach(officer => {
    const group = getOfficerGroup(officer);
    groupedOfficers[group].push(officer);
  });

  // Ordenando militares dentro de cada grupo por posto/graduação
  const sortByRank = (a: string, b: string): number => {
    const ranks = [
      "CAP", "TEN", "SUB TEN", "1º SGT", "2º SGT", "3º SGT", "CB", "SD"
    ];
    
    // Encontrar o posto/graduação de cada militar
    const getRank = (name: string) => {
      for (const rank of ranks) {
        if (name.includes(rank)) {
          return ranks.indexOf(rank);
        }
      }
      return ranks.length; // Caso não encontre, coloca no final
    };
    
    return getRank(a) - getRank(b);
  };
  
  // Ordenar cada grupo
  Object.keys(groupedOfficers).forEach(group => {
    groupedOfficers[group].sort(sortByRank);
  });

  return (
    <div className="officer-select">
      <Label className="block text-sm font-medium text-gray-700 mb-1">
        Policial {position}
      </Label>
      
      {/* Solução customizada para exibição do nome completo */}
      {selectedOfficer ? (
        <div className="border border-gray-300 rounded-md shadow-sm p-2 bg-white text-sm">
          {selectedOfficer}
        </div>
      ) : (
        <Select
          value={selectedOfficer || PLACEHOLDER_VALUE}
          onValueChange={handleChange}
        >
          <SelectTrigger className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-200 text-sm min-h-[40px]">
            <SelectValue placeholder="-- Selecione um policial --" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto w-[300px]">
            <SelectItem value={PLACEHOLDER_VALUE}>-- Selecione um policial --</SelectItem>
            
            {/* Grupo EXPEDIENTE */}
            {groupedOfficers.EXPEDIENTE.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-blue-600">EXPEDIENTE</SelectLabel>
                {groupedOfficers.EXPEDIENTE.map((officer) => (
                  <SelectItem
                    key={officer}
                    value={officer}
                    disabled={disabledOfficers.includes(officer)}
                  >
                    {officer}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            
            {/* Grupo ALFA */}
            {groupedOfficers.ALFA.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-yellow-600">ALFA</SelectLabel>
                {groupedOfficers.ALFA.map((officer) => (
                  <SelectItem
                    key={officer}
                    value={officer}
                    disabled={disabledOfficers.includes(officer)}
                  >
                    {officer}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            
            {/* Grupo BRAVO */}
            {groupedOfficers.BRAVO.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-green-600">BRAVO</SelectLabel>
                {groupedOfficers.BRAVO.map((officer) => (
                  <SelectItem
                    key={officer}
                    value={officer}
                    disabled={disabledOfficers.includes(officer)}
                  >
                    {officer}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            
            {/* Grupo CHARLIE */}
            {groupedOfficers.CHARLIE.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-cyan-600">CHARLIE</SelectLabel>
                {groupedOfficers.CHARLIE.map((officer) => (
                  <SelectItem
                    key={officer}
                    value={officer}
                    disabled={disabledOfficers.includes(officer)}
                  >
                    {officer}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            
            {/* Outros militares que não se encaixam em nenhum grupo */}
            {groupedOfficers.OUTROS.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-gray-600">OUTROS</SelectLabel>
                {groupedOfficers.OUTROS.map((officer) => (
                  <SelectItem
                    key={officer}
                    value={officer}
                    disabled={disabledOfficers.includes(officer)}
                  >
                    {officer}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
