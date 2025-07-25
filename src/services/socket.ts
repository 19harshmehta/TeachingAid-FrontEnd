
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:9595';

class SocketService {
  private socket: Socket | null = null;
  private connectionPromise: Promise<Socket> | null = null;

  connect(): Promise<Socket> {
    if (this.socket && this.socket.connected) {
      return Promise.resolve(this.socket);
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      console.log('Connecting to socket server at:', SOCKET_URL);
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        resolve(this.socket!);
      });
      
      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.connectionPromise = null;
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.connectionPromise = null;
        reject(error);
      });
      
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Set timeout for connection
      setTimeout(() => {
        if (!this.socket?.connected) {
          console.error('Socket connection timeout');
          this.connectionPromise = null;
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });

    return this.connectionPromise;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.connectionPromise = null;
    }
  }

  async joinPoll(pollCode: string) {
    try {
      const socket = await this.connect();
      console.log('Joining poll room:', pollCode);
      socket.emit('join_poll', pollCode);
    } catch (error) {
      console.error('Failed to join poll:', error);
    }
  }

  async onVoteUpdate(callback: (updatedPoll: any) => void) {
    try {
      const socket = await this.connect();
      console.log('Setting up vote update listener');
      socket.on('vote_update', callback);
    } catch (error) {
      console.error('Failed to set up vote update listener:', error);
    }
  }

  offVoteUpdate() {
    if (this.socket) {
      console.log('Removing vote update listener');
      this.socket.off('vote_update');
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
