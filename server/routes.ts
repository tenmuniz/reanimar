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
      
      // Configurar cabeçalhos anti-cache
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      // Converter para números
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);
      
      // Buscar dados diretamente para garantir que temos os dados corretos
      const pmfSchedule = await storage.getSchedule('pmf', yearNum, monthNum);
      const esSchedule = await storage.getSchedule('escolaSegura', yearNum, monthNum);
      
      // Imprimir formato dos dados para depuração
      console.log("Dados PMF originais:", JSON.stringify(pmfSchedule));
      console.log("Dados ES originais:", JSON.stringify(esSchedule));

      // Extrai dados do formato correto para PMF
      let pmfData = {};
      
      // Verifica várias possíveis estruturas para garantir que obtemos os dados
      if (pmfSchedule && typeof pmfSchedule === 'object') {
        if (pmfSchedule["2025"] && pmfSchedule["2025"]["4"]) {
          pmfData = pmfSchedule["2025"]["4"];
        } else if (pmfSchedule["schedule"] && pmfSchedule["schedule"]["2025"] && pmfSchedule["schedule"]["2025"]["4"]) {
          pmfData = pmfSchedule["schedule"]["2025"]["4"];
        } else if (pmfSchedule["1"] !== undefined) {
          // Formato simplificado onde temos dias como chaves diretamente
          pmfData = pmfSchedule;
        }
      }
      
      // Extrai dados do formato correto para Escola Segura
      let esData = {};
      
      // Verifica várias possíveis estruturas para garantir que obtemos os dados
      if (esSchedule && typeof esSchedule === 'object') {
        if (esSchedule["2025"] && esSchedule["2025"]["4"]) {
          esData = esSchedule["2025"]["4"];
        } else if (esSchedule["schedule"] && esSchedule["schedule"]["2025"] && esSchedule["schedule"]["2025"]["4"]) {
          esData = esSchedule["schedule"]["2025"]["4"];
        } else if (esSchedule["1"] !== undefined) {
          // Formato simplificado onde temos dias como chaves diretamente
          esData = esSchedule;
        }
      }
      
      // Montar objeto de resposta com formato simples e direto
      const schedules = {
        pmf: pmfData,
        escolaSegura: esData
      };
      
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

  // Rota para página de visualização pública - com cabeçalhos anti-cache
  app.get("/visualizacao-publica", (req, res) => {
    // Configurar cabeçalhos anti-cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    // Enviar o arquivo HTML
    res.sendFile(path.resolve(process.cwd(), "public/visualizacao.html"));
  });

  const httpServer = createServer(app);

  return httpServer;
}
