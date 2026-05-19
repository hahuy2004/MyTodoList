import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';

export const SignInPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    try {
      setError('');
      await login(username, password);
      // Sau khi đăng nhập thành công, AuthenticatedApp sẽ tự động redirect
    } catch (error: any) {
      // Hiển thị lỗi theo yêu cầu
      setError('Tài khoản hoặc mật khẩu bị sai. Vui lòng nhập lại');
    }
  };

  const switchToRegister = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo và tiêu đề */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student TodoList
          </h1>
          <p className="text-gray-600">
            Quản lý công việc hiệu quả
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
            <p className="text-gray-600 mt-2">Chào mừng trở lại!</p>
            {/* Error message theo yêu cầu - dưới "Chào mừng trở lại" */}
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={switchToRegister}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};