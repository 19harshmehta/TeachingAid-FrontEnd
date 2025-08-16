
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Folder, FolderOpen, Trash2 } from 'lucide-react';
import { folderAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Folder {
  _id: string;
  name: string;
  description: string;
  polls: string[];
  createdAt: string;
}

interface FolderManagerProps {
  onFolderSelect: (folderId: string | null) => void;
  selectedFolder: string | null;
}

const FolderManager = ({ onFolderSelect, selectedFolder }: FolderManagerProps) => {
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await folderAPI.getAll();
      setFolders(response.data.folders || response.data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch folders",
        variant: "destructive",
      });
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await folderAPI.create(name.trim(), description.trim());
      toast({
        title: "Folder Created!",
        description: `Folder "${name}" has been created successfully`,
      });
      
      setName('');
      setDescription('');
      setShowCreateModal(false);
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Folders</h3>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Folder
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <Button
          variant={selectedFolder === null ? "default" : "outline"}
          size="sm"
          onClick={() => onFolderSelect(null)}
          className={selectedFolder === null ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
        >
          <FolderOpen className="h-4 w-4 mr-1" />
          All Polls
        </Button>
        
        {folders.map((folder) => (
          <Button
            key={folder._id}
            variant={selectedFolder === folder._id ? "default" : "outline"}
            size="sm"
            onClick={() => onFolderSelect(folder._id)}
            className={selectedFolder === folder._id ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
          >
            <Folder className="h-4 w-4 mr-1" />
            {folder.name} ({folder.polls?.length || 0})
          </Button>
        ))}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Math Quizzes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folderDescription">Description (Optional)</Label>
              <Textarea
                id="folderDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this folder"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
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
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderManager;
