export interface User {
  _id: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  dob: string;
  photoUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  skinAnalysisHistory: any[]; // You might want to create a specific type for this
  purchaseHistory: any[]; // You might want to create a specific type for this
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const userService = {
  // Create new user (POST /users)
  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const data: ApiResponse<User> = await response.json();
    return data.data;
  },

  // Get all users (GET /users)
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data: ApiResponse<User[]> = await response.json();
    return data.data;
  },

  // Get user by ID (GET /users/{id})
  async getUserById(id: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user');
      }

      const data: ApiResponse<User> = await response.json();
      if (!data.success || !data.data) {
        throw new Error('Invalid user data received');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user data');
    }
  },

  // Update user avatar (PATCH /users/avatar)
  async updateAvatar(formData: FormData): Promise<User> {
    const response = await fetch(`${API_URL}/users/avatar`, {
      method: 'PATCH',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to update avatar');
    }

    const data: ApiResponse<User> = await response.json();
    return data.data;
  },

  // Get current authenticated user
  async getCurrentUser(): Promise<User> {
    try {
      // Get userId from localStorage or your auth state management
      const userId = localStorage.getItem('userId'); // or from your auth context/store
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Use the existing getUserById method
      return await this.getUserById(userId);
      
    } catch (error) {
      console.error('Error getting current user:', error);
      throw new Error('Failed to fetch current user');
    }
  }
};

export default userService;