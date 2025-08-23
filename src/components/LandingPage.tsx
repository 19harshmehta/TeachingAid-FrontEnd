
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, Users, Zap, TrendingUp, Download } from 'lucide-react';

const LandingPage = () => {
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
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-16 animate-fade-in gap-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              PollSync
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            {/* Mobile App Download Button - Only visible on mobile */}
            <Button 
              id="install-button"
              variant="outline" 
              className="sm:hidden bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Mobile App
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300"
            >
              Login to Create Poll
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-20 animate-slide-up">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Create polls.
            <br />
            Get real-time answers.
            <br />
            <span className="text-violet-600">Instantly.</span>
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

        {/* Features Grid */}
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
          <Card className="p-6 sm:p-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Real-time Results</h3>
              <p className="text-gray-600">
                Watch votes pour in live with beautiful animated charts that update instantly.
              </p>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Easy Participation</h3>
              <p className="text-gray-600">
                Users join with simple poll codes. No accounts needed, just instant participation.
              </p>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Smart Analytics</h3>
              <p className="text-gray-600">
                Get insights with beautiful visualizations and track engagement patterns.
              </p>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/50 backdrop-blur-sm rounded-3xl p-8 sm:p-12 mx-4 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ready to engage your audience?
          </h2>
          <p className="text-gray-700 mb-8 text-base sm:text-lg">
            Join thousands of users already using PollSync to make their sessions more interactive.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
