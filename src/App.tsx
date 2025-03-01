
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Diary from "./pages/Diary";
import Budget from "./pages/Budget";
import Notes from "./pages/Notes";
import Calendar from "./pages/Calendar";
import Security from "./pages/Security";
import Settings from "./pages/Settings";
import { AppPinDialog } from "./components/AppPinDialog";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(true);
  
  useEffect(() => {
    // Check if user has entered the PIN for this session
    const hasEnteredPin = sessionStorage.getItem("has-entered-pin");
    if (hasEnteredPin) {
      setIsAuthenticated(true);
      setShowPinDialog(false);
    }
  }, []);

  // Handler for when PIN is successfully entered
  const handlePinSuccess = () => {
    sessionStorage.setItem("has-entered-pin", "true");
    setIsAuthenticated(true);
    setShowPinDialog(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {showPinDialog && (
              <AppPinDialog 
                onClose={() => setShowPinDialog(false)}
                onSuccess={handlePinSuccess}
              />
            )}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/diary" element={<Diary />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/security" element={<Security />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
