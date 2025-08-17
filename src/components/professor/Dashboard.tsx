import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Play, Eye, FolderOpen, Plus, LogOut, Folder, Vote } from 'lucide-react';
import { pollAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CreatePollModal from './CreatePollModal';
import LivePollView from './LivePollView';
import FolderManager from './FolderManager';
import MovePollToFolder from './MovePollToFolder';
import PollsSearchFilter from './PollsSearchFilter';
import PastResultsView from './PastResultsView';

interface Poll {
  _id: string;
  question: string;
  topic?: string;
  options: string[];
  code: string;
  isActive: boolean;
  votes: number[];
  allowMultiple?: boolean;
  createdAt: string;
  folder?: string;
  history?: Array<{
    votes: number[];
    votedFingerprints: number;
    timestamp: string;
    _id: string;
  }>;
}

interface Folder {
  _id: string;
  name: string;
  pollCount: number;
}

const Dashboard: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [viewingPoll, setViewingPoll] = useState<Poll | null>(null);
  const [viewingPastResults, setViewingPastResults] = useState<Poll | null>(null);
  const [pollToMove, setPollToMove] = useState<Poll | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [relaunchingId, setRelaunchingId] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const fetchPolls = async () => {
    setIsLoading(true);
    try {
      const response = await pollAPI.getAll();
      setPolls(response.data);
    } catch (error) {
      console.error("Error fetching polls:", error);
      toast({
        title: "Error",
        description: "Failed to fetch polls.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await pollAPI.getFolders();
      setFolders(response.data);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch folders.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPolls();
    fetchFolders();
  }, []);

  const handleViewLive = (poll: Poll) => {
    setViewingPoll(poll);
  };

  const handleViewPastResults = (poll: Poll) => {
    setViewingPastResults(poll);
  };

  const handleRelaunch = async (pollId: string) => {
    setRelaunchingId(pollId);
    try {
      await pollAPI.relaunch(pollId);
      setPolls(polls.map(poll =>
        poll._id === pollId ? { ...poll, isActive: true } : poll
      ));
      toast({
        title: "Poll Relaunched",
        description: "The poll has been relaunched successfully.",
      });
    } catch (error) {
      console.error("Error relaunching poll:", error);
      toast({
        title: "Error",
        description: "Failed to relaunch the poll.",
        variant: "destructive",
      });
    } finally {
      setRelaunchingId(null);
    }
  };

  const handleMoveToFolder = (poll: Poll) => {
    setPollToMove(poll);
  };

  const activePolls = polls.filter(poll => poll.isActive).length;
  const totalVotes = polls.reduce((sum, poll) => {
    return sum + poll.votes.reduce((pollSum, vote) => pollSum + vote, 0);
  }, 0);

  const filteredPolls = polls
    .filter(poll => {
      const searchTermLower = searchTerm.toLowerCase();
      const questionMatch = poll.question.toLowerCase().includes(searchTermLower);
      const topicMatch = poll.topic?.toLowerCase().includes(searchTermLower);
      const codeMatch = poll.code.toLowerCase().includes(searchTermLower);
      
      let folderMatch = true;
      if (selectedFolder !== 'all') {
        folderMatch = poll.folder === selectedFolder;
      }

      return folderMatch && (questionMatch || topicMatch || codeMatch);
    })
    .sort((a, b) => {
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'votes') {
        const totalVotesA = a.votes.reduce((sum, vote) => sum + vote, 0);
        const totalVotesB = b.votes.reduce((sum, vote) => sum + vote, 0);
        return totalVotesB - totalVotesA;
      }
      return 0;
    });

  const handleLogout = () => {
    logout();
  };

  if (viewingPoll) {
    return (
      <LivePollView
        poll={viewingPoll}
        onBack={() => setViewingPoll(null)}
        onPollUpdated={(updatedPoll) => {
          setPolls(polls.map(p => p._id === updatedPoll._id ? updatedPoll : p));
          setViewingPoll(updatedPoll);
        }}
      />
    );
  }

  if (viewingPastResults) {
    return (
      <PastResultsView 
        poll={viewingPastResults} 
        onBack={() => setViewingPastResults(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-purple-800 mb-2">
                Welcome back, {user?.name || 'Professor'}!
              </h1>
              <p className="text-purple-600">
                Manage your polls and organize them in folders
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowFolderManager(true)}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 border-purple-200 text-purple-700 hover:text-purple-800"
              >
                <Folder className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Folder</span>
                <span className="sm:hidden">Folder</span>
              </Button>
              
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create Poll</span>
                <span className="sm:hidden">Create</span>
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 border-red-200 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Polls</p>
                    <p className="text-2xl font-bold text-purple-700">{polls.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Polls</p>
                    <p className="text-2xl font-bold text-green-700">{activePolls}</p>
                  </div>
                  <Play className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Folders</p>
                    <p className="text-2xl font-bold text-blue-700">{folders.length}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Votes</p>
                    <p className="text-2xl font-bold text-orange-700">{totalVotes}</p>
                  </div>
                  <Vote className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filter */}
        <PollsSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedFolder={selectedFolder}
          onFolderChange={setSelectedFolder}
          folders={folders}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Polls Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPolls.map((poll) => (
            <Card
              key={poll._id}
              className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {poll.question.length > 50 ? `${poll.question.substring(0, 50)}...` : poll.question}
                  </CardTitle>
                  <Badge
                    variant={poll.isActive ? "default" : "secondary"}
                    className={poll.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                  >
                    {poll.isActive ? "Active" : "Closed"}
                  </Badge>
                </div>
                {poll.topic && (
                  <p className="text-sm text-purple-600 font-medium">{poll.topic}</p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Code:</span> {poll.code}</p>
                    <p><span className="font-medium">Options:</span> {poll.options.length}</p>
                    <p><span className="font-medium">Total Votes:</span> {poll.votes.reduce((sum, vote) => sum + vote, 0)}</p>
                    <p><span className="font-medium">Created:</span> {new Date(poll.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    {poll.isActive ? (
                      <Button
                        onClick={() => handleViewLive(poll)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">View Live</span>
                        <span className="sm:hidden">Live</span>
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleRelaunch(poll._id)}
                          disabled={relaunchingId === poll._id}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Relaunch</span>
                          <span className="sm:hidden">Launch</span>
                        </Button>
                        <Button
                          onClick={() => handleViewPastResults(poll)}
                          variant="outline"
                          className="flex-1 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-sm"
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">View Results</span>
                          <span className="sm:hidden">Results</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPolls.length === 0 && !isLoading && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2 text-gray-600">No polls found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedFolder !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Create your first poll to get started!'
                }
              </p>
              {!searchTerm && selectedFolder === 'all' && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Poll
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <CreatePollModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPollCreated={fetchPolls}
        />

        <FolderManager
          isOpen={showFolderManager}
          onClose={() => setShowFolderManager(false)}
          onFolderCreated={fetchFolders}
          existingFolders={folders}
        />

        <MovePollToFolder
          isOpen={!!pollToMove}
          onClose={() => setPollToMove(null)}
          poll={pollToMove}
          folders={folders}
          onPollMoved={fetchPolls}
        />
      </div>
    </div>
  );
};

export default Dashboard;
