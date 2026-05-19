import { 
  Home, 
  Brain,
  CheckSquare,
  Calendar,
  StickyNote,
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getListIconColor } from "@/lib/utils";
import type { TaskList } from "@/types";

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  upcomingTaskCount?: number;
  lists: TaskList[];
  onAddList: (name: string) => void;
  allTasksCount?: number; // Thêm prop cho tổng số tasks
}

const Sidebar = ({ activeItem, setActiveItem, upcomingTaskCount, lists, onAddList, allTasksCount }: SidebarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [listsPage, setListsPage] = useState(0); // Add pagination state for lists

  const ITEMS_PER_PAGE = 4;
  const safeList = Array.isArray(lists) ? lists : [];
  const totalPages = Math.ceil(safeList.length / ITEMS_PER_PAGE);
  const paginatedLists = safeList.slice(listsPage * ITEMS_PER_PAGE, (listsPage + 1) * ITEMS_PER_PAGE);

  const taskItems = [
    { id: "todolist", icon: Home, label: "To-do List", path: "/", count: allTasksCount },
    { id: "upcoming", icon: CheckSquare, label: "Upcoming", count: upcomingTaskCount, path: "/upcoming" },
    { id: "calendar", icon: Calendar, label: "Calendar", path: "/calendar" },
    { id: "sticky-wall", icon: StickyNote, label: "Sticky Notes", path: "/sticky-notes", count: allTasksCount },
  ];

  const handleTaskItemClick = (item: any) => {
    setActiveItem(item.id);
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleListItemClick = (listId: string) => {
    setActiveItem(listId);
    // Navigate to the list page to show tasks from that specific list
    navigate(`/list/${listId}`);
  };

  const handleAddListSubmit = () => {
    if (newListName.trim()) {
      onAddList(newListName.trim());
      setNewListName("");
      setIsAddListOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Default avatar khi user không có avatar
  const getAvatarText = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const aiItems = [
    { id: "ai-assistant", icon: Brain, label: "AI Assistant" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Student TodoList</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col">
        <div className="flex-1">
          {/* Tasks Section */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                TASKS VIEW
              </h3>
            </div>
            <div className="space-y-1">
              {taskItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTaskItemClick(item)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeItem === item.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lists Section */}
          <div className="mt-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                LISTS
              </h3>
              <Dialog open={isAddListOpen} onOpenChange={setIsAddListOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-6 h-6 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Thêm danh sách mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Nhập tên danh sách..."
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddListSubmit();
                        }
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsAddListOpen(false);
                          setNewListName("");
                        }}
                      >
                        Hủy
                      </Button>
                      <Button 
                        onClick={handleAddListSubmit}
                        disabled={!newListName.trim()}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lists Content - Flex grow to take available space */}
            <div className="flex-1 flex flex-col">
              <div className="space-y-1 flex-1 min-h-[120px]">
                {paginatedLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleListItemClick(list.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeItem === list.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getListIconColor(list.color)}`} />
                      <span className="text-sm">{list.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{list.count}</span>
                  </button>
                ))}

                {/* Empty state when no lists on current page */}
                {paginatedLists.length === 0 && safeList.length > 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Không có danh sách nào trên trang này
                  </div>
                )}

                {/* Empty state when no lists at all */}
                {safeList.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Chưa có danh sách nào
                  </div>
                )}
              </div>

              {/* Pagination Controls - Fixed at bottom of lists section */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setListsPage(Math.max(0, listsPage - 1))}
                    disabled={listsPage === 0}
                    className="p-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setListsPage(i)}
                        className={`w-6 h-6 text-xs rounded ${
                          i === listsPage 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setListsPage(Math.min(totalPages - 1, listsPage + 1))}
                    disabled={listsPage === totalPages - 1}
                    className="p-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* AI Assistants Section - Fixed at bottom of pagination lists section */}
              <div className="mt-3 flex-shrink-0">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  AI ASSISTANTS
                </h3>
                <div className="space-y-1">
                  {aiItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveItem(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeItem === item.id
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <div className="space-y-3">
          {/* User info */}
          {user && (
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">Xin chào,</div>
                <div className="text-sm font-medium text-gray-900 truncate">{user.fullName}</div>
              </div>
            </div>
          )}
          
          {/* Logout button */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
