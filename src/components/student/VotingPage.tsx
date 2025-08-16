
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Vote, Users, AlertCircle } from 'lucide-react';
import { pollAPI } from '@/services/api';
import { getFingerprint } from '@/services/fingerprint';
import { useToast } from '@/hooks/use-toast';

interface Poll {
  _id: string;
  question: string;
  topic?: string;
  options: string[];
  code: string;
  isActive: boolean;
  allowMultiple?: boolean;
}

const VotingPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [singleSelection, setSingleSelection] = useState<string>('');
  const [fingerprint, setFingerprint] = useState<string>('');

  useEffect(() => {
    if (code) {
      fetchPoll();
      initFingerprint();
    }
  }, [code]);

  const initFingerprint = async () => {
    try {
      const fp = await getFingerprint();
      setFingerprint(fp);
    } catch (error) {
      console.error('Error getting fingerprint:', error);
      // Generate a fallback fingerprint
      setFingerprint(`fp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    }
  };

  const fetchPoll = async () => {
    try {
      const response = await pollAPI.getPollByCode(code!);
      console.log('Poll data:', response.data);
      
      let pollData = response.data;
      if (response.data.data) {
        pollData = response.data.data;
      }
      
      setPoll(pollData);
    } catch (error) {
      console.error('Error fetching poll:', error);
      toast({
        title: "Error",
        description: "Poll not found or has expired",
        variant: "destructive",
      });
      navigate('/join');
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleSelectionChange = (optionIndex: number, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, optionIndex]);
    } else {
      setSelectedOptions(selectedOptions.filter(index => index !== optionIndex));
    }
  };

  const handleSingleSelectionChange = (value: string) => {
    setSingleSelection(value);
  };

  const handleVote = async () => {
    if (!poll || !fingerprint) return;

    if (poll.allowMultiple) {
      if (selectedOptions.length === 0) {
        toast({
          title: "No Selection",
          description: "Please select at least one option",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (singleSelection === '') {
        toast({
          title: "No Selection",
          description: "Please select an option",
          variant: "destructive",
        });
        return;
      }
    }

    setVoting(true);

    try {
      if (poll.allowMultiple) {
        await pollAPI.vote(poll.code, undefined, selectedOptions, fingerprint);
      } else {
        await pollAPI.vote(poll.code, parseInt(singleSelection), undefined, fingerprint);
      }

      toast({
        title: "Vote Submitted!",
        description: "Thank you for participating in the poll",
      });

      // Navigate to a thank you page or back to join
      setTimeout(() => {
        navigate('/join');
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      const errorMessage = error.response?.data?.message || "Failed to submit vote";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Poll Not Found</h2>
            <p className="text-gray-600 mb-4">The poll you're looking for doesn't exist or has expired.</p>
            <Button onClick={() => navigate('/join')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Join
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!poll.isActive) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <Vote className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Poll Closed</h2>
            <p className="text-gray-600 mb-4">This poll is no longer accepting votes.</p>
            <Button onClick={() => navigate('/join')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Join
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => navigate('/join')}
              className="text-purple-700 hover:text-purple-800 hover:bg-purple-50 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Join
            </Button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-600">Poll Code: <span className="font-mono font-bold">{poll.code}</span></span>
              </div>
              
              {poll.topic && (
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                  {poll.topic}
                </span>
              )}
            </div>
          </div>

          {/* Poll Question */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-8 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-center">
                <pre className="text-lg md:text-xl font-bold text-gray-800 whitespace-pre-wrap font-mono">
                  {poll.question}
                </pre>
              </CardTitle>
              {poll.allowMultiple && (
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mt-2">
                    Multiple selections allowed
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {poll.allowMultiple ? (
                  // Multiple selection mode
                  poll.options.map((option, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                      <Checkbox
                        id={`option-${index}`}
                        checked={selectedOptions.includes(index)}
                        onCheckedChange={(checked) => handleMultipleSelectionChange(index, checked as boolean)}
                        className="mt-1"
                      />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 cursor-pointer"
                      >
                        <pre className="whitespace-pre-wrap font-mono text-sm">
                          {option}
                        </pre>
                      </Label>
                    </div>
                  ))
                ) : (
                  // Single selection mode
                  <RadioGroup value={singleSelection} onValueChange={handleSingleSelectionChange}>
                    {poll.options.map((option, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className="flex-1 cursor-pointer"
                        >
                          <pre className="whitespace-pre-wrap font-mono text-sm">
                            {option}
                          </pre>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={handleVote}
                  disabled={voting || (poll.allowMultiple ? selectedOptions.length === 0 : singleSelection === '')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 text-lg"
                >
                  {voting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Vote...
                    </>
                  ) : (
                    <>
                      <Vote className="h-5 w-5 mr-2" />
                      Submit Vote
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-gradient-to-r from-blue-100/80 to-purple-100/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2 text-purple-800">
                How to Vote
              </h3>
              <p className="text-sm text-purple-600">
                {poll.allowMultiple 
                  ? "Select one or more options that apply to you, then click 'Submit Vote'."
                  : "Select one option that best represents your choice, then click 'Submit Vote'."
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;
