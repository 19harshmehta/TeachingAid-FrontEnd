
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Tag } from 'lucide-react';

interface PollsSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  topicFilter: string;
  onTopicFilterChange: (value: string) => void;
  availableTopics: string[];
}

const PollsSearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange,
  topicFilter,
  onTopicFilterChange,
  availableTopics
}: PollsSearchFilterProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search polls by question or topic..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white/70 backdrop-blur-sm border-0 shadow-lg"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Tag className="h-4 w-4 text-gray-600" />
          <Select value={topicFilter} onValueChange={onTopicFilterChange}>
            <SelectTrigger className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {availableTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 flex-1">
          <Filter className="h-4 w-4 text-gray-600" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="active">Active First</SelectItem>
              <SelectItem value="closed">Closed First</SelectItem>
              <SelectItem value="topic">By Topic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PollsSearchFilter;
