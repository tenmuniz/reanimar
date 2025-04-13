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
  
  // Normalizar os nomes para evitar diferenças de formatação
  const normRegistrado = normalizeString(nomeRegistrado);
  const normBuscado = normalizeString(nomeBuscado);
  
  // Debug
  console.log(`Comparando: "${normRegistrado}" com "${normBuscado}"`);
  
  // 1. VERIFICAÇÃO EXATA (após normalização)
  if (normRegistrado === normBuscado) {
    console.log("✓ Match exato após normalização");
    return true;
  }
  
  // 2. VERIFICAÇÃO DE INCLUSÃO (nome completo ou parte significativa)
  // Exemplo: "SGT SILVA" deve corresponder a "SGT PM SILVA"
  
  // 2.1 O registro contém exatamente o termo buscado
  if (normRegistrado.includes(normBuscado)) {
    // Verifica se é uma palavra completa ou parte de uma palavra
    const words = normRegistrado.split(' ');
    
    // 2.2 Se o termo buscado for uma palavra completa ou início de palavra
    for (const word of words) {
      if (word === normBuscado || word.startsWith(normBuscado)) {
        console.log(`✓ Match por inclusão: "${word}" contém "${normBuscado}"`);
        return true;
      }
    }
    
    // 2.3 Se o termo buscado for um sobrenome ou patente específica
    // Lista de patentes e prefixos comuns
    const patentes = ["sd", "cb", "sgt", "ten", "cap", "maj", "cel", "cmt", "pm", "qopm"];
    
    // Separa o termo buscado em partes
    const partesBuscado = normBuscado.split(' ');
    
    // Se o termo tiver 2+ palavras E não for só patentes
    if (partesBuscado.length >= 2 && !partesBuscado.every(p => patentes.includes(p))) {
      // Busca por sobrenomes específicos
      const sobreNomes = partesBuscado.filter(p => !patentes.includes(p));
      
      // Se todos os sobrenomes estiverem no nome registrado
      if (sobreNomes.length > 0 && sobreNomes.every(sn => normRegistrado.includes(sn))) {
        console.log(`✓ Match por sobrenome: todos os sobrenomes "${sobreNomes.join(', ')}" estão presentes`);
        return true;
      }
    }
    
    // 2.4 O termo buscado é significativamente grande e está contido no nome registrado
    if (normBuscado.length >= 4 && normRegistrado.includes(normBuscado)) {
      console.log(`✓ Match por substring significativa: "${normBuscado}" está contido em "${normRegistrado}"`);
      return true;
    }
  }
  
  // 3. VERIFICAÇÃO INVERSA: o termo buscado contém o nome registrado
  // Exemplo: "SGT PM SILVA JUNIOR" deve corresponder a "SILVA"
  if (normBuscado.includes(normRegistrado) && normRegistrado.length >= 4) {
    console.log(`✓ Match por inclusão inversa: "${normBuscado}" contém "${normRegistrado}"`);
    return true;
  }
  
  // 4. VERIFICAÇÃO POR INICIAIS (para nomes muito específicos)
  // Exemplo: "S.CORREA" deve corresponder a "S CORREA" ou "SD CORREA"
  const regInitials = normRegistrado.replace(/\./g, '');
  const busInitials = normBuscado.replace(/\./g, '');
  
  if (regInitials === busInitials) {
    console.log(`✓ Match por iniciais: "${regInitials}" = "${busInitials}"`);
    return true;
  }
  
  // 5. VERIFICAÇÃO DE LEVENSHTEIN COM TOLERÂNCIA 1
  // Detecta erros de digitação, como "MUNZ" vs "MUNIZ"
  const distance = levenshteinDistance(normRegistrado, normBuscado);
  if (distance <= 1) {
    console.log(`✓ Match por Levenshtein: distância = ${distance}`);
    return true;
  }
  
  // 6. VERIFICAÇÃO FINAL PARA CASOS COMPLEXOS
  // Separa os nomes em partes
  const partesRegistrado = normRegistrado.split(' ');
  const partesBuscado = normBuscado.split(' ');
  
  // 6.1 Ao menos uma parte significativa bate exatamente e é incomum
  // (evita falsos positivos com patentes comuns como "SGT" ou "CB")
  for (const pReg of partesRegistrado) {
    if (pReg.length >= 4) { // Partes significativas tem 4+ letras
      for (const pBus of partesBuscado) {
        if (pReg === pBus) {
          console.log(`✓ Match por parte significativa: "${pReg}" = "${pBus}"`);
          return true;
        }
      }
    }
  }
  
  // 6.2 Verifica sobrenomes abreviados (ex: "S. CORREA" vs "CORREA")
  // Identifica iniciais (letra seguida de ponto) e verifica o resto
  if (partesRegistrado.length >= 2 && partesBuscado.length >= 1) {
    // Pega a última parte (geralmente o sobrenome)
    const sobrenomeReg = partesRegistrado[partesRegistrado.length - 1];
    const sobrenomeBus = partesBuscado[partesBuscado.length - 1];
    
    // Se os sobrenomes batem e são significativos (4+ letras)
    if (sobrenomeReg === sobrenomeBus && sobrenomeReg.length >= 4) {
      console.log(`✓ Match por sobrenome: "${sobrenomeReg}" = "${sobrenomeBus}"`);
      return true;
    }
  }
  
  console.log(`✗ Sem correspondência entre "${normRegistrado}" e "${normBuscado}"`);
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
    
    // Debug completo dos dados recebidos
    console.log("DADOS BRUTOS RECEBIDOS:", JSON.stringify(data));
    
    if (!data.schedules || !data.schedules.pmf || !data.schedules.escolaSegura) {
      throw new Error("Formato de dados inválido");
    }
    
    // Extrai os schedules das operações com validação robusta
    let pmfSchedule: Record<string, string[]> = {};
    let escolaSeguraSchedule: Record<string, string[]> = {};
    
    // Verificação e normalização de diferentes formatos possíveis
    try {
      // Formato 1: data.schedules.pmf[year][month]
      if (data.schedules.pmf[year] && data.schedules.pmf[year][month]) {
        pmfSchedule = data.schedules.pmf[year][month];
        escolaSeguraSchedule = data.schedules.escolaSegura[year][month];
      }
      // Formato 2: data.schedules.pmf[month]
      else if (data.schedules.pmf[month]) {
        pmfSchedule = data.schedules.pmf[month];
        escolaSeguraSchedule = data.schedules.escolaSegura[month];
      }
      // Formato 3: data.schedules.pmf (direto)
      else if (typeof data.schedules.pmf === 'object') {
        pmfSchedule = data.schedules.pmf;
        escolaSeguraSchedule = data.schedules.escolaSegura;
      }
      // Formato 4: data.schedules.pmf.2025.4 (aninhado diretamente)
      else if (data.schedules.pmf['2025'] && data.schedules.pmf['2025']['4']) {
        pmfSchedule = data.schedules.pmf['2025']['4'];
        escolaSeguraSchedule = data.schedules.escolaSegura['2025']['4'];
      }
      // Formato 5: Se for algum formato inesperado, tentar extrair qualquer objeto válido
      else {
        // Busca recursiva por um objeto que pareça uma agenda
        const findSchedule = (obj: any): any => {
          if (!obj || typeof obj !== 'object') return null;
          
          // Verifica se o objeto atual parece uma agenda (dias como chaves)
          const keys = Object.keys(obj);
          if (keys.some(k => !isNaN(parseInt(k)) && parseInt(k) >= 1 && parseInt(k) <= 31)) {
            return obj;
          }
          
          // Busca recursivamente
          for (const key of keys) {
            const result = findSchedule(obj[key]);
            if (result) return result;
          }
          
          return null;
        };
        
        pmfSchedule = findSchedule(data.schedules.pmf) || {};
        escolaSeguraSchedule = findSchedule(data.schedules.escolaSegura) || {};
      }
    } catch (e) {
      console.error("Erro ao extrair agendas:", e);
      throw new Error("Formato de dados inesperado. Não foi possível extrair as agendas.");
    }
    
    // Debug das agendas extraídas
    console.log("PMF Schedule (normalizado):", pmfSchedule);
    console.log("Escola Segura Schedule (normalizado):", escolaSeguraSchedule);
    
    // Validação final das agendas
    if (Object.keys(pmfSchedule).length === 0 && Object.keys(escolaSeguraSchedule).length === 0) {
      throw new Error("Nenhuma agenda válida encontrada nos dados");
    }
    
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
    
    // Normalizando o nome buscado para melhorar a comparação
    const nomeMilitarNormalizado = normalizeString(nomeMilitar);
    console.log(`Nome militar normalizado para busca: "${nomeMilitarNormalizado}"`);
    
    // Cria um registro para debug de todas as comparações feitas
    const todasComparacoes: { militar: string, normalizado: string, match: boolean }[] = [];
    
    // Função auxiliar para buscar em uma operação com log detalhado
    const buscarEmOperacao = (
      operacao: any,
      diasOperacao: number[],
      datasOperacao: string[],
      tipoOperacao: string
    ): string | null => {
      let nomeEncontrado: string | null = null;
      
      console.log(`\nBuscando em operação ${tipoOperacao}:`);
      console.log(`Total de dias na operação: ${Object.keys(operacao).length}`);
      
      Object.entries(operacao).forEach(([dia, militares]) => {
        if (!Array.isArray(militares)) {
          console.log(`Dia ${dia}: não é um array`);
          return;
        }
        
        console.log(`Dia ${dia}: ${militares.length} militares escalados`);
        const diaNum = parseInt(dia);
        
        for (const militar of militares) {
          if (!militar || typeof militar !== 'string') {
            console.log(`- Militar inválido: ${militar}`);
            continue;
          }
          
          const militarNormalizado = normalizeString(militar);
          const match = isNameMatch(militar, nomeMilitar);
          
          // Registrar todas as comparações para debug
          todasComparacoes.push({
            militar,
            normalizado: militarNormalizado,
            match
          });
          
          if (match) {
            console.log(`✅ ENCONTRADO: "${militar}" corresponde a "${nomeMilitar}"`);
            
            // Guarda o nome exato como consta no banco
            if (!nomeEncontrado) nomeEncontrado = militar;
            
            // Evita duplicidades
            if (!diasOperacao.includes(diaNum)) {
              diasOperacao.push(diaNum);
              
              // Formata a data no padrão brasileiro
              const data = formatDateBR(new Date(year, month - 1, diaNum));
              datasOperacao.push(data);
              
              console.log(`  Adicionado dia ${diaNum} (${data}) à lista de ${tipoOperacao}`);
            } else {
              console.log(`  Dia ${diaNum} já estava na lista de ${tipoOperacao}`);
            }
          } else {
            console.log(`- "${militar}" (normalizado: "${militarNormalizado}") não corresponde a "${nomeMilitar}" (normalizado: "${nomeMilitarNormalizado}")`);
          }
        }
      });
      
      return nomeEncontrado;
    };
    
    // Busca nas operações com log detalhado
    const nomePMF = buscarEmOperacao(
      pmfSchedule,
      resultado.diasPorOperacao.pmf,
      resultado.operacoes.pmf,
      "PMF"
    );
    
    const nomeEscolaSegura = buscarEmOperacao(
      escolaSeguraSchedule,
      resultado.diasPorOperacao.escolaSegura,
      resultado.operacoes.escolaSegura,
      "Escola Segura"
    );
    
    // Log detalhado de todas as comparações
    console.log("\nTODAS AS COMPARAÇÕES REALIZADAS:");
    console.table(todasComparacoes);
    
    // Ordena os dias
    resultado.diasPorOperacao.pmf.sort((a, b) => a - b);
    resultado.diasPorOperacao.escolaSegura.sort((a, b) => a - b);
    
    // Atualiza o nome exato e total
    resultado.nome = nomePMF || nomeEscolaSegura || nomeMilitar;
    resultado.total = resultado.operacoes.pmf.length + resultado.operacoes.escolaSegura.length;
    
    console.log("\nRESULTADO FINAL DA BUSCA:", resultado);
    return resultado;
    
  } catch (error) {
    console.error("ERRO FATAL na busca:", error);
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