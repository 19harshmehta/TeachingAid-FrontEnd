
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { pollAPI } from '@/services/api';
import { getFingerprint } from '@/services/fingerprint';
import { useToast } from '@/hooks/use-toast';
import { Vote, ArrowLeft, User } from 'lucide-react';

interface Poll {
  _id: string;
  question: string;
  topic: string;
  options: string[];
  code: string;
  isActive: boolean;
  allowMultiple: boolean;
  createdBy: {
    name: string;
  };
}

const VotingPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  useEffect(() => {
    if (code) {
      fetchPoll();
    }
  }, [code]);

  const fetchPoll = async () => {
    try {
      const response = await pollAPI.getPollByCode(code!);
      setPoll(response.data);
    } catch (error) {
      console.error('Error fetching poll:', error);
      toast({
        title: "Error",
        description: "Failed to load poll",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleOptionChange = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleMultipleOptionChange = (optionIndex: number, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, optionIndex]);
    } else {
      setSelectedOptions(selectedOptions.filter(index => index !== optionIndex));
    }
  };

  const handleSubmitVote = async () => {
    if (!poll) return;

    if (poll.allowMultiple && selectedOptions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one option",
        variant: "destructive",
      });
      return;
    }

    if (!poll.allowMultiple && selectedOption === null) {
      toast({
        title: "Error",
        description: "Please select an option",
        variant: "destructive",
      });
      return;
    }

    setVoting(true);

    try {
      const fingerprint = await getFingerprint();
      
      if (poll.allowMultiple) {
        await pollAPI.vote(code!, undefined, selectedOptions, fingerprint);
      } else {
        await pollAPI.vote(code!, selectedOption!, undefined, fingerprint);
      }

      toast({
        title: "Vote Submitted!",
        description: "Thank you for participating",
      });

      // Navigate to results or back to join page
      navigate('/');
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
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl max-w-md w-full mx-4">
          <CardContent className="text-center p-6">
            <p className="text-gray-600 mb-4">Poll not found</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!poll.isActive) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl max-w-md w-full mx-4">
          <CardContent className="text-center p-6">
            <p className="text-gray-600 mb-4">This poll is no longer active</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
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
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-6 bg-white/70 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <User className="h-4 w-4" />
                <span>Created by {poll.createdBy?.name || 'Unknown'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {poll.topic}
                </span>
                {poll.allowMultiple && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Multiple Choice
                  </span>
                )}
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800">
                <div className="whitespace-pre-wrap">{poll.question}</div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {poll.options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    {poll.allowMultiple ? (
                      <Checkbox
                        id={`option-${index}`}
                        checked={selectedOptions.includes(index)}
                        onCheckedChange={(checked) => handleMultipleOptionChange(index, checked as boolean)}
                        className="mt-1"
                      />
                    ) : (
                      <input
                        type="radio"
                        id={`option-${index}`}
                        name="poll-option"
                        value={index}
                        checked={selectedOption === index}
                        onChange={() => handleSingleOptionChange(index)}
                        className="mt-1"
                      />
                    )}
                    <label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer whitespace-pre-wrap"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSubmitVote}
                disabled={voting || (poll.allowMultiple ? selectedOptions.length === 0 : selectedOption === null)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Vote className="h-4 w-4 mr-2" />
                {voting ? 'Submitting...' : 'Submit Vote'}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Poll Code: <span className="font-mono">{poll.code}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;
