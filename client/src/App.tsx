import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shield } from "lucide-react";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// Componente de navegação
function NavBar() {
  // Não precisamos mais verificar a localização já que temos apenas uma rota
  
  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="text-white font-bold text-xl">Escala PMF</div>
        
        <div className="flex space-x-1">
          <Link href="/">
            <a className="px-4 py-2 rounded-lg flex items-center text-sm bg-blue-700 text-white">
              <Shield className="mr-1 h-4 w-4" />
              <span>Polícia Mais Forte</span>
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
