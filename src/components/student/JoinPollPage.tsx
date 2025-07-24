
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Hash } from 'lucide-react';
import { pollAPI } from '@/services/api';
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
        title: "Error",
        description: "Please enter a poll code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await pollAPI.getPollByCode(pollCode.trim().toUpperCase());
      const poll = response.data;
      
      if (!poll.isActive) {
        toast({
          title: "Poll Inactive",
          description: "This poll is not currently active",
          variant: "destructive",
        });
        return;
      }

      navigate(`/poll/${poll.code}`, { state: { poll } });
    } catch (error: any) {
      toast({
        title: "Poll Not Found",
        description: error.response?.data?.message || "Invalid poll code",
        variant: "destructive",
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
            <p className="text-gray-600">Enter the poll code provided by your instructor</p>
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
                    placeholder="Enter poll code (e.g., ABC123)"
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
                {loading ? 'Joining...' : 'Join Poll'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have a poll code? Ask your instructor to provide one.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mt-6 bg-gradient-to-r from-blue-100/80 to-purple-100/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">
              How it works
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. Get the poll code from your instructor</p>
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
