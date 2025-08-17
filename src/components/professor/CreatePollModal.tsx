import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, Plus } from "lucide-react";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Single Poll Creation */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Single Poll
            </h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Options</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 01-7.5 0"
                          />
                        </svg>
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  Add Option
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="allowMultiple">Allow Multiple Selections</Label>
                <Switch
                  id="allowMultiple"
                  checked={allowMultiple}
                  onCheckedChange={(checked) => setAllowMultiple(checked)}
                />
              </div>
            </div>
            
            <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
              {isLoading ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>

          <Separator />

          {/* Bulk Upload Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Bulk Upload from CSV
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <span className="text-xs text-muted-foreground">
                  Download CSV template to see the required format
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </div>
              
              <Button
                onClick={handleCsvUpload}
                disabled={!csvFile || isUploadingCsv}
                className="w-full"
                variant="secondary"
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
