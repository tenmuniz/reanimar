// Interfaces para armazenamento local
// Preparação para futura migração para Supabase

// Interface para Militar
export interface Militar {
  id: string;
  nome: string;
  patente: string;
  guarnicao: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Chaves para armazenamento no localStorage
export const MILITARES_STORAGE_KEY = "militares_20cipm";
export const PMF_SCHEDULE_KEY = "pmfSchedule";
export const ESCOLA_SEGURA_SCHEDULE_KEY = "escolaSeguraSchedule";

// Interface para Escala
export interface EscalaData {
  [monthKey: string]: { // formato "ano-mes" (ex: "2023-10")
    [day: string]: (string | null)[] // O dia do mês como string e um array de militares (ou null para posição vazia)
  }
}

// Classe de armazenamento para gerenciamento de militares
export class MilitarStorage {
  // Obter todos os militares
  static getAllMilitares(): Militar[] {
    try {
      const stored = localStorage.getItem(MILITARES_STORAGE_KEY);
      if (!stored) return [];
      
      const militares = JSON.parse(stored);
      if (!Array.isArray(militares)) return [];
      
      return militares;
    } catch (error) {
      console.error("Erro ao buscar militares:", error);
      return [];
    }
  }
  
  // Obter apenas os militares ativos
  static getActiveMilitares(): Militar[] {
    const militares = this.getAllMilitares();
    return militares.filter(militar => militar.ativo !== false);
  }
  
  // Obter apenas os nomes dos militares ativos (para uso na escala)
  static getActiveMilitarNames(): string[] {
    return this.getActiveMilitares().map(militar => militar.nome);
  }
  
  // Buscar militar por ID
  static getMilitarById(id: string): Militar | null {
    const militares = this.getAllMilitares();
    return militares.find(militar => militar.id === id) || null;
  }
  
  // Adicionar um novo militar
  static addMilitar(militar: Omit<Militar, 'id' | 'createdAt' | 'updatedAt'>): Militar {
    const militares = this.getAllMilitares();
    
    // Gerar ID e timestamps
    const now = new Date().toISOString();
    const newMilitar: Militar = {
      ...militar,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    };
    
    // Adicionar à lista
    militares.push(newMilitar);
    
    // Salvar no localStorage
    this.saveMilitares(militares);
    
    return newMilitar;
  }
  
