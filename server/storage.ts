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
  
  saveSchedule(schedule: any): Promise<void>;
  getSchedule(year: number, month: number): Promise<any>;
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
      // Oficiais
      { id: 1, name: "MAJ PM GOMES", rank: "OFICIAIS" },
      { id: 2, name: "CAP PM RAQUEL", rank: "OFICIAIS" },
      { id: 3, name: "1º TEN PM DIAS", rank: "OFICIAIS" },
      { id: 4, name: "2º TEN PM MARCELO", rank: "OFICIAIS" },
      { id: 5, name: "ASP OF PM JUNIOR", rank: "OFICIAIS" },
      
      // Seção
      { id: 6, name: "SUB TEN PM CARDOSO", rank: "SEÇÃO" },
      { id: 7, name: "1º SGT PM SANTOS", rank: "SEÇÃO" },
      { id: 8, name: "2º SGT PM FERREIRA", rank: "SEÇÃO" },
      { id: 9, name: "3º SGT PM COSTA", rank: "SEÇÃO" },
      { id: 10, name: "CB PM OLIVEIRA", rank: "SEÇÃO" },
      { id: 11, name: "SD PM ARAUJO", rank: "SEÇÃO" },
      
      // Grupo ALFA
      { id: 12, name: "2º SGT PM PEIXOTO", rank: "ALFA" },
      { id: 13, name: "3º SGT PM RODRIGO", rank: "ALFA" },
      { id: 14, name: "3º SGT PM LEDO", rank: "ALFA" },
      { id: 15, name: "3º SGT PM NUNES", rank: "ALFA" },
      { id: 16, name: "3º SGT PM AMARAL", rank: "ALFA" },
      { id: 17, name: "CB PM CARLA", rank: "ALFA" },
      { id: 18, name: "CB PM FELIPE", rank: "ALFA" },
      { id: 19, name: "CB PM BARROS", rank: "ALFA" },
      { id: 20, name: "CB PM A. SILVA", rank: "ALFA" },
      { id: 21, name: "SD PM LUAN", rank: "ALFA" },
      { id: 22, name: "SD PM NAVARRO", rank: "ALFA" },
      
      // Grupo BRAVO
      { id: 23, name: "1º SGT PM OLIMAR", rank: "BRAVO" },
      { id: 24, name: "2º SGT PM FÁBIO", rank: "BRAVO" },
      { id: 25, name: "3º SGT PM ANA CLEIDE", rank: "BRAVO" },
      { id: 26, name: "3º SGT PM GLEIDSON", rank: "BRAVO" },
      { id: 27, name: "3º SGT PM CARLOS EDUARDO", rank: "BRAVO" },
      { id: 28, name: "3º SGT PM NEGRÃO", rank: "BRAVO" },
      { id: 29, name: "CB PM BRASIL", rank: "BRAVO" },
      { id: 30, name: "SD PM MARVÃO", rank: "BRAVO" },
      { id: 31, name: "SD PM IDELVAN", rank: "BRAVO" },
      
      // Grupo CHARLIE
      { id: 32, name: "2º SGT PM PINHEIRO", rank: "CHARLIE" },
      { id: 33, name: "3º SGT PM RAFAEL", rank: "CHARLIE" },
      { id: 34, name: "CB PM MIQUEIAS", rank: "CHARLIE" },
      { id: 35, name: "CB PM M. PAIXÃO", rank: "CHARLIE" },
      { id: 36, name: "SD PM CHAGAS", rank: "CHARLIE" },
      { id: 37, name: "SD PM CARVALHO", rank: "CHARLIE" },
      { id: 38, name: "SD PM GOVEIA", rank: "CHARLIE" },
      { id: 39, name: "SD PM ALMEIDA", rank: "CHARLIE" },
      { id: 40, name: "SD PM PATRIK", rank: "CHARLIE" },
      { id: 41, name: "SD PM GUIMARÃES", rank: "CHARLIE" }
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
  
  async saveSchedule(schedule: any): Promise<void> {
    // For each month in the schedule, create a key and store the data
    Object.keys(schedule).forEach(monthKey => {
      this.scheduleMap.set(monthKey, schedule[monthKey]);
    });
  }
  
  async getSchedule(year: number, month: number): Promise<any> {
    const key = `${year}-${month}`;
    return this.scheduleMap.get(key) || {};
  }
}

export const storage = new MemStorage();
