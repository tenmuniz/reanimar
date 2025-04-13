/**
 * Depurador de schedules para diagnóstico preciso do problema de busca
 * 
 * Esta ferramenta auxiliar permite visualizar exatamente a estrutura
 * dos dados recebidos da API combined-schedules com especial atenção
 * para a posição exata de "CB CARLA" no dia 14 da operação PMF.
 */

export async function debugCombinedSchedules() {
  try {
    // Obter ano e mês atual
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    
    console.log(`🔍 DEBUG: Buscando dados de combined-schedules para ${month}/${year}`);
    
    // Chamar a API
    const response = await fetch(`/api/combined-schedules?year=${year}&month=${month}`);
    
    if (!response.ok) {
      console.error(`❌ Erro na API: ${response.status} - ${response.statusText}`);
      return;
    }
    
    // Obter os dados
    const data = await response.json();
    
    // Verificar se temos schedules
    if (!data.schedules) {
      console.error("❌ Estrutura inválida: data.schedules não encontrado");
      return;
    }
    
    // Exibir a estrutura dos dados
    console.log("📊 ESTRUTURA COMPLETA DOS DADOS:", data);
    
    // Tentar encontrar o PMF Schedule de várias formas
    let pmfSchedule = null;
    
    // Verificar formato 1: data.schedules.pmf[year][month]
    if (data.schedules.pmf?.[year]?.[month]) {
      console.log("✅ Formato 1 detectado: data.schedules.pmf[year][month]");
      pmfSchedule = data.schedules.pmf[year][month];
    } 
    // Verificar formato 2: data.schedules.pmf[month]
    else if (data.schedules.pmf?.[month]) {
      console.log("✅ Formato 2 detectado: data.schedules.pmf[month]");
      pmfSchedule = data.schedules.pmf[month];
    }
    // Verificar formato 3: data.schedules.pmf diretamente
    else if (data.schedules.pmf && typeof data.schedules.pmf === 'object') {
      if (Object.keys(data.schedules.pmf).some(k => !isNaN(parseInt(k)))) {
        console.log("✅ Formato 3 detectado: data.schedules.pmf (dias como chaves)");
        pmfSchedule = data.schedules.pmf;
      }
    }
    // Verificar formato 4: data.schedules.pmf.2025.4
    else if (data.schedules.pmf?.["2025"]?.["4"]) {
      console.log("✅ Formato 4 detectado: data.schedules.pmf.2025.4");
      pmfSchedule = data.schedules.pmf["2025"]["4"];
    }
    
    if (!pmfSchedule) {
      console.error("❌ Não foi possível extrair o PMF Schedule dos dados");
      return;
    }
    
    // Agora vamos verificar o dia 14 especificamente
    console.log("\n🔎 VERIFICANDO DIA 14 ESPECIFICAMENTE:");
    
    const day14Data = pmfSchedule["14"];
    
    if (!day14Data) {
      console.error("❌ Dia 14 não encontrado no PMF Schedule");
      return;
    }
    
    console.log("📅 Dados do Dia 14:", day14Data);
    
    // Verificar se há algum elemento "CB CARLA" ou contendo "CARLA"
    if (Array.isArray(day14Data)) {
      const containsCarla = day14Data.some(item => 
        typeof item === 'string' && 
        (item === "CB CARLA" || item.toUpperCase().includes("CARLA"))
      );
      
      console.log(`${containsCarla ? '✅' : '❌'} "CARLA" encontrado no dia 14:`, containsCarla);
      
      // Imprimir todos os militares do dia 14
      console.log("👥 Lista completa de militares no dia 14:");
      day14Data.forEach((item, index) => {
        console.log(`   [${index}] "${item}"`);
      });
    } else {
      console.error("❌ Dados do dia 14 não são um array");
    }
    
    // Verificar todos os dias com CB CARLA em qualquer lugar
    console.log("\n🔎 PROCURANDO \"CB CARLA\" EM TODOS OS DIAS DA PMF:");
    
    Object.entries(pmfSchedule).forEach(([day, militaries]) => {
      if (Array.isArray(militaries)) {
        const containsCarla = militaries.some(item => 
          typeof item === 'string' && 
          (item === "CB CARLA" || item.toUpperCase().includes("CARLA"))
        );
        
        if (containsCarla) {
          console.log(`✅ Dia ${day} contém "CARLA":`, 
            militaries.filter(item => 
              typeof item === 'string' && 
              (item === "CB CARLA" || item.toUpperCase().includes("CARLA"))
            )
          );
        }
      }
    });
    
    // Verificar a estrutura da API completa
    console.log("\n🔎 CAMINHO COMPLETO DO JSON:", getJsonPath(data, "CARLA"));
    
  } catch (error) {
    console.error("❌ Erro durante a depuração:", error);
  }
}

// Função auxiliar para encontrar o caminho até um valor em um objeto JSON
function getJsonPath(obj: any, searchValue: string, currentPath = ''): string[] {
  let results: string[] = [];
  
  if (!obj) return [];
  
  if (typeof obj === 'string' && obj.toUpperCase().includes(searchValue.toUpperCase())) {
    return [currentPath];
  }
  
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const newPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
      results = [...results, ...getJsonPath(obj[i], searchValue, newPath)];
    }
  } else if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      results = [...results, ...getJsonPath(obj[key], searchValue, newPath)];
    }
  }
  
  return results;
}