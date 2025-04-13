/**
 * Biblioteca de funções para busca avançada de militares em operações.
 * Implementa busca tolerante a erros, com suporte a diferentes formatos de dados.
 */

import { formatDateBR } from "./utils";

export interface MilitarOperacaoResultado {
  nome: string;         // Nome exato do militar como consta no banco
  operacoes: {
    pmf: string[];      // Datas formatadas da operação PMF (DD/MM/YYYY)
    escolaSegura: string[]; // Datas formatadas da operação Escola Segura (DD/MM/YYYY)
  };
  diasPorOperacao: {
    pmf: number[];      // Números dos dias da operação PMF
    escolaSegura: number[]; // Números dos dias da operação Escola Segura
  };
  total: number;        // Total de operações encontradas
}

/**
 * Calcula a distância de Levenshtein entre duas strings
 * @param a Primeira string
 * @param b Segunda string
 * @returns Número representando a distância entre as strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Inicializa a matriz
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Preenche a matriz
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const custo = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deleção
        matrix[i][j - 1] + 1,      // inserção
        matrix[i - 1][j - 1] + custo // substituição
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normaliza uma string para comparação, removendo acentos, espaços extras e
 * convertendo para minúsculas
 * @param str String a ser normalizada
 * @returns String normalizada
 */
function normalizeString(str: string): string {
  if (!str) return '';
  
  return str.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, " "); // Remove espaços extras
}

/**
 * Verifica se duas strings são similares/iguais para fins de busca de militar
 * @param nomeRegistrado Nome como está registrado no banco de dados
 * @param nomeBuscado Nome sendo buscado pelo usuário
 * @returns true se os nomes forem considerados equivalentes para busca
 */
function isNameMatch(nomeRegistrado: string, nomeBuscado: string): boolean {
  if (!nomeRegistrado || !nomeBuscado) return false;
  
  // Normalizar os nomes
  const normRegistrado = normalizeString(nomeRegistrado);
  const normBuscado = normalizeString(nomeBuscado);
  
  // Verificação exata (após normalização)
  if (normRegistrado === normBuscado) {
    return true;
  }
  
  // Verificação de inclusão (nome completo inclui o termo buscado)
  if (normRegistrado.includes(normBuscado)) {
    // Verifica se é uma palavra completa ou parte de uma palavra
    const words = normRegistrado.split(' ');
    for (const word of words) {
      // Se a palavra começa com o termo buscado
      if (word === normBuscado || word.startsWith(normBuscado)) {
        return true;
      }
    }
  }
  
  // Verificação com distância Levenshtein com tolerância máxima de 1
  const distance = levenshteinDistance(normRegistrado, normBuscado);
  if (distance <= 1) {
    return true;
  }
  
  return false;
}

/**
 * Busca um militar nas operações PMF e Escola Segura
 * @param nomeMilitar Nome do militar a ser buscado
 * @param year Ano da busca
 * @param month Mês da busca
 * @returns Promessa com os resultados da busca
 */
export async function buscarMilitar(
  nomeMilitar: string,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): Promise<MilitarOperacaoResultado> {
  if (!nomeMilitar?.trim()) {
    throw new Error("Nome do militar não fornecido");
  }

  try {
    console.log(`Buscando militar '${nomeMilitar}' em ${month}/${year}`);
    
    // Buscar dados das operações na API
    const response = await fetch(`/api/combined-schedules?year=${year}&month=${month}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Dados recebidos:", data);
    
    if (!data.schedules || !data.schedules.pmf || !data.schedules.escolaSegura) {
      throw new Error("Formato de dados inválido");
    }
    
    // Extrai os schedules das operações
    let pmfSchedule, escolaSeguraSchedule;
    
    // Tenta diferentes formatos de resposta possíveis
    if (data.schedules.pmf[year] && data.schedules.pmf[year][month]) {
      pmfSchedule = data.schedules.pmf[year][month];
      escolaSeguraSchedule = data.schedules.escolaSegura[year][month];
    } else if (data.schedules.pmf[month]) {
      pmfSchedule = data.schedules.pmf[month];
      escolaSeguraSchedule = data.schedules.escolaSegura[month];
    } else {
      pmfSchedule = data.schedules.pmf;
      escolaSeguraSchedule = data.schedules.escolaSegura;
    }
    
    console.log("PMF Schedule:", pmfSchedule);
    console.log("Escola Segura Schedule:", escolaSeguraSchedule);
    
    // Inicializa o resultado
    const resultado: MilitarOperacaoResultado = {
      nome: "",
      operacoes: {
        pmf: [],
        escolaSegura: []
      },
      diasPorOperacao: {
        pmf: [],
        escolaSegura: []
      },
      total: 0
    };
    
    // Função auxiliar para buscar em uma operação
    const buscarEmOperacao = (
      operacao: any,
      diasOperacao: number[],
      datasOperacao: string[]
    ): string | null => {
      let nomeEncontrado: string | null = null;
      
      Object.entries(operacao).forEach(([dia, militares]) => {
        if (!Array.isArray(militares)) return;
        
        const diaNum = parseInt(dia);
        
        for (const militar of militares) {
          if (!militar || typeof militar !== 'string') continue;
          
          if (isNameMatch(militar, nomeMilitar)) {
            // Guarda o nome exato como consta no banco
            if (!nomeEncontrado) nomeEncontrado = militar;
            
            // Evita duplicidades
            if (!diasOperacao.includes(diaNum)) {
              diasOperacao.push(diaNum);
              
              // Formata a data no padrão brasileiro
              const data = formatDateBR(new Date(year, month - 1, diaNum));
              datasOperacao.push(data);
            }
            break;
          }
        }
      });
      
      return nomeEncontrado;
    };
    
    // Busca nas operações
    const nomePMF = buscarEmOperacao(
      pmfSchedule,
      resultado.diasPorOperacao.pmf,
      resultado.operacoes.pmf
    );
    
    const nomeEscolaSegura = buscarEmOperacao(
      escolaSeguraSchedule,
      resultado.diasPorOperacao.escolaSegura,
      resultado.operacoes.escolaSegura
    );
    
    // Ordena os dias
    resultado.diasPorOperacao.pmf.sort((a, b) => a - b);
    resultado.diasPorOperacao.escolaSegura.sort((a, b) => a - b);
    
    // Atualiza o nome exato e total
    resultado.nome = nomePMF || nomeEscolaSegura || nomeMilitar;
    resultado.total = resultado.operacoes.pmf.length + resultado.operacoes.escolaSegura.length;
    
    console.log("Resultado da busca:", resultado);
    return resultado;
    
  } catch (error) {
    console.error("Erro ao buscar militar:", error);
    throw error;
  }
}

/**
 * Formata o resultado da busca como texto para exibição
 * @param resultado Resultado da busca de militar
 * @returns String formatada com os resultados
 */
export function formatarResultadoBusca(resultado: MilitarOperacaoResultado): string {
  if (resultado.total === 0) {
    return `Nenhuma operação registrada para ${resultado.nome}.`;
  }
  
  let texto = `Operações encontradas para ${resultado.nome}:\n\n`;
  
  if (resultado.operacoes.pmf.length > 0) {
    texto += `PMF: ${resultado.operacoes.pmf.join(', ')}\n`;
  }
  
  if (resultado.operacoes.escolaSegura.length > 0) {
    texto += `Escola Segura: ${resultado.operacoes.escolaSegura.join(', ')}\n`;
  }
  
  texto += `\nTotal: ${resultado.total} operação(ões)`;
  
  return texto;
}