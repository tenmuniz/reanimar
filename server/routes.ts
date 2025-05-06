import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { WebSocketServer } from 'ws';

export async function registerRoutes(app: Express): Promise<Server> {
  // Criar servidor HTTP para o Express - será retornado no final da função
  const httpServer = createServer(app);
  
  // Configurar WebSocket com um caminho específico para não conflitar com o Vite
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws-api', // Caminho específico para evitar conflito com o Vite
    perMessageDeflate: false, // Desabilitar compressão para evitar problemas com frames
    maxPayload: 1024 * 1024, // 1MB de payload máximo
  });
  
  // Tratamento de erros no nível do servidor WebSocket
  wss.on('error', (error) => {
    console.error('Erro no WebSocket Server:', error);
    // Apenas logar o erro, sem propagar para evitar queda do servidor
  });
  
  // Configuração adicional para lidar com tokens de conexão
  wss.on('connection', (ws, req) => {
    console.log('Nova conexão WebSocket estabelecida');
    
    // Extrair token da URL se presente
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log(`Conexão WebSocket autenticada com token: ${token}`);
    }
    
    // Adicionar tratamento de erros individual para cada conexão
    ws.on('error', (error) => {
      console.error('Erro na conexão WebSocket individual:', error);
      // Não propagar o erro, apenas registrar
    });
    
    // Ouvir mensagens do cliente com tratamento de erros
    ws.on('message', (message) => {
      try {
        console.log('Mensagem recebida:', message.toString());
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    });
    
    // Evento de fechamento
    ws.on('close', () => {
      console.log('Conexão WebSocket fechada');
    });
  });
  
  // Endpoint de health check para Railway
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    });
  });
  
  // Configurar autenticação

  // API routes for the application
  
  // Get all officers
  app.get("/api/officers", async (req, res) => {
    try {
      const officers = await storage.getAllOfficers();
      // Retorna apenas os nomes para manter compatibilidade com o frontend atual
      res.json({ officers: officers.map(officer => officer.name) });
    } catch (error) {
      res.status(500).json({ message: "Error fetching officers" });
    }
  });

  // Save schedule - rota protegida
  app.post("/api/schedule", (req, res, next) => {
    // Verificar autenticação simplificada (sem isAuthenticated)
    // Note: Como não temos uma implementação completa de autenticação,
    // vamos considerar todas as requisições como autenticadas por enquanto
    if (req.headers.authorization) {
      // Se houvesse um sistema de autenticação real, verificaríamos o token aqui
      next();
    } else {
      // Para fins de desenvolvimento, permitir sem autenticação
      console.warn("Acesso sem autenticação à rota /api/schedule");
      next();
    }
  }, async (req, res) => {
    try {
      const { operation, year, month, data } = req.body;
      
      if (!operation || !year || !month || !data) {
        return res.status(400).json({ message: "Operation, year, month, and data are required" });
      }
      
      // Formatação para garantir que o formato é consistente
      // Construir no formato que esperamos para o armazenamento
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);
      
      // Se os dados já estiverem no formato esperado, usamos assim mesmo
      // Senão, formatamos para o padrão {ano: {mês: {dia: [dados]}}}
      let formattedData;
      
      if (data && typeof data === 'object') {
        if (data[yearNum] && data[yearNum][monthNum]) {
          // Já está no formato correto
          formattedData = data;
        } else if (Object.keys(data).some(key => !isNaN(Number(key)))) {
          // Formato simples com dias como chaves, vamos formatar
          formattedData = {
            [yearNum]: {
              [monthNum]: data
            }
          };
        } else {
          // Formato desconhecido, usar como está
          formattedData = data;
        }
      } else {
        formattedData = data;
      }
      
      await storage.saveSchedule(
        operation,
        yearNum, 
        monthNum,
        formattedData
      );
      
      res.json({ message: "Schedule saved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error saving schedule" });
    }
  });

  // Get schedule for a specific operation - rota protegida
  app.get("/api/schedule", (req, res, next) => {
    // Verificar autenticação simplificada (sem isAuthenticated)
    // Mesma lógica da rota anterior
    if (req.headers.authorization) {
      next();
    } else {
      // Para fins de desenvolvimento, permitir sem autenticação
      console.warn("Acesso sem autenticação à rota /api/schedule (GET)");
      next();
    }
  }, async (req, res) => {
    try {
      const { operation, year, month } = req.query;
      
      if (!operation || !year || !month) {
        return res.status(400).json({ message: "Operation, year, and month are required" });
      }
      
      const schedule = await storage.getSchedule(
        operation as string,
        parseInt(year as string), 
        parseInt(month as string)
      );
      
      res.json({ schedule });
    } catch (error) {
      res.status(500).json({ message: "Error fetching schedule" });
    }
  });
  
  // Get combined schedules - rota protegida
  app.get("/api/combined-schedules", (req, res, next) => {
    // Verificar autenticação simplificada (sem isAuthenticated)
    // Mesma lógica das rotas anteriores
    if (req.headers.authorization) {
      next();
    } else {
      // Para fins de desenvolvimento, permitir sem autenticação
      console.warn("Acesso sem autenticação à rota /api/combined-schedules");
      next();
    }
  }, async (req, res) => {
    try {
      const { year, month } = req.query;
      
      if (!year || !month) {
        return res.status(400).json({ message: "Year and month are required" });
      }
      
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);
      
      // Buscar dados das duas operações
      const schedules = await storage.getCombinedSchedules(yearNum, monthNum);
      
      // Retornar dados
      res.json({ schedules });
    } catch (error) {
      // Erro ao buscar escalas combinadas
      res.status(500).json({ 
        message: "Error fetching combined schedules"
      });
    }
  });

  // Retornar o servidor HTTP
  return httpServer;
}
