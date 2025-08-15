
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { pollAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, BarChart3, X, Eye, EyeOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { io, Socket } from 'socket.io-client';

interface Poll {
  _id: string;
  question: string;
  topic: string;
  options: string[];
  code: string;
  isActive: boolean;
  votes: number[];
  allowMultiple?: boolean;
  createdAt: string;
}

interface LivePollViewProps {
  poll: Poll;
  onBack: () => void;
  onPollUpdated: (poll: Poll) => void;
}

const LivePollView: React.FC<LivePollViewProps> = ({ poll: initialPoll, onBack, onPollUpdated }) => {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showPercentages, setShowPercentages] = useState(true);
  const { toast } = useToast();

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      onBack();
    };

    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack]);

  useEffect(() => {
    // Connect to socket for real-time updates
    const newSocket = io('https://teachingaid-backend.onrender.com');
    setSocket(newSocket);

    newSocket.emit('joinPoll', poll.code);

    newSocket.on('voteUpdate', (updatedVotes: number[]) => {
      setPoll(prevPoll => ({
        ...prevPoll,
        votes: updatedVotes
      }));
    });

    return () => {
      newSocket.emit('leavePoll', poll.code);
      newSocket.disconnect();
    };
  }, [poll.code]);

  const handleClosePoll = async () => {
    setLoading(true);
    try {
      await pollAPI.closePoll(poll.code);
      const updatedPoll = { ...poll, isActive: false };
      setPoll(updatedPoll);
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
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = poll.votes.reduce((sum, count) => sum + count, 0);
  const maxVotes = Math.max(...poll.votes);

  const chartData = poll.options.map((option, index) => ({
    name: option.length > 20 ? option.substring(0, 20) + '...' : option,
    fullName: option,
    votes: poll.votes[index] || 0,
    percentage: totalVotes > 0 ? ((poll.votes[index] || 0) / totalVotes * 100).toFixed(1) : '0.0'
  }));

  const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-white/70 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPercentages(!showPercentages)}
              className="bg-white/70 backdrop-blur-sm"
            >
              {showPercentages ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPercentages ? 'Hide %' : 'Show %'}
            </Button>
            
            {poll.isActive && (
              <Button
                onClick={handleClosePoll}
                disabled={loading}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                {loading ? 'Closing...' : 'Close Poll'}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Question Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                <Badge variant="outline" className="self-start">
                  {poll.topic}
                </Badge>
                <Badge variant={poll.isActive ? "default" : "secondary"} className="self-start">
                  {poll.isActive ? 'Active' : 'Closed'}
                </Badge>
                {poll.allowMultiple && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 self-start">
                    Multiple Choice
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-600 ml-auto">
                  <Users className="h-4 w-4" />
                  <span>{totalVotes} votes</span>
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                <div className="whitespace-pre-wrap">{poll.question}</div>
              </CardTitle>
              <p className="text-sm text-gray-500">
                Poll Code: <span className="font-mono text-lg">{poll.code}</span>
              </p>
            </CardHeader>
          </Card>

          {/* Result Summary */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Result Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {poll.options.map((option, index) => {
                  const votes = poll.votes[index] || 0;
                  const percentage = totalVotes > 0 ? (votes / totalVotes * 100) : 0;
                  const isLeading = votes === maxVotes && votes > 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium whitespace-pre-wrap ${isLeading ? 'text-purple-700' : 'text-gray-700'}`}>
                            {option}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`font-semibold ${isLeading ? 'text-purple-700' : 'text-gray-700'}`}>
                            {votes} votes
                          </span>
                          {showPercentages && (
                            <span className={`${isLeading ? 'text-purple-600' : 'text-gray-500'}`}>
                              ({percentage.toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Live Results Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live Results
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${value} votes${showPercentages ? ` (${props.payload.percentage}%)` : ''}`, 
                        'Votes'
                      ]}
                      labelFormatter={(name: any, payload: any) => {
                        if (payload && payload[0]) {
                          return payload[0].payload.fullName;
                        }
                        return name;
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LivePollView;
