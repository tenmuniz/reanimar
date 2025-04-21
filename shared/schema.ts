import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { InferModel } from "drizzle-orm";

// Tabela de usuários (login)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  cpf: text("cpf").notNull().unique(),
  role: text("role").notNull(),
});

// Tabela de policiais (substitui officers)
export const officers = pgTable("policiais", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de escalas salvas
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  operation: text("operation").notNull(), // PMF, GPA, etc
  year: serial("year").notNull(),
  month: serial("month").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tipagens (backend)
export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

export type Officer = InferModel<typeof officers>;
export type NewOfficer = InferModel<typeof officers, "insert">;

export type Schedule = InferModel<typeof schedules>;
export type NewSchedule = InferModel<typeof schedules, "insert">;
