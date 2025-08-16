
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, HelpCircle } from 'lucide-react';
import { pollAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPollCreated: () => void;
}

const CreatePollModal = ({ isOpen, onClose, onPollCreated }: CreatePollModalProps) => {
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !topic.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both question and topic",
        variant: "destructive",
      });
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please provide at least 2 options",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await pollAPI.create(question.trim(), topic.trim(), validOptions, allowMultiple);
      toast({
        title: "Poll Created!",
        description: `Poll code: ${response.data.code}`,
      });
      
      // Reset form
      setQuestion('');
      setTopic('');
      setOptions(['', '']);
      setAllowMultiple(false);
      
      onPollCreated();
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuestion('');
    setTopic('');
    setOptions(['', '']);
    setAllowMultiple(false);
    onClose();
  };

  const handleAllowMultipleChange = (checked: boolean | "indeterminate") => {
    setAllowMultiple(checked === true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create New Poll
          </DialogTitle>
          <p className="text-gray-600 text-sm">Design an engaging poll for your audience</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-2 border-purple-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                Basic Information
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-sm font-medium text-gray-700">
                    Topic *
                  </Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Programming, Science, General"
                    required
                    className="border-2 border-gray-200 focus:border-purple-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500">Categorize your poll for better organization</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="allowMultiple"
                      checked={allowMultiple}
                      onCheckedChange={handleAllowMultipleChange}
                      className="border-2 border-gray-300"
                    />
                    <Label htmlFor="allowMultiple" className="text-sm font-medium text-gray-700">
                      Allow multiple selections
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">Let participants select more than one option</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Section */}
          <Card className="border-2 border-blue-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Question</h3>
              
              <div className="space-y-2">
                <Label htmlFor="question" className="text-sm font-medium text-gray-700">
                  Poll Question *
                </Label>
                <Textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your poll question here. You can use multiple lines and include code snippets."
                  required
                  rows={4}
                  className="font-mono text-sm border-2 border-gray-200 focus:border-blue-500 transition-colors resize-none"
                />
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">Tip:</span>
                  <span>Supports multiline text and code snippets. Use proper formatting for better readability.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options Section */}
          <Card className="border-2 border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Answer Options</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="border-2 border-green-200 hover:border-green-400 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              
              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">
                      <Textarea
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1} (supports multiline and code)`}
                        rows={2}
                        className="font-mono text-sm border-2 border-gray-200 focus:border-green-500 transition-colors resize-none"
                      />
                    </div>
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="mt-1 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                <span className="px-2 py-1 bg-gray-100 rounded">Note:</span>
                <span>Each option supports multiline text and code snippets. Minimum 2 options required.</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border-2 border-gray-300 hover:border-gray-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </div>
              ) : (
                'Create Poll'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollModal;
