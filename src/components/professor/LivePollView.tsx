
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Copy, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { socketService } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';

interface Poll {
  _id: string;
  question: string;
  options: string[];
  code: string;
  isActive: boolean;
  votes: number[];
}

interface LivePollViewProps {
  poll: Poll;
  onBack: () => void;
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const LivePollView: React.FC<LivePollViewProps> = ({ poll, onBack }) => {
  const [votes, setVotes] = useState<number[]>(poll.votes || []);
  const [copied, setCopied] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const setupSocket = async () => {
      try {
        console.log('Setting up socket connection for poll:', poll.code);
        console.log('Initial votes:', poll.votes);
        
        // Set initial votes
        setVotes(poll.votes || []);
        
        // Connect to socket
        const socket = await socketService.connect();
        
        if (!mounted) return;
        
        setSocketConnected(true);
        
        // Set up vote update listener
        await socketService.onVoteUpdate((data) => {
          console.log('Vote update received:', data);
          if (data.pollCode === poll.code && mounted) {
            console.log('Updating votes from:', votes, 'to:', data.votes);
            setVotes(data.votes);
          }
        });
        
        // Join the poll room
        await socketService.joinPoll(poll.code);
        
      } catch (error) {
        console.error('Failed to setup socket:', error);
        if (mounted) {
          toast({
            title: "Connection Error",
            description: "Failed to connect to live updates",
            variant: "destructive",
          });
        }
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      console.log('Cleaning up socket connection');
      socketService.offVoteUpdate();
      setSocketConnected(false);
    };
  }, [poll.code, poll.votes, toast]);

  const copyPollCode = async () => {
    try {
      await navigator.clipboard.writeText(poll.code);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Poll code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy poll code",
        variant: "destructive",
      });
    }
  };

  // Calculate total votes
  const totalVotes = votes.reduce((sum, count) => sum + count, 0);

  // Prepare chart data
  const chartData = poll.options.map((option, index) => {
    const voteCount = votes[index] || 0;
    return {
      option: option.length > 20 ? option.substring(0, 20) + '...' : option,
      fullOption: option,
      votes: voteCount,
      percentage: totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
    };
  });

  const pieData = chartData.map((item, index) => ({
    name: item.fullOption,
    value: item.votes,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-purple-700 hover:text-purple-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">{poll.question}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">Poll Code:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyPollCode}
                className="bg-white/70 backdrop-blur-sm hover:bg-white/90"
              >
                <span className="font-mono text-lg font-bold">{poll.code}</span>
                {copied ? (
                  <Check className="h-4 w-4 ml-2 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>
            {socketConnected && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live Connected</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-purple-700">
            <Users className="h-5 w-5" />
            <span className="font-semibold">{totalVotes} votes</span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up">
            <CardHeader>
              <CardTitle className="text-center">Live Results - Bar Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="option" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Votes']}
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.option === label);
                      return item?.fullOption || label;
                    }}
                  />
                  <Bar dataKey="votes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="text-center">Live Results - Pie Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${percentage}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, 'Votes']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle>Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-white/50 to-purple-50/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="font-medium">{item.fullOption}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{item.votes} votes</div>
                    <div className="text-sm text-gray-600">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 text-purple-800">
              Students can join at:
            </h3>
            <p className="text-xl font-mono font-bold text-purple-700 mb-2">
              {window.location.origin}/join
            </p>
            <p className="text-sm text-purple-600">
              Ask them to enter poll code: <span className="font-bold">{poll.code}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LivePollView;
