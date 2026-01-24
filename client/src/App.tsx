import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ListingsPage from "@/pages/listings";
import GlossaryPage from "@/pages/resources/glossary";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/listings" component={ListingsPage} />
      <Route path="/resources/glossary" component={GlossaryPage} />
      {/* 
        For the prototype, other routes will fall back to 404 
        or we can map them to the listings page with different pre-sets 
        if we wanted to go deeper.
      */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
