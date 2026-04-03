import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GlobalNav } from "@/components/layout/GlobalNav";
import Index from "./pages/Index";
import Leaderboard from "./pages/Leaderboard";
import PMDashboard from "./pages/PMDashboard";
import PropertyList from "./pages/PropertyList";
import RenewalTracker from "./pages/RenewalTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/pm/:pmId" element={<PMDashboard />} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/renewals" element={<RenewalTracker />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GlobalNav />
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
