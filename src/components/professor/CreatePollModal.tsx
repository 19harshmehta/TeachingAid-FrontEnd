
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, Download, Plus, X, Users, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { pollAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPollCreated: () => void;
}

type CreateMode = 'selection' | 'single' | 'bulk' | 'group';

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onPollCreated }) => {
  const [createMode, setCreateMode] = useState<CreateMode>('selection');
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  
  // Poll Group fields
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupPolls, setGroupPolls] = useState([{ question: '', topic: '', options: ['', ''], allowMultiple: false }]);
  
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
  const link = document.createElement('a');
  link.href = '/poll-template.csv';  // File path in your public folder
  link.download = 'poll-template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const addPollToGroup = () => {
    setGroupPolls([...groupPolls, { question: '', topic: '', options: ['', ''], allowMultiple: false }]);
  };

  const removePollFromGroup = (index: number) => {
    if (groupPolls.length > 1) {
      const newPolls = [...groupPolls];
      newPolls.splice(index, 1);
      setGroupPolls(newPolls);
    }
  };

  const updateGroupPoll = (index: number, field: string, value: any) => {
    const newPolls = [...groupPolls];
    newPolls[index] = { ...newPolls[index], [field]: value };
    setGroupPolls(newPolls);
  };

  const addOptionToGroupPoll = (pollIndex: number) => {
    const newPolls = [...groupPolls];
    newPolls[pollIndex].options.push('');
    setGroupPolls(newPolls);
  };

  const removeOptionFromGroupPoll = (pollIndex: number, optionIndex: number) => {
    const newPolls = [...groupPolls];
    if (newPolls[pollIndex].options.length > 2) {
      newPolls[pollIndex].options.splice(optionIndex, 1);
      setGroupPolls(newPolls);
    }
  };

  const updateGroupPollOption = (pollIndex: number, optionIndex: number, value: string) => {
    const newPolls = [...groupPolls];
    newPolls[pollIndex].options[optionIndex] = value;
    setGroupPolls(newPolls);
  };

  const handleSubmitGroup = async () => {
    setIsLoading(true);
    try {
      // Create each poll in the group individually
      const createPromises = groupPolls.map(poll => 
        pollAPI.create(poll.question, poll.topic, poll.options, poll.allowMultiple)
      );
      
      await Promise.all(createPromises);
      
      toast({
        title: "Success",
        description: `Poll group "${groupName}" created successfully with ${groupPolls.length} polls!`,
      });
      onPollCreated();
      handleClose();
    } catch (error) {
      console.error("Error creating poll group:", error);
      toast({
        title: "Error",
        description: "Failed to create poll group.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCreateMode('selection');
    setQuestion('');
    setTopic('');
    setOptions(['', '']);
    setAllowMultiple(false);
    setCsvFile(null);
    setGroupName('');
    setGroupDescription('');
    setGroupPolls([{ question: '', topic: '', options: ['', ''], allowMultiple: false }]);
    onClose();
  };

  const renderSelectionView = () => (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Choose how you want to create polls
        </h2>
        <p className="text-muted-foreground">
          Select one of the options below to get started
        </p>
      </div>
      
      <div className="grid gap-4">
        <Button
          onClick={() => setCreateMode('single')}
          className="w-full h-20 bg-gradient-purple text-white hover:opacity-90 transition-all duration-200 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-white/20">
              <Plus className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">Create Single Poll</div>
              <div className="text-sm opacity-90">Create one poll with custom options</div>
            </div>
          </div>
        </Button>

        <Button
          onClick={() => setCreateMode('bulk')}
          className="w-full h-20 bg-gradient-blue text-white hover:opacity-90 transition-all duration-200 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-white/20">
              <Upload className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">Bulk Upload by CSV</div>
              <div className="text-sm opacity-90">Upload multiple polls from a CSV file</div>
            </div>
          </div>
        </Button>

        <Button
          onClick={() => setCreateMode('group')}
          className="w-full h-20 bg-gradient-pink text-white hover:opacity-90 transition-all duration-200 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-white/20">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">Create a Poll Group</div>
              <div className="text-sm opacity-90">Create multiple related polls together</div>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );

  const renderSinglePollView = () => (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCreateMode('selection')}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">Create Single Poll</h3>
      </div>
      
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="question" className="text-sm font-medium text-foreground">
            Question
          </Label>
          <Textarea
            id="question"
            placeholder="Enter your poll question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="topic" className="text-sm font-medium text-foreground">
            Topic
          </Label>
          <Input
            id="topic"
            placeholder="Enter poll topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="grid gap-4">
          <Label className="text-sm font-medium text-foreground">Options</Label>
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
                />
              </div>
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  className="hover:bg-destructive hover:text-destructive-foreground"
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
            className="w-fit"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
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
        className="w-full bg-gradient-purple text-white hover:opacity-90"
      >
        {isLoading ? 'Creating...' : 'Create Poll'}
      </Button>
    </div>
  );

  const renderBulkUploadView = () => (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCreateMode('selection')}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">Bulk Upload from CSV</h3>
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg bg-muted">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="flex items-center gap-2 shrink-0"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          <div className="text-sm text-muted-foreground">
            Download the CSV template to see the required format for bulk poll creation
          </div>
        </div>
        
        <div className="space-y-4">
          <Label htmlFor="csv-file" className="text-sm font-medium text-foreground">
            Upload CSV File
          </Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="cursor-pointer"
          />
          {csvFile && (
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded-lg">
              Selected: {csvFile.name}
            </p>
          )}
        </div>
        
        <Button
          onClick={handleCsvUpload}
          disabled={!csvFile || isUploadingCsv}
          className="w-full bg-gradient-blue text-white hover:opacity-90"
        >
          {isUploadingCsv ? 'Uploading...' : 'Upload CSV'}
        </Button>
      </div>
    </div>
  );

  const renderGroupPollView = () => (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCreateMode('selection')}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">Create Poll Group</h3>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="groupName" className="text-sm font-medium text-foreground">
            Group Name
          </Label>
          <Input
            id="groupName"
            placeholder="Enter group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="groupDescription" className="text-sm font-medium text-foreground">
            Group Description (Optional)
          </Label>
          <Textarea
            id="groupDescription"
            placeholder="Enter group description..."
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <Separator />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Polls in Group</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPollToGroup}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Poll
            </Button>
          </div>

          {groupPolls.map((poll, pollIndex) => (
            <div key={pollIndex} className="p-4 rounded-lg bg-muted space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Poll {pollIndex + 1}</h4>
                {groupPolls.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePollFromGroup(pollIndex)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                <Input
                  placeholder="Poll question..."
                  value={poll.question}
                  onChange={(e) => updateGroupPoll(pollIndex, 'question', e.target.value)}
                />
                
                <Input
                  placeholder="Poll topic..."
                  value={poll.topic}
                  onChange={(e) => updateGroupPoll(pollIndex, 'topic', e.target.value)}
                />

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Options</Label>
                  {poll.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <Input
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => updateGroupPollOption(pollIndex, optionIndex, e.target.value)}
                      />
                      {poll.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOptionFromGroupPoll(pollIndex, optionIndex)}
                          className="hover:bg-destructive hover:text-destructive-foreground"
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
                    onClick={() => addOptionToGroupPoll(pollIndex)}
                    className="w-fit"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Allow Multiple Selections</Label>
                  <Switch
                    checked={poll.allowMultiple}
                    onCheckedChange={(checked) => updateGroupPoll(pollIndex, 'allowMultiple', checked)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubmitGroup}
          disabled={isLoading || !groupName.trim() || groupPolls.some(poll => 
            !poll.question.trim() || !poll.topic.trim() || poll.options.some(opt => !opt.trim())
          )}
          className="w-full bg-gradient-pink text-white hover:opacity-90"
        >
          {isLoading ? 'Creating Group...' : `Create Poll Group (${groupPolls.length} polls)`}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border shadow-lg">
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {createMode === 'selection' && 'Create New Poll'}
            {createMode === 'single' && 'Create Single Poll'}
            {createMode === 'bulk' && 'Bulk Upload Polls'}
            {createMode === 'group' && 'Create Poll Group'}
          </DialogTitle>
        </DialogHeader>
        
        {createMode === 'selection' && renderSelectionView()}
        {createMode === 'single' && renderSinglePollView()}
        {createMode === 'bulk' && renderBulkUploadView()}
        {createMode === 'group' && renderGroupPollView()}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollModal;
