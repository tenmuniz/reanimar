import { CombinedSchedules } from "./types";

export interface SearchResult {
  operacao: 'pmf' | 'escolaSegura';
  dias: number[];
  mes: number;
  ano: number;
}

export function searchMilitar(schedules: CombinedSchedules, searchTerm: string, month: number, year: number): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!schedules) {
    console.warn('Não há escalas disponíveis para busca');
    return [];
  }
  
  console.log('Estrutura das escalas recebidas:', JSON.stringify(schedules, null, 2).substring(0, 200) + '...');
  
  // Buscar na PMF com a estrutura aninhada: schedules.pmf[year][month][day]
  try {
    let pmfSchedule = {};
    
    if (schedules.pmf) {
      if (schedules.pmf[year] && schedules.pmf[year][month]) {
        // Formato: {pmf: {2025: {4: {1: [...], 2: [...] }}}}
        pmfSchedule = schedules.pmf[year][month];
      } else if (typeof schedules.pmf === 'object' && Object.keys(schedules.pmf).some(key => !isNaN(Number(key)))) {
        // Formato alternativo: {pmf: {1: [...], 2: [...] }}
        pmfSchedule = schedules.pmf;
      }
    }
    
    console.log(`PMF Schedule para busca (${year}/${month}):`, pmfSchedule);
    
    const pmfResults = searchInSchedule(pmfSchedule, searchTerm, 'pmf', month, year);
    if (pmfResults.dias.length > 0) {
      results.push(pmfResults);
    }
  } catch (error) {
    console.error('Erro ao buscar em PMF:', error);
  }
  
  // Buscar na Escola Segura com a mesma lógica
  try {
    let escolaSeguraSchedule = {};
    
    if (schedules.escolaSegura) {
      if (schedules.escolaSegura[year] && schedules.escolaSegura[year][month]) {
        // Formato: {escolaSegura: {2025: {4: {1: [...], 2: [...] }}}}
        escolaSeguraSchedule = schedules.escolaSegura[year][month];
      } else if (typeof schedules.escolaSegura === 'object' && Object.keys(schedules.escolaSegura).some(key => !isNaN(Number(key)))) {
        // Formato alternativo: {escolaSegura: {1: [...], 2: [...] }}
        escolaSeguraSchedule = schedules.escolaSegura;
      }
    }
    
    console.log(`Escola Segura Schedule para busca (${year}/${month}):`, escolaSeguraSchedule);
    
    const escolaSeguraResults = searchInSchedule(escolaSeguraSchedule, searchTerm, 'escolaSegura', month, year);
    if (escolaSeguraResults.dias.length > 0) {
      results.push(escolaSeguraResults);
    }
  } catch (error) {
    console.error('Erro ao buscar em Escola Segura:', error);
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