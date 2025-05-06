// Ponto de entrada para funções serverless do Vercel
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Importar configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL || "https://uakdrtgabsxvuxilqepw.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2RydGdhYnN4dnV4aWxxZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI2MzIwMDAsImV4cCI6MjAyNzk3NDQwMH0.FFxCUjovtw5JfbQvLTn7yUPRUYZ2HFLzEhdBd-1PYIB";

// Inicializar Express
const app = express();
app.use(express.json({ limit: '2mb' }));

// Criar servidor HTTP
const server = createServer(app);

// Configurar WebSocket
const wss = new WebSocketServer({ 
  server: server,
  path: '/ws-api'
});

// Tratamento de erros no WebSocket
wss.on('error', (error) => {
  console.error('Erro no WebSocket Server:', error);
});

// Lidar com conexões WebSocket
wss.on('connection', (ws, req) => {
  console.log('Nova conexão WebSocket estabelecida');
  
  // Extrair token da URL
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  
  if (token) {
    console.log(`Conexão WebSocket autenticada com token: ${token}`);
  }
  
  // Tratamento de erros individuais
  ws.on('error', (error) => {
    console.error('Erro na conexão WebSocket individual:', error);
  });
  
  // Mensagens recebidas
  ws.on('message', (message) => {
    try {
      console.log('Mensagem recebida:', message.toString());
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });
  
  // Fechamento de conexão
  ws.on('close', () => {
    console.log('Conexão WebSocket fechada');
  });
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// API routes

// Get all officers
app.get("/api/officers", async (req, res) => {
  try {
    // Simulação de resposta para teste
    const officers = ["CAP QOPM MUNIZ", "1º TEN QOPM MONTEIRO", "TEN VANILSON"];
    res.json({ officers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching officers" });
  }
});

// Definir porta e iniciar servidor
const port = process.env.PORT || 5006;
server.listen(port, () => {
  console.log(`Servidor API está rodando na porta ${port}`);
});

// Exportar app para serverless
export default app; 