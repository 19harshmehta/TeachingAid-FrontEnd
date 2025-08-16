
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Copy, Check, RefreshCw, Wifi, WifiOff, QrCode, X, Play } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { pollAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';
import QRCodeModal from './QRCodeModal';

interface Poll {
  _id: string;
  question: string;
  topic?: string;
  options: string[];
  code: string;
  isActive: boolean;
  votes: number[];
  allowMultiple?: boolean;
}

interface PollResults {
  question: string;
  results: Array<{
    option: string;
    votes: number;
  }>;
}

interface LivePollViewProps {
  poll: Poll;
  onBack: () => void;
  onPollUpdated: (updatedPoll: Poll) => void;
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const LivePollView: React.FC<LivePollViewProps> = ({ poll, onBack, onPollUpdated }) => {
  const navigate = useNavigate();
  const [currentPoll, setCurrentPoll] = useState<Poll>(poll);
  const [pollResults, setPollResults] = useState<PollResults>({
    question: poll.question,
    results: poll.options.map((option, index) => ({
      option,
      votes: poll.votes[index] || 0
    }))
  });
  const [copied, setCopied] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isRelaunching, setIsRelaunching] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();
  
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(true);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      onBack();
    };

    // Push current state to history
    window.history.pushState({ page: 'livePoll' }, '', window.location.pathname);
    
    // Listen for back button
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack]);

  const fetchPollResults = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      console.log('🔄 Fetching poll results for code:', currentPoll.code);
      const response = await pollAPI.getPollResults(currentPoll.code);
      console.log('📊 Poll results received:', response.data);
      
      if (!mountedRef.current) return;
      
      let resultsData = response.data;
      if (response.data.data) {
        resultsData = response.data.data;
      }
      
      if (resultsData.question && resultsData.results) {
        setPollResults(resultsData);
        setLastUpdate(new Date());
        console.log('✅ Poll results updated successfully');
      }
    } catch (error) {
      console.error('❌ Error fetching poll results:', error);
    }
  }, [currentPoll.code]);

  const manualRefresh = async () => {
    setIsRefreshing(true);
    await fetchPollResults();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleClosePoll = async () => {
    setIsClosing(true);
    try {
      await pollAPI.closePoll(currentPoll.code);
      const updatedPoll = { ...currentPoll, isActive: false };
      setCurrentPoll(updatedPoll);
      onPollUpdated(updatedPoll);
      
      toast({
        title: "Poll Closed",
        description: "The poll has been closed successfully",
      });
    } catch (error) {
      console.error('Error closing poll:', error);
      toast({
        title: "Error",
        description: "Failed to close the poll",
        variant: "destructive",
      });
    } finally {
      setIsClosing(false);
    }
  };

  const handleRelaunchPoll = async () => {
    setIsRelaunching(true);
    try {
      await pollAPI.relaunch(currentPoll._id);
      const updatedPoll = { ...currentPoll, isActive: true };
      setCurrentPoll(updatedPoll);
      onPollUpdated(updatedPoll);
      
      toast({
        title: "Poll Relaunched",
        description: "The poll is now active again with votes reset",
      });
    } catch (error) {
      console.error('Error relaunching poll:', error);
      toast({
        title: "Error",
        description: "Failed to relaunch the poll",
        variant: "destructive",
      });
    } finally {
      setIsRelaunching(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    console.log('🚀 Initializing socket connection for poll:', currentPoll.code);
    
    const socket = io('https://teachingaid-backend.onrender.com', {
      transports: ['websocket'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (!mountedRef.current) return;
      console.log('🔗 Socket connected successfully');
      setSocketConnected(true);
      
      console.log('🏠 Joining poll room:', currentPoll.code);
      socket.emit('join_poll', currentPoll.code);
      
      toast({
        title: "Live Connection Active",
        description: "Real-time updates are now enabled",
      });
    });

    socket.on('disconnect', () => {
      if (!mountedRef.current) return;
      console.log('🔌 Socket disconnected');
      setSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      if (!mountedRef.current) return;
      console.error('💥 Socket connection error:', error);
      setSocketConnected(false);
    });

    socket.on('poll_updated', () => {
      if (!mountedRef.current) return;
      console.log('📡 Received poll_updated event');
      fetchPollResults();
    });

    socket.on('vote_update', () => {
      if (!mountedRef.current) return;
      console.log('📡 Received vote_update event');
      fetchPollResults();
    });

    socket.on('poll_votes_changed', () => {
      if (!mountedRef.current) return;
      console.log('📡 Received poll_votes_changed event');
      fetchPollResults();
    });

    fetchPollResults();

    const fallbackPolling = setInterval(() => {
      if (!socketConnected && mountedRef.current) {
        console.log('⏰ Fallback polling - fetching results');
        fetchPollResults();
      }
    }, 5000);

    return () => {
      console.log('🧹 Cleaning up socket connection');
      mountedRef.current = false;
      
      if (socket) {
        socket.disconnect();
      }
      
      if (fallbackPolling) {
        clearInterval(fallbackPolling);
      }
      
      setSocketConnected(false);
    };
  }, [currentPoll.code, fetchPollResults]);

  const copyPollCode = async () => {
    try {
      await navigator.clipboard.writeText(currentPoll.code);
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

  const totalVotes = pollResults.results.reduce((sum, result) => sum + result.votes, 0);

  const chartData = pollResults.results.map((result, index) => ({
    option: result.option.length > 20 ? result.option.substring(0, 20) + '...' : result.option,
    fullOption: result.option,
    votes: result.votes,
    percentage: totalVotes > 0 ? Math.round((result.votes / totalVotes) * 100) : 0
  }));

  const pieData = chartData.filter(item => item.votes > 0).map((item, index) => ({
    name: item.fullOption,
    value: item.votes,
    color: COLORS[index % COLORS.length],
    percentage: item.percentage
  }));

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-purple-700 hover:text-purple-800 hover:bg-purple-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-700">{totalVotes} participants</span>
              </div>
            </div>
          </div>

          {/* Settings Panel - As shown in your image */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">Poll Code:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyPollCode}
                      className="bg-white/70 backdrop-blur-sm hover:bg-white/90 font-mono text-lg font-bold h-8"
                    >
                      {currentPoll.code}
                      {copied ? (
                        <Check className="h-4 w-4 ml-2 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 ml-2" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentPoll.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {currentPoll.isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {socketConnected ? (
                      <>
                        <Wifi className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Live Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-500 font-medium">Polling Mode</span>
                      </>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={manualRefresh}
                    disabled={isRefreshing}
                    className="h-8 px-3 text-sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>

                  <span className="text-gray-500">Updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowQRModal(true)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Show QR Code
                  </Button>
                  
                  {currentPoll.isActive ? (
                    <Button
                      onClick={handleClosePoll}
                      disabled={isClosing}
                      size="sm"
                      variant="destructive"
                    >
                      {isClosing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Closing...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Close Poll
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleRelaunchPoll}
                      disabled={isRelaunching}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isRelaunching ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Relaunching...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Relaunch Poll
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-8 animate-fade-in">
          <CardContent className="p-6">
            <div className="text-center">
              <pre className="text-xl md:text-2xl font-bold text-gray-800 mb-4 whitespace-pre-wrap font-mono">
                {pollResults.question}
              </pre>
              
              {currentPoll.topic && (
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Topic: {currentPoll.topic}
                  </span>
                </div>
              )}

              {currentPoll.allowMultiple && (
                <div className="flex justify-center">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Multiple selections allowed
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Poll Closed Message */}
        {!currentPoll.isActive && (
          <Card className="mb-8 bg-red-50/80 backdrop-blur-sm border-red-200 shadow-lg animate-fade-in">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2 text-red-800">
                Poll Closed
              </h3>
              <p className="text-sm text-red-600">
                This poll is no longer accepting votes. You can relaunch it to reactivate voting.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in mb-8">
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
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <pre className="font-medium text-sm font-mono whitespace-pre-wrap break-words flex-1">
                      {item.fullOption}
                    </pre>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="font-bold text-lg">{item.votes} votes</div>
                    <div className="text-sm text-gray-600">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              {totalVotes > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ percentage }) => `${percentage}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, 'Votes']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p>No votes yet</p>
                    <p className="text-sm">Results will appear here once voting begins</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-purple-800">
                  Students can join at:
                </h3>
                <p className="text-xl font-mono font-bold text-purple-700 mb-2">
                  https://instant-pulse.vercel.app/join
                </p>
                <p className="text-sm text-purple-600">
                  Ask them to enter poll code: <span className="font-bold">{currentPoll.code}</span>
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">
                  Or scan QR code:
                </h3>
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <QRCodeSVG
                      value={`https://instant-pulse.vercel.app/join/${currentPoll.code}`}
                      size={120}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </button>
                </div>
                <p className="text-xs text-purple-600 mt-2">Click to enlarge</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        pollCode={currentPoll.code}
      />
    </div>
  );
};

export default LivePollView;