  // Atualizar um militar existente
  static updateMilitar(id: string, updates: Partial<Militar>): Militar | null {
    const militares = this.getAllMilitares();
    const index = militares.findIndex(m => m.id === id);
    
    if (index === -1) return null;
    
    // Atualizar o militar
    const updatedMilitar: Militar = {
      ...militares[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    militares[index] = updatedMilitar;
    
    // Salvar no localStorage
    this.saveMilitares(militares);
    
    return updatedMilitar;
  }
  
  // Remover um militar
  static deleteMilitar(id: string): boolean {
    const militares = this.getAllMilitares();
    const filteredMilitares = militares.filter(m => m.id !== id);
    
    if (filteredMilitares.length === militares.length) {
      return false; // Militar não encontrado
    }
    
    // Salvar no localStorage
    this.saveMilitares(filteredMilitares);
    
    return true;
  }
  
  // Importar militares da API
  static importFromOfficersAPI(officers: string[]): Militar[] {
    if (!officers || officers.length === 0) return [];
    
    const now = new Date().toISOString();
    const militares: Militar[] = officers.map(officer => {
      // Extrair patente do nome (assumindo formato "PATENTE NOME")
      const parts = officer.split(" ");
      const patente = parts[0];
      const nome = parts.slice(1).join(" ");
      
      // Detectar guarnição com base no nome
      const guarnicao = this.getGuarnicaoMilitar(officer);
      
      return {
        id: this.generateId(),
        nome: officer,
        patente: patente,
        guarnicao: guarnicao,
        ativo: true,
        createdAt: now,
        updatedAt: now
      };
    });
    
    // Salvar no localStorage
    this.saveMilitares(militares);
    
    return militares;
  }
  
  // Método privado para salvar a lista de militares
  private static saveMilitares(militares: Militar[]): void {
    localStorage.setItem(MILITARES_STORAGE_KEY, JSON.stringify(militares));
  }
  
  // Método privado para gerar um ID único
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
  
  // Método privado para identificar a guarnição de um militar
  private static getGuarnicaoMilitar(nome: string): string {
    if (nome.includes("QOPM") || nome.includes("MONTEIRO") || 
        nome.includes("VANILSON") || nome.includes("ANDRÉ") || 
        nome.includes("CUNHA") || nome.includes("CARAVELAS") || 
        nome.includes("TONI") || nome.includes("CORREA") || 
        nome.includes("RODRIGUES") || nome.includes("TAVARES")) {
      return "EXPEDIENTE";
    } else if (nome.includes("PEIXOTO") || nome.includes("RODRIGO") || 
               nome.includes("LEDO") || nome.includes("NUNES") || 
               nome.includes("AMARAL") || nome.includes("CARLA") || 
               nome.includes("FELIPE") || nome.includes("BARROS") || 
               nome.includes("A. SILVA") || nome.includes("LUAN") || 
               nome.includes("NAVARRO")) {
      return "ALFA";
    } else if (nome.includes("OLIMAR") || nome.includes("FÁBIO") || 
               nome.includes("ANA CLEIDE") || nome.includes("GLEIDSON") || 
               nome.includes("CARLOS EDUARDO") || nome.includes("NEGRÃO") || 
               nome.includes("BRASIL") || nome.includes("MARVÃO") || 
               nome.includes("IDELVAN")) {
      return "BRAVO";
    } else if (nome.includes("PINHEIRO") || nome.includes("RAFAEL") || 
               nome.includes("MIQUEIAS") || nome.includes("M. PAIXÃO") || 
               nome.includes("CHAGAS") || nome.includes("CARVALHO") || 
               nome.includes("GOVEIA") || nome.includes("ALMEIDA") || 
               nome.includes("PATRIK") || nome.includes("GUIMARÃES")) {
      return "CHARLIE";
    }
    return "OUTROS";
  }
}

// Classe para gerenciamento de escalas
export class EscalaStorage {
  // Salvar escala
  static saveEscala(tipo: 'pmf' | 'escolaSegura', data: EscalaData): void {
    const key = tipo === 'pmf' ? PMF_SCHEDULE_KEY : ESCOLA_SEGURA_SCHEDULE_KEY;
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  // Carregar escala
  static getEscala(tipo: 'pmf' | 'escolaSegura'): EscalaData {
    const key = tipo === 'pmf' ? PMF_SCHEDULE_KEY : ESCOLA_SEGURA_SCHEDULE_KEY;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  }
  
  // Salvar escala para um mês específico
  static saveEscalaMes(tipo: 'pmf' | 'escolaSegura', ano: number, mes: number, dadosMes: {[day: string]: (string | null)[]}): void {
    // Carregar dados existentes
    const escalaCompleta = this.getEscala(tipo);
    const monthKey = `${ano}-${mes}`;
    
    // Atualizar dados do mês específico
    escalaCompleta[monthKey] = dadosMes;
    
    // Salvar dados atualizados
    this.saveEscala(tipo, escalaCompleta);
  }
  
  // Obter escala para um mês específico
  static getEscalaMes(tipo: 'pmf' | 'escolaSegura', ano: number, mes: number): {[day: string]: (string | null)[]} {
    const escalaCompleta = this.getEscala(tipo);
    const monthKey = `${ano}-${mes}`;
    
    return escalaCompleta[monthKey] || {};
  }
  
  // Adicionar ou atualizar um militar em uma escala
  static atualizarMilitarNaEscala(
    tipo: 'pmf' | 'escolaSegura', 
    ano: number, 
    mes: number, 
    dia: number, 
    posicao: number, 
    militar: string | null
  ): void {
    // Obter dados do mês
    const dadosMes = this.getEscalaMes(tipo, ano, mes);
    const diaStr = dia.toString();
    
    // Se o dia não existe na escala, criar array vazio
    if (!dadosMes[diaStr]) {
      // PMF tem 3 posições, Escola Segura tem 2
      const tamanhoArray = tipo === 'pmf' ? 3 : 2;
      dadosMes[diaStr] = Array(tamanhoArray).fill(null);
    }
    
    // Atualizar posição do militar
    dadosMes[diaStr][posicao] = militar;
    
    // Salvar dados atualizados
    this.saveEscalaMes(tipo, ano, mes, dadosMes);
  }
} 