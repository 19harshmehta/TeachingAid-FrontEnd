
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
  onSuccess: () => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onSuccess }) => {
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
      onSuccess();
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

      onSuccess();
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
  const link = document.createElement('a');
  link.href = '/poll-template.csv';  // File path in your public folder
  link.download = 'poll-template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-purple-200">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
            Create New Poll
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 p-2">
          {/* Single Poll Creation */}
          <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-white/90 to-purple-50/80 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
            <h3 className="text-lg font-semibold flex items-center gap-3 text-purple-800">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <Plus className="h-5 w-5 text-white" />
              </div>
              Create Single Poll
            </h3>
            
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="question" className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  Question
                </Label>
                <Textarea
                  id="question"
                  placeholder="Enter your poll question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px] bg-white/80 border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg text-gray-800"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="topic" className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  Topic
                </Label>
                <Input
                  id="topic"
                  placeholder="Enter poll topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-white/80 border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg h-12"
                />
              </div>

              <div className="grid gap-4">
                <Label className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  Options
                </Label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = e.target.value;
                          setOptions(newOptions);
                        }}
                        className="bg-white/80 border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg h-12"
                      />
                    </div>
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="hover:bg-red-100 hover:text-red-600 rounded-lg h-12 w-12 border-2 border-transparent hover:border-red-200"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addOption}
                  className="w-fit border-2 border-dashed border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 rounded-lg h-10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-100/80 to-pink-100/80 border-2 border-purple-200">
                <Label htmlFor="allowMultiple" className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
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
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>

          <Separator className="bg-gradient-to-r from-purple-300 to-pink-300 h-0.5" />

          {/* Bulk Upload Section */}
          <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-white/90 to-blue-50/80 backdrop-blur-sm border-2 border-blue-200 shadow-lg">
            <h3 className="text-lg font-semibold flex items-center gap-3 text-blue-800">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                <Upload className="h-5 w-5 text-white" />
              </div>
              Bulk Upload from CSV
            </h3>
            
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-cyan-50/80 border-2 border-blue-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 shrink-0 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 rounded-lg h-10"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <div className="text-sm text-blue-700 font-medium">
                  Download the CSV template to see the required format for bulk poll creation
                </div>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="csv-file" className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  Upload CSV File
                </Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="cursor-pointer bg-white/80 border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-lg h-12 file:bg-gradient-to-r file:from-blue-500 file:to-cyan-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:text-sm file:font-medium file:mr-4"
                />
                {csvFile && (
                  <p className="text-sm text-blue-600 font-medium bg-blue-50 p-2 rounded-lg border border-blue-200">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>
              
              <Button
                onClick={handleCsvUpload}
                disabled={!csvFile || isUploadingCsv}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
