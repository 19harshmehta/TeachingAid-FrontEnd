
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pollAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BarChart3, LogOut, Eye, Play, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CreatePollModal from './CreatePollModal';
import LivePollView from './LivePollView';
import QRCodeModal from './QRCodeModal';

interface Poll {
  _id: string;
  question: string;
  options: string[];
  code: string;
  isActive: boolean;
  createdAt: string;
  votes: number[];
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPollForQR, setSelectedPollForQR] = useState<string>('');

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      console.log('Fetching polls...');
      const response = await pollAPI.getMyPolls();
      console.log('API Response:', response);
      
      let pollsData = [];
      if (Array.isArray(response.data)) {
        pollsData = response.data;
      } else if (response.data && Array.isArray(response.data.polls)) {
        pollsData = response.data.polls;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        pollsData = response.data.data;
      } else {
        console.warn('Unexpected response structure:', response.data);
        pollsData = [];
      }
      
      console.log('Processed polls data:', pollsData);
      
      const processedPolls = pollsData.map(poll => ({
        ...poll,
        votes: Array.isArray(poll.votes) ? poll.votes : []
      }));
      
      setPolls(processedPolls);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "Error",
        description: "Failed to fetch polls",
        variant: "destructive",
      });
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRelaunch = async (pollId: string) => {
    try {
      console.log('Relaunching poll:', pollId);
      const response = await pollAPI.relaunch(pollId);
      console.log('Relaunch response:', response);
      toast({
        title: "Poll Relaunched!",
        description: `Poll code: ${response.data.code}`,
      });
      fetchPolls();
    } catch (error) {
      console.error('Error relaunching poll:', error);
      toast({
        title: "Error",
        description: "Failed to relaunch poll",
        variant: "destructive",
      });
    }
  };

  const handleClosePoll = async (pollCode: string) => {
    try {
      await pollAPI.closePoll(pollCode);
      toast({
        title: "Poll Closed",
        description: "Poll has been closed successfully",
      });
      fetchPolls();
    } catch (error) {
      console.error('Error closing poll:', error);
      toast({
        title: "Error",
        description: "Failed to close poll",
        variant: "destructive",
      });
    }
  };

  const handleViewLive = (poll: Poll) => {
    setActivePoll(poll);
  };

  const handleShowQR = (pollCode: string) => {
    setSelectedPollForQR(pollCode);
    setShowQRModal(true);
  };

  const handlePollUpdated = (updatedPoll: Poll) => {
    setPolls(polls.map(poll => 
      poll._id === updatedPoll._id ? updatedPoll : poll
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (activePoll) {
    return (
      <LivePollView 
        poll={activePoll} 
        onBack={() => setActivePoll(null)}
        onPollUpdated={handlePollUpdated}
      />
    );
  }

  const safePollsArray = Array.isArray(polls) ? polls : [];

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">Manage your polls and engage your audience</p>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
            
            <Button
              variant="outline"
              onClick={logout}
              className="bg-white/70 backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Polls</p>
                  <p className="text-2xl font-bold text-gray-800">{safePollsArray.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Polls</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {safePollsArray.filter(p => p.isActive).length}
                  </p>
                </div>
                <Play className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {safePollsArray.reduce((sum, poll) => {
                      const pollVotes = Array.isArray(poll.votes) ? poll.votes : [];
                      return sum + pollVotes.reduce((voteSum, count) => voteSum + count, 0);
                    }, 0)}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Polls List */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Your Polls</CardTitle>
          </CardHeader>
          <CardContent>
            {safePollsArray.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No polls created yet</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Create Your First Poll
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {safePollsArray.map((poll) => {
                  const pollVotes = Array.isArray(poll.votes) ? poll.votes : [];
                  const totalVotes = pollVotes.reduce((sum, count) => sum + count, 0);
                  
                  return (
                    <div 
                      key={poll._id} 
                      className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-800">{poll.question}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            poll.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {poll.isActive ? 'Active' : 'Closed'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Code: {poll.code} • {poll.options.length} options • {totalVotes} votes
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(poll.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShowQR(poll.code)}
                          className="bg-white/70 backdrop-blur-sm"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        
                        {poll.isActive ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleViewLive(poll)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Live
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleClosePoll(poll.code)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Close
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleRelaunch(poll._id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Relaunch
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreatePollModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPollCreated={() => {
          fetchPolls();
          setShowCreateModal(false);
        }}
      />

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        pollCode={selectedPollForQR}
      />
    </div>
  );
};

export default Dashboard;
