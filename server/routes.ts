import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { setupAuth } from "./auth";
import { WebSocketServer } from 'ws';

export async function registerRoutes(app: Express): Promise<Server> {
  // Criar servidor HTTP para o Express - será retornado no final da função
  const httpServer = createServer(app);
  
  // Configurar WebSocket em um caminho seguro para Railway
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    perMessageDeflate: {
      zlibDeflateOptions: {
        // Nível de compressão 
        level: 6,
        // Memória alocada para a compressão
        memLevel: 8
      }
    }
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
  setupAuth(app);

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
    // Verificar autenticação
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autorizado. Faça login para continuar." });
    }
    next();
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
    // Verificar autenticação
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autorizado. Faça login para continuar." });
    }
    next();
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
    // Verificar autenticação
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autorizado. Faça login para continuar." });
    }
    next();
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
