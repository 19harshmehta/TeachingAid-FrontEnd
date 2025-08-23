import React, { useState, useEffect } from 'react';
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

// This interface helps TypeScript understand the special 'beforeinstallprompt' event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PageTitleHandler = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  React.useEffect(() => {
    // This part of your code remains unchanged
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
  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setInstallPrompt(null);
  };
  
  // This part of your code for removing branding remains unchanged
  React.useEffect(() => {
    const removeLovableBranding = () => {
      const lovableElements = document.querySelectorAll('[data-lovable], [class*="lovable"], [id*="lovable"]');
      lovableElements.forEach(el => el.remove());
    };
    removeLovableBranding();
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
                {/* This Route now correctly passes props to the Index component */}
                <Route 
                  path="/" 
                  element={<Index installPrompt={installPrompt} onInstall={handleInstallClick} />} 
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/join" element={<JoinPollPage />} />
                <Route path="/join/:code" element={<JoinPollWithCode />} />
                <Route path="/poll/:code" element={<VotingPage />} />
                <Route 
                  path="/dashboard" 
                  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
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
