import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shield, BookOpen, Calendar, ArrowUp, Award, AlertCircle, BarChart4, Bell, ChevronRight, User, Activity, Users, Clock, Database, Cloud, CheckCircle, LogOut } from "lucide-react";
import brasaoCipm from "./assets/brasao-cipm.jpg";
import Home from "@/pages/home";
import EscolaSegura from "@/pages/escola-segura";
import VerificadorEscalas from "@/pages/verificador-escalas";
import Relatorios from "@/pages/relatorios";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ConflictCounter from "@/components/calendar/ConflictCounter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Componente de navegação
function NavBar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { user, logoutMutation } = useAuth();
  
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
    <header className="bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl sticky top-0 z-50 w-full transition-all duration-300">
      <div className="container mx-auto">
        {/* Barra superior com logomark e informações de usuário */}
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl p-0.5 rounded-xl relative flex items-center justify-center">
              <img src={brasaoCipm} alt="Brasão da 20ª CIPM" className="h-10 w-auto rounded-xl" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
                  EXTRAORDINÁRIO
                </span>
              </h1>
              <div className="flex items-center">
                <span className="text-xs font-medium text-blue-200">Sistema de Gestão - 20ªCIPM</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Contador de conflitos */}
            <ConflictCounter />
            
            {/* Data atual */}
            <div className="hidden lg:flex items-center bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl rounded-lg px-3 py-1.5">
              <Calendar className="h-4 w-4 text-blue-200 mr-2" />
              <span className="text-sm text-white font-medium">
                {new Date().toLocaleDateString('pt-BR', {weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'})}
              </span>
            </div>
            
            {/* Informações do usuário e botão de logout - Design mais discreto */}
            <div className="flex items-center gap-2">
              {/* Badge do usuário com design compacto */}
              <div className="flex items-center">
                {/* Avatar simples */}
                <div className="hidden md:flex mr-2 items-center justify-center w-8 h-8 rounded-md bg-blue-700/80 shadow-sm">
                  <User className="h-4 w-4 text-white" />
                  
                  {/* Pequeno indicador de status */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                
                {/* Informações do usuário mais compactas */}
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-white">
                    {user?.name || 'Cap. Muniz'}
                  </div>
                  
                  <div className="text-xs text-blue-200">
                    {user?.role || 'admin'}
                  </div>
                </div>
              </div>
              
              {/* Botão de logout simples */}
              <button 
                onClick={() => logoutMutation.mutate()}
                className="flex items-center gap-1 bg-blue-700/60 px-3 py-1.5 rounded-md hover:bg-blue-600/80 transition-colors text-white text-sm"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Navegação principal */}
        <nav className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-1">
            <Link href="/">
              <a className="group flex items-center px-4 py-2 rounded-xl transition-all duration-300 ease-in-out 
                          bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white shadow-lg shadow-blue-500/30 
                          scale-100 hover:scale-[1.02] active:scale-[0.98] 
                          border border-blue-400/30 backdrop-blur-sm">
                <div className="mr-2 p-1.5 rounded-lg bg-blue-400/30 backdrop-blur-md">
                  <Shield className="h-4 w-4 text-white drop-shadow-md" />
                </div>
                <span className="text-sm font-medium drop-shadow-md">Polícia Mais Forte</span>
                {location === "/" && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 backdrop-blur-lg rounded-full text-xs font-medium border border-white/30 shadow-inner">
                    Ativo
                  </span>
                )}
              </a>
            </Link>
            
            <Link href="/escola-segura">
              <a className="group flex items-center px-4 py-2 rounded-xl transition-all duration-300 ease-in-out 
                          bg-gradient-to-br from-[#9333ea] to-[#7e22ce] text-white shadow-lg shadow-purple-500/30 
                          scale-100 hover:scale-[1.02] active:scale-[0.98] 
                          border border-purple-400/30 backdrop-blur-sm">
                <div className="mr-2 p-1.5 rounded-lg bg-purple-400/30 backdrop-blur-md">
                  <BookOpen className="h-4 w-4 text-white drop-shadow-md" />
                </div>
                <span className="text-sm font-medium drop-shadow-md">Escola Segura</span>
                {location === "/escola-segura" && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 backdrop-blur-lg rounded-full text-xs font-medium border border-white/30 shadow-inner">
                    Ativo
                  </span>
                )}
              </a>
            </Link>
            
            <Link href="/verificador-escalas">
              <a className="group flex items-center px-4 py-2 rounded-xl transition-all duration-300 ease-in-out 
                          bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white shadow-lg shadow-amber-500/30 
                          scale-100 hover:scale-[1.02] active:scale-[0.98] 
                          border border-amber-400/30 backdrop-blur-sm">
                <div className="mr-2 p-1.5 rounded-lg bg-amber-400/30 backdrop-blur-md">
                  <AlertCircle className="h-4 w-4 text-white drop-shadow-md" />
                </div>
                <span className="text-sm font-medium drop-shadow-md">Verificador</span>
                {location === "/verificador-escalas" && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 backdrop-blur-lg rounded-full text-xs font-medium border border-white/30 shadow-inner">
                    Ativo
                  </span>
                )}
              </a>
            </Link>
          </div>
          
          {/* Links adicionais */}
          <div className="flex items-center space-x-1">
            <Link href="/relatorios">
              <a className="group flex items-center px-4 py-2 rounded-xl transition-all duration-300 ease-in-out 
                          bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-lg shadow-green-500/30 
                          scale-100 hover:scale-[1.02] active:scale-[0.98] 
                          border border-green-400/30 backdrop-blur-sm">
                <div className="mr-2 p-1.5 rounded-lg bg-green-400/30 backdrop-blur-md">
                  <BarChart4 className="h-4 w-4 text-white drop-shadow-md" />
                </div>
                <span className="text-sm font-medium drop-shadow-md">Relatórios</span>
                {location === "/relatorios" && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 backdrop-blur-lg rounded-full text-xs font-medium border border-white/30 shadow-inner">
                    Ativo
                  </span>
                )}
              </a>
            </Link>
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
    <footer className="bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="p-0.5 rounded-lg bg-white/10 shadow-lg mr-2">
                <img src={brasaoCipm} alt="Brasão da 20ª CIPM" className="h-8 w-auto rounded-lg" />
              </div>
              <span className="text-lg font-bold text-white">EXTRAORDINÁRIO</span>
            </div>
            <p className="text-sm text-blue-200 mt-1">Sistema de Gestão - 20ªCIPM</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className={`text-blue-100 transition-colors hover:${isEscolaSegura ? "text-purple-200" : "text-blue-50"} text-sm font-medium`}>Documentação</a>
            <a href="#" className={`text-blue-100 transition-colors hover:${isEscolaSegura ? "text-purple-200" : "text-blue-50"} text-sm font-medium`}>Suporte</a>
            <a href="#" className={`text-blue-100 transition-colors hover:${isEscolaSegura ? "text-purple-200" : "text-blue-50"} text-sm font-medium`}>Política de Privacidade</a>
          </div>
          
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-sm text-blue-100">© {new Date().getFullYear()} - Todos os direitos reservados</p>
            <p className="text-xs text-blue-200 mt-1 flex items-center justify-end">
              <span className="mr-1">v1.1.0</span>
              <span className="bg-gradient-to-r from-green-700 to-blue-700 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center border border-blue-400/20 shadow-inner">
                <div className="relative mr-1">
                  <Database className="h-3 w-3 text-white" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <span>PostgreSQL</span>
              </span>
              <span className="ml-1">- Atualizado em 14/04/2025</span>
            </p>
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
      className={`fixed right-5 bottom-5 z-50 p-3 rounded-full ${
        isEscolaSegura 
          ? "bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800" 
          : "bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
      } text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 backdrop-blur-md border border-white/20`}
      aria-label="Voltar ao topo"
    >
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div className="absolute top-1/2 left-0 right-0 h-12 bg-white/10 blur-md transform -translate-y-1/2"></div>
      </div>
      <ArrowUp className="h-5 w-5 drop-shadow-md relative z-10" />
    </button>
  ) : null;
}

