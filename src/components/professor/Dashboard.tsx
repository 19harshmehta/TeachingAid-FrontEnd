
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Copy,
  ExternalLink,
  QrCode,
  Trash2,
  Users,
  TrendingUp,
  BarChart3,
  Clock,
  Play,
  RefreshCw,
  FolderPlus,
  X,
  ChevronDown,
  Folder,
  ChevronRight
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { pollAPI, folderAPI } from '@/services/api';
import { Folder as FolderType, Poll } from '@/types';
import QRCodeModal from './QRCodeModal';
import MoveToFolderModal from './MoveToFolderModal';
import PastResultsModal from './PastResultsModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [currentPolls, setCurrentPolls] = useState<Poll[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
	const [showFolderCreation, setShowFolderCreation] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPollCode, setSelectedPollCode] = useState('');
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
  const [selectedPollForFolder, setSelectedPollForFolder] = useState<Poll | null>(null);
  const [relaunchingPolls, setRelaunchingPolls] = useState<Set<string>>(new Set());
  const [showPastResults, setShowPastResults] = useState(false);
  const [selectedPollForHistory, setSelectedPollForHistory] = useState<Poll | null>(null);

  const [date, setDate] = useState<Date | undefined>(undefined)

  const { 
    data: allPollsData, 
    isLoading: isPollsLoading, 
    isError: isPollsError, 
    error: pollsError 
  } = useQuery({
    queryKey: ['polls'],
    queryFn: pollAPI.getMyPolls,
  });

  const { 
    data: allFoldersData, 
    isLoading: isFoldersLoading, 
    isError: isFoldersError, 
    error: foldersError 
  } = useQuery({
    queryKey: ['folders'],
    queryFn: folderAPI.getAll,
  });

  const { 
    data: folderPollsData,
    isLoading: isFolderPollsLoading,
  } = useQuery({
    queryKey: ['folderPolls', selectedFolder],
    queryFn: () => selectedFolder ? folderAPI.getPollsByFolder(selectedFolder) : Promise.resolve({ data: [] }),
    enabled: !!selectedFolder,
  });

  useEffect(() => {
    if (allPollsData?.data) {
      setPolls(allPollsData.data);
      setCurrentPolls(allPollsData.data);
    }
  }, [allPollsData]);

  useEffect(() => {
    if (allFoldersData?.data) {
      setFolders(allFoldersData.data);
    }
  }, [allFoldersData]);

  useEffect(() => {
    if (selectedFolder && folderPollsData?.data) {
      setCurrentPolls(folderPollsData.data);
    } else if (!selectedFolder && allPollsData?.data) {
      setCurrentPolls(allPollsData.data);
    }
  }, [selectedFolder, folderPollsData, allPollsData]);

  const createFolderMutation = useMutation({
    mutationFn: () => folderAPI.create(newFolderName, newFolderDescription),
    onSuccess: () => {
      toast({
        title: "Folder Created!",
        description: "Your folder has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setShowFolderCreation(false);
      setNewFolderName('');
      setNewFolderDescription('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create folder",
        variant: "destructive",
      });
    },
  });

  const deletePollMutation = useMutation({
    mutationFn: (pollId: string) => pollAPI.delete(pollId),
    onSuccess: () => {
      toast({
        title: "Poll Deleted!",
        description: "The poll has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete poll",
        variant: "destructive",
      });
    },
  });

  const handleViewLive = (poll: Poll) => {
    navigate(`/dashboard/poll/${poll.code}`);
  };

  const handleCreatePoll = () => {
    navigate('/dashboard/create');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterByFolder = (folderId: string | null) => {
    setSelectedFolder(folderId);
  };

	const handleShowFolderCreationModal = () => {
		setShowFolderCreation(true);
	};

  const handleCreateFolder = async () => {
    if (newFolderName.trim() === '') {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFolderMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    try {
      await deletePollMutation.mutateAsync(pollId);
    } catch (error) {
      console.error("Failed to delete poll:", error);
    }
  };

  const copyPollCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied!",
        description: "Poll code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy poll code",
        variant: "destructive",
      });
    }
  };

  const copyPollLink = async (code: string) => {
    try {
      const pollLink = `${window.location.origin}/join/${code}`;
      await navigator.clipboard.writeText(pollLink);
      toast({
        title: "Copied!",
        description: "Poll link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy poll link",
        variant: "destructive",
      });
    }
  };

  const handleShowQR = (poll: Poll) => {
    setSelectedPollCode(poll.code);
    setShowQRModal(true);
  };

  const handleMoveToFolder = (poll: Poll) => {
    setSelectedPollForFolder(poll);
    setShowMoveToFolderModal(true);
  };

  const handleRelaunchPoll = async (poll: Poll) => {
    setRelaunchingPolls((prev) => new Set(prev).add(poll._id));
    try {
      await pollAPI.relaunch(poll._id);
      toast({
        title: "Poll Relaunched",
        description: "The poll is now active again with votes reset",
      });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    } catch (error) {
      console.error('Error relaunching poll:', error);
      toast({
        title: "Error",
        description: "Failed to relaunch the poll",
        variant: "destructive",
      });
    } finally {
      setRelaunchingPolls((prev) => {
        const next = new Set(prev);
        next.delete(poll._id);
        return next;
      });
    }
  };

  const handleViewPastResults = (poll: Poll) => {
    setSelectedPollForHistory(poll);
    setShowPastResults(true);
  };

  const filteredAndSortedPolls = useMemo(() => {
    let filteredPolls = [...currentPolls];

    // Filter by search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filteredPolls = filteredPolls.filter(poll =>
        poll.question.toLowerCase().includes(lowerCaseQuery) ||
        (poll.topic && poll.topic.toLowerCase().includes(lowerCaseQuery)) ||
        poll.code.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Filter by date
    if (date) {
      filteredPolls = filteredPolls.filter(poll => {
        const pollDate = new Date(poll.createdAt).toLocaleDateString();
        const selectedDate = date.toLocaleDateString();
        return pollDate === selectedDate;
      });
    }

    // Sort by creation date (newest first)
    filteredPolls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filteredPolls;
  }, [currentPolls, searchQuery, date]);

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-purple-800">My Polls</h1>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {filteredAndSortedPolls.length} polls
            </span>
          </div>
          <Button onClick={handleCreatePoll} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Poll
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{polls.length}</div>
              <p className="text-xs text-gray-500">All polls created</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{polls.filter(poll => poll.isActive).length}</div>
              <p className="text-xs text-gray-500">Currently accepting votes</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed Polls</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{polls.filter(poll => !poll.isActive).length}</div>
              <p className="text-xs text-gray-500">No longer accepting votes</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search polls..."
              value={searchQuery}
              onChange={handleSearch}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-md"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select onValueChange={(value) => handleFilterByFolder(value === "all" ? null : value)}>
              <SelectTrigger className="w-full md:w-[180px] bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <SelectValue placeholder="Filter by folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder._id} value={folder._id}>{folder.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleShowFolderCreationModal} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Folders Section */}
        {folders.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">My Folders</h2>
            <div className="flex flex-wrap gap-4">
              {folders.map(folder => (
                <Button
                  key={folder._id}
                  variant="outline"
                  className={`flex items-center gap-2 ${selectedFolder === folder._id ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : ''}`}
                  onClick={() => handleFilterByFolder(selectedFolder === folder._id ? null : folder._id)}
                >
                  <Folder className="h-4 w-4" />
                  {folder.name}
                  {selectedFolder === folder._id && <X className="h-4 w-4 ml-1" />}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Polls Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPolls.map((poll) => (
            <Card key={poll._id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium text-gray-900 leading-tight">
                      <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                        {poll.question.length > 100 ? poll.question.substring(0, 100) + '...' : poll.question}
                      </pre>
                    </CardTitle>
                    {poll.topic && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {poll.topic}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Poll Code:</span>
                    <span className="font-mono font-bold">{poll.code}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Votes:</span>
                    <span className="font-semibold">{poll.votes?.reduce((a, b) => a + b, 0) || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Options:</span>
                    <span className="font-semibold">{poll.options?.length || 0}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Created: {new Date(poll.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {poll.isActive ? (
                      <Button
                        onClick={() => handleViewLive(poll)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Live
                      </Button>
                    ) : (
                      <div className="flex gap-2 flex-1">
                        <Button
                          onClick={() => handleRelaunchPoll(poll)}
                          disabled={relaunchingPolls.has(poll._id)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                          size="sm"
                        >
                          {relaunchingPolls.has(poll._id) ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              Relaunching...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Relaunch
                            </>
                          )}
                        </Button>
                        
                        {poll.history && poll.history.length > 0 && (
                          <Button
                            onClick={() => handleViewPastResults(poll)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Past Results
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyPollCode(poll.code)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyPollLink(poll.code)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShowQR(poll)}>
                          <QrCode className="h-4 w-4 mr-2" />
                          Show QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMoveToFolder(poll)}>
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Move to Folder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeletePoll(poll._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination (if needed) */}
        {filteredAndSortedPolls.length === 0 && (
          <div className="text-center mt-8">
            <h3 className="text-lg font-semibold text-gray-700">No polls found</h3>
            <p className="text-gray-500">Create a new poll or adjust your search filters.</p>
          </div>
        )}

        {/* Folder Creation Modal */}
        <AlertDialog open={showFolderCreation} onOpenChange={setShowFolderCreation}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Folder</AlertDialogTitle>
              <AlertDialogDescription>
                Enter a name and description for your new folder.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCreateFolder}>Create</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* QR Code Modal */}
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          pollCode={selectedPollCode}
        />

        {/* Move to Folder Modal */}
        <MoveToFolderModal
          isOpen={showMoveToFolderModal}
          onClose={() => setShowMoveToFolderModal(false)}
          poll={selectedPollForFolder}
          folders={folders}
          onPollMoved={() => queryClient.invalidateQueries({ queryKey: ['polls'] })}
        />

        {/* Past Results Modal */}
        {selectedPollForHistory && (
          <PastResultsModal
            isOpen={showPastResults}
            onClose={() => {
              setShowPastResults(false);
              setSelectedPollForHistory(null);
            }}
            poll={selectedPollForHistory}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
