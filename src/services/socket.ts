
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:9595';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinPoll(pollCode: string) {
    if (this.socket) {
      this.socket.emit('joinPoll', { pollCode });
    }
  }

  onVoteUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('voteUpdate', callback);
    }
  }

  offVoteUpdate() {
    if (this.socket) {
      this.socket.off('voteUpdate');
    }
  }
}

export const socketService = new SocketService();