function Router() {
  const [showSyncBanner, setShowSyncBanner] = useState(true);
  const { user } = useAuth();
  
  // Ocultar banner após alguns segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSyncBanner(false);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-[#0a2f6b] via-[#143d8a] to-[#1e3a8a]">
      {showSyncBanner && user && (
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 text-center text-sm font-medium relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-sm">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white rounded-full"></div>
              <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white rounded-full"></div>
              <div className="absolute bottom-1/4 right-1/4 w-5 h-5 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-3 relative">
            <div className="flex items-center justify-center bg-white/20 rounded-full p-1 shadow-inner">
              <Database className="h-4 w-4 drop-shadow-md" />
            </div>
            <p className="font-medium text-sm drop-shadow-md">Nova funcionalidade: Sincronização em tempo real com PostgreSQL</p>
            <button 
              onClick={() => setShowSyncBanner(false)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 rounded-full p-1 hover:bg-white/30 transition-all duration-200 shadow-inner"
              aria-label="Fechar notificação"
            >
              <span className="sr-only">Fechar</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      {user && <NavBar />}
      <main className="flex-grow container mx-auto px-4 py-6 text-white">
        <Switch>
          <ProtectedRoute path="/" component={Home} />
          <ProtectedRoute path="/escola-segura" component={EscolaSegura} />
          <ProtectedRoute path="/verificador-escalas" component={VerificadorEscalas} />
          <ProtectedRoute path="/relatorios" component={Relatorios} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {user && <Footer />}
      <ScrollToTop />
    </div>
  );
}

function App() {
  const { toast } = useToast();
  
  // Mostrar notificação de persistência de dados ao iniciar
  useEffect(() => {
    const syncNotificationShown = localStorage.getItem('syncNotificationShown');
    
    if (!syncNotificationShown) {
      setTimeout(() => {
        toast({
          title: "Sincronização com PostgreSQL ativada!",
          description: "Suas escalas agora estão armazenadas de forma segura em banco de dados e podem ser acessadas de qualquer dispositivo.",
          duration: 8000,
          variant: "default",
          action: (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-medium shadow-md">
              <div className="flex items-center bg-white/20 p-1 rounded-full">
                <Database className="h-3.5 w-3.5 text-blue-100" />
              </div>
              <span className="text-sm">Persistência habilitada</span>
            </div>
          )
        });
        
        // Marcar como visualizada
        localStorage.setItem('syncNotificationShown', 'true');
      }, 1500);
    }
  }, [toast]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
