
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderInput } from 'lucide-react';
import { folderAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Folder {
  _id: string;
  name: string;
  description?: string;
  polls: string[];
}

interface MovePollToFolderProps {
  isOpen: boolean;
  onClose: () => void;
  pollCode: string;
  pollQuestion: string;
  onPollMoved: () => void;
}

const MovePollToFolder = ({ 
  isOpen, 
  onClose, 
  pollCode, 
  pollQuestion, 
  onPollMoved 
}: MovePollToFolderProps) => {
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingFolders, setFetchingFolders] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    }
  }, [isOpen]);

  const fetchFolders = async () => {
    setFetchingFolders(true);
    try {
      const response = await folderAPI.getAll();
      setFolders(response.data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch folders",
        variant: "destructive",
      });
    } finally {
      setFetchingFolders(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFolder) {
      toast({
        title: "Error",
        description: "Please select a folder",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await folderAPI.addPollToFolder(selectedFolder, pollCode);
      const selectedFolderName = folders.find(f => f._id === selectedFolder)?.name;
      toast({
        title: "Poll Moved!",
        description: `Poll has been moved to "${selectedFolderName}" folder`,
      });
      
      setSelectedFolder('');
      onClose();
      onPollMoved();
    } catch (error) {
      console.error('Error moving poll to folder:', error);
      toast({
        title: "Error",
        description: "Failed to move poll to folder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFolder('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderInput className="h-5 w-5" />
            Move Poll to Folder
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Poll to move:</p>
            <p className="font-medium text-gray-800 truncate">{pollQuestion}</p>
            <p className="text-xs text-gray-500">Code: {pollCode}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder">Select Folder</Label>
              {fetchingFolders ? (
                <div className="text-sm text-gray-500">Loading folders...</div>
              ) : (
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder._id} value={folder._id}>
                        <div className="flex flex-col">
                          <span>{folder.name}</span>
                          {folder.description && (
                            <span className="text-xs text-gray-500">{folder.description}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex gap-2 pt-4">
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
                disabled={loading || !selectedFolder}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {loading ? 'Moving...' : 'Move Poll'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovePollToFolder;
