import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Users, BarChart3 } from 'lucide-react';
import { quizAPI } from '@/services/api';
import { io, Socket } from 'socket.io-client';

interface Poll {
  _id: string;
  question: string;
  options: string[];
  allowMultiple: boolean;
  code: string;
  votes: number[];
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  code: string;
  isActive: boolean;
  polls: Poll[];
}

interface LiveQuizViewProps {
  quiz: Quiz;
  onBack: () => void;
}

const LiveQuizView: React.FC<LiveQuizViewProps> = ({ quiz: initialQuiz, onBack }) => {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz);
  const [sockets, setSockets] = useState<Record<string, Socket>>({});

  useEffect(() => {
    // Connect to socket for each poll in the quiz
    const newSockets: Record<string, Socket> = {};
    
    quiz.polls.forEach(poll => {
      const socket = io('https://teachingaid-backend.onrender.com');
      newSockets[poll.code] = socket;
      
      socket.emit('join_poll', poll.code);
      
      socket.on('vote_update', (data) => {
        setQuiz(prevQuiz => ({
          ...prevQuiz,
          polls: prevQuiz.polls.map(p => 
            p.code === poll.code ? { ...p, votes: data.votes } : p
          )
        }));
      });
    });
    
    setSockets(newSockets);

    return () => {
      // Cleanup sockets
      Object.values(newSockets).forEach(socket => {
        socket.disconnect();
      });
    };
  }, [quiz.polls]);

  const getTotalVotes = (poll: Poll): number => {
    if (poll.allowMultiple) {
      // For multiple choice, count unique voters (this is simplified)
      return Math.max(...poll.votes, 0);
    } else {
      return poll.votes.reduce((sum, count) => sum + count, 0);
    }
  };

  const getVotePercentage = (votes: number, total: number): number => {
    return total > 0 ? (votes / total) * 100 : 0;
  };

  const totalParticipants = Math.max(
    ...quiz.polls.map(poll => getTotalVotes(poll)),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-4">
          <Badge variant={quiz.isActive ? "default" : "secondary"}>
            {quiz.isActive ? "Active" : "Closed"}
          </Badge>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{totalParticipants} participants</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          {quiz.description && (
            <p className="text-muted-foreground">{quiz.description}</p>
          )}
          <div className="flex items-center space-x-4 text-sm">
            <span>Quiz Code: <span className="font-mono font-bold text-primary">{quiz.code}</span></span>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {quiz.polls.map((poll, index) => {
          const totalVotes = getTotalVotes(poll);
          
          return (
            <Card key={poll._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Question {index + 1}: {poll.question}
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <span>Poll Code: {poll.code}</span>
                      <span>{poll.allowMultiple ? 'Multiple Choice' : 'Single Choice'}</span>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>{totalVotes} votes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {poll.options.map((option, optionIndex) => {
                    const votes = poll.votes[optionIndex] || 0;
                    const percentage = getVotePercentage(votes, totalVotes);
                    
                    return (
                      <div key={optionIndex} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{option}</span>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{votes} votes</span>
                            <span>({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LiveQuizView;