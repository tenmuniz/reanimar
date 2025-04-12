import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shield, BookOpen, AlertCircle } from "lucide-react";
import Home from "@/pages/home";
import EscolaSegura from "@/pages/escola-segura";
import VerificadorEscalas from "@/pages/verificador-escalas";
import NotFound from "@/pages/not-found";

// Componente de navegação simplificado
function NavBar() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-blue-950 p-4 shadow-md">
      <div className="container mx-auto">
        {/* Linha superior com logo e título */}
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-full shadow mr-3">
              <Shield className="h-7 w-7 text-blue-800" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                EXTRAORDINÁRIO
              </h1>
              <div className="flex items-center">
                <span className="text-xs text-blue-200">Sistema de Gestão - GCJO</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navegação simplificada */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3">
          <Link href="/">
            <a className={`flex items-center px-4 py-2 rounded-lg ${
              location === "/" 
                ? "bg-blue-700 text-white" 
                : "bg-blue-800 text-white hover:bg-blue-700"
            }`}>
              <Shield className="h-5 w-5 mr-2" />
              <span>Polícia Mais Forte</span>
            </a>
          </Link>
          
          <Link href="/escola-segura">
            <a className={`flex items-center px-4 py-2 rounded-lg ${
              location === "/escola-segura" 
                ? "bg-purple-700 text-white" 
                : "bg-blue-800 text-white hover:bg-blue-700"
            }`}>
              <BookOpen className="h-5 w-5 mr-2" />
              <span>Escola Segura</span>
            </a>
          </Link>

          <Link href="/verificador-escalas">
            <a className={`flex items-center px-4 py-2 rounded-lg ${
              location === "/verificador-escalas" 
                ? "bg-amber-600 text-white" 
                : "bg-blue-800 text-white hover:bg-blue-700"
            }`}>
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Verificador</span>
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-blue-950 py-4 text-center text-blue-300 text-xs">
      <div className="container mx-auto px-4">
        <p className="mb-1">© {new Date().getFullYear()} - EXTRAORDINÁRIO - Sistema de Gestão de GCJO</p>
        <p>Desenvolvido pela equipe de TI</p>
      </div>
    </footer>
  );
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
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
