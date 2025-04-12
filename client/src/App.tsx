import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shield, BookOpen, Calendar, Star, Award, AlertCircle } from "lucide-react";
import Home from "@/pages/home";
import EscolaSegura from "@/pages/escola-segura";
import VerificadorEscalas from "@/pages/verificador-escalas";
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
            <a className={`group flex items-center px-5 py-3 rounded-lg transition-all duration-200 relative overflow-hidden ${
              location === "/" 
                ? "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg border border-blue-400 ring-2 ring-blue-500/50" 
                : "bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500 hover:shadow-lg"
            }`}>
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shine-effect"></div>
              
              {/* Círculo com ícone */}
              <div className={`mr-2 rounded-full p-2 transition-colors duration-200 ${
                location === "/" 
                  ? "bg-white/20 shadow-inner" 
                  : "bg-white/10 group-hover:bg-white/20"
              }`}>
                <Shield className="h-5 w-5" />
              </div>
              
              {/* Texto com efeito gradiente */}
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight drop-shadow-md">
                  POLÍCIA MAIS FORTE
                </span>
                <span className="text-xs text-blue-100">Escala PMF</span>
              </div>
              
              {/* Badge indicador de ativo */}
              {location === "/" && (
                <div className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full">
                  <Award className="h-3 w-3 text-yellow-300" />
                </div>
              )}
            </a>
          </Link>
          
          <Link href="/escola-segura">
            <a className={`group flex items-center px-5 py-3 rounded-lg transition-all duration-200 relative overflow-hidden ${
              location === "/escola-segura" 
                ? "bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white shadow-lg border border-purple-400 ring-2 ring-purple-500/50" 
                : "bg-gradient-to-r from-purple-700 to-purple-600 text-white hover:from-purple-600 hover:to-purple-500 hover:shadow-lg"
            }`}>
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shine-effect"></div>
              
              {/* Círculo com ícone */}
              <div className={`mr-2 rounded-full p-2 transition-colors duration-200 ${
                location === "/escola-segura" 
                  ? "bg-white/20 shadow-inner" 
                  : "bg-white/10 group-hover:bg-white/20"
              }`}>
                <BookOpen className="h-5 w-5" />
              </div>
              
              {/* Texto com efeito gradiente */}
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight drop-shadow-md">
                  ESCOLA SEGURA
                </span>
                <span className="text-xs text-purple-100">Escala ES</span>
              </div>
              
              {/* Badge indicador de ativo */}
              {location === "/escola-segura" && (
                <div className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full animate-pulse">
                  <Award className="h-3 w-3 text-yellow-300" />
                </div>
              )}
            </a>
          </Link>

          <Link href="/verificador-escalas">
            <a className={`group flex items-center px-5 py-3 rounded-lg transition-all duration-200 relative overflow-hidden ${
              location === "/verificador-escalas" 
                ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-lg border border-amber-300 ring-2 ring-amber-500/50" 
                : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 hover:shadow-lg"
            }`}>
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shine-effect"></div>
              
              {/* Círculo com ícone pulsante */}
              <div className={`mr-2 relative rounded-full p-2 transition-colors duration-200 ${
                location === "/verificador-escalas" 
                  ? "bg-white/20 shadow-inner" 
                  : "bg-white/10 group-hover:bg-white/20"
              }`}>
                <AlertCircle className="h-5 w-5" />
                {location === "/verificador-escalas" && (
                  <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping"></span>
                )}
              </div>
              
              {/* Texto com efeito gradiente */}
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight drop-shadow-md">
                  VERIFICADOR
                </span>
                <span className="text-xs text-amber-100">Conflitos de Escala</span>
              </div>
              
              {/* Badge indicador de ativo */}
              {location === "/verificador-escalas" && (
                <div className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-yellow-300">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
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
          <Route path="/verificador-escalas" component={VerificadorEscalas} />
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
