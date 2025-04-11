import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Visualizacao from "@/pages/visualizacao-publica";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 shadow-md">
        <div className="container mx-auto flex flex-wrap items-center justify-center">
          <div className="text-white font-bold text-xl">20ª CIPM - Visualização de Escalas</div>
        </div>
      </div>
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Visualizacao} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function PublicoApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default PublicoApp;