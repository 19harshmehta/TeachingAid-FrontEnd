import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pollAPI, folderAPI, quizAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, BarChart3, LogOut, Eye, Play, QrCode, X, FolderInput, Folder, History, Calendar, Square, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CreatePollModal from './CreatePollModal';
import CreateQuizModal from './CreateQuizModal';
import LivePollView from './LivePollView';
import LiveQuizView from './LiveQuizView';
import PastResultsView from './PastResultsView';
import QRCodeModal from './QRCodeModal';
import PollsSearchFilter from './PollsSearchFilter';
import FolderManager from './FolderManager';
import MovePollToFolder from './MovePollToFolder';

interface Poll {
  _id: string;
  question: string;
  topic?: string;
  options: string[];
  code: string;
  isActive: boolean;
  createdAt: string;
  votes: number[];
  allowMultiple: boolean;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  polls: Poll[];
}

interface Folder {
  _id: string;
  name: string;
  description?: string;
  polls: string[];
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [liveQuiz, setLiveQuiz] = useState<Quiz | null>(null);
  const [viewingPastResults, setViewingPastResults] = useState<Poll | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPollForQR, setSelectedPollForQR] = useState<string>('');

  useEffect(() => {
    fetchPolls();
    fetchQuizzes();
    fetchFolders();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await pollAPI.getMyPolls();
      setPolls(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getMyQuizzes();
      setQuizzes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // Silently handle 404 for now since backend endpoint may not exist yet
      setQuizzes([]);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await folderAPI.getAll();
      setFolders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      setFolders([]);
    }
  };

  const handleQuizAction = async (action: string, quiz: Quiz) => {
    try {
      switch (action) {
        case 'close':
          await quizAPI.updateStatus(quiz.code, false);
          break;
        case 'activate':
          await quizAPI.updateStatus(quiz.code, true);
          break;
        case 'relaunch':
          await quizAPI.relaunch(quiz._id);
          break;
      }
      toast({ title: 'Success', description: 'Quiz updated successfully!' });
      fetchQuizzes();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update quiz', variant: 'destructive' });
    }
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
    return <LivePollView poll={activePoll} onBack={() => setActivePoll(null)} onPollUpdated={() => {}} />;
  }

  if (liveQuiz) {
    return <LiveQuizView quiz={liveQuiz} onBack={() => setLiveQuiz(null)} />;
  }

  if (viewingPastResults) {
    return <PastResultsView poll={viewingPastResults} onBack={() => setViewingPastResults(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600">Manage your polls and quizzes</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="polls" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="polls">Polls ({polls.length})</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes ({quizzes.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="polls" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Polls</h2>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Poll
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Polls</CardTitle>
              </CardHeader>
              <CardContent>
                {polls.map((poll) => (
                  <div key={poll._id}>
                    {poll.question}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Quizzes</h2>
              <Button onClick={() => setShowCreateQuizModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </div>
            
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <Card key={quiz._id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{quiz.title}</h3>
                        <p className="text-gray-600">{quiz.description}</p>
                        <p className="text-sm text-gray-500">Code: {quiz.code} | {quiz.polls.length} questions</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { setSelectedPollForQR(quiz.code); setShowQRModal(true); }}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => setLiveQuiz(quiz)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={() => handleQuizAction(quiz.isActive ? 'close' : 'activate', quiz)}>
                          {quiz.isActive ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" onClick={() => handleQuizAction('relaunch', quiz)}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <CreatePollModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={() => { fetchPolls(); }} />
        <CreateQuizModal isOpen={showCreateQuizModal} onClose={() => setShowCreateQuizModal(false)} onSuccess={() => { fetchQuizzes(); }} />
        <QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} pollCode={selectedPollForQR} />
      </div>
    </div>
  );
};

export default Dashboard;
