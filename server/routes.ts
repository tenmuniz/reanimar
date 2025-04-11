import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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
      const schedule = req.body;
      await storage.saveSchedule(schedule);
      res.json({ message: "Schedule saved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error saving schedule" });
    }
  });

  // Get schedule
  app.get("/api/schedule", async (req, res) => {
    try {
      const { year, month } = req.query;
      
      if (!year || !month) {
        return res.status(400).json({ message: "Year and month are required" });
      }
      
      const schedule = await storage.getSchedule(
        parseInt(year as string), 
        parseInt(month as string)
      );
      
      res.json({ schedule });
    } catch (error) {
      res.status(500).json({ message: "Error fetching schedule" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
