
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users } from 'lucide-react';

interface PastResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  poll: {
    question: string;
    topic?: string;
    options: string[];
    history?: Array<{
      votes: number[];
      votedFingerprints: number;
      timestamp: string;
      _id: string;
    }>;
  };
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const PastResultsModal: React.FC<PastResultsModalProps> = ({ isOpen, onClose, poll }) => {
  if (!poll.history || poll.history.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Past Results</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <p className="text-gray-500">No historical data available for this poll.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Get the most recent historical data
  const latestHistory = poll.history[poll.history.length - 1];
  const totalVotes = latestHistory.votes.reduce((sum, votes) => sum + votes, 0);

  const chartData = poll.options.map((option, index) => ({
    option: option.length > 20 ? option.substring(0, 20) + '...' : option,
    fullOption: option,
    votes: latestHistory.votes[index] || 0,
    percentage: totalVotes > 0 ? Math.round((latestHistory.votes[index] / totalVotes) * 100) : 0
  }));

  const pieData = chartData.filter(item => item.votes > 0).map((item, index) => ({
    name: item.fullOption,
    value: item.votes,
    color: COLORS[index % COLORS.length],
    percentage: item.percentage
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Past Results</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Question Section */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <pre className="text-lg font-bold text-gray-800 mb-4 whitespace-pre-wrap font-mono">
                  {poll.question}
                </pre>
                
                {poll.topic && (
                  <div className="flex justify-center mb-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Topic: {poll.topic}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{totalVotes} total votes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last activity: {new Date(latestHistory.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Results Summary</CardTitle>
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
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Results - Bar Chart</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Results - Pie Chart</CardTitle>
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
                      <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p>No votes recorded</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* History Timeline */}
          {poll.history.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Poll History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {poll.history.map((historyItem, index) => {
                    const historyTotalVotes = historyItem.votes.reduce((sum, votes) => sum + votes, 0);
                    return (
                      <div key={historyItem._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">Session {index + 1}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(historyItem.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {historyTotalVotes} votes
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PastResultsModal;
