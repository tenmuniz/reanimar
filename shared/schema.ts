import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  cpf: text("cpf").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
});

export const officers = pgTable("officers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rank: text("rank").notNull(),
});

// Tabela de escalas atualizada para formato JSON
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  operation: text("operation").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  data: jsonb("data").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  cpf: true,
  name: true,
  password: true,
  role: true,
});

export const insertOfficerSchema = createInsertSchema(officers).pick({
  name: true,
  rank: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).pick({
  operation: true,
  year: true,
  month: true,
  data: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOfficer = z.infer<typeof insertOfficerSchema>;
export type Officer = typeof officers.$inferSelect;

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;
