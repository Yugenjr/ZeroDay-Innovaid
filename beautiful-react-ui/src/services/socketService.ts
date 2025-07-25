// import { io, Socket } from 'socket.io-client';
import { LostFoundItem } from './lostFoundService';

// Temporary mock for Socket type
type Socket = any;

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export interface SocketEvents {
  // Lost and Found events
  newLostFoundItem: (data: { item: LostFoundItem; message: string }) => void;
  lostFoundItemUpdated: (data: { item: LostFoundItem; message: string }) => void;
  lostFoundItemDeleted: (data: { itemId: string; message: string }) => void;
  
  // General events
  notification: (data: { type: 'success' | 'info' | 'warning' | 'error'; message: string; title?: string }) => void;
  adminNotification: (data: { message: string; type: string; data?: any }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();

  // Initialize socket connection
  connect(userId?: string, isAdmin = false): void {
    // Temporarily disabled socket connection
    console.log('Socket connection temporarily disabled');
    return;

    /*
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });
    */

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;

      // Join appropriate room based on user role
      if (isAdmin) {
        this.socket?.emit('joinAdmin');
      } else if (userId) {
        this.socket?.emit('joinUser', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  // Check if socket is connected
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Set up default event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Lost and Found events
    this.socket.on('newLostFoundItem', (data: any) => {
      this.emitToListeners('newLostFoundItem', data);
    });

    this.socket.on('lostFoundItemUpdated', (data: any) => {
      this.emitToListeners('lostFoundItemUpdated', data);
    });

    this.socket.on('lostFoundItemDeleted', (data: any) => {
      this.emitToListeners('lostFoundItemDeleted', data);
    });

    this.socket.on('notification', (data: any) => {
      this.emitToListeners('notification', data);
    });

    this.socket.on('adminNotification', (data: any) => {
      this.emitToListeners('adminNotification', data);
    });
  }

  // Add event listener
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  // Remove event listener
  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Emit event to all listeners
  private emitToListeners(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Send message to server
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }

  // Join a specific room
  joinRoom(room: string): void {
    this.emit('joinRoom', room);
  }

  // Leave a specific room
  leaveRoom(room: string): void {
    this.emit('leaveRoom', room);
  }

  // Send notification to admin
  notifyAdmin(message: string, type: string, data?: any): void {
    this.emit('notifyAdmin', { message, type, data });
  }

  // Send notification to specific user
  notifyUser(userId: string, message: string, type: string, data?: any): void {
    this.emit('notifyUser', { userId, message, type, data });
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Reconnect socket
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }

  // Check socket status
  getStatus(): {
    connected: boolean;
    socketId?: string;
    transport?: string;
  } {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      transport: this.socket?.io.engine?.transport?.name,
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
