
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, Plus, X } from "lucide-react";
import { pollAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPollCreated: () => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onPollCreated }) => {
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await pollAPI.create(question, topic, options, allowMultiple);
      toast({
        title: "Success",
        description: "Poll created successfully!",
      });
      onPollCreated();
      handleClose();
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error",
        description: "Failed to create poll.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingCsv(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://teachingaid-backend.onrender.com'}/api/poll/bulk-create/csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload CSV');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: `Successfully created ${result.pollsCreated || 'multiple'} polls from CSV`,
      });

      onPollCreated();
      handleClose();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast({
        title: "Error",
        description: "Failed to upload CSV file",
        variant: "destructive",
      });
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `question,topic,option1,option2,option3,option4,allowMultiple
"What is your favorite color?","General","Red","Blue","Green","Yellow",false
"Which programming language do you prefer?","Technology","JavaScript","Python","Java","C++",true`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'poll-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setQuestion('');
    setTopic('');
    setOptions(['', '']);
    setAllowMultiple(false);
    setCsvFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground">Create New Poll</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Single Poll Creation */}
          <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
            <h3 className="text-base font-medium flex items-center gap-2 text-card-foreground">
              <Plus className="h-4 w-4 text-primary" />
              Create Single Poll
            </h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="question" className="text-sm font-medium text-foreground">Question</Label>
                <Textarea
                  id="question"
                  placeholder="Enter your poll question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[80px] bg-background border-input"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="topic" className="text-sm font-medium text-foreground">Topic</Label>
                <Input
                  id="topic"
                  placeholder="Enter poll topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-background border-input"
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-sm font-medium text-foreground">Options</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="bg-background border-input"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addOption}
                  className="w-fit border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-muted">
                <Label htmlFor="allowMultiple" className="text-sm font-medium text-foreground">
                  Allow Multiple Selections
                </Label>
                <Switch
                  id="allowMultiple"
                  checked={allowMultiple}
                  onCheckedChange={(checked) => setAllowMultiple(checked)}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !question.trim() || !topic.trim() || options.some(opt => !opt.trim())} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>

          <Separator className="bg-border" />

          {/* Bulk Upload Section */}
          <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
            <h3 className="text-base font-medium flex items-center gap-2 text-card-foreground">
              <Upload className="h-4 w-4 text-primary" />
              Bulk Upload from CSV
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 shrink-0"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <div className="text-xs text-muted-foreground">
                  Download the CSV template to see the required format for bulk poll creation
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="csv-file" className="text-sm font-medium text-foreground">
                  Upload CSV File
                </Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="cursor-pointer bg-background border-input file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:text-xs"
                />
                {csvFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>
              
              <Button
                onClick={handleCsvUpload}
                disabled={!csvFile || isUploadingCsv}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                {isUploadingCsv ? 'Uploading...' : 'Upload CSV'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollModal;
