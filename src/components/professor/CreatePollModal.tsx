
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
import { Plus, X } from 'lucide-react';
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Programming, Science, General"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your poll question here. You can use multiple lines and include code snippets."
              required
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Supports multiline text and code snippets. Use proper formatting for better readability.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
            
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1} (supports multiline and code)`}
                    rows={2}
                    className="font-mono text-sm"
                  />
                </div>
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    className="mt-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <p className="text-xs text-gray-500">
              Each option supports multiline text and code snippets.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowMultiple"
              checked={allowMultiple}
              onCheckedChange={handleAllowMultipleChange}
            />
            <Label htmlFor="allowMultiple" className="text-sm">
              Allow multiple selections
            </Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollModal;
