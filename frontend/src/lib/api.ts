const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: string[];
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async health() {
    return this.request('/health');
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    year: string;
    branch: string;
    bio?: string;
    skills?: string[];
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async refreshToken(token: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Project endpoints
  async getProjects(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: boolean;
    sortBy?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/projects${query ? `?${query}` : ''}`);
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData: FormData) {
    return this.request('/projects', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: projectData,
    });
  }

  async updateProject(id: string, projectData: FormData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: projectData,
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async likeProject(id: string) {
    return this.request(`/projects/${id}/like`, {
      method: 'POST',
    });
  }

  async addComment(id: string, text: string) {
    return this.request(`/projects/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // User endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    year?: string;
    branch?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  async getUserProfile(id: string) {
    return this.request(`/users/profile/${id}`);
  }

  async updateProfile(profileData: FormData) {
    return this.request('/users/profile', {
      method: 'PUT',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: profileData,
    });
  }

  async followUser(id: string) {
    return this.request(`/users/follow/${id}`, {
      method: 'POST',
    });
  }

  async unfollowUser(id: string) {
    return this.request(`/users/unfollow/${id}`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
