
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import Dashboard from "./components/professor/Dashboard";
import JoinPollPage from "./components/student/JoinPollPage";
import JoinPollWithCode from "./components/student/JoinPollWithCode";
import VotingPage from "./components/student/VotingPage";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Component to handle dynamic page titles
const PageTitleHandler = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  React.useEffect(() => {
    const titles: { [key: string]: string } = {
      '/': 'PollSync - Real-time Polling Made Easy',
      '/login': 'Login - PollSync',
      '/register': 'Register - PollSync',
      '/dashboard': 'Dashboard - PollSync',
      '/join': 'Join Poll - PollSync',
    };
    
    let title = titles[location.pathname];
    
    if (location.pathname.startsWith('/poll/')) {
      title = 'Vote - PollSync';
    }
    
    document.title = title || 'PollSync';
  }, [location.pathname]);
  
  return <>{children}</>;
};

const App = () => {
  
  React.useEffect(() => {
    const removeLovableBranding = () => {
      const lovableElements = document.querySelectorAll('[data-lovable], [class*="lovable"], [id*="lovable"]');
      lovableElements.forEach(el => el.remove());
    };
    
    // Remove on load
    removeLovableBranding();
    
    // Monitor for dynamically added elements
    const observer = new MutationObserver(removeLovableBranding);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <PageTitleHandler>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/join" element={<JoinPollPage />} />
                <Route path="/join/:code" element={<JoinPollWithCode />} />
                <Route path="/poll/:code" element={<VotingPage />} />
                <Route 
                  path="/dashboard/*" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTitleHandler>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
