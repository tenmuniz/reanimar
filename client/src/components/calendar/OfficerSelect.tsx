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
      <div className="mb-1">
        <Label className="text-xs font-semibold text-slate-600">
          Policial
        </Label>
      </div>
      
      {/* Exibição do policial selecionado com opção para mudar/remover */}
      {selectedOfficer ? (
        <div className="flex items-center">
          <div className={`${limitReachedOfficers.includes(selectedOfficer) 
              ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-800 border-0 shadow-inner' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-800 border-0 shadow-sm'} 
              rounded-lg px-4 py-2.5 text-sm flex-1 truncate relative overflow-hidden`}>
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-70"></div>
            
            {/* Barra lateral indicadora */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 
              ${limitReachedOfficers.includes(selectedOfficer) 
                ? 'bg-gradient-to-b from-red-500 to-red-600' 
                : 'bg-gradient-to-b from-blue-500 to-indigo-600'}`}>
            </div>
            
            <div className="relative flex items-center">
              {/* Remover qualquer indicador de número */}
              
              {/* Nome do policial */}
              <span className={`font-medium ${limitReachedOfficers.includes(selectedOfficer) ? 'line-through opacity-70' : ''}`}>
                {selectedOfficer}
              </span>
              
              {/* Badge de limite */}
              {limitReachedOfficers.includes(selectedOfficer) && (
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
      ) : (
        <Select
          value={selectedOfficer || PLACEHOLDER_VALUE}
          onValueChange={handleChange}
        >
          <SelectTrigger 
            className="w-full rounded-lg border-0 text-sm min-h-[46px] bg-gradient-to-r from-blue-50 to-indigo-50 shadow-[0_2px_5px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:shadow-[0_3px_8px_rgba(59,130,246,0.15),inset_0_1px_1px_rgba(255,255,255,0.8)] transition-all duration-200 relative overflow-hidden pl-4"
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
            {/* Decoração lateral */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
            
            {/* Sem ícone decorativo */}
            
            <SelectValue placeholder="Selecione um policial" />
          </SelectTrigger>
          <SelectContent 
            className="max-h-[350px] overflow-y-auto w-[320px] bg-gradient-to-b from-slate-50 to-white border-0 shadow-lg rounded-lg p-1"
          >
            <SelectItem 
              value={PLACEHOLDER_VALUE}
              className="bg-slate-100 mb-2 rounded-md font-medium text-slate-500 flex items-center justify-center py-2"
            >
              Selecione um policial
            </SelectItem>
            
            {/* AVISO DE LIMITE NO TOPO QUANDO HÁ MILITARES BLOQUEADOS */}
            {limitReachedOfficers.length > 0 && (
              <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-yellow-50 my-2 text-sm rounded-lg shadow-inner border border-yellow-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="font-bold text-red-700 leading-tight">
                      Alerta de Limite GCJO
                    </p>
                    <p className="text-yellow-800 text-xs mt-1">
                      {limitReachedOfficers.length} {limitReachedOfficers.length === 1 ? 'militar atingiu' : 'militares atingiram'} o limite máximo de 12 escalas mensais. Estes militares estão bloqueados para novas escalas.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Grupo EXPEDIENTE */}
            {groupedOfficers.EXPEDIENTE.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded-md flex items-center shadow-sm mb-1">
                  <div className="flex-1">EXPEDIENTE</div>
                  <div className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-md">{groupedOfficers.EXPEDIENTE.length}</div>
                </SelectLabel>
                {groupedOfficers.EXPEDIENTE.map((officer) => {
                  const hasReachedLimit = limitReachedOfficers.includes(officer);
                  const isDisabled = disabledOfficers.includes(officer) || hasReachedLimit;
                  
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
                            : "hover:bg-blue-50 border-l-2 border-blue-300 pl-3"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={hasReachedLimit ? "text-red-800" : ""}>{officer}</span>
                        {hasReachedLimit && (
                          <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-0.5" />
                            12+
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            )}
            
            {/* Grupo ALFA */}
            {groupedOfficers.ALFA.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-yellow-600 px-2 py-1 bg-yellow-50 rounded-md flex items-center shadow-sm mb-1">
                  <div className="flex-1">ALFA</div>
                  <div className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-md">{groupedOfficers.ALFA.length}</div>
                </SelectLabel>
                {groupedOfficers.ALFA.map((officer) => {
                  const hasReachedLimit = limitReachedOfficers.includes(officer);
                  const isDisabled = disabledOfficers.includes(officer) || hasReachedLimit;
                  
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
                            : "hover:bg-yellow-50 border-l-2 border-yellow-300 pl-3"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={hasReachedLimit ? "text-red-800" : ""}>{officer}</span>
                        {hasReachedLimit && (
                          <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-0.5" />
                            12+
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            )}
            
            {/* Grupo BRAVO */}
            {groupedOfficers.BRAVO.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-green-600 px-2 py-1 bg-green-50 rounded-md flex items-center shadow-sm mb-1">
                  <div className="flex-1">BRAVO</div>
                  <div className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-md">{groupedOfficers.BRAVO.length}</div>
                </SelectLabel>
                {groupedOfficers.BRAVO.map((officer) => {
                  const hasReachedLimit = limitReachedOfficers.includes(officer);
                  const isDisabled = disabledOfficers.includes(officer) || hasReachedLimit;
                  
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
                            : "hover:bg-green-50 border-l-2 border-green-300 pl-3"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={hasReachedLimit ? "text-red-800" : ""}>{officer}</span>
                        {hasReachedLimit && (
                          <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-0.5" />
                            12+
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            )}
            
            {/* Grupo CHARLIE */}
            {groupedOfficers.CHARLIE.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-cyan-600 px-2 py-1 bg-cyan-50 rounded-md flex items-center shadow-sm mb-1">
                  <div className="flex-1">CHARLIE</div>
                  <div className="bg-cyan-100 text-cyan-800 text-xs px-1.5 py-0.5 rounded-md">{groupedOfficers.CHARLIE.length}</div>
                </SelectLabel>
                {groupedOfficers.CHARLIE.map((officer) => {
                  const hasReachedLimit = limitReachedOfficers.includes(officer);
                  const isDisabled = disabledOfficers.includes(officer) || hasReachedLimit;
                  
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
                            : "hover:bg-cyan-50 border-l-2 border-cyan-300 pl-3"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={hasReachedLimit ? "text-red-800" : ""}>{officer}</span>
                        {hasReachedLimit && (
                          <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-0.5" />
                            12+
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            )}
            
            {/* Outros militares que não se encaixam em nenhum grupo */}
            {groupedOfficers.OUTROS.length > 0 && (
              <SelectGroup>
                <SelectLabel className="font-bold text-slate-600 px-2 py-1 bg-slate-100 rounded-md flex items-center shadow-sm mb-1">
                  <div className="flex-1">OUTROS</div>
                  <div className="bg-slate-200 text-slate-700 text-xs px-1.5 py-0.5 rounded-md">{groupedOfficers.OUTROS.length}</div>
                </SelectLabel>
                {groupedOfficers.OUTROS.map((officer) => {
                  const hasReachedLimit = limitReachedOfficers.includes(officer);
                  const isDisabled = disabledOfficers.includes(officer) || hasReachedLimit;
                  
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
                            : "hover:bg-slate-50 border-l-2 border-slate-300 pl-3"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={hasReachedLimit ? "text-red-800" : ""}>{officer}</span>
                        {hasReachedLimit && (
                          <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-0.5" />
                            12+
                          </span>
                        )}
                      </div>
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
