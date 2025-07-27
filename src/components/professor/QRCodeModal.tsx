
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollCode: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, pollCode }) => {
  const qrUrl = `https://preview--instant-pulse.lovable.app/poll/${pollCode}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Scan to Vote</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 p-6">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <QRCodeSVG
              value={qrUrl}
              size={256}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Students can scan this QR code to vote
            </p>
            <p className="text-xs text-gray-500 font-mono">
              Poll Code: {pollCode}
            </p>
          </div>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
