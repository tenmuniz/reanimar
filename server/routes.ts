import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Save schedule
  app.post("/api/schedule", async (req, res) => {
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

  // Get schedule for a specific operation
  app.get("/api/schedule", async (req, res) => {
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
  
  // Get combined schedules
  app.get("/api/combined-schedules", async (req, res) => {
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



  const httpServer = createServer(app);

  return httpServer;
}
