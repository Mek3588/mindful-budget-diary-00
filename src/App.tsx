
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Diary from "./pages/Diary";
import Budget from "./pages/Budget";
import Notes from "./pages/Notes";
import Calendar from "./pages/Calendar";
import Security from "./pages/Security";
import Settings from "./pages/Settings";
import Goals from "./pages/Goals";
import { AppPinDialog } from "./components/AppPinDialog";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// Helper component to check PIN for each route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(true);
  const location = useLocation();
  const currentRoute = location.pathname.substring(1) || "index";
  
  useEffect(() => {
    // Check if user has entered the main PIN for this session
    const hasEnteredPin = sessionStorage.getItem("has-entered-pin");
    
    // Check if this route is protected
    const protectedRoutes = JSON.parse(localStorage.getItem("protected-routes") || "[]");
    const needsAuth = !hasEnteredPin || protectedRoutes.includes(currentRoute);
    
    setIsAuthenticated(!needsAuth);
    setShowPinDialog(needsAuth);
  }, [currentRoute]);

  // Handler for when PIN is successfully entered
  const handlePinSuccess = () => {
    setIsAuthenticated(true);
    setShowPinDialog(false);
  };

  return (
    <>
      {showPinDialog && (
        <AppPinDialog 
          onSuccess={handlePinSuccess}
          route={currentRoute}
        />
      )}
      {children}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/security" element={<Security />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ProtectedRoute>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
