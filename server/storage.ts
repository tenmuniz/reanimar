// Importações necessárias
import { db } from './db';
import { and, eq } from 'drizzle-orm';
import { users, officers, schedules, type User, type InsertUser, type Officer, type InsertOfficer } from '@shared/schema';

// Interface de armazenamento
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllOfficers(): Promise<Officer[]>;
  getOfficer(id: number): Promise<Officer | undefined>;
  createOfficer(officer: InsertOfficer): Promise<Officer>;
  
  saveSchedule(operation: string, year: number, month: number, data: any): Promise<void>;
  getSchedule(operation: string, year: number, month: number): Promise<any>;
  getCombinedSchedules(year: number, month: number): Promise<any>;
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

// Implementação com banco de dados PostgreSQL
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
      const [user] = await db.select().from(users).where(eq(users.id, parseInt(dbId)));
      if (user) return { ...user, id };
    }
    
    // Fallback: buscar todos os usuários e usar o primeiro
    const allUsers = await db.select().from(users);
    if (allUsers.length > 0) {
      // Armazenar o mapeamento para próximas consultas
      this.userIdMap.set(id, allUsers[0].id.toString());
      return { ...allUsers[0], id };
    }
    
    return undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (user) {
      const internalId = 1; // Para simplificar, usamos ID 1 para o usuário
      this.userIdMap.set(internalId, user.id.toString());
      return { ...user, id: internalId };
    }
    return undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    const internalId = 1;
    this.userIdMap.set(internalId, user.id.toString());
    return { ...user, id: internalId };
  }
  
  async getAllOfficers(): Promise<Officer[]> {
    // Verificar se já temos oficiais no banco de dados
    const existingOfficers = await db.select().from(officers);
    
    // Se não temos oficiais, inicializar com a lista padrão
    if (existingOfficers.length === 0) {
      await this.initializeOfficers();
      return this.getAllOfficers(); // Chamar novamente após inicialização
    }
    
    // Mapear oficiais para o formato esperado pela aplicação
    return existingOfficers.map((officer, index) => {
      const internalId = index + 1;
      this.officerIdMap.set(internalId, officer.id.toString());
      return { ...officer, id: internalId };
    });
  }
  
  private async initializeOfficers(): Promise<void> {
    // Lista de oficiais a serem inicializados no banco
    const defaultOfficers = [
      // Oficiais - EXPEDIENTE
      { name: "CAP QOPM MUNIZ", rank: "EXPEDIENTE" },
      { name: "1º TEN QOPM MONTEIRO", rank: "EXPEDIENTE" },
      { name: "TEN VANILSON", rank: "EXPEDIENTE" },
      { name: "SUB TEN ANDRÉ", rank: "EXPEDIENTE" },
      { name: "3º SGT PM CUNHA", rank: "EXPEDIENTE" },
      { name: "3º SGT PM CARAVELAS", rank: "EXPEDIENTE" },
      { name: "CB PM TONI", rank: "EXPEDIENTE" },
      { name: "SD PM S. CORREA", rank: "EXPEDIENTE" },
      { name: "SD PM RODRIGUES", rank: "EXPEDIENTE" },
      { name: "2º SGT PM A. TAVARES", rank: "EXPEDIENTE" },
      
      // Grupo ALFA
      { name: "2º SGT PM PEIXOTO", rank: "ALFA" },
      { name: "3º SGT PM RODRIGO", rank: "ALFA" },
      { name: "3º SGT PM LEDO", rank: "ALFA" },
      { name: "3º SGT PM NUNES", rank: "ALFA" },
      { name: "3º SGT AMARAL", rank: "ALFA" },
      { name: "CB CARLA", rank: "ALFA" },
      { name: "CB PM FELIPE", rank: "ALFA" },
      { name: "CB PM BARROS", rank: "ALFA" },
      { name: "CB PM A. SILVA", rank: "ALFA" },
      { name: "SD PM LUAN", rank: "ALFA" },
      { name: "SD PM NAVARRO", rank: "ALFA" },
      
      // Grupo BRAVO
      { name: "1º SGT PM OLIMAR", rank: "BRAVO" },
      { name: "2º SGT PM FÁBIO", rank: "BRAVO" },
      { name: "3º SGT PM ANA CLEIDE", rank: "BRAVO" },
      { name: "3º SGT PM GLEIDSON", rank: "BRAVO" },
      { name: "3º SGT PM CARLOS EDUARDO", rank: "BRAVO" },
      { name: "3º SGT PM NEGRÃO", rank: "BRAVO" },
      { name: "CB PM BRASIL", rank: "BRAVO" },
      { name: "SD PM MARVÃO", rank: "BRAVO" },
      { name: "SD PM IDELVAN", rank: "BRAVO" },
      
      // Grupo CHARLIE
      { name: "2º SGT PM PINHEIRO", rank: "CHARLIE" },
      { name: "3º SGT PM RAFAEL", rank: "CHARLIE" },
      { name: "CB PM MIQUEIAS", rank: "CHARLIE" },
      { name: "CB PM M. PAIXÃO", rank: "CHARLIE" },
      { name: "SD PM CHAGAS", rank: "CHARLIE" },
      { name: "SD PM CARVALHO", rank: "CHARLIE" },
      { name: "SD PM GOVEIA", rank: "CHARLIE" },
      { name: "SD PM ALMEIDA", rank: "CHARLIE" },
      { name: "SD PM PATRIK", rank: "CHARLIE" },
      { name: "SD PM GUIMARÃES", rank: "CHARLIE" }
    ];
    
    // Inserir todos os oficiais no banco de dados
    await db.insert(officers).values(defaultOfficers);
  }
  
  async getOfficer(id: number): Promise<Officer | undefined> {
    // Obter o ID do banco de dados mapeado
    const dbId = this.officerIdMap.get(id);
    if (!dbId) {
      // Se não temos o mapeamento, tentar obter todos os oficiais primeiro
      await this.getAllOfficers();
      return this.getOfficer(id); // Tentar novamente após buscar todos
    }
    
    // Buscar o oficial pelo ID do banco
    const [officer] = await db.select().from(officers).where(eq(officers.id, parseInt(dbId)));
    if (officer) return { ...officer, id };
    
    return undefined;
  }
  
  async createOfficer(insertOfficer: InsertOfficer): Promise<Officer> {
    const [officer] = await db.insert(officers).values(insertOfficer).returning();
    const internalId = (await this.getAllOfficers()).length + 1;
    this.officerIdMap.set(internalId, officer.id.toString());
    return { ...officer, id: internalId };
  }
  
  async saveSchedule(operation: string, year: number, month: number, data: any): Promise<void> {
    // Verificar se já existe uma escala para esta operação/ano/mês
    const [existingSchedule] = await db.select()
      .from(schedules)
      .where(
        and(
          eq(schedules.operation, operation),
          eq(schedules.year, year),
          eq(schedules.month, month)
        )
      );
    
    if (existingSchedule) {
      // Atualizar escala existente
      await db.update(schedules)
        .set({ data: JSON.stringify(data) })
        .where(eq(schedules.id, existingSchedule.id));
    } else {
      // Inserir nova escala
      await db.insert(schedules).values({
        operation,
        year,
        month,
        data: JSON.stringify(data)
      });
    }
  }
  
  async getSchedule(operation: string, year: number, month: number): Promise<any> {
    const [schedule] = await db.select()
      .from(schedules)
      .where(
        and(
          eq(schedules.operation, operation),
          eq(schedules.year, year),
          eq(schedules.month, month)
        )
      );
    
    return schedule ? JSON.parse(schedule.data) : {};
  }
  
  async getCombinedSchedules(year: number, month: number): Promise<any> {
    try {
      // Buscar a escala PMF
      const pmfSchedules = await db.select()
        .from(schedules)
        .where(
          and(
            eq(schedules.operation, 'pmf'),
            eq(schedules.year, year),
            eq(schedules.month, month)
          )
        );
      
      // Buscar a escala Escola Segura
      const escolaSeguraSchedules = await db.select()
        .from(schedules)
        .where(
          and(
            eq(schedules.operation, 'escolaSegura'),
            eq(schedules.year, year),
            eq(schedules.month, month)
          )
        );
      
      // Extrair os dados ou usar objeto vazio se não houver nada
      const pmfSchedule = pmfSchedules.length > 0 ? pmfSchedules[0] : null;
      const escolaSeguraSchedule = escolaSeguraSchedules.length > 0 ? escolaSeguraSchedules[0] : null;
      
      // Retornar as escalas combinadas com tratamento de erro ao fazer parse do JSON
      return {
        pmf: pmfSchedule && pmfSchedule.data ? JSON.parse(pmfSchedule.data) : {},
        escolaSegura: escolaSeguraSchedule && escolaSeguraSchedule.data ? JSON.parse(escolaSeguraSchedule.data) : {}
      };
    } catch (error) {
      console.error("Erro ao buscar ou processar escalas combinadas:", error);
      // Retornar objeto vazio em caso de erro para evitar quebra da aplicação
      return { pmf: {}, escolaSegura: {} };
    }
  }
}

// Verificar se temos acesso ao banco de dados
let usingDatabase = true;

try {
  // Verificar se a variável DATABASE_URL está configurada
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL não encontrado. Usando armazenamento em memória.');
    usingDatabase = false;
  }
} catch (error) {
  console.error('Erro ao verificar conexão com banco de dados:', error);
  usingDatabase = false;
}

// Usar a implementação adequada com base na disponibilidade do banco de dados
export const storage = usingDatabase ? new DatabaseStorage() : new MemStorage();