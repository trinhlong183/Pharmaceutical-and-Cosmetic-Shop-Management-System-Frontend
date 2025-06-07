import http from "@/lib/http";

export interface User {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

export const userService = {
  // Create new user (POST /users)
  async createUser(
    userData: Omit<User, "_id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    const data: ApiResponse<User> = await response.json();
    return data.data;
  },

  // Get all users (GET /users)
  async getAllUsers(): Promise<User[]> {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data: ApiResponse<User[]> = await response.json();
    return data.data;
  },

  // Get user by ID (GET /users/{id})
  async getUserById(id: string): Promise<User> {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const data: ApiResponse<User> = await response.json();
    return data.data;
  },

  // Update user avatar (PATCH /users/avatar)
  // async updateAvatar(formData: FormData): Promise<User> {
  //   const response = await fetch(`${API_URL}/users/avatar`, {
  //     method: "PATCH",
  //     body: formData,
  //     credentials: "include",
  //   });

  //   if (!response.ok) {
  //     throw new Error("Failed to update avatar");
  //   }
  //   const data: ApiResponse<User> = await response.json();
  //   return data.data;
  // },
  uploadAvatar: async (formData: FormData) => {
    console.log("Uploading avatar with formData:", formData);

    return await http.patch("/users/avatar", formData);
  },

  // Get current authenticated user
  async getCurrentUser(): Promise<User> {
    try {
      // Get userId from localStorage or your auth state management
      const userId = localStorage.getItem("userId"); // or from your auth context/store
      if (!userId) {
        throw new Error("User not authenticated");
      }
      // Use the existing getUserById method
      return await this.getUserById(userId);
    } catch (error) {
      console.error("Error getting current user:", error);
      throw new Error("Failed to fetch current user");
    }
  },

  updateProfile: (body: Partial<User>) => {
    return http.patch("/users/profile", body);
  },
};

export default userService;
