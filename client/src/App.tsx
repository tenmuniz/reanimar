import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shield, BookOpen } from "lucide-react";
import Home from "@/pages/home";
import EscolaSegura from "@/pages/escola-segura";
import NotFound from "@/pages/not-found";

// Componente de navegação
function NavBar() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="text-white font-bold text-xl">Escala PMF</div>
        
        <div className="flex space-x-1">
          <Link href="/">
            <a className={`px-4 py-2 rounded-lg flex items-center text-sm ${
              location === "/" 
                ? "bg-blue-700 text-white" 
                : "text-blue-100 hover:bg-blue-700/50"
            }`}>
              <Shield className="mr-1 h-4 w-4" />
              <span>PMF</span>
            </a>
          </Link>
          
          <Link href="/escola-segura">
            <a className={`px-4 py-2 rounded-lg flex items-center text-sm ${
              location === "/escola-segura" 
                ? "bg-green-700 text-white" 
                : "text-blue-100 hover:bg-green-700/50"
            }`}>
              <BookOpen className="mr-1 h-4 w-4" />
              <span>Escola Segura</span>
            </a>
          </Link>
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
