
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:9595';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket || !this.socket.connected) {
      console.log('Connecting to socket server at:', SOCKET_URL);
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        timeout: 5000,
      });
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
      });
      
      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinPoll(pollCode: string) {
    if (this.socket && this.socket.connected) {
      console.log('Joining poll room:', pollCode);
      this.socket.emit('joinPoll', { pollCode });
    } else {
      console.warn('Socket not connected, cannot join poll');
    }
  }

  onVoteUpdate(callback: (data: { pollCode: string; votes: number[] }) => void) {
    if (this.socket) {
      console.log('Setting up vote update listener');
      this.socket.on('voteUpdate', callback);
    }
  }

  offVoteUpdate() {
    if (this.socket) {
      console.log('Removing vote update listener');
      this.socket.off('voteUpdate');
    }
  }
}

export const socketService = new SocketService();
