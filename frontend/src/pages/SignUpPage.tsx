import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

export const SignUpPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (
    fullName: string,
    username: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      setError('');
      await register(fullName, username, password, confirmPassword);
      // Sau khi đăng ký thành công, AuthenticatedApp sẽ tự động redirect
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Đăng ký thất bại';
      
      // Kiểm tra lỗi trùng tên đăng nhập theo yêu cầu
      if (errorMessage.includes('Tên tài khoản đã tồn tại') || errorMessage.includes('đã tồn tại')) {
        setError('Đã có tên đăng nhập này rồi, vui lòng nhập tên đăng nhập khác');
      } else {
        setError(errorMessage);
      }
    }
  };

  const switchToLogin = () => {
    navigate('/signin');
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
            <h2 className="text-2xl font-bold text-gray-900">Đăng ký</h2>
            <p className="text-gray-600 mt-2">Tạo tài khoản mới</p>
            {/* Error message theo yêu cầu - dưới "Tạo tài khoản mới" */}
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={switchToLogin}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};