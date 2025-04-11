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
    
    // Initialize with default officers for testing
    const defaultOfficers = [
      { id: 1, name: "Sd Silva", rank: "Soldado" },
      { id: 2, name: "Cb Almeida", rank: "Cabo" },
      { id: 3, name: "Sd Costa", rank: "Soldado" },
      { id: 4, name: "Sgt Souza", rank: "Sargento" },
      { id: 5, name: "Sd Lima", rank: "Soldado" }
    ];
    
    defaultOfficers.forEach(officer => {
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
