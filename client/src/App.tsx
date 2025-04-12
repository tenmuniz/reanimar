import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shield, BookOpen, Calendar, ArrowUp, Award, AlertCircle, BarChart4, Bell, ChevronRight, User, Activity } from "lucide-react";
import Home from "@/pages/home";
import EscolaSegura from "@/pages/escola-segura";
import VerificadorEscalas from "@/pages/verificador-escalas";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

// Componente de navegação
function NavBar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  // Detectar scroll para efeito de navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? "bg-white/95 backdrop-blur-md shadow-md" 
        : "bg-white/50 backdrop-blur-sm"
    }`}>
      <div className="container mx-auto">
        {/* Barra superior com logomark e informações de usuário */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-md relative">
              <Shield className="h-6 w-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800 leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  EXTRAORDINÁRIO
                </span>
              </h1>
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-500">Sistema Integrado de Gestão - GCJO</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            {/* Status do sistema */}
            <div className="hidden md:flex items-center px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
              <Activity className="h-3.5 w-3.5 text-green-500 mr-1.5" />
              <span className="text-xs font-medium text-green-700">Sistema operacional</span>
            </div>
            
            {/* Notificações */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Data atual */}
            <div className="hidden lg:flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700 font-medium">
                {new Date().toLocaleDateString('pt-BR', {weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'})}
              </span>
            </div>
            
            {/* Menu de usuário */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-sm">
                CM
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">Cmdt. Silva</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Navegação principal */}
        <nav className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-1">
            <Link href="/">
              <a className={`group flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                location === "/" 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}>
                <div className={`mr-2 rounded-lg p-1.5 transition-colors duration-200 ${
                  location === "/" 
                    ? "bg-blue-100" 
                    : "bg-gray-100 group-hover:bg-blue-50"
                }`}>
                  <Shield className={`h-4 w-4 ${location === "/" ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`} />
                </div>
                <span className={`text-sm font-medium ${location === "/" ? "font-semibold" : ""}`}>Polícia Mais Forte</span>
              </a>
            </Link>
            
            <Link href="/escola-segura">
              <a className={`group flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                location === "/escola-segura" 
                  ? "bg-purple-50 text-purple-700" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}>
                <div className={`mr-2 rounded-lg p-1.5 transition-colors duration-200 ${
                  location === "/escola-segura" 
                    ? "bg-purple-100" 
                    : "bg-gray-100 group-hover:bg-purple-50"
                }`}>
                  <BookOpen className={`h-4 w-4 ${location === "/escola-segura" ? "text-purple-600" : "text-gray-500 group-hover:text-purple-600"}`} />
                </div>
                <span className={`text-sm font-medium ${location === "/escola-segura" ? "font-semibold" : ""}`}>Escola Segura</span>
              </a>
            </Link>
            
            <Link href="/verificador-escalas">
              <a className={`group flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                location === "/verificador-escalas" 
                  ? "bg-amber-50 text-amber-700" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}>
                <div className={`mr-2 rounded-lg p-1.5 transition-colors duration-200 ${
                  location === "/verificador-escalas" 
                    ? "bg-amber-100" 
                    : "bg-gray-100 group-hover:bg-amber-50"
                }`}>
                  <AlertCircle className={`h-4 w-4 ${location === "/verificador-escalas" ? "text-amber-600" : "text-gray-500 group-hover:text-amber-600"}`} />
                </div>
                <span className={`text-sm font-medium ${location === "/verificador-escalas" ? "font-semibold" : ""}`}>Verificador</span>
                {location === "/verificador-escalas" && (
                  <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                    Ativo
                  </span>
                )}
              </a>
            </Link>
          </div>
          
          {/* Links adicionais */}
          <div className="flex items-center space-x-1">
            <a href="#" className="group flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50">
              <div className="mr-2 rounded-lg p-1.5 bg-gray-100 group-hover:bg-green-50">
                <BarChart4 className="h-4 w-4 text-gray-500 group-hover:text-green-600" />
              </div>
              <span className="text-sm font-medium">Estatísticas</span>
            </a>
            
            <a href="#" className="group flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50">
              <div className="mr-2 rounded-lg p-1.5 bg-gray-100 group-hover:bg-indigo-50">
                <User className="h-4 w-4 text-gray-500 group-hover:text-indigo-600" />
              </div>
              <span className="text-sm font-medium">Militares</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-sm mr-2">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800">EXTRAORDINÁRIO</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Sistema de Gestão de GCJO</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">Documentação</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">Suporte</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">Política de Privacidade</a>
          </div>
          
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} - Todos os direitos reservados</p>
            <p className="text-xs text-gray-500 mt-1">v1.0.2 - Atualizado em 12/04/2025</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Botão de voltar ao topo
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  return visible ? (
    <button 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed right-5 bottom-5 z-50 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"
      aria-label="Voltar ao topo"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  ) : null;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/escola-segura" component={EscolaSegura} />
          <Route path="/verificador-escalas" component={VerificadorEscalas} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <ScrollToTop />
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
