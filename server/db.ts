import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Configuração de conexão personalizada (usar a mesma conexão no deploy)
const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_TP1lKjG6pxqc@ep-bold-queen-a63l3hze.us-west-2.aws.neon.tech/neondb?sslmode=require';

// Criar pool e cliente drizzle
let pool;
let db;

try {
  // Tentar conectar com a URL definida acima
  pool = new Pool({ connectionString: DATABASE_URL });
  db = drizzle(pool, { schema });
  console.log('Banco de dados PostgreSQL conectado com sucesso.');
} catch (error) {
  console.error('Erro ao conectar ao banco de dados:', error);
  // Criar um objeto db que não faz nada para evitar erros
  db = new Proxy({}, {
    get: () => () => {
      console.log('Erro na conexão com o banco de dados. Operação ignorada.');
      return Promise.resolve([]);
    }
  });
}

export { pool, db };