import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shield, BookOpen, Calendar, ArrowUp, Award, AlertCircle, BarChart4, Bell, ChevronRight, User, Activity, Users, Clock, FileCheck } from "lucide-react";
import brasaoCipm from "./assets/brasao-cipm.jpg";
import Home from "@/pages/home";
import EscolaSegura from "@/pages/escola-segura";
import VerificadorEscalas from "@/pages/verificador-escalas";
import Relatorios from "@/pages/relatorios";
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
            <div className="p-0.5 rounded-xl shadow-md relative flex items-center justify-center">
              <img src={brasaoCipm} alt="Brasão da 20ª CIPM" className="h-10 w-auto rounded-xl" />
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
                <span className="text-xs font-medium text-gray-500">Sistema de Gestão - 20ªCIPM</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Estatísticas rápidas */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center px-3 py-1.5 bg-blue-50 rounded-l-full border border-blue-100">
                <Users className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                <span className="text-xs font-medium text-blue-700">GCJO: 48</span>
              </div>
              
              <div className="flex items-center px-3 py-1.5 bg-purple-50 rounded-r-full border-t border-r border-b border-purple-100">
                <Shield className="h-3.5 w-3.5 text-purple-500 mr-1.5" />
                <span className="text-xs font-medium text-purple-700">16 guarniçoes</span>
              </div>
            </div>
            
            {/* Data atual */}
            <div className="hidden lg:flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700 font-medium">
                {new Date().toLocaleDateString('pt-BR', {weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'})}
              </span>
            </div>
          </div>
        </div>
        
        {/* Navegação principal */}
        <nav className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-1">
            <Link href="/">
              <a className={`group flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                location === "/" 
                  ? "bg-gradient-to-r from-blue-500/10 to-blue-600/20 text-blue-700 border border-blue-200 shadow-lg shadow-blue-200/30" 
                  : "text-gray-700 hover:bg-gray-50 hover:shadow-md"
              }`}>
                <div className={`mr-2 rounded-lg p-1.5 transition-colors duration-200 ${
                  location === "/" 
                    ? "bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-400/30" 
                    : "bg-gray-100 group-hover:bg-blue-500 group-hover:shadow-md"
                }`}>
                  <Shield className={`h-4 w-4 ${location === "/" ? "text-white" : "text-gray-500 group-hover:text-white"}`} />
                </div>
                <span className={`text-sm font-medium ${location === "/" ? "font-semibold" : ""}`}>Polícia Mais Forte</span>
              </a>
            </Link>
            
            <Link href="/escola-segura">
              <a className={`group flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                location === "/escola-segura" 
                  ? "bg-gradient-to-r from-purple-500/10 to-purple-600/20 text-purple-700 border border-purple-200 shadow-lg shadow-purple-200/30" 
                  : "text-gray-700 hover:bg-gray-50 hover:shadow-md"
              }`}>
                <div className={`mr-2 rounded-lg p-1.5 transition-colors duration-200 ${
                  location === "/escola-segura" 
                    ? "bg-gradient-to-br from-purple-500 to-purple-700 shadow-md shadow-purple-400/30" 
                    : "bg-gray-100 group-hover:bg-purple-500 group-hover:shadow-md"
                }`}>
                  <BookOpen className={`h-4 w-4 ${location === "/escola-segura" ? "text-white" : "text-gray-500 group-hover:text-white"}`} />
                </div>
                <span className={`text-sm font-medium ${location === "/escola-segura" ? "font-semibold" : ""}`}>Escola Segura</span>
              </a>
            </Link>
            
            <Link href="/verificador-escalas">
              <a className={`group flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                location === "/verificador-escalas" 
                  ? "bg-gradient-to-r from-amber-500/10 to-amber-600/20 text-amber-700 border border-amber-200 shadow-lg shadow-amber-200/30" 
                  : "text-gray-700 hover:bg-gray-50 hover:shadow-md"
              }`}>
                <div className={`mr-2 rounded-lg p-1.5 transition-colors duration-200 ${
                  location === "/verificador-escalas" 
                    ? "bg-gradient-to-br from-amber-500 to-amber-600 shadow-md shadow-amber-400/30" 
                    : "bg-gray-100 group-hover:bg-amber-500 group-hover:shadow-md"
                }`}>
                  <AlertCircle className={`h-4 w-4 ${location === "/verificador-escalas" ? "text-white" : "text-gray-500 group-hover:text-white"}`} />
                </div>
                <span className={`text-sm font-medium ${location === "/verificador-escalas" ? "font-semibold" : ""}`}>Verificador</span>
                {location === "/verificador-escalas" && (
                  <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs shadow-sm font-medium border border-amber-200">
                    Ativo
                  </span>
                )}
              </a>
            </Link>
          </div>
          
          {/* Links adicionais */}
          <div className="flex items-center space-x-1">
            <Link href="/relatorios">
              <a className={`group flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                location === "/relatorios" 
                  ? "bg-gradient-to-r from-green-500/10 to-green-600/20 text-green-700 border border-green-200 shadow-lg shadow-green-200/30" 
                  : "text-gray-700 hover:bg-green-50/60 hover:shadow-md hover:border hover:border-green-100"
              }`}>
                <div className={`mr-2 rounded-lg p-1.5 transition-colors duration-200 ${
                  location === "/relatorios" 
                    ? "bg-gradient-to-br from-green-500 to-green-700 shadow-md shadow-green-400/30" 
                    : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-green-500 group-hover:to-green-600 group-hover:shadow-md group-hover:shadow-green-400/20"
                }`}>
                  <BarChart4 className={`h-4 w-4 ${location === "/relatorios" ? "text-white" : "text-gray-500 group-hover:text-white"}`} />
                </div>
                <span className={`text-sm font-medium ${location === "/relatorios" ? "font-semibold" : ""}`}>Relatórios</span>
              </a>
            </Link>
            
            <a href="#" className="group flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-gray-700 hover:bg-indigo-50/60 hover:shadow-md hover:border hover:border-indigo-100">
              <div className="mr-2 rounded-lg p-1.5 bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-indigo-600 group-hover:shadow-md group-hover:shadow-indigo-400/20">
                <FileCheck className="h-4 w-4 text-gray-500 group-hover:text-white" />
              </div>
              <span className="text-sm font-medium">Exportar PDF</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const [location] = useLocation();
  const isEscolaSegura = location === "/escola-segura";
  
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="p-0.5 rounded-lg shadow-lg mr-2">
                <img src={brasaoCipm} alt="Brasão da 20ª CIPM" className="h-8 w-auto rounded-lg" />
              </div>
              <span className="text-lg font-bold text-gray-800">EXTRAORDINÁRIO</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Sistema de Gestão - 20ªCIPM</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className={`text-gray-600 transition-colors hover:${isEscolaSegura ? "text-purple-600" : "text-blue-600"} text-sm font-medium`}>Documentação</a>
            <a href="#" className={`text-gray-600 transition-colors hover:${isEscolaSegura ? "text-purple-600" : "text-blue-600"} text-sm font-medium`}>Suporte</a>
            <a href="#" className={`text-gray-600 transition-colors hover:${isEscolaSegura ? "text-purple-600" : "text-blue-600"} text-sm font-medium`}>Política de Privacidade</a>
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
  
  const [location] = useLocation();
  const isEscolaSegura = location === "/escola-segura";

  return visible ? (
    <button 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed right-5 bottom-5 z-50 p-2.5 rounded-full ${
        isEscolaSegura 
          ? "bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800" 
          : "bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
      } text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110`}
      aria-label="Voltar ao topo"
    >
      <ArrowUp className="h-5 w-5 drop-shadow-sm" />
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
          <Route path="/relatorios" component={Relatorios} />
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
