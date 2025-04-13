import { CombinedSchedules } from "./types";

export interface SearchResult {
  operacao: 'pmf' | 'escolaSegura';
  dias: number[];
  mes: number;
  ano: number;
}

export function searchMilitar(schedules: CombinedSchedules, searchTerm: string, month: number, year: number): SearchResult[] {
  const results: SearchResult[] = [];
  
  // Buscar na PMF
  const pmfResults = searchInSchedule(schedules.pmf, searchTerm, 'pmf', month, year);
  if (pmfResults.dias.length > 0) {
    results.push(pmfResults);
  }
  
  // Buscar na Escola Segura
  const escolaSeguraResults = searchInSchedule(schedules.escolaSegura, searchTerm, 'escolaSegura', month, year);
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
  
  // Percorrer cada dia do cronograma
  Object.keys(schedule).forEach(dayString => {
    const day = parseInt(dayString, 10);
    const officers = schedule[dayString] || [];
    
    // Verificar cada oficial neste dia
    let foundMatch = false;
    for (let i = 0; i < officers.length && !foundMatch; i++) {
      const officer = officers[i];
      if (officer && officer.toLowerCase().includes(searchTerm.toLowerCase())) {
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