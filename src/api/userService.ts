import http from "@/lib/http";

export interface User {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  dob?: string;
  photoUrl?: string;
  isVerified?: boolean;
  isActive?: boolean;
  skinAnalysisHistory?: unknown[];
  purchaseHistory?: unknown[];
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

// Helper function to get auth headers
const getAuthHeader = () => {
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken") || "";
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const userService = {
  // Create new user (register)
  async register(
    userData: { email: string; password: string; fullName: string }
  ): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to register user");
    }

    return await response.json();
  },

  // Login user
  async login(
    credentials: { email: string; password: string }
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    return await response.json();
  },

  // Get all users (admin only)
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${API_URL}/users`, {
      headers: getAuthHeader(),
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to fetch users");
    }

    return await response.json();
  },

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: getAuthHeader(),
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to fetch user");
    }

    // API returns user object directly, not wrapped in data property 
    // based on your example response
    const userData = await response.json();
    
    if (!userData || !userData._id) {
      throw new Error("Invalid user data received");
    }
    
    return userData;
  },

  // Update user profile
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "PATCH",
      headers: getAuthHeader(),
      body: JSON.stringify(profileData),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile");
    }

    return await response.json();
  },

    uploadAvatar: async (formData: FormData) => {
    return await http.patch("/users/avatar", formData);
  },

  // Logout user
  async logout(): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: getAuthHeader(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to logout");
    }

    // Clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
    }
  },
};

export default userService;
