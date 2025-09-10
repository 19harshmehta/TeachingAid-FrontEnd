import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Hash } from 'lucide-react';
import { pollAPI, quizAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const JoinPollPage = () => {
  const [pollCode, setPollCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pollCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const code = pollCode.toUpperCase();
      
      // First try to fetch as a quiz
      try {
        await quizAPI.getQuizByCode(code);
        navigate(`/quiz/${code}`);
        return;
      } catch (quizError) {
        // If quiz fetch fails, try as a poll
        try {
          await pollAPI.getPollByCode(code);
          navigate(`/vote/${code}`);
          return;
        } catch (pollError) {
          // Both failed
          throw new Error('Code not found');
        }
      }
    } catch (error) {
      console.error('Error fetching code:', error);
      toast({
        title: 'Error',
        description: 'Code not found. Please check the code and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-purple-700 hover:text-purple-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join a Poll
            </CardTitle>
            <p className="text-gray-600">Enter the code provided by your instructor</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pollCode">Poll Code</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="pollCode"
                    type="text"
                    placeholder="Enter code (e.g., ABC123)"
                    value={pollCode}
                    onChange={(e) => setPollCode(e.target.value.toUpperCase())}
                    className="pl-10 text-center text-lg font-mono"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={loading}
              >
                {loading ? 'Joining...' : 'Join Session'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have a code? Ask your instructor to provide one.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mt-6 bg-gradient-to-r from-blue-100/80 to-purple-100/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up">
          <CardContent className="p-4 sm:p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">
              How it works
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. Get the code from your instructor</p>
              <p>2. Enter the code above</p>
              <p>3. Vote and see live results!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinPollPage;
