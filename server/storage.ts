import { users, officers, schedules, type User, type InsertUser, type Officer, type InsertOfficer } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

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
      
      // Militares de férias em Abril (não incluídos na lista):
      // CB PM ALAX (BRAVO)
      // CB PM VELOSO (BRAVO)
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
    
    // Mantemos escolaSegura como um objeto vazio por compatibilidade, 
    // já que a funcionalidade foi removida
    return {
      pmf: this.scheduleMap.get(pmfKey) || {},
      escolaSegura: {}
    };
  }
}

export const storage = new MemStorage();
