import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { InferModel } from "drizzle-orm";

// Tabela de usuários (login)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  cpf: text("cpf").notNull().unique(),
  role: text("role").notNull(), // exemplo: 'admin', 'user'
});

// Tabela de policiais (escala)
export const officers = pgTable("policiais", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tipagem automática dos dados (opcional, usado no backend)
export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

export type Officer = InferModel<typeof officers>;
export type NewOfficer = InferModel<typeof officers, "insert">;
