import { CombinedSchedules } from "./types";

export interface SearchResult {
  operacao: 'pmf' | 'escolaSegura';
  dias: number[];
  mes: number;
  ano: number;
}

export function searchMilitar(schedules: CombinedSchedules, searchTerm: string, month: number, year: number): SearchResult[] {
  const results: SearchResult[] = [];
  
  // Buscar na PMF (estrutura: schedules.pmf[year][month][day])
  const pmfSchedule = schedules.pmf && schedules.pmf[year] && schedules.pmf[year][month] 
    ? schedules.pmf[year][month] 
    : {};
    
  const pmfResults = searchInSchedule(pmfSchedule, searchTerm, 'pmf', month, year);
  if (pmfResults.dias.length > 0) {
    results.push(pmfResults);
  }
  
  // Buscar na Escola Segura (estrutura semelhante)
  const escolaSeguraSchedule = schedules.escolaSegura && schedules.escolaSegura[year] && schedules.escolaSegura[year][month] 
    ? schedules.escolaSegura[year][month] 
    : {};
    
  const escolaSeguraResults = searchInSchedule(escolaSeguraSchedule, searchTerm, 'escolaSegura', month, year);
  if (escolaSeguraResults.dias.length > 0) {
    results.push(escolaSeguraResults);
  }
  
  return results;
}

function searchInSchedule(
  schedule: any, // Usando any para evitar erros de tipo com a estrutura complexa
  searchTerm: string,
  operationType: 'pmf' | 'escolaSegura',
  month: number,
  year: number
): SearchResult {
  const matchingDays: number[] = [];
  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  
  // Verificar se o schedule está definido
  if (!schedule) {
    return {
      operacao: operationType,
      dias: [],
      mes: month,
      ano: year
    };
  }
  
  // Percorrer cada dia do cronograma
  Object.keys(schedule).forEach(dayString => {
    const day = parseInt(dayString, 10);
    const officers = schedule[dayString] || [];
    
    // Verificar cada oficial neste dia
    let foundMatch = false;
    for (let i = 0; i < officers.length && !foundMatch; i++) {
      const officer = officers[i];
      if (officer && officer.toLowerCase().includes(lowerSearchTerm)) {
        matchingDays.push(day);
        foundMatch = true;
      }
    }
  });
  
  // Ordenar os dias em ordem crescente
  matchingDays.sort((a, b) => a - b);
  
  return {
    operacao: operationType,
    dias: matchingDays,
    mes: month,
    ano: year
  };
}