// import React, { useState } from 'react';
// import { LoginForm } from '../components/LoginForm';
// import { RegisterForm } from '../components/RegisterForm';
// import { useAuth } from '../contexts/AuthContext';

// type AuthMode = 'login' | 'register';

// export const AuthPage: React.FC = () => {
//   const [mode, setMode] = useState<AuthMode>('login');
//   const [error, setError] = useState<string>('');
//   const { login, register, isLoading } = useAuth();

//   const handleLogin = async (username: string, password: string) => {
//     try {
//       setError('');
//       await login(username, password);
//     } catch (error: any) {
//       const errorMessage = error?.response?.data?.message || 'Đăng nhập thất bại';
//       setError(errorMessage);
//     }
//   };

//   const handleRegister = async (
//     fullName: string,
//     username: string,
//     password: string,
//     confirmPassword: string
//   ) => {
//     setError('');
//     await register(fullName, username, password, confirmPassword);
//   };

//   const switchToRegister = () => {
//     setMode('register');
//     setError('');
//   };

//   const switchToLogin = () => {
//     setMode('login');
//     setError('');
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Logo và tiêu đề */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Student Todo List
//           </h1>
//           <p className="text-gray-600">
//             Quản lý công việc hiệu quả
//           </p>
//         </div>

//         {/* Error message */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
//             {error}
//           </div>
//         )}

//         {/* Form */}
//         {mode === 'login' ? (
//           <LoginForm
//             onLogin={handleLogin}
//             onSwitchToRegister={switchToRegister}
//             isLoading={isLoading}
//           />
//         ) : (
//           <RegisterForm
//             onRegister={handleRegister}
//             onSwitchToLogin={switchToLogin}
//             isLoading={isLoading}
//           />
//         )}

//       </div>
//     </div>
//   );
// };