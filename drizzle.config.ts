import { defineConfig } from "drizzle-kit";

// Usando Supabase em vez de Neon DB
const supabaseUrl = 'https://uakdrtgabsxvuxilqepw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2RydGdhYnN4dnV4aWxxZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0OTA2MjcsImV4cCI6MjA2MjA2NjYyN30.FFxCUjxwtW5JfbQVLTn7pUPRUY22HFLzEHBd8-lfYI8';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // Usando a URL do Supabase para conexão
    url: `postgresql://postgres.uakdrtgabsxvuxilqepw:@Will0801@db.uakdrtgabsxvuxilqepw.supabase.co:5432/postgres`,
  },
});
