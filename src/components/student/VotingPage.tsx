
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Users, X, AlertCircle } from 'lucide-react';
import { pollAPI } from '@/services/api';
import { getFingerprint } from '@/services/fingerprint';
import { useToast } from '@/hooks/use-toast';

interface Poll {
  _id: string;
  question: string;
  options: string[];
  code: string;
  isActive: boolean;
}

const VotingPage = () => {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [poll, setPoll] = useState<Poll | null>(location.state?.poll || null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!location.state?.poll);
  const [error, setError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string>('');

  useEffect(() => {
    console.log('VotingPage mounted with code:', code);
    console.log('Location state:', location.state);
    initializeFingerprint();
    
    if (!poll && code) {
      console.log('No poll in state, fetching poll with code:', code);
      fetchPoll();
    }
  }, [code, poll]);

  const initializeFingerprint = async () => {
    try {
      const fp = await getFingerprint();
      setFingerprint(fp);
      console.log('Generated fingerprint:', fp);
    } catch (error) {
      console.error('Failed to generate fingerprint:', error);
      toast({
        title: "Error",
        description: "Failed to initialize voting system",
        variant: "destructive",
      });
    }
  };

  const fetchPoll = async () => {
    if (!code) {
      console.error('No poll code provided');
      setError("Invalid poll code");
      setInitialLoading(false);
      return;
    }
    
    console.log('Starting poll fetch for code:', code);
    setInitialLoading(true);
    setError(null);
    
    try {
      console.log('Making API call to fetch poll with code:', code);
      const response = await pollAPI.getPollByCode(code);
      console.log('Poll API response:', response);
      console.log('Poll data received:', response.data);
      
      if (response.data) {
        setPoll(response.data);
        console.log('Poll set successfully:', response.data);
      } else {
        console.error('No data in response');
        setError("Poll data not found");
      }
    } catch (error: any) {
      console.error('Error fetching poll:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = "This poll could not be found";
      
      if (error.response?.status === 404) {
        errorMessage = "Poll not found. Please check the poll code and try again.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Poll Not Found",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleVote = async () => {
    if (!poll || selectedOption === null || !fingerprint) return;

    setLoading(true);

    try {
      console.log('Submitting vote:', { code: poll.code, optionIndex: selectedOption, fingerprint });
      const response = await pollAPI.vote(poll.code, selectedOption, fingerprint);
      console.log('Vote response:', response.data);
      setHasVoted(true);
      toast({
        title: "Vote Recorded!",
        description: "Thank you for participating in the poll",
      });
    } catch (error: any) {
      console.error('Vote error:', error);
      toast({
        title: "Vote Failed",
        description: error.response?.data?.message || "Failed to record your vote",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading poll...</p>
          <p className="text-sm text-gray-500 mt-2">Code: {code}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Poll Not Found</h2>
            <p className="text-gray-600 mb-2">
              {error || "The poll you're looking for doesn't exist or has been removed."}
            </p>
            <p className="text-sm text-gray-500 mb-6">Poll Code: {code}</p>
            <div className="space-y-3">
              <Button
                onClick={() => fetchPoll()}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate('/join')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Join Another Poll
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show closed poll message
  if (!poll.isActive) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Poll Closed</h2>
            <p className="text-gray-600 mb-6">
              This poll is no longer accepting votes. Please check with your instructor for more information.
            </p>
            <Button
              onClick={() => navigate('/join')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Join Another Poll
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Vote Recorded!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for participating in this poll. Your vote has been recorded.
            </p>
            <Button
              onClick={() => navigate('/join')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Join Another Poll
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main p-4">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/join')}
          className="mb-6 text-purple-700 hover:text-purple-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Join
        </Button>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Poll Code:</span>
              <span className="font-mono text-lg font-bold text-purple-600">{poll.code}</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
              {poll.question}
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-purple-700">
              <Users className="h-4 w-4" />
              <span className="text-sm">Live Poll</span>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-3 mb-6">
              {poll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedOption === index
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {selectedOption === index && (
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleVote}
              disabled={selectedOption === null || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              {loading ? 'Recording Vote...' : 'Submit Vote'}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Your vote is anonymous and will be recorded securely.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VotingPage;
