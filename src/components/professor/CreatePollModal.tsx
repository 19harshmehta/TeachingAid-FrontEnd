
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
            Create New Poll
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Single Poll Creation */}
          <div className="space-y-4 p-6 rounded-lg border border-purple-200 bg-gradient-to-br from-white to-purple-50/50 shadow-lg">
            <h3 className="text-base font-medium flex items-center gap-2 text-purple-800">
              <Plus className="h-5 w-5 text-purple-600" />
              Create Single Poll
            </h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="question" className="text-sm font-medium text-purple-700">
                  Question
                </Label>
                <Textarea
                  id="question"
                  placeholder="Enter your poll question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[80px] bg-white/80 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="topic" className="text-sm font-medium text-purple-700">
                  Topic
                </Label>
                <Input
                  id="topic"
                  placeholder="Enter poll topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-white/80 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-sm font-medium text-purple-700">Options</Label>
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
                      className="bg-white/80 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="hover:bg-red-100 hover:text-red-600"
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
                  className="w-fit border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-md bg-gradient-to-r from-purple-100 to-pink-100">
                <Label htmlFor="allowMultiple" className="text-sm font-medium text-purple-700">
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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              {isLoading ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>

          <Separator className="bg-gradient-to-r from-purple-200 to-pink-200" />

          {/* Bulk Upload Section */}
          <div className="space-y-4 p-6 rounded-lg border border-blue-200 bg-gradient-to-br from-white to-blue-50/50 shadow-lg">
            <h3 className="text-base font-medium flex items-center gap-2 text-blue-800">
              <Upload className="h-5 w-5 text-blue-600" />
              Bulk Upload from CSV
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-md bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 shrink-0 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <div className="text-xs text-blue-700">
                  Download the CSV template to see the required format for bulk poll creation
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="csv-file" className="text-sm font-medium text-blue-700">
                  Upload CSV File
                </Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="cursor-pointer bg-white/80 border-blue-200 focus:border-blue-400 focus:ring-blue-400 file:bg-gradient-to-r file:from-blue-600 file:to-cyan-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:text-xs"
                />
                {csvFile && (
                  <p className="text-xs text-blue-600 font-medium">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>
              
              <Button
                onClick={handleCsvUpload}
                disabled={!csvFile || isUploadingCsv}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
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
