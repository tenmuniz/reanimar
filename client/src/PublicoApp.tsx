import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import VisualizacaoPublica from "@/pages/visualizacao-publica";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={VisualizacaoPublica} />
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