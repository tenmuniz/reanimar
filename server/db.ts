import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { eq } from 'drizzle-orm';

// Configurar o WebSocket para o NeonDB
neonConfig.webSocketConstructor = ws;

// Verificar DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.warn('AVISO: Variável de ambiente DATABASE_URL não configurada!');
  console.warn('No Railway, você deve adicionar esta variável nas configurações do projeto.');
  console.warn('Para desenvolvimento local, preencha .env ou configure no painel do Railway.');
}

// Usar DATABASE_URL do Railway ou fallback para desenvolvimento
const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_TP1lKjG6pxqc@ep-bold-queen-a63l3hze.us-west-2.aws.neon.tech/neondb?sslmode=require';

// Configuração para aumentar a resiliência da conexão - otimizada para Railway
const poolConfig = {
  connectionString: DATABASE_URL,
  max: 20, // máximo de conexões no pool
  connectionTimeoutMillis: 10000, // timeout para obter conexão do pool - aumentado para Railway
  idleTimeoutMillis: 30000, // tempo máximo que uma conexão pode ficar ociosa
  allowExitOnIdle: false, // não fechar a pool quando ociosa
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined // SSL flexível para Railway
};

// Criar pool e cliente drizzle
let pool: Pool;
let db: any;

try {
  // Tentar conectar com a URL definida
  pool = new Pool(poolConfig);
  db = drizzle(pool, { schema });
  
  // Testar a conexão com retry
  const testConnection = async (retries = 5, delay = 3000): Promise<void> => {
    try {
      await pool.query('SELECT NOW()');
      console.log('Banco de dados PostgreSQL conectado com sucesso.');
    } catch (error) {
      console.error(`Erro ao testar conexão com o banco de dados (tentativas restantes: ${retries}):`, error);
      
      if (retries > 0) {
        console.log(`Tentando reconectar em ${delay/1000} segundos...`);
        setTimeout(() => testConnection(retries - 1, delay), delay);
      } else {
        console.error('Falha ao estabelecer conexão com o banco após várias tentativas.');
      }
    }
  };
  
  // Iniciar teste de conexão
  testConnection();
  
  // Configurar eventos para melhor gestão de conexão
  pool.on('error', (err: Error) => {
    console.error('Erro inesperado no pool de conexões:', err);
    
    // Em produção, tentamos recuperar da falha
    if (process.env.NODE_ENV === 'production') {
      console.log('Tentando reconectar automaticamente...');
      testConnection();
    }
  });
  
  // Verificar banco periodicamente para manter conexão ativa
  setInterval(() => {
    pool.query('SELECT 1').catch((err: Error) => {
      console.log('Erro na verificação de conexão:', err);
    });
  }, 60000); // Verificar a cada minuto
  
} catch (error) {
  console.error('Erro ao inicializar conexão com o banco de dados:', error);
  
  // Criar um objeto db que não faz nada para evitar erros de runtime
  db = new Proxy({}, {
    get: () => () => {
      console.error('Erro na conexão com o banco de dados. Operação ignorada.');
      return Promise.resolve([]);
    }
  });
}

export { pool, db, eq };