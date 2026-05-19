import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api");

// Tạo một instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor để tự động thêm token vào headers
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('authUser');
      
      // Không reload trang để tránh vòng lặp vô tận
      // Thay vào đó, để AuthContext xử lý logout
      console.log('Unauthorized - token removed');
    }
    return Promise.reject(error);
  }
);

// Xuất instance axios để sử dụng ở nơi khác trong ứng dụng
export default api;