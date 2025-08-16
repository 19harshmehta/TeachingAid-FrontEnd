import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pollAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

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

interface LivePollViewProps {
  poll: Poll;
  onBack: () => void;
  onPollUpdated: (updatedPoll: Poll) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c', '#d0ed57'];

const LivePollView = ({ poll, onBack, onPollUpdated }: LivePollViewProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [pollVotes, setPollVotes] = useState<number[]>(poll.votes || []);
  const [totalVotes, setTotalVotes] = useState<number>(pollVotes.reduce((sum, count) => sum + count, 0));
  const [uniqueVoters, setUniqueVoters] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPollResults();
  }, [poll.code]);

  const fetchPollResults = async () => {
    setLoading(true);
    try {
      const response = await pollAPI.getPollResults(poll.code);
      if (response.data && Array.isArray(response.data.votes)) {
        const votesData = response.data.votes;
        setPollVotes(votesData);
        const total = votesData.reduce((sum, count) => sum + count, 0);
        setTotalVotes(total);
        setUniqueVoters(response.data.uniqueVoters || 0);
        
        // Update poll with current results
        const updatedPoll = { ...poll, votes: votesData };
        onPollUpdated(updatedPoll);
      } else {
        console.error('Unexpected response structure for poll results:', response.data);
        toast({
          title: "Error",
          description: "Failed to fetch poll results",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching poll results:', error);
      toast({
        title: "Error",
        description: "Failed to fetch poll results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    return poll.options.map((option, index) => ({
      name: option,
      votes: pollVotes[index] || 0,
    }));
  }, [poll.options, pollVotes]);

  const leadingOption = useMemo(() => {
    if (totalVotes === 0) return null;

    let maxVotes = 0;
    let leadingIndex = -1;

    pollVotes.forEach((votes, index) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        leadingIndex = index;
      }
    });

    if (leadingIndex === -1) return null;

    const percentage = ((maxVotes / totalVotes) * 100).toFixed(1);
    return {
      label: poll.options[leadingIndex],
      percentage: percentage,
    };
  }, [poll.options, pollVotes, totalVotes]);

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Poll Settings */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <Button
                onClick={onBack}
                variant="outline"
                className="bg-white/70 backdrop-blur-sm w-fit"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Topic: {poll.topic || 'General'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  poll.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {poll.isActive ? 'Active' : 'Closed'}
                </span>
                {poll.allowMultiple && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Multiple Selection
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Code: {poll.code}
                </span>
              </div>
            </div>

            {/* Poll Question - Left Aligned */}
            <div className="text-left mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                {poll.question}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{poll.options.length} options</span>
                <span>•</span>
                <span>{totalVotes} total votes</span>
                <span>•</span>
                <span>{uniqueVoters} participants</span>
              </div>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-sm text-gray-600">Total Votes</p>
                <p className="text-xl font-bold text-blue-600">{totalVotes}</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-sm text-gray-600">Participants</p>
                <p className="text-xl font-bold text-green-600">{uniqueVoters}</p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-sm text-gray-600">Leading Option</p>
                <p className="text-xl font-bold text-purple-600">
                  {leadingOption ? `${leadingOption.label} (${leadingOption.percentage}%)` : 'N/A'}
                </p>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-xl font-bold text-orange-600">
                  {totalVotes > 0 ? `${((totalVotes / Math.max(uniqueVoters, 1)) * 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Vote Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Votes']}
                      labelFormatter={(label) => `Option: ${label}`}
                    />
                    <Bar 
                      dataKey="votes" 
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Vote Percentage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="votes"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, 'Votes']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {poll.options.map((option, index) => {
                const votes = pollVotes[index] || 0;
                const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{option}</span>
                      <span className="text-sm text-gray-600">{votes} votes ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LivePollView;
