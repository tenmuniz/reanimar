import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Obter configurações do ambiente
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

// Configurar headers de segurança para produção
if (isProd) {
  app.use((req, res, next) => {
    // Desativar o cabeçalho X-Powered-By
    app.disable('x-powered-by');
    
    // Adicionar headers de segurança
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT environment variable for Vercel deployment or fallback to port 5006
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5006;
  
  // Simplificando a configuração de escuta
  server.listen(port, () => {
    log(`Server is running on http://localhost:${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
  
  // Adicionar tratamento para erros de servidor
  server.on('error', (err: any) => {
    log(`Server error: ${err.message}`);
    if (err.code === 'EADDRINUSE') {
      log(`Port ${port} is already in use. Please configure a different PORT in environment variables.`);
    }
    // Não encerrar o processo em produção para permitir que o Vercel reinicie
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });
})();
