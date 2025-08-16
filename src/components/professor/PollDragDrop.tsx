
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { FolderPlus, Move } from 'lucide-react';
import { folderAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Folder {
  _id: string;
  name: string;
  description: string;
  polls: string[];
}

interface PollDragDropProps {
  isOpen: boolean;
  onClose: () => void;
  pollCode: string;
  pollQuestion: string;
  folders: Folder[];
  onPollMoved: () => void;
}

const PollDragDrop = ({ isOpen, onClose, pollCode, pollQuestion, folders, onPollMoved }: PollDragDropProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleMoveToFolder = async (folderId: string) => {
    setLoading(true);

    try {
      await folderAPI.addPollToFolder(folderId, pollCode);
      const folder = folders.find(f => f._id === folderId);
      toast({
        title: "Poll Moved!",
        description: `Poll has been moved to "${folder?.name}"`,
      });
      
      onPollMoved();
      onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Move Poll to Folder
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Moving poll:</p>
            <p className="font-medium text-gray-800 truncate">{pollQuestion}</p>
            <p className="text-xs text-gray-500">Code: {pollCode}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">Select destination folder:</p>
            
            {folders.length === 0 ? (
              <div className="text-center py-6">
                <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No folders available</p>
                <p className="text-xs text-gray-400">Create a folder first to organize your polls</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {folders.map((folder) => (
                  <Card 
                    key={folder._id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleMoveToFolder(folder._id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{folder.name}</p>
                          {folder.description && (
                            <p className="text-xs text-gray-500">{folder.description}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {folder.polls?.length || 0} polls
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PollDragDrop;
