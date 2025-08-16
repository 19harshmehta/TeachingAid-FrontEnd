
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PastResultsViewProps {
  poll: {
    _id: string;
    question: string;
    topic?: string;
    options: string[];
    code: string;
    history?: Array<{
      votes: number[];
      votedFingerprints: number;
      timestamp: string;
      _id: string;
    }>;
  };
  onBack: () => void;
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const PastResultsView: React.FC<PastResultsViewProps> = ({ poll, onBack }) => {
  // Get the most recent history entry for results
  const latestHistory = poll.history && poll.history.length > 0 ? poll.history[poll.history.length - 1] : null;
  const historicalVotes = latestHistory?.votes || [];
  
  const totalVotes = historicalVotes.reduce((sum, count) => sum + count, 0);
  
  const chartData = poll.options.map((option, index) => ({
    option: option.length > 20 ? option.substring(0, 20) + '...' : option,
    fullOption: option,
    votes: historicalVotes[index] || 0,
    percentage: totalVotes > 0 ? Math.round(((historicalVotes[index] || 0) / totalVotes) * 100) : 0
  }));

  const pieData = chartData.filter(item => item.votes > 0).map((item, index) => ({
    name: item.fullOption,
    value: item.votes,
    color: COLORS[index % COLORS.length],
    percentage: item.percentage
  }));

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-purple-700 hover:text-purple-800 hover:bg-purple-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-700">Past Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-8 animate-fade-in">
          <CardContent className="p-6">
            <div className="text-center">
              <pre className="text-xl md:text-2xl font-bold text-gray-800 mb-4 whitespace-pre-wrap font-mono">
                {poll.question}
              </pre>
              
              {poll.topic && (
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Topic: {poll.topic}
                  </span>
                </div>
              )}

              <div className="flex justify-center">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Historical Results - Poll Code: {poll.code}
                </span>
              </div>

              {latestHistory && (
                <p className="text-sm text-gray-600 mt-2">
                  Results from: {new Date(latestHistory.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* No History Message */}
        {!latestHistory && (
          <Card className="mb-8 bg-yellow-50/80 backdrop-blur-sm border-yellow-200 shadow-lg animate-fade-in">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2 text-yellow-800">
                No Historical Data
              </h3>
              <p className="text-sm text-yellow-600">
                This poll doesn't have any historical voting data available.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        {latestHistory && (
          <>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in mb-8">
              <CardHeader>
                <CardTitle>Historical Results Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-white/50 to-purple-50/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <pre className="font-medium text-sm font-mono whitespace-pre-wrap break-words flex-1">
                          {item.fullOption}
                        </pre>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="font-bold text-lg">{item.votes} votes</div>
                        <div className="text-sm text-gray-600">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Bar Chart */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-center">Historical Results - Bar Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="option" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [value, 'Votes']}
                        labelFormatter={(label) => {
                          const item = chartData.find(d => d.option === label);
                          return item?.fullOption || label;
                        }}
                      />
                      <Bar dataKey="votes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="text-center">Historical Results - Pie Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  {totalVotes > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ percentage }) => `${percentage}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, 'Votes']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p>No votes in history</p>
                        <p className="text-sm">This poll had no votes when it was last closed</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PastResultsView;
