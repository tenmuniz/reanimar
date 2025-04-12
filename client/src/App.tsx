import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shield, BookOpen, AlertTriangle, Calendar, Star, Award, FileWarning } from "lucide-react";
import Home from "@/pages/home";
import EscolaSegura from "@/pages/escola-segura";
import VerificadorInconsistencias from "@/pages/verificador";
import VerificadorGeral from "@/pages/verificador-geral";

import NotFound from "@/pages/not-found";

// Componente de navegação
function NavBar() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-gradient-to-b from-blue-950 to-blue-900 p-4 shadow-xl border-b-4 border-yellow-500">
      <div className="container mx-auto">
        {/* Linha superior com logo e título */}
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-full shadow-lg mr-3">
              <Shield className="h-8 w-8 text-blue-800" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tighter">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-300 to-white">
                  EXTRAORDINÁRIO
                </span>
              </h1>
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                <span className="text-xs font-medium text-blue-200">Sistema de Gestão - GCJO</span>
                <Star className="h-3 w-3 text-yellow-400 ml-1" />
              </div>
            </div>
          </div>
          
          <div className="bg-blue-800/50 rounded-lg px-4 py-2 border border-blue-700/50 shadow-inner">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-300 mr-2" />
              <div className="text-white flex flex-col">
                <span className="text-sm font-bold">{new Date().toLocaleDateString('pt-BR', {weekday: 'long'})}</span>
                <span className="text-xs text-blue-300">{new Date().toLocaleDateString('pt-BR', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barra de navegação */}
        <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4">
          <Link href="/">
            <a className={`group flex items-center px-5 py-3 rounded-lg transition-all duration-200 ${
              location === "/" 
                ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-lg border border-blue-500" 
                : "bg-blue-800/50 text-white/80 hover:bg-blue-700/60 hover:text-white"
            }`}>
              <div className={`mr-2 rounded-full p-1.5 transition-colors duration-200 ${
                location === "/" 
                  ? "bg-white/20" 
                  : "bg-white/10 group-hover:bg-white/20"
              }`}>
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">POLÍCIA MAIS FORTE</span>
                <span className="text-xs opacity-80">Escala PMF</span>
              </div>
              {location === "/" && <Award className="h-3 w-3 ml-2 text-yellow-400" />}
            </a>
          </Link>
          
          <Link href="/escola-segura">
            <a className={`group flex items-center px-5 py-3 rounded-lg transition-all duration-200 ${
              location === "/escola-segura" 
                ? "bg-gradient-to-b from-green-600 to-green-700 text-white shadow-lg border border-green-500" 
                : "bg-green-800/50 text-white/80 hover:bg-green-700/60 hover:text-white"
            }`}>
              <div className={`mr-2 rounded-full p-1.5 transition-colors duration-200 ${
                location === "/escola-segura" 
                  ? "bg-white/20" 
                  : "bg-white/10 group-hover:bg-white/20"
              }`}>
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">ESCOLA SEGURA</span>
                <span className="text-xs opacity-80">Escala ES</span>
              </div>
              {location === "/escola-segura" && <Award className="h-3 w-3 ml-2 text-yellow-400" />}
            </a>
          </Link>
          
          <Link href="/verificador">
            <a className={`group flex items-center px-5 py-3 rounded-lg transition-all duration-200 ${
              location === "/verificador" 
                ? "bg-gradient-to-b from-amber-600 to-amber-700 text-white shadow-lg border border-amber-500" 
                : "bg-amber-700/50 text-white/80 hover:bg-amber-700/60 hover:text-white"
            }`}>
              <div className={`mr-2 rounded-full p-1.5 transition-colors duration-200 ${
                location === "/verificador" 
                  ? "bg-white/20" 
                  : "bg-white/10 group-hover:bg-white/20"
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">VERIFICADOR</span>
                <span className="text-xs opacity-80">Simples</span>
              </div>
              {location === "/verificador" && <Award className="h-3 w-3 ml-2 text-yellow-400" />}
            </a>
          </Link>
          
          <Link href="/verificador-geral">
            <a className={`group flex items-center px-5 py-3 rounded-lg transition-all duration-200 ${
              location === "/verificador-geral" 
                ? "bg-gradient-to-b from-orange-600 to-orange-700 text-white shadow-lg border border-orange-500" 
                : "bg-orange-700/50 text-white/80 hover:bg-orange-700/60 hover:text-white"
            }`}>
              <div className={`mr-2 rounded-full p-1.5 transition-colors duration-200 ${
                location === "/verificador-geral" 
                  ? "bg-white/20" 
                  : "bg-white/10 group-hover:bg-white/20"
              }`}>
                <FileWarning className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">VERIFICADOR GERAL</span>
                <span className="text-xs opacity-80">Dashboard Completo</span>
              </div>
              {location === "/verificador-geral" && <Award className="h-3 w-3 ml-2 text-yellow-400" />}
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-blue-950 py-4 border-t border-blue-800 text-center text-blue-300 text-xs">
      <div className="container mx-auto px-4">
        <p className="mb-1">© {new Date().getFullYear()} - EXTRAORDINÁRIO - Sistema de Gestão de GCJO</p>
        <p>Desenvolvido por <span className="text-yellow-400 font-medium">@equipepoderosa</span></p>
      </div>
    </footer>
  );
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      <NavBar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/escola-segura" component={EscolaSegura} />
          <Route path="/verificador" component={VerificadorInconsistencias} />
          <Route path="/verificador-geral" component={VerificadorGeral} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
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
