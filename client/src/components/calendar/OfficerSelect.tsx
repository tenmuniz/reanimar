import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OfficerSelectProps {
  position: number;
  officers: string[];
  selectedOfficer: string | null;
  disabledOfficers: string[];
  limitReachedOfficers?: string[]; // Oficiais que atingiram o limite de 12 escalas
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
  limitReachedOfficers = [],
  onChange,
}: OfficerSelectProps) {
  // VERIFICAÇÃO ADICIONAL DE SEGURANÇA: Garantir que nunca podemos selecionar alguém com limite atingido
  const handleChange = (value: string) => {
    // Se for o placeholder, só remove a seleção
    if (value === PLACEHOLDER_VALUE) {
      onChange(null);
      return;
    }
    
    // VERIFICAÇÃO CRUCIAL: Nunca permitir selecionar alguém com limite atingido
    if (limitReachedOfficers.includes(value)) {
      console.error(`🚫 TENTATIVA BLOQUEADA: Seleção de ${value} que já atingiu o limite de 12 serviços`);
      // Não realizar nenhuma ação - bloqueio total
      return;
    }
    
    // Tudo ok, pode prosseguir com a seleção
    onChange(value);
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
      <div className="flex justify-between items-center mb-1">
        <Label className="text-xs font-semibold text-slate-600">
          Policial {position}
        </Label>
        {selectedOfficer && (
          <span className="text-xs text-blue-700 bg-blue-50 px-1 py-0.5 rounded">
            {selectedOfficer.includes("CAP") || selectedOfficer.includes("TEN") ? "Oficial" : "Praça"}
          </span>
        )}
      </div>
      
      {/* Exibição do policial selecionado com opção para mudar/remover */}
      {selectedOfficer ? (
        <div className="flex items-center">
          <div className={`${limitReachedOfficers.includes(selectedOfficer) 
              ? 'border border-yellow-400 bg-yellow-50 text-yellow-800 border-l-4 border-l-yellow-500' 
              : 'border border-slate-200 bg-white text-slate-800'} 
              rounded px-3 py-2 text-sm flex-1 truncate`}>
            <span className={limitReachedOfficers.includes(selectedOfficer) ? 'line-through' : ''}>
              {selectedOfficer}
            </span>
            {limitReachedOfficers.includes(selectedOfficer) && (
              <span className="ml-1 bg-yellow-200 text-yellow-800 text-xs font-bold inline-flex items-center px-1.5 py-0.5 rounded">
                <AlertTriangle className="h-3 w-3 mr-1" />
                LIMITE
              </span>
            )}
          </div>
          <button 
            className="ml-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
            onClick={() => onChange(null)}
            title="Remover policial da escala"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Select
          value={selectedOfficer || PLACEHOLDER_VALUE}
          onValueChange={handleChange}
        >
          <SelectTrigger className="w-full rounded border border-slate-200 shadow-sm text-sm min-h-[42px] bg-slate-50/50">
            <SelectValue placeholder="-- Selecione um policial --" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto w-[300px]">
            <SelectItem value={PLACEHOLDER_VALUE}>-- Selecione um policial --</SelectItem>
            
            {/* AVISO DE LIMITE NO TOPO QUANDO HÁ MILITARES BLOQUEADOS */}
            {limitReachedOfficers.length > 0 && (
              <div className="px-3 py-2 bg-yellow-50 border-l-4 border-yellow-500 my-1.5 text-xs rounded-r">
                <p className="font-bold text-yellow-800 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1 text-yellow-600" />
                  MILITARES BLOQUEADOS
                </p>
                <p className="text-yellow-700">
                  {limitReachedOfficers.length} {limitReachedOfficers.length === 1 ? 'militar atingiu' : 'militares atingiram'} o limite de 12 serviços
                </p>
              </div>
            )}
            
            {/* Grupo EXPEDIENTE */}
            {groupedOfficers.EXPEDIENTE.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-blue-600">EXPEDIENTE</SelectLabel>
                {groupedOfficers.EXPEDIENTE.map((officer) => {
                  const hasReachedLimit = limitReachedOfficers.includes(officer);
                  return (
                    <SelectItem
                      key={officer}
                      value={officer}
                      disabled={disabledOfficers.includes(officer) || hasReachedLimit}
                      className={hasReachedLimit 
                        ? "bg-yellow-50 text-yellow-800 line-through border-l-4 border-yellow-500 pl-2 opacity-75" 
                        : ""}
                    >
                      {officer}
                      {hasReachedLimit && (
                        <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs font-medium inline-block px-1.5 py-0.5 rounded">
                          Limite 12
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            )}
            
            {/* Grupo ALFA */}
            {groupedOfficers.ALFA.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-yellow-600">ALFA</SelectLabel>
                {groupedOfficers.ALFA.map((officer) => {
                  const hasReachedLimit = limitReachedOfficers.includes(officer);
                  return (
                    <SelectItem
                      key={officer}
                      value={officer}
                      disabled={disabledOfficers.includes(officer) || hasReachedLimit}
                      className={hasReachedLimit 
                        ? "bg-red-100 text-red-800 line-through border-l-4 border-red-600 pl-2 opacity-60" 
                        : ""}
                    >
                      {officer}
                      {hasReachedLimit && (
                        <span className="ml-1 bg-red-200 text-red-700 text-xs font-bold inline-block px-1 py-0.5 rounded">
                          ⛔ BLOQUEADO (12)
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            )}
            
            {/* Grupo BRAVO */}
            {groupedOfficers.BRAVO.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-green-600">BRAVO</SelectLabel>
                {groupedOfficers.BRAVO.map((officer) => {
                  const hasReachedLimit = limitReachedOfficers.includes(officer);
                  return (
                    <SelectItem
                      key={officer}
                      value={officer}
                      disabled={disabledOfficers.includes(officer) || hasReachedLimit}
                      className={hasReachedLimit 
                        ? "bg-red-100 text-red-800 line-through border-l-4 border-red-600 pl-2 opacity-60" 
                        : ""}
                    >
                      {officer}
                      {hasReachedLimit && (
                        <span className="ml-1 bg-red-200 text-red-700 text-xs font-bold inline-block px-1 py-0.5 rounded">
                          ⛔ BLOQUEADO (12)
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            )}
            
            {/* Grupo CHARLIE */}
            {groupedOfficers.CHARLIE.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-cyan-600">CHARLIE</SelectLabel>
                {groupedOfficers.CHARLIE.map((officer) => {
                  const hasReachedLimit = limitReachedOfficers.includes(officer);
                  return (
                    <SelectItem
                      key={officer}
                      value={officer}
                      disabled={disabledOfficers.includes(officer) || hasReachedLimit}
                      className={hasReachedLimit 
                        ? "bg-red-100 text-red-800 line-through border-l-4 border-red-600 pl-2 opacity-60" 
                        : ""}
                    >
                      {officer}
                      {hasReachedLimit && (
                        <span className="ml-1 bg-red-200 text-red-700 text-xs font-bold inline-block px-1 py-0.5 rounded">
                          ⛔ BLOQUEADO (12)
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            )}
            
            {/* Outros militares que não se encaixam em nenhum grupo */}
            {groupedOfficers.OUTROS.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-gray-600">OUTROS</SelectLabel>
                {groupedOfficers.OUTROS.map((officer) => {
                  const hasReachedLimit = limitReachedOfficers.includes(officer);
                  return (
                    <SelectItem
                      key={officer}
                      value={officer}
                      disabled={disabledOfficers.includes(officer) || hasReachedLimit}
                      className={hasReachedLimit 
                        ? "bg-red-100 text-red-800 line-through border-l-4 border-red-600 pl-2 opacity-60" 
                        : ""}
                    >
                      {officer}
                      {hasReachedLimit && (
                        <span className="ml-1 bg-red-200 text-red-700 text-xs font-bold inline-block px-1 py-0.5 rounded">
                          ⛔ BLOQUEADO (12)
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
