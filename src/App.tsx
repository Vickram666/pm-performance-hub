import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { RoleProvider, useRole, ROLE_META } from "@/context/RoleContext";
import { ScopeProvider } from "@/context/ScopeContext";
import Index from "./pages/Index";
import Leaderboard from "./pages/Leaderboard";
import PMDashboard from "./pages/PMDashboard";
import PropertyList from "./pages/PropertyList";
import RenewalTracker from "./pages/RenewalTracker";
import PMCommand from "./pages/acc/PMCommand";
import TLWarRoom from "./pages/acc/TLWarRoom";
import CityStrategic from "./pages/acc/CityStrategic";
import LeadershipSnapshot from "./pages/acc/LeadershipSnapshot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RoleHome() {
  const { role } = useRole();
  return <Navigate to={ROLE_META[role].home} replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      {/* Key on pathname only (not search) so scope drills don't remount the page. */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RoleHome />} />
        <Route path="/pm" element={<PMCommand />} />
        <Route path="/tl" element={<TLWarRoom />} />
        <Route path="/city" element={<CityStrategic />} />
        <Route path="/leadership" element={<LeadershipSnapshot />} />
        <Route path="/score" element={<Index />} />
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
        <RoleProvider>
          <ScopeProvider>
            <GlobalNav />
            <AnimatedRoutes />
          </ScopeProvider>
        </RoleProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
