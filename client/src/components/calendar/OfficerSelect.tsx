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
  guarnicao?: string; // Propriedade para filtrar militares por guarnição (agora ignorada)
}

// Define a special placeholder constant
const PLACEHOLDER_VALUE = "placeholder";

// Função auxiliar para detectar a qual guarnição um policial pertence com base no nome ou outras características
const getOfficerGuarnicao = (officer: string): string => {
  if (!officer || typeof officer !== 'string') return "OUTROS";
  
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
  guarnicao = "TODOS", // Ignorado, sempre mostrará todos os militares
}: OfficerSelectProps) {
  // Garantir que todas as listas são arrays
  const safeOfficers = Array.isArray(officers) ? officers : [];
  const safeDisabledOfficers = Array.isArray(disabledOfficers) ? disabledOfficers : [];
  const safeLimitReachedOfficers = Array.isArray(limitReachedOfficers) ? limitReachedOfficers : [];

  // VERIFICAÇÃO ADICIONAL DE SEGURANÇA: Garantir que nunca podemos selecionar alguém com limite atingido
  const handleChange = (value: string) => {
    // Se for o placeholder, só remove a seleção
    if (value === PLACEHOLDER_VALUE) {
      onChange(null);
      return;
    }
    
    // VERIFICAÇÃO CRUCIAL: Nunca permitir selecionar alguém com limite atingido
    if (safeLimitReachedOfficers.includes(value)) {
      console.error(`🚫 TENTATIVA BLOQUEADA: Seleção de ${value} que já atingiu o limite de 12 serviços`);
      // Não realizar nenhuma ação - bloqueio total
      return;
    }
    
    // Tudo ok, pode prosseguir com a seleção
    onChange(value);
  };

  // Agrupando oficiais por guarnição
  const groupedOfficers: Record<string, string[]> = {
    EXPEDIENTE: [],
    ALFA: [],
    BRAVO: [],
    CHARLIE: [],
    OUTROS: []
  };

  // Classificando cada policial em seu grupo
  safeOfficers.forEach(officer => {
    if (officer) {
      const group = getOfficerGuarnicao(officer);
      groupedOfficers[group].push(officer);
    }
  });

  // Ordenando militares dentro de cada grupo por posto/graduação
  const sortByRank = (a: string, b: string): number => {
    const ranks = [
      "CEL", "TEN CEL", "MAJ", "CAP", "1º TEN", "2º TEN", 
      "ASP", "SUB TEN", "1º SGT", "2º SGT", "3º SGT", 
      "CB", "SD"
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
  
  // Criar interface de seleção apropriada baseada no estado atual
  
  // Se já temos um militar selecionado, mostrar apenas ele
  if (selectedOfficer) {
    return (
      <div className="officer-select">
        <div className="mb-1">
          <Label className="text-xs font-semibold text-slate-600">
            Policial {position + 1}
          </Label>
        </div>
        
        {/* Exibição do policial selecionado com opção para mudar/remover */}
        <div className="flex items-center">
          <div className={`${safeLimitReachedOfficers.includes(selectedOfficer) 
              ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-800 border-l-4 border-l-red-500 shadow-inner' 
              : 'bg-white text-gray-800 border-l-4 border-l-indigo-600 shadow-sm'} 
              rounded-lg px-4 py-2.5 text-sm flex-1 truncate relative overflow-hidden`}>
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-70"></div>
            
            <div className="relative flex items-center">
              {/* Nome do policial com o posto/graduação destacado */}
              <span className={`font-medium ${safeLimitReachedOfficers.includes(selectedOfficer) ? 'line-through opacity-70' : ''}`}>
                {selectedOfficer}
              </span>
              
              {/* Badge de limite */}
              {safeLimitReachedOfficers.includes(selectedOfficer) && (
                <span className="ml-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold inline-flex items-center px-2 py-1 rounded-full shadow-sm animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  LIMITE ATINGIDO
                </span>
              )}
            </div>
          </div>
          
          {/* Botão de remover com efeito 3D */}
          <button 
            className="ml-2 p-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg 
              hover:from-red-600 hover:to-red-700 transition-all duration-200 
              shadow-[0_2px_4px_rgba(239,68,68,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] 
              hover:shadow-[0_3px_6px_rgba(239,68,68,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)]
              active:shadow-[0_1px_2px_rgba(239,68,68,0.4),inset_0_1px_1px_rgba(0,0,0,0.1)]
              active:translate-y-0.5
              transform hover:-rotate-12 flex items-center justify-center"
            onClick={() => onChange(null)}
            title="Remover policial da escala"
          >
            <X className="h-4 w-4 drop-shadow-sm" />
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="officer-select">
      <div className="mb-1">
        <Label className="text-xs font-semibold text-slate-600">
          Policial {position + 1}
        </Label>
      </div>
      
      <Select
        value={selectedOfficer || PLACEHOLDER_VALUE}
        onValueChange={handleChange}
      >
        <SelectTrigger 
          className="w-full rounded-lg border-0 border-l-4 border-l-indigo-600 text-sm min-h-[46px] bg-white text-gray-800 shadow-[0_2px_5px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:shadow-[0_3px_8px_rgba(59,130,246,0.15),inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all duration-200 relative overflow-hidden pl-4"
          style={{
            backgroundSize: '200% 100%',
            backgroundPosition: '0 0',
            transition: 'background-position 0.5s, box-shadow 0.3s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundPosition = '100% 0';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundPosition = '0 0';
          }}
        >
          <SelectValue placeholder="Selecione um policial" className="text-gray-700" />
        </SelectTrigger>
        <SelectContent 
          className="max-h-[350px] overflow-y-auto w-[320px] bg-gradient-to-b from-slate-50 to-white border-0 shadow-lg rounded-lg p-1"
        >
          <SelectItem 
            value={PLACEHOLDER_VALUE}
            className="bg-slate-100 mb-2 rounded-md font-medium text-gray-700 flex items-center justify-center py-2"
          >
            Selecione um policial
          </SelectItem>
          
          {/* AVISO DE LIMITE NO TOPO QUANDO HÁ MILITARES BLOQUEADOS */}
          {safeLimitReachedOfficers.length > 0 && (
            <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-yellow-50 my-2 text-sm rounded-lg shadow-inner border border-yellow-200">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="font-bold text-red-700 leading-tight">
                    Alerta de Limite GCJO
                  </p>
                  <p className="text-yellow-800 text-xs mt-1">
                    {safeLimitReachedOfficers.length} {safeLimitReachedOfficers.length === 1 ? 'militar atingiu' : 'militares atingiram'} o limite máximo de 12 escalas mensais. Estes militares estão bloqueados para novas escalas.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Mostrar todos os grupos com militares */}
          {Object.entries(groupedOfficers).map(([group, officers]) => 
            officers.length > 0 ? (
              <SelectGroup key={group}>
                <SelectLabel className={`font-bold ${
                  group === "EXPEDIENTE" ? "text-blue-600 px-2 py-1 bg-blue-50" :
                  group === "ALFA" ? "text-green-600 px-2 py-1 bg-green-50" :
                  group === "BRAVO" ? "text-yellow-600 px-2 py-1 bg-yellow-50" :
                  group === "CHARLIE" ? "text-red-600 px-2 py-1 bg-red-50" :
                  "text-gray-600 px-2 py-1 bg-gray-50"
                } rounded-md flex items-center shadow-sm mb-1`}>
                  <div className="flex-1">{group}</div>
                  <div className={`${
                    group === "EXPEDIENTE" ? "bg-blue-100 text-blue-800" :
                    group === "ALFA" ? "bg-green-100 text-green-800" :
                    group === "BRAVO" ? "bg-yellow-100 text-yellow-800" :
                    group === "CHARLIE" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  } text-xs px-1.5 py-0.5 rounded-md`}>
                    {/* Contagem de militares disponíveis (não-desabilitados) */}
                    {officers.filter(o => !safeDisabledOfficers.includes(o)).length}
                  </div>
                </SelectLabel>
                
                {officers.map((officer) => {
                  const hasReachedLimit = safeLimitReachedOfficers.includes(officer);
                  const isDisabled = safeDisabledOfficers.includes(officer) || hasReachedLimit;
                  
                  return (
                    <SelectItem
                      key={officer}
                      value={officer}
                      disabled={isDisabled}
                      className={`mb-1 rounded-md transition-all duration-200 ${
                        hasReachedLimit 
                          ? "bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 pl-3 line-through opacity-80" 
                          : isDisabled
                            ? "bg-slate-100 opacity-60"
                            : group === "EXPEDIENTE" 
                              ? "hover:bg-blue-50 border-l-2 border-blue-300 pl-3" 
                              : group === "ALFA" 
                                ? "hover:bg-green-50 border-l-2 border-green-300 pl-3"
                                : group === "BRAVO"
                                  ? "hover:bg-yellow-50 border-l-2 border-yellow-300 pl-3"
                                  : group === "CHARLIE"
                                    ? "hover:bg-red-50 border-l-2 border-red-300 pl-3"
                                    : "hover:bg-gray-50 border-l-2 border-gray-300 pl-3"
                      }`}
                    >
                      {officer}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            ) : null
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
