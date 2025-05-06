import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shield, BookOpen, Calendar, ArrowUp, AlertCircle, BarChart4, User, Database, Users, Settings } from "lucide-react";
import brasaoCipm from "./assets/brasao-cipm.jpg";
import Home from "@/pages/home";
import EscolaSegura from "@/pages/escola-segura";
import VerificadorEscalas from "@/pages/verificador-escalas";
import Relatorios from "@/pages/relatorios";
import Escala from "@/pages/escala";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import ConflictCounter from "@/components/calendar/ConflictCounter";
import ConflictBadge from "@/components/calendar/ConflictBadge";
import WebSocketStatus from "@/components/WebSocketStatus";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Componente de navegação
function NavBar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header className="bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl sticky top-0 z-50 w-full transition-all duration-300">
      <div className="container mx-auto">
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
              <h1 className="text-2xl font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
                EXTRAORDINÁRIO
              </h1>
              <span className="text-xs font-medium text-blue-200">Sistema de Gestão - 20ªCIPM</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ConflictCounter />
            <div className="hidden lg:flex items-center bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl rounded-lg px-3 py-1.5">
              <Calendar className="h-4 w-4 text-blue-200 mr-2" />
              <span className="text-sm text-white font-medium">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex mr-2 items-center justify-center w-8 h-8 rounded-md bg-blue-700/80 shadow-sm">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-white">Cap. Muniz</div>
                <div className="text-xs text-blue-200">admin</div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-1">
            <NavLink href="/" icon={<Shield />} text="Polícia Mais Forte" active={location === "/"} />
            <NavLink href="/escola-segura" icon={<BookOpen />} text="Escola Segura" active={location === "/escola-segura"} />
            <NavLink href="/escala" icon={<Users />} text="Escala" active={location === "/escala"} />
            <NavLink href="/verificador-escalas" icon={<AlertCircle />} text="Verificador" active={location === "/verificador-escalas"}>
              <ConflictBadge className="z-10" />
            </NavLink>
            <NavLink href="/relatorios" icon={<BarChart4 />} text="Relatórios" active={location === "/relatorios"} />
            <NavLink href="/admin" icon={<Settings />} text="Admin" active={location === "/admin"} />
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, icon, text, active, children }: any) {
  return (
    <a href={href} className={`group flex items-center px-4 py-2 rounded-xl transition-all duration-300 ease-in-out
      ${active ? "bg-blue-700/80" : "bg-white/10 hover:bg-white/20"} 
      text-white shadow-md border border-white/10 backdrop-blur-sm`}>
      <div className="mr-2 p-1.5 rounded-lg bg-blue-400/30 backdrop-blur-md">{icon}</div>
      <span className="text-sm font-medium drop-shadow-md">{text}</span>
      {active && <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-medium border border-white/30">Ativo</span>}
      {children}
    </a>
  );
}

function Footer() {
  const [location] = useLocation();
  const isEscolaSegura = location === "/escola-segura";

  return (
    <footer className="bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl py-6 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <img src={brasaoCipm} alt="Brasão da 20ª CIPM" className="h-8 w-auto rounded-lg mr-2" />
          <span className="text-lg font-bold text-white">EXTRAORDINÁRIO</span>
        </div>
        <p className="text-sm text-blue-200 text-center md:text-right">
          © {new Date().getFullYear()} - Todos os direitos reservados • Sistema de Gestão - 20ª CIPM
        </p>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.pageYOffset > 300);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  if (!visible) return null;

  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed right-5 bottom-5 z-50 p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 backdrop-blur-md border border-white/20"
      aria-label="Voltar ao topo">
      <ArrowUp className="h-5 w-5 drop-shadow-md" />
    </button>
  );
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-[#0a2f6b] via-[#143d8a] to-[#1e3a8a]">
      <NavBar />
      <main className="flex-grow container mx-auto px-4 py-6 text-white">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/escola-segura" component={EscolaSegura} />
          <Route path="/escala" component={Escala} />
          <Route path="/verificador-escalas" component={VerificadorEscalas} />
          <Route path="/relatorios" component={Relatorios} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <ScrollToTop />
      <WebSocketStatus />
    </div>
  );
}

function App() {
  const { toast } = useToast();

  useEffect(() => {
    const shown = localStorage.getItem("syncNotificationShown");
    if (!shown) {
      setTimeout(() => {
        toast({
          title: "Sincronização com PostgreSQL ativada!",
          description: "Suas escalas agora estão armazenadas de forma segura em banco de dados e podem ser acessadas de qualquer dispositivo.",
          duration: 8000,
        });
        localStorage.setItem("syncNotificationShown", "true");
      }, 1500);
    }
  }, [toast]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
