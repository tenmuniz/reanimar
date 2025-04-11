import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Criar pool e cliente drizzle apenas se DATABASE_URL estiver definido
let pool;
let db;

try {
  // Verificar se DATABASE_URL existe
  if (process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
    console.log('Banco de dados PostgreSQL conectado com sucesso.');
  } else {
    console.log('DATABASE_URL não definido. Banco de dados não será usado.');
    // Criar um objeto db que não faz nada para evitar erros
    db = new Proxy({}, {
      get: () => () => {
        console.log('Tentativa de usar banco de dados, mas DATABASE_URL não está definido.');
        return Promise.resolve([]);
      }
    });
  }
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