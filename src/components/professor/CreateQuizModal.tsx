import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Trash2 } from 'lucide-react';
import { quizAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question: string;
  options: string[];
  allowMultiple: boolean;
}

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', question: '', options: ['', ''], allowMultiple: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([...questions, { 
      id: newId, 
      question: '', 
      options: ['', ''], 
      allowMultiple: false 
    }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, options: [...q.options, ''] } : q
    ));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { 
        ...q, 
        options: q.options.filter((_, index) => index !== optionIndex) 
      } : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { 
        ...q, 
        options: q.options.map((opt, index) => 
          index === optionIndex ? value : opt
        ) 
      } : q
    ));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a quiz title',
        variant: 'destructive',
      });
      return;
    }

    // Validate questions
    for (const question of questions) {
      if (!question.question.trim()) {
        toast({
          title: 'Error',
          description: 'Please fill in all question texts',
          variant: 'destructive',
        });
        return;
      }

      const validOptions = question.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast({
          title: 'Error',
          description: 'Each question must have at least 2 options',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload = questions.map(q => ({
        question: q.question.trim(),
        options: q.options.filter(opt => opt.trim()),
        allowMultiple: q.allowMultiple
      }));

      await quizAPI.create(title.trim(), description.trim(), payload);
      
      toast({
        title: 'Success',
        description: 'Quiz created successfully!',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setQuestions([{ id: '1', question: '', options: ['', ''], allowMultiple: false }]);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to create quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogDescription>
            Create a multi-question quiz with various answer options.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button onClick={addQuestion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Question {index + 1}</CardTitle>
                    {questions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Question Text</Label>
                    <Input
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                      placeholder="Enter your question"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={question.allowMultiple}
                      onCheckedChange={(checked) => updateQuestion(question.id, 'allowMultiple', checked)}
                    />
                    <Label>Allow multiple selections</Label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Options</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(question.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          {question.options.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(question.id, optionIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Quiz'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuizModal;