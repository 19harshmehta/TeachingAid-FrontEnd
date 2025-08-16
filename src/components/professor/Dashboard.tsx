import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pollAPI, folderAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, BarChart3, LogOut, Eye, Play, QrCode, X, FolderPlus, ChevronDown } from 'lucide-react';
import CreatePollModal from './CreatePollModal';
import LivePollView from './LivePollView';
import QRCodeModal from './QRCodeModal';
import PollsSearchFilter from './PollsSearchFilter';
import FolderManager from './FolderManager';
import PollDragDrop from './PollDragDrop';

interface Poll {
  _id: string;
  question: string;
  topic?: string;
  options: string[];
  code: string;
  isActive: boolean;
  createdAt: string;
  votes: number[];
  allowMultiple?: boolean;
}

interface Folder {
  _id: string;
  name: string;
  description: string;
  polls: string[];
  createdAt: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPollForQR, setSelectedPollForQR] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [topicFilter, setTopicFilter] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedPollForMove, setSelectedPollForMove] = useState<{ code: string; question: string } | null>(null);

  // Ensure polls is always an array
  const safePollsArray = Array.isArray(polls) ? polls : [];

  useEffect(() => {
    fetchPolls();
    fetchFolders();
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
        votes: Array.isArray(poll.votes) ? poll.votes : [],
        topic: poll.topic || 'General'
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

  const fetchFolders = async () => {
    try {
      const response = await folderAPI.getAll();
      setFolders(response.data.folders || response.data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
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

  const handleMoveToFolder = (pollCode: string, pollQuestion: string) => {
    setSelectedPollForMove({ code: pollCode, question: pollQuestion });
    // Refresh folders before showing modal
    fetchFolders();
    setShowMoveModal(true);
  };

  const availableTopics = useMemo(() => {
    const topics = safePollsArray.map(poll => poll.topic || 'General');
    return [...new Set(topics)].sort();
  }, [safePollsArray]);

  const filteredAndSortedPolls = useMemo(() => {
    console.log('Filtering polls with selectedFolder:', selectedFolder);
    console.log('Available folders:', folders);
    console.log('Available polls:', safePollsArray);

    let filtered = safePollsArray.filter(poll => {
      const matchesSearch = poll.question.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic = topicFilter === 'all' || poll.topic === topicFilter;
      
      // Fix folder filtering logic
      let matchesFolder = true;
      if (selectedFolder !== null) {
        const folder = folders.find(f => f._id === selectedFolder);
        console.log('Selected folder:', folder);
        console.log('Poll code:', poll.code);
        console.log('Folder polls:', folder?.polls);
        
        if (folder && Array.isArray(folder.polls)) {
          matchesFolder = folder.polls.includes(poll.code);
        } else {
          matchesFolder = false;
        }
        
        console.log('Poll matches folder:', matchesFolder);
      }
      
      return matchesSearch && matchesTopic && matchesFolder;
    });

    console.log('Filtered polls:', filtered);

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'active':
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'closed':
          if (!a.isActive && b.isActive) return -1;
          if (a.isActive && !b.isActive) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [safePollsArray, searchTerm, sortBy, topicFilter, selectedFolder, folders]);

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

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 animate-fade-in gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your polls and engage your audience</p>
          </div>
          
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
            
            <Button
              variant="outline"
              onClick={logout}
              className="bg-white/70 backdrop-blur-sm flex-1 sm:flex-none"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-slide-up">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Polls</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{safePollsArray.length}</p>
                </div>
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Polls</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {safePollsArray.filter(p => p.isActive).length}
                  </p>
                </div>
                <Play className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-slide-up sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {safePollsArray.reduce((sum, poll) => {
                      const pollVotes = Array.isArray(poll.votes) ? poll.votes : [];
                      return sum + pollVotes.reduce((voteSum, count) => voteSum + count, 0);
                    }, 0)}
                  </p>
                </div>
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Polls List */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-semibold">Your Polls</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Folder Dropdown */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Folders</h3>
                <FolderManager onFolderCreated={fetchFolders} />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-white/70 backdrop-blur-sm">
                    {selectedFolder === null 
                      ? "All Polls" 
                      : folders.find(f => f._id === selectedFolder)?.name || "Select Folder"
                    }
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[200px] bg-white/95 backdrop-blur-sm border shadow-lg">
                  <DropdownMenuItem
                    onClick={() => setSelectedFolder(null)}
                    className={selectedFolder === null ? "bg-purple-50" : ""}
                  >
                    All Polls ({safePollsArray.length})
                  </DropdownMenuItem>
                  {folders.map((folder) => {
                    const pollCount = folder.polls?.length || 0;
                    return (
                      <DropdownMenuItem
                        key={folder._id}
                        onClick={() => setSelectedFolder(folder._id)}
                        className={selectedFolder === folder._id ? "bg-purple-50" : ""}
                      >
                        {folder.name} ({pollCount})
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <PollsSearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
              topicFilter={topicFilter}
              onTopicFilterChange={setTopicFilter}
              availableTopics={availableTopics}
            />
            
            {filteredAndSortedPolls.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {searchTerm || topicFilter !== 'all' || selectedFolder !== null ? 'No polls found matching your criteria' : 'No polls created yet'}
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Create Your First Poll
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedPolls.map((poll) => {
                  const pollVotes = Array.isArray(poll.votes) ? poll.votes : [];
                  const totalVotes = pollVotes.reduce((sum, count) => sum + count, 0);
                  
                  return (
                    <div 
                      key={poll._id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-semibold text-gray-800 truncate pr-2">{poll.question}</h3>
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {poll.topic || 'General'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              poll.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {poll.isActive ? 'Active' : 'Closed'}
                            </span>
                            {poll.allowMultiple && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Multiple
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600">
                          <span>Code: <span className="font-mono">{poll.code}</span></span>
                          <span className="hidden sm:inline">•</span>
                          <span>{poll.options.length} options</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{totalVotes} votes</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(poll.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveToFolder(poll.code, poll.question)}
                          className="bg-white/70 backdrop-blur-sm flex-1 sm:flex-none"
                        >
                          <FolderPlus className="h-4 w-4 sm:mr-0 mr-1" />
                          <span className="sm:hidden">Move</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShowQR(poll.code)}
                          className="bg-white/70 backdrop-blur-sm flex-1 sm:flex-none"
                        >
                          <QrCode className="h-4 w-4 sm:mr-0 mr-1" />
                          <span className="sm:hidden">QR</span>
                        </Button>
                        
                        {poll.isActive ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleViewLive(poll)}
                              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">View Live</span>
                              <span className="sm:hidden">Live</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleClosePoll(poll.code)}
                              className="flex-1 sm:flex-none"
                            >
                              <X className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Close</span>
                              <span className="sm:hidden">Close</span>
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleRelaunch(poll._id)}
                            className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Relaunch</span>
                            <span className="sm:hidden">Relaunch</span>
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

      <PollDragDrop
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        pollCode={selectedPollForMove?.code || ''}
        pollQuestion={selectedPollForMove?.question || ''}
        folders={folders}
        onPollMoved={() => {
          fetchPolls();
          fetchFolders();
        }}
      />
    </div>
  );
};

export default Dashboard;
