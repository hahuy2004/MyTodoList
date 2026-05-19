// Dùng để hiển thị header của ứng dụng
import { useAuth } from "../contexts/AuthContext";

export const Header = () => {
  const { user } = useAuth();

  // Default avatar khi user không có avatar
  const getAvatarText = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Logo và tiêu đề */}
      <div className="space-y-2 text-center flex-1">
        <h1 className="text-4xl font-bold text-transparent bg-primary bg-clip-text">
          Student ToDoList
        </h1>
        <p className="text-muted-foreground">
          Không có việc gì khó, chỉ sợ mình không làm 💪
        </p>
      </div>

      {/* User info */}
      {user && (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getAvatarText(user.fullName)
            )}
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Xin chào, </span>
            <span className="font-medium text-gray-900">{user.fullName}</span>
          </div>
        </div>
      )}
    </div>
  );
};