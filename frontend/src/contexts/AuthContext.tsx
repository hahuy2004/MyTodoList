import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../lib/authAPI';

export interface User {
  _id: string;
  fullName: string;
  username: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (fullName: string, username: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  updateProfile: (fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Khởi tạo auth state từ sessionStorage (sẽ bị xóa khi tắt tab)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = sessionStorage.getItem('authToken');
        const savedUser = sessionStorage.getItem('authUser');

        if (savedToken && savedUser) {
          // Verify token với server trước khi set state
          try {
            const response = await authAPI.getCurrentUser(savedToken);
            // Chỉ set state sau khi verify thành công
            setUser(response.data.user);
            setToken(savedToken);
          } catch (error) {
            console.error('Token verification failed:', error);
            // Token không hợp lệ, xóa khỏi sessionStorage
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('authUser');
            setUser(null);
            setToken(null);
          }
        } else {
          // Không có token/user, đảm bảo state là null
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(username, password);
      
      const { user: userData, token: authToken } = response.data;
      
      setUser(userData);
      setToken(authToken);
      
      // Lưu vào sessionStorage (sẽ bị xóa khi tắt tab)
      sessionStorage.setItem('authToken', authToken);
      sessionStorage.setItem('authUser', JSON.stringify(userData));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string, 
    username: string, 
    password: string, 
    confirmPassword: string
  ) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(fullName, username, password, confirmPassword);
      
      const { user: userData, token: authToken } = response.data;
      
      setUser(userData);
      setToken(authToken);
      
      // Lưu vào sessionStorage (sẽ bị xóa khi tắt tab)
      sessionStorage.setItem('authToken', authToken);
      sessionStorage.setItem('authUser', JSON.stringify(userData));
      
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Xóa khỏi sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
  };

  const updateProfile = async (fullName: string) => {
    if (!token) {
      throw new Error('Không có token xác thực');
    }

    try {
      const response = await authAPI.updateProfile(fullName, token);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      
      // Cập nhật sessionStorage
      sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};