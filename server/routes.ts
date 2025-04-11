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
      
      await storage.saveSchedule(
        operation,
        parseInt(year as string), 
        parseInt(month as string),
        data
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
      
      // Converter para números
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);
      
      // Buscar dados do banco
      const schedules = await storage.getCombinedSchedules(yearNum, monthNum);
      
      // Log para depuração
      console.log("Dados obtidos do banco:", JSON.stringify(schedules));
      
      // Garantir que não tem cache
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      // Retornar dados
      res.json({ schedules });
    } catch (error) {
      console.error("Erro ao buscar escalas combinadas:", error);
      // Retorna o erro detalhado para depuração
      res.status(500).json({ 
        message: "Error fetching combined schedules", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Rota para página de visualização pública
  app.get("/visualizacao-publica", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "public/visualizacao.html"));
  });

  const httpServer = createServer(app);

  return httpServer;
}
