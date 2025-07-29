
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, BarChart3, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { pollAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Poll {
  _id: string;
  question: string;
  options: string[];
  code: string;
  isActive: boolean;
  createdAt: string;
  votes: number[];
}

interface LivePollViewProps {
  poll: Poll;
  onBack: () => void;
  onPollUpdated: (poll: Poll) => void;
}

const LivePollView: React.FC<LivePollViewProps> = ({ poll, onBack, onPollUpdated }) => {
  const [currentPoll, setCurrentPoll] = useState<Poll>(poll);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      onBack();
    };

    // Push a new state when this component mounts
    window.history.pushState({ page: 'livePoll' }, '', window.location.pathname);
    
    // Listen for back button
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack]);

  const refreshPoll = async () => {
    setLoading(true);
    try {
      const response = await pollAPI.getPollByCode(currentPoll.code);
      const updatedPoll = response.data;
      setCurrentPoll(updatedPoll);
      onPollUpdated(updatedPoll);
    } catch (error) {
      console.error('Error refreshing poll:', error);
      toast({
        title: "Error",
        description: "Failed to refresh poll data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const closePoll = async () => {
    try {
      await pollAPI.closePoll(currentPoll.code);
      const updatedPoll = { ...currentPoll, isActive: false };
      setCurrentPoll(updatedPoll);
      onPollUpdated(updatedPoll);
      toast({
        title: "Poll Closed",
        description: "Poll has been closed successfully",
      });
    } catch (error) {
      console.error('Error closing poll:', error);
      toast({
        title: "Error",
        description: "Failed to close poll",
        variant: "destructive",
      });
    }
  };

  const totalVotes = currentPoll.votes.reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white/70 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Live Poll: {currentPoll.code}
              </h1>
              <p className="text-gray-600">{currentPoll.question}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={refreshPoll}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {currentPoll.isActive && (
              <Button
                onClick={closePoll}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Close Poll
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="text-3xl font-bold text-gray-800">{totalVotes}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`text-lg font-semibold ${currentPoll.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {currentPoll.isActive ? 'Active' : 'Closed'}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Live Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentPoll.options.map((option, index) => {
                const votes = currentPoll.votes[index] || 0;
                const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{option}</span>
                      <span className="text-sm text-gray-600">
                        {votes} votes ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LivePollView;
