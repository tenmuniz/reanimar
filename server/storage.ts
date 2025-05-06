// Importações necessárias
import { supabase } from './db';

// Interface de armazenamento
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByCpf(cpf: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllOfficers(): Promise<Officer[]>;
  getOfficer(id: number): Promise<Officer | undefined>;
  createOfficer(officer: InsertOfficer): Promise<Officer>;
  
  saveSchedule(operation: string, year: number, month: number, data: any): Promise<void>;
  getSchedule(operation: string, year: number, month: number): Promise<any>;
  getCombinedSchedules(year: number, month: number): Promise<any>;
}

// Define interfaces para os modelos
export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  cpf: string;
  email?: string;
}

export interface InsertUser {
  username: string;
  password: string;
  name: string;
  cpf: string;
  email?: string;
}

export interface Officer {
  id: number;
  name: string;
  rank: string;
}

export interface InsertOfficer {
  name: string;
  rank: string;
}

// Implementação com armazenamento em memória
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private officersMap: Map<number, Officer>;
  private scheduleMap: Map<string, any>;
  private currentUserId: number;
  private currentOfficerId: number;

  constructor() {
    this.users = new Map();
    this.officersMap = new Map();
    this.scheduleMap = new Map();
    this.currentUserId = 1;
    this.currentOfficerId = 1;
    
    // Inicializa com os oficiais reais da PMF
    const realOfficers = [
      // Oficiais - EXPEDIENTE
      { id: 1, name: "CAP QOPM MUNIZ", rank: "EXPEDIENTE" },
      { id: 2, name: "1º TEN QOPM MONTEIRO", rank: "EXPEDIENTE" },
      { id: 3, name: "TEN VANILSON", rank: "EXPEDIENTE" },
      { id: 4, name: "SUB TEN ANDRÉ", rank: "EXPEDIENTE" },
      { id: 5, name: "3º SGT PM CUNHA", rank: "EXPEDIENTE" },
      { id: 6, name: "3º SGT PM CARAVELAS", rank: "EXPEDIENTE" },
      { id: 7, name: "CB PM TONI", rank: "EXPEDIENTE" },
      { id: 8, name: "SD PM S. CORREA", rank: "EXPEDIENTE" },
      { id: 9, name: "SD PM RODRIGUES", rank: "EXPEDIENTE" },
      { id: 10, name: "2º SGT PM A. TAVARES", rank: "EXPEDIENTE" },
      
      // Grupo ALFA
      { id: 11, name: "2º SGT PM PEIXOTO", rank: "ALFA" },
      { id: 12, name: "3º SGT PM RODRIGO", rank: "ALFA" },
      { id: 13, name: "3º SGT PM LEDO", rank: "ALFA" },
      { id: 14, name: "3º SGT PM NUNES", rank: "ALFA" },
      { id: 15, name: "3º SGT AMARAL", rank: "ALFA" },
      { id: 16, name: "CB CARLA", rank: "ALFA" },
      { id: 17, name: "CB PM FELIPE", rank: "ALFA" },
      { id: 18, name: "CB PM BARROS", rank: "ALFA" },
      { id: 19, name: "CB PM A. SILVA", rank: "ALFA" },
      { id: 20, name: "SD PM LUAN", rank: "ALFA" },
      { id: 21, name: "SD PM NAVARRO", rank: "ALFA" },
      
      // Grupo BRAVO
      { id: 22, name: "1º SGT PM OLIMAR", rank: "BRAVO" },
      { id: 23, name: "2º SGT PM FÁBIO", rank: "BRAVO" },
      { id: 24, name: "3º SGT PM ANA CLEIDE", rank: "BRAVO" },
      { id: 25, name: "3º SGT PM GLEIDSON", rank: "BRAVO" },
      { id: 26, name: "3º SGT PM CARLOS EDUARDO", rank: "BRAVO" },
      { id: 27, name: "3º SGT PM NEGRÃO", rank: "BRAVO" },
      { id: 28, name: "CB PM BRASIL", rank: "BRAVO" },
      { id: 29, name: "SD PM MARVÃO", rank: "BRAVO" },
      { id: 30, name: "SD PM IDELVAN", rank: "BRAVO" },
      
      // Grupo CHARLIE
      { id: 31, name: "2º SGT PM PINHEIRO", rank: "CHARLIE" },
      { id: 32, name: "3º SGT PM RAFAEL", rank: "CHARLIE" },
      { id: 33, name: "CB PM MIQUEIAS", rank: "CHARLIE" },
      { id: 34, name: "CB PM M. PAIXÃO", rank: "CHARLIE" },
      { id: 35, name: "SD PM CHAGAS", rank: "CHARLIE" },
      { id: 36, name: "SD PM CARVALHO", rank: "CHARLIE" },
      { id: 37, name: "SD PM GOVEIA", rank: "CHARLIE" },
      { id: 38, name: "SD PM ALMEIDA", rank: "CHARLIE" },
      { id: 39, name: "SD PM PATRIK", rank: "CHARLIE" },
      { id: 40, name: "SD PM GUIMARÃES", rank: "CHARLIE" }
    ];
    
    realOfficers.forEach(officer => {
      this.officersMap.set(officer.id, officer as Officer);
      this.currentOfficerId = Math.max(this.currentOfficerId, officer.id + 1);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByCpf(cpf: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.cpf === cpf,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllOfficers(): Promise<Officer[]> {
    return Array.from(this.officersMap.values());
  }
  
  async getOfficer(id: number): Promise<Officer | undefined> {
    return this.officersMap.get(id);
  }
  
  async createOfficer(insertOfficer: InsertOfficer): Promise<Officer> {
    const id = this.currentOfficerId++;
    const officer: Officer = { ...insertOfficer, id };
    this.officersMap.set(id, officer);
    return officer;
  }
  
  async saveSchedule(operation: string, year: number, month: number, data: any): Promise<void> {
    const key = `${operation}-${year}-${month}`;
    this.scheduleMap.set(key, data);
  }
  
  async getSchedule(operation: string, year: number, month: number): Promise<any> {
    const key = `${operation}-${year}-${month}`;
    return this.scheduleMap.get(key) || {};
  }
  
  async getCombinedSchedules(year: number, month: number): Promise<any> {
    const pmfKey = `pmf-${year}-${month}`;
    const escolaSeguraKey = `escolaSegura-${year}-${month}`;
    
    return {
      pmf: this.scheduleMap.get(pmfKey) || {},
      escolaSegura: this.scheduleMap.get(escolaSeguraKey) || {}
    };
  }
}

// Implementação com o Supabase
export class DatabaseStorage implements IStorage {
  // Armazena mapeamentos entre IDs internos usados no aplicativo e UUIDs do banco de dados
  private userIdMap: Map<number, string> = new Map();
  private officerIdMap: Map<number, string> = new Map();
  
  constructor() {
    // A inicialização da lista de oficiais será feita sob demanda
  }
  
  async getUser(id: number): Promise<User | undefined> {
    // Se temos o mapeamento do ID, use-o para buscar diretamente
    const dbId = this.userIdMap.get(id);
    if (dbId) {
      const { data } = await supabase.from('users').select().eq('id', parseInt(dbId));
      if (data && data.length > 0) return { ...data[0], id };
    }
    
    // Fallback: buscar todos os usuários e usar o primeiro
    const { data } = await supabase.from('users').select();
    if (data && data.length > 0) {
      // Armazenar o mapeamento para próximas consultas
      this.userIdMap.set(id, data[0].id.toString());
      return { ...data[0], id };
    }
    
    return undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select().eq('username', username);
    if (data && data.length > 0) {
      const internalId = 1; // Para simplificar, usamos ID 1 para o usuário
      this.userIdMap.set(internalId, data[0].id.toString());
      return { ...data[0], id: internalId };
    }
    return undefined;
  }
  
  async getUserByCpf(cpf: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select().eq('cpf', cpf);
    if (data && data.length > 0) {
      const internalId = 1; // Para simplificar, usamos ID 1 para o usuário
      this.userIdMap.set(internalId, data[0].id.toString());
      return { ...data[0], id: internalId };
    }
    return undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase.from('users').insert(insertUser).select();
    if (error) throw error;
    
    const internalId = 1;
    this.userIdMap.set(internalId, data[0].id.toString());
    return { ...data[0], id: internalId };
  }
  
  async getAllOfficers(): Promise<Officer[]> {
    // Verificar se já temos oficiais no banco de dados
    const { data: existingOfficers } = await supabase.from('militares').select();
    
    // Se não temos oficiais, inicializar com a lista padrão
    if (!existingOfficers || existingOfficers.length === 0) {
      await this.initializeOfficers();
      return this.getAllOfficers(); // Chamar novamente após inicialização
    }
    
    // Mapear militares para o formato esperado pela aplicação (Officer)
    return existingOfficers.map((militar, index) => {
      const internalId = index + 1;
      this.officerIdMap.set(internalId, militar.id.toString());
      return { 
        id: internalId, 
        name: militar.nome, 
        rank: militar.patente || militar.guarnicao || "OUTROS" 
      };
    });
  }
  
  private async initializeOfficers(): Promise<void> {
    // Lista de oficiais a serem inicializados no banco
    const defaultOfficers = [
      // Oficiais - EXPEDIENTE
      { nome: "CAP QOPM MUNIZ", patente: "CAP", guarnicao: "EXPEDIENTE", ativo: true },
      { nome: "1º TEN QOPM MONTEIRO", patente: "1º TEN", guarnicao: "EXPEDIENTE", ativo: true },
      { nome: "TEN VANILSON", patente: "TEN", guarnicao: "EXPEDIENTE", ativo: true },
      { nome: "SUB TEN ANDRÉ", patente: "SUB TEN", guarnicao: "EXPEDIENTE", ativo: true },
      { nome: "3º SGT PM CUNHA", patente: "3º SGT", guarnicao: "EXPEDIENTE", ativo: true },
      { nome: "3º SGT PM CARAVELAS", patente: "3º SGT", guarnicao: "EXPEDIENTE", ativo: true },
      { nome: "CB PM TONI", patente: "CB", guarnicao: "EXPEDIENTE", ativo: true },
      { nome: "SD PM S. CORREA", patente: "SD", guarnicao: "EXPEDIENTE", ativo: true },
      { nome: "SD PM RODRIGUES", patente: "SD", guarnicao: "EXPEDIENTE", ativo: true },
      { nome: "2º SGT PM A. TAVARES", patente: "2º SGT", guarnicao: "EXPEDIENTE", ativo: true },
      
      // Grupo ALFA
      { nome: "2º SGT PM PEIXOTO", patente: "2º SGT", guarnicao: "ALFA", ativo: true },
      { nome: "3º SGT PM RODRIGO", patente: "3º SGT", guarnicao: "ALFA", ativo: true },
      { nome: "3º SGT PM LEDO", patente: "3º SGT", guarnicao: "ALFA", ativo: true },
      { nome: "3º SGT PM NUNES", patente: "3º SGT", guarnicao: "ALFA", ativo: true },
      { nome: "3º SGT AMARAL", patente: "3º SGT", guarnicao: "ALFA", ativo: true },
      { nome: "CB CARLA", patente: "CB", guarnicao: "ALFA", ativo: true },
      { nome: "CB PM FELIPE", patente: "CB", guarnicao: "ALFA", ativo: true },
      { nome: "CB PM BARROS", patente: "CB", guarnicao: "ALFA", ativo: true },
      { nome: "CB PM A. SILVA", patente: "CB", guarnicao: "ALFA", ativo: true },
      { nome: "SD PM LUAN", patente: "SD", guarnicao: "ALFA", ativo: true },
      { nome: "SD PM NAVARRO", patente: "SD", guarnicao: "ALFA", ativo: true },
      
      // Grupo BRAVO
      { nome: "1º SGT PM OLIMAR", patente: "1º SGT", guarnicao: "BRAVO", ativo: true },
      { nome: "2º SGT PM FÁBIO", patente: "2º SGT", guarnicao: "BRAVO", ativo: true },
      { nome: "3º SGT PM ANA CLEIDE", patente: "3º SGT", guarnicao: "BRAVO", ativo: true },
      { nome: "3º SGT PM GLEIDSON", patente: "3º SGT", guarnicao: "BRAVO", ativo: true },
      { nome: "3º SGT PM CARLOS EDUARDO", patente: "3º SGT", guarnicao: "BRAVO", ativo: true },
      { nome: "3º SGT PM NEGRÃO", patente: "3º SGT", guarnicao: "BRAVO", ativo: true },
      { nome: "CB PM BRASIL", patente: "CB", guarnicao: "BRAVO", ativo: true },
      { nome: "SD PM MARVÃO", patente: "SD", guarnicao: "BRAVO", ativo: true },
      { nome: "SD PM IDELVAN", patente: "SD", guarnicao: "BRAVO", ativo: true },
      
      // Grupo CHARLIE
      { nome: "2º SGT PM PINHEIRO", patente: "2º SGT", guarnicao: "CHARLIE", ativo: true },
      { nome: "3º SGT PM RAFAEL", patente: "3º SGT", guarnicao: "CHARLIE", ativo: true },
      { nome: "CB PM MIQUEIAS", patente: "CB", guarnicao: "CHARLIE", ativo: true },
      { nome: "CB PM M. PAIXÃO", patente: "CB", guarnicao: "CHARLIE", ativo: true },
      { nome: "SD PM CHAGAS", patente: "SD", guarnicao: "CHARLIE", ativo: true },
      { nome: "SD PM CARVALHO", patente: "SD", guarnicao: "CHARLIE", ativo: true },
      { nome: "SD PM GOVEIA", patente: "SD", guarnicao: "CHARLIE", ativo: true },
      { nome: "SD PM ALMEIDA", patente: "SD", guarnicao: "CHARLIE", ativo: true },
      { nome: "SD PM PATRIK", patente: "SD", guarnicao: "CHARLIE", ativo: true },
      { nome: "SD PM GUIMARÃES", patente: "SD", guarnicao: "CHARLIE", ativo: true }
    ];
    
    // Inserir todos os oficiais no banco de dados como militares
    console.log('Inicializando militares no Supabase...');
    const { error } = await supabase.from('militares').insert(defaultOfficers);
    if (error) {
      console.error('Erro ao inserir militares:', error);
    } else {
      console.log('Militares inicializados com sucesso!');
    }
  }
  
  async getOfficer(id: number): Promise<Officer | undefined> {
    // Obter o ID do banco de dados mapeado
    const dbId = this.officerIdMap.get(id);
    if (!dbId) {
      // Se não temos o mapeamento, tentar obter todos os oficiais primeiro
      await this.getAllOfficers();
      return this.getOfficer(id); // Tentar novamente após buscar todos
    }
    
    // Buscar o militar pelo ID do banco
    const { data } = await supabase.from('militares').select().eq('id', dbId);
    if (data && data.length > 0) {
      const militar = data[0];
      return { 
        id, 
        name: militar.nome, 
        rank: militar.patente || militar.guarnicao || "OUTROS" 
      };
    }
    
    return undefined;
  }
  
  async createOfficer(insertOfficer: InsertOfficer): Promise<Officer> {
    // Converter formato Officer para Militar
    const militar = {
      nome: insertOfficer.name,
      patente: insertOfficer.rank || "",
      guarnicao: this.getGuarnicaoFromNome(insertOfficer.name),
      ativo: true
    };
    
    const { data, error } = await supabase.from('militares').insert(militar).select();
    if (error) throw error;
    
    const officers = await this.getAllOfficers();
    const internalId = officers.length + 1;
    this.officerIdMap.set(internalId, data[0].id.toString());
    
    return { 
      id: internalId, 
      name: data[0].nome, 
      rank: data[0].patente || data[0].guarnicao || "OUTROS" 
    };
  }
  
  // Função auxiliar para identificar a guarnição
  private getGuarnicaoFromNome(nome: string): string {
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
  
  async saveSchedule(operation: string, year: number, month: number, data: any): Promise<void> {
    // Verificar se já existe uma escala para esta operação/ano/mês
    const { data: existingSchedules } = await supabase
      .from('schedules')
      .select()
      .eq('operation', operation)
      .eq('year', year)
      .eq('month', month);
    
    if (existingSchedules && existingSchedules.length > 0) {
      // Atualizar escala existente
      await supabase
        .from('schedules')
        .update({ data: JSON.stringify(data) })
        .eq('id', existingSchedules[0].id);
    } else {
      // Inserir nova escala
      await supabase.from('schedules').insert({
        operation,
        year,
        month,
        data: JSON.stringify(data)
      });
    }
  }
  
  async getSchedule(operation: string, year: number, month: number): Promise<any> {
    try {
      const { data: schedules } = await supabase
        .from('schedules')
        .select()
        .eq('operation', operation)
        .eq('year', year)
        .eq('month', month);
      
      if (!schedules || schedules.length === 0 || !schedules[0].data) return {};
      
      const schedule = schedules[0];
      
      // Tratar dados possivelmente mal formatados
      let scheduleData = {};
      
      if (schedule.data) {
        try {
          // Verificar se o dado já é um objeto
          if (typeof schedule.data === 'object') {
            scheduleData = schedule.data;
          } else {
            // Tentar fazer o parse
            scheduleData = JSON.parse(schedule.data);
            
            // Se ainda for string, tentar fazer outro parse (dupla serialização)
            if (typeof scheduleData === 'string') {
              scheduleData = JSON.parse(scheduleData);
            }
          }
        } catch (err) {
          console.error(`Erro ao processar dados da operação ${operation}:`, err);
        }
      }
      
      return scheduleData;
    } catch (error) {
      console.error(`Erro ao buscar escala da operação ${operation}:`, error);
      return {};
    }
  }
  
  // Função auxiliar para obter dados da tabela no formato padrão da aplicação
  private async getStoredScheduleData(operation: string, year: number, month: number): Promise<any> {
    try {
      // Buscar dados da escala no banco
      const { data: schedules } = await supabase
        .from('schedules')
        .select()
        .eq('operation', operation)
        .eq('year', year)
        .eq('month', month);
      
      if (!schedules || schedules.length === 0 || !schedules[0].data) return {};
      
      const schedule = schedules[0];
      
      // Processar dados para garantir formato correto
      let parsedData = schedule.data;
      
      // Se não for objeto, tentar fazer parse
      if (typeof parsedData !== 'object') {
        try {
          parsedData = JSON.parse(parsedData);
          
          // Verificar se houve dupla serialização
          if (typeof parsedData === 'string') {
            parsedData = JSON.parse(parsedData);
          }
        } catch (err) {
          console.error(`Erro ao processar dados de ${operation}:`, err);
          return {};
        }
      }
      
      return parsedData;
    } catch (err) {
      console.error(`Erro ao buscar dados de ${operation}:`, err);
      return {};
    }
  }

  async getCombinedSchedules(year: number, month: number): Promise<any> {
    try {
      // Buscar a escala PMF
      const { data: pmfSchedules } = await supabase
        .from('schedules')
        .select()
        .eq('operation', 'pmf')
        .eq('year', year)
        .eq('month', month);
      
      // Buscar a escala Escola Segura
      const { data: escolaSeguraSchedules } = await supabase
        .from('schedules')
        .select()
        .eq('operation', 'escolaSegura')
        .eq('year', year)
        .eq('month', month);
      
      // Extrair os dados ou usar objeto vazio se não houver nada
      const pmfSchedule = pmfSchedules && pmfSchedules.length > 0 ? pmfSchedules[0] : null;
      const escolaSeguraSchedule = escolaSeguraSchedules && escolaSeguraSchedules.length > 0 ? escolaSeguraSchedules[0] : null;
      
      // Tratar dados possivelmente mal formatados
      let pmfData = {};
      let escolaSeguraData = {};
      
      if (pmfSchedule && pmfSchedule.data) {
        try {
          // Verificar se o dado já é um objeto
          if (typeof pmfSchedule.data === 'object') {
            pmfData = pmfSchedule.data;
          } else {
            // Tentar fazer o parse
            pmfData = JSON.parse(pmfSchedule.data);
            
            // Se ainda for string, tentar fazer outro parse (dupla serialização)
            if (typeof pmfData === 'string') {
              pmfData = JSON.parse(pmfData);
            }
          }
        } catch (err) {
          console.error("Erro ao processar dados PMF:", err);
        }
      }
      
      if (escolaSeguraSchedule && escolaSeguraSchedule.data) {
        try {
          // Verificar se o dado já é um objeto
          if (typeof escolaSeguraSchedule.data === 'object') {
            escolaSeguraData = escolaSeguraSchedule.data;
          } else {
            // Tentar fazer o parse
            escolaSeguraData = JSON.parse(escolaSeguraSchedule.data);
            
            // Se ainda for string, tentar fazer outro parse (dupla serialização)
            if (typeof escolaSeguraData === 'string') {
              escolaSeguraData = JSON.parse(escolaSeguraData);
            }
          }
        } catch (err) {
          console.error("Erro ao processar dados Escola Segura:", err);
        }
      }
      
      // Consulta direta para verificar se há dados mais recentes na outra tabela
      const directPmfData = await this.getStoredScheduleData('pmf', year, month);
      const directEsData = await this.getStoredScheduleData('escolaSegura', year, month);
      
      // Determinar qual conjunto de dados usar para cada operação
      const pmfFinalData = Object.keys(directPmfData).length > 0 ? directPmfData : pmfData;
      const escolaSeguraFinalData = Object.keys(directEsData).length > 0 ? directEsData : escolaSeguraData;
      
      // Retornar as escalas combinadas
      return {
        pmf: pmfFinalData,
        escolaSegura: escolaSeguraFinalData
      };
    } catch (error) {
      console.error("Erro ao buscar ou processar escalas combinadas:", error);
      // Retornar objeto vazio em caso de erro para evitar quebra da aplicação
      return { pmf: {}, escolaSegura: {} };
    }
  }
}

// Sempre usar o banco de dados para persistência
let usingDatabase = true;

try {
  // Verificar se a variável DATABASE_URL está configurada
  if (!process.env.DATABASE_URL) {
    console.log('Aviso: DATABASE_URL não encontrado, mas ainda tentaremos usar o banco.');
  }
} catch (error) {
  console.error('Erro ao verificar conexão com banco de dados:', error);
  console.log('Tentando usar o banco de dados de qualquer forma...');
}

// Sempre usar a implementação do banco de dados para garantir persistência
export const storage = new DatabaseStorage();