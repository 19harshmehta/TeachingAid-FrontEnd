import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, Users, Zap, TrendingUp, Download } from 'lucide-react';

// Define the interface for the props this component will receive
interface LandingPageProps {
  installPrompt: Event | null;
  onInstall: () => void;
}

const LandingPage = ({ installPrompt, onInstall }: LandingPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-main relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 rounded-full animate-bounce-gentle"></div>
        <div className="absolute top-40 -left-20 w-60 h-60 bg-pink-300/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-300/20 rounded-full animate-bounce-gentle"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-16 animate-fade-in gap-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              PollSync
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Conditional Install Button - It will only show if installPrompt is available */}
            {installPrompt && (
              <Button 
                variant="outline" 
                onClick={onInstall}
                className="hidden sm:flex bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300"
            >
              Login to Create Poll
            </Button>
          </div>
        </header>

        {/* The rest of your landing page content remains the same */}
        <div className="text-center mb-20 animate-slide-up">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Create polls.<br />Get real-time answers.<br /><span className="text-violet-600">Instantly.</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto px-4">
            Engage your audience with interactive polls and see results update in real-time. 
            Perfect for classrooms, presentations, and events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Login to Create Poll
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/join')}
              className="w-full sm:w-auto bg-white/70 backdrop-blur-sm hover:bg-white/90 border-purple-200 text-purple-700 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Join a Poll
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
