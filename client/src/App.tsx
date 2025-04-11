import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shield, BookOpen, AlertTriangle, Eye, ExternalLink } from "lucide-react";
import Home from "@/pages/home";
import EscolaSegura from "@/pages/escola-segura";
import VerificadorInconsistencias from "@/pages/verificador";
import Visualizacao from "@/pages/visualizacao";
import NotFound from "@/pages/not-found";

// Componente de navegação
function NavBar() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="text-white font-bold text-xl">20ª CIPM - Sistema de Escalas</div>
        
        <div className="flex flex-wrap space-x-2 sm:space-x-3">
          <Link href="/">
            <a className={`px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm ${
              location === "/" 
                ? "bg-blue-600 text-white shadow-lg border border-blue-500" 
                : "bg-blue-700/80 text-white/90 hover:bg-blue-700 hover:text-white transition-colors"
            }`}>
              <Shield className="mr-1 h-4 w-4" />
              <span>Polícia Mais Forte</span>
            </a>
          </Link>
          
          <Link href="/escola-segura">
            <a className={`px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm ${
              location === "/escola-segura" 
                ? "bg-green-600 text-white shadow-lg border border-green-500" 
                : "bg-green-700/80 text-white/90 hover:bg-green-700 hover:text-white transition-colors"
            }`}>
              <BookOpen className="mr-1 h-4 w-4" />
              <span>Escola Segura</span>
            </a>
          </Link>
          
          <Link href="/verificador">
            <a className={`px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm ${
              location === "/verificador" 
                ? "bg-amber-600 text-white shadow-lg border border-amber-500" 
                : "bg-amber-700/80 text-white/90 hover:bg-amber-700 hover:text-white transition-colors"
            }`}>
              <AlertTriangle className="mr-1 h-4 w-4" />
              <span>Verificador</span>
            </a>
          </Link>
          
          <Link href="/visualizacao">
            <a className={`px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm ${
              location === "/visualizacao" 
                ? "bg-purple-600 text-white shadow-lg border border-purple-500" 
                : "bg-purple-700/80 text-white/90 hover:bg-purple-700 hover:text-white transition-colors"
            }`}>
              <Eye className="mr-1 h-4 w-4" />
              <span>Visualizar</span>
            </a>
          </Link>
          
          <a 
            href="/visualizacao-publica" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm bg-teal-700/80 text-white/90 hover:bg-teal-700 hover:text-white transition-colors shadow-md"
          >
            <ExternalLink className="mr-1 h-4 w-4" />
            <span>Link Público</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/escola-segura" component={EscolaSegura} />
          <Route path="/verificador" component={VerificadorInconsistencias} />
          <Route path="/visualizacao" component={Visualizacao} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
