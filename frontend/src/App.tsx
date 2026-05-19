import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import UpcomingPage from "./pages/UpcomingPage";
import CalendarPage from "./pages/CalendarPage";
import ListPage from "./pages/ListPage";
import StickyNotesPage from "./pages/StickyNotesPage";
import NotFound from "./pages/NotFound";

// Component để kiểm tra authentication
const AuthenticatedApp = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - chỉ hiển thị khi chưa đăng nhập */}
        {!isAuthenticated && (
          <>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            {/* Redirect về signin nếu chưa đăng nhập và truy cập route khác */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </>
        )}
        
        {/* App routes - chỉ hiển thị khi đã đăng nhập */}
        {isAuthenticated && (
          <>
            {/* Trang chính - ToDo List */}
            <Route path="/" element={<HomePage />} />
            {/* Trang Upcoming */}
            <Route path="/upcoming" element={<UpcomingPage />} />
            {/* Trang Calendar */}
            <Route path="/calendar" element={<CalendarPage />} />
            {/* Trang Sticky Notes */}
            <Route path="/sticky-notes" element={<StickyNotesPage />} />
            {/* Trang hiển thị tasks theo list cụ thể */}
            <Route path="/list/:listId" element={<ListPage />} />
            {/* Redirect về home nếu đã đăng nhập và truy cập auth routes */}
            <Route path="/signin" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            {/* Trang không tìm thấy */}
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      {/* Hiển thị thông báo kiểu toast */}
      <Toaster richColors />
      
      {/* App với authentication */}
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;