import { toast, ToastOptions } from 'react-toastify';

export interface NotificationOptions extends ToastOptions {
  title?: string;
}

class NotificationService {
  private defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  // Success notification
  success(message: string, options?: NotificationOptions): void {
    const { title, ...toastOptions } = options || {};
    const content = title ? `${title}: ${message}` : message;
    
    toast.success(content, {
      ...this.defaultOptions,
      ...toastOptions,
    });
  }

  // Error notification
  error(message: string, options?: NotificationOptions): void {
    const { title, ...toastOptions } = options || {};
    const content = title ? `${title}: ${message}` : message;
    
    toast.error(content, {
      ...this.defaultOptions,
      autoClose: 8000, // Longer for errors
      ...toastOptions,
    });
  }

  // Warning notification
  warning(message: string, options?: NotificationOptions): void {
    const { title, ...toastOptions } = options || {};
    const content = title ? `${title}: ${message}` : message;
    
    toast.warning(content, {
      ...this.defaultOptions,
      ...toastOptions,
    });
  }

  // Info notification
  info(message: string, options?: NotificationOptions): void {
    const { title, ...toastOptions } = options || {};
    const content = title ? `${title}: ${message}` : message;
    
    toast.info(content, {
      ...this.defaultOptions,
      ...toastOptions,
    });
  }

  // Custom notification
  custom(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', options?: NotificationOptions): void {
    switch (type) {
      case 'success':
        this.success(message, options);
        break;
      case 'error':
        this.error(message, options);
        break;
      case 'warning':
        this.warning(message, options);
        break;
      case 'info':
      default:
        this.info(message, options);
        break;
    }
  }

  // Lost and Found specific notifications
  lostFound = {
    itemReported: (itemName: string, type: 'lost' | 'found') => {
      this.success(`${type.charAt(0).toUpperCase() + type.slice(1)} item "${itemName}" reported successfully!`, {
        title: 'Item Reported'
      });
    },

    statusUpdated: (itemName: string, status: string) => {
      this.info(`Item "${itemName}" status updated to ${status}`, {
        title: 'Status Updated'
      });
    },

    itemDeleted: (itemName: string) => {
      this.warning(`Item "${itemName}" has been deleted`, {
        title: 'Item Deleted'
      });
    },

    newItemAlert: (itemName: string, type: 'lost' | 'found') => {
      this.info(`New ${type} item reported: "${itemName}"`, {
        title: 'New Item',
        autoClose: 7000
      });
    },

    itemClaimed: (itemName: string) => {
      this.success(`Item "${itemName}" has been claimed!`, {
        title: 'Item Claimed'
      });
    },

    itemResolved: (itemName: string) => {
      this.success(`Lost item "${itemName}" has been found and resolved!`, {
        title: 'Item Found'
      });
    }
  };

  // Admin specific notifications
  admin = {
    newSubmission: (itemName: string, reporterName: string) => {
      this.info(`New submission: "${itemName}" by ${reporterName}`, {
        title: 'Admin Alert',
        autoClose: 10000
      });
    },

    systemUpdate: (message: string) => {
      this.info(message, {
        title: 'System Update',
        autoClose: 8000
      });
    }
  };

  // Connection status notifications
  connection = {
    connected: () => {
      this.success('Connected to server', {
        autoClose: 3000
      });
    },

    disconnected: () => {
      this.warning('Connection lost. Attempting to reconnect...', {
        autoClose: false
      });
    },

    reconnected: () => {
      this.success('Reconnected to server', {
        autoClose: 3000
      });
    },

    error: (message: string) => {
      this.error(`Connection error: ${message}`, {
        title: 'Connection Error'
      });
    }
  };

  // Clear all notifications
  clear(): void {
    toast.dismiss();
  }

  // Update default options
  setDefaultOptions(options: Partial<ToastOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
