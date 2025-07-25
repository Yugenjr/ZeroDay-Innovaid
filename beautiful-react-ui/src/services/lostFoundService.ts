import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LostFoundItem {
  _id: string;
  type: 'lost' | 'found';
  itemName: string;
  category: string;
  location: string;
  description: string;
  reportedBy: {
    _id: string;
    name: string;
    email: string;
    studentId?: string;
    department?: string;
  };
  reportedByName: string;
  contactInfo: {
    email: string;
    phone?: string;
  };
  status: 'pending' | 'claimed' | 'resolved';
  images?: string[];
  adminNotes?: string;
  claimedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  claimedAt?: string;
  resolvedAt?: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  viewCount: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  daysSinceReported?: number;
  formattedDate?: string;
}

export interface CreateLostFoundItem {
  type: 'lost' | 'found';
  itemName: string;
  category: string;
  location: string;
  description: string;
  images?: string[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateLostFoundItem {
  itemName?: string;
  category?: string;
  location?: string;
  description?: string;
  images?: string[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'claimed' | 'resolved';
  adminNotes?: string;
  claimedBy?: string;
}

export interface LostFoundFilters {
  type?: 'all' | 'lost' | 'found';
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LostFoundResponse {
  success: boolean;
  data: LostFoundItem[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  message?: string;
}

export interface LostFoundStats {
  total: number;
  lost: number;
  found: number;
  pending: number;
  resolved: number;
}

class LostFoundService {
  // Get all lost and found items with filters
  async getLostFoundItems(filters: LostFoundFilters = {}): Promise<LostFoundResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/lostfound?${params.toString()}`);
    return response.data;
  }

  // Get single lost and found item
  async getLostFoundItem(id: string): Promise<{ success: boolean; data: LostFoundItem; message?: string }> {
    const response = await api.get(`/lostfound/${id}`);
    return response.data;
  }

  // Create new lost and found item
  async createLostFoundItem(item: CreateLostFoundItem): Promise<{ success: boolean; data: LostFoundItem; message?: string }> {
    const response = await api.post('/lostfound', item);
    return response.data;
  }

  // Update lost and found item
  async updateLostFoundItem(id: string, updates: UpdateLostFoundItem): Promise<{ success: boolean; data: LostFoundItem; message?: string }> {
    const response = await api.put(`/lostfound/${id}`, updates);
    return response.data;
  }

  // Delete lost and found item
  async deleteLostFoundItem(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await api.delete(`/lostfound/${id}`);
    return response.data;
  }

  // Get user's lost and found items
  async getMyLostFoundItems(): Promise<{ success: boolean; data: LostFoundItem[]; message?: string }> {
    const response = await api.get('/lostfound/user/my-items');
    return response.data;
  }

  // Get lost and found statistics (admin only)
  async getLostFoundStats(): Promise<{ success: boolean; data: LostFoundStats; message?: string }> {
    const response = await api.get('/lostfound/admin/stats');
    return response.data;
  }

  // Search lost and found items
  async searchLostFoundItems(query: string, filters: Omit<LostFoundFilters, 'search'> = {}): Promise<LostFoundResponse> {
    return this.getLostFoundItems({ ...filters, search: query });
  }

  // Get categories
  getCategories(): string[] {
    return ['Electronics', 'Books', 'Bag', 'Accessories', 'ID/Card', 'Clothing', 'Other'];
  }

  // Get status options
  getStatusOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'pending', label: 'Pending' },
      { value: 'claimed', label: 'Claimed' },
      { value: 'resolved', label: 'Resolved' }
    ];
  }

  // Get priority options
  getPriorityOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ];
  }
}

const lostFoundService = new LostFoundService();
export default lostFoundService;
