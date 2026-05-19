import axios from 'axios';
import type { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api");

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API response types
interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      fullName: string;
      username: string;
      avatar?: string;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  };
}

interface UserResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      fullName: string;
      username: string;
      avatar?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export const authAPI = {
  // Đăng nhập
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  // Đăng ký
  register: async (
    fullName: string,
    username: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', {
      fullName,
      username,
      password,
      confirmPassword,
    });
    return response.data;
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async (token: string): Promise<UserResponse> => {
    const response: AxiosResponse<UserResponse> = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Cập nhật profile
  updateProfile: async (fullName: string, token: string): Promise<UserResponse> => {
    const response: AxiosResponse<UserResponse> = await api.put(
      '/auth/profile',
      { fullName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};