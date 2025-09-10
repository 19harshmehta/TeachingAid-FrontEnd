import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { quizAPI } from '@/services/api';
import { getFingerprint } from '@/services/fingerprint';
import { useToast } from '@/hooks/use-toast';

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

const QuizVotingPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [fingerprint, setFingerprint] = useState<string>('');
  const [selections, setSelections] = useState<Record<string, number | number[]>>({});

  useEffect(() => {
    if (code) {
      fetchQuiz();
      initFingerprint();
    }
  }, [code]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getQuizByCode(code!);
      setQuiz(response.data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      navigate('/join');
    } finally {
      setLoading(false);
    }
  };

  const initFingerprint = async () => {
    try {
      const fp = await getFingerprint();
      setFingerprint(fp);
    } catch (error) {
      console.error('Error getting fingerprint:', error);
    }
  };

  const handleSingleSelection = (pollId: string, optionIndex: number) => {
    setSelections(prev => ({
      ...prev,
      [pollId]: optionIndex
    }));
  };

  const handleMultipleSelection = (pollId: string, optionIndex: number, checked: boolean) => {
    setSelections(prev => {
      const currentSelections = (prev[pollId] as number[]) || [];
      if (checked) {
        return {
          ...prev,
          [pollId]: [...currentSelections, optionIndex]
        };
      } else {
        return {
          ...prev,
          [pollId]: currentSelections.filter(index => index !== optionIndex)
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (!quiz || !fingerprint) return;

    // Validate that all questions have been answered
    const unansweredQuestions = quiz.polls.filter(poll => {
      const selection = selections[poll._id];
      if (poll.allowMultiple) {
        return !selection || (Array.isArray(selection) && selection.length === 0);
      } else {
        return selection === undefined;
      }
    });

    if (unansweredQuestions.length > 0) {
      toast({
        title: 'Incomplete Submission',
        description: 'Please answer all questions before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setVoting(true);
    try {
      const votes = quiz.polls.map(poll => {
        const selection = selections[poll._id];
        if (poll.allowMultiple) {
          return {
            pollId: poll._id,
            optionIndices: selection as number[]
          };
        } else {
          return {
            pollId: poll._id,
            optionIndex: selection as number
          };
        }
      });

      await quizAPI.submitVotes(code!, fingerprint, votes);
      
      toast({
        title: 'Success',
        description: 'Your answers have been submitted successfully!',
      });

      setTimeout(() => {
        navigate('/join');
      }, 2000);
    } catch (error) {
      console.error('Error submitting votes:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your answers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The quiz code you entered doesn't exist or has expired.
            </p>
            <Button onClick={() => navigate('/join')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Join
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz.isActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Quiz Closed</h2>
            <p className="text-muted-foreground mb-4">
              This quiz is no longer accepting responses.
            </p>
            <Button onClick={() => navigate('/join')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Join
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allQuestionsAnswered = quiz.polls.every(poll => {
    const selection = selections[poll._id];
    if (poll.allowMultiple) {
      return selection && Array.isArray(selection) && selection.length > 0;
    } else {
      return selection !== undefined;
    }
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{quiz.title}</CardTitle>
            {quiz.description && (
              <p className="text-center text-muted-foreground">{quiz.description}</p>
            )}
            <p className="text-center text-sm text-muted-foreground">
              Quiz Code: <span className="font-mono font-bold">{quiz.code}</span>
            </p>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {quiz.polls.map((poll, index) => (
            <Card key={poll._id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {index + 1}: {poll.question}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {poll.allowMultiple ? 'Select all that apply' : 'Select one option'}
                </p>
              </CardHeader>
              <CardContent>
                {poll.allowMultiple ? (
                  <div className="space-y-3">
                    {poll.options.map((option, optionIndex) => {
                      const isChecked = Array.isArray(selections[poll._id]) && 
                        (selections[poll._id] as number[]).includes(optionIndex);
                      
                      return (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => 
                              handleMultipleSelection(poll._id, optionIndex, checked as boolean)
                            }
                          />
                          <Label className="text-sm cursor-pointer flex-1">
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <RadioGroup
                    value={selections[poll._id]?.toString() || ''}
                    onValueChange={(value) => handleSingleSelection(poll._id, parseInt(value))}
                  >
                    {poll.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={optionIndex.toString()} />
                        <Label className="text-sm cursor-pointer flex-1">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/join')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!allQuestionsAnswered || voting}
            size="lg"
          >
            {voting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Quiz'
            )}
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {allQuestionsAnswered ? (
            'All questions answered. Ready to submit!'
          ) : (
            `Please answer ${quiz.polls.length - Object.keys(selections).filter(key => {
              const selection = selections[key];
              const poll = quiz.polls.find(p => p._id === key);
              if (!poll) return false;
              if (poll.allowMultiple) {
                return Array.isArray(selection) && selection.length > 0;
              }
              return selection !== undefined;
            }).length} more question(s)`
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizVotingPage;