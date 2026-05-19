import { useState, useEffect } from "react";
import { toast } from "sonner";
import Sidebar from '../components/Sidebar'
import UpcomingContent from '../components/UpcomingContent'
import AIAssistant from '../components/AIAssistant'
import type { Task, TaskList } from "@/types";
import api from '../lib/axios';
import { taskListAPI, taskStatsAPI } from '../lib/taskListAPI';

const UpcomingPage = () => {
  // State để lưu trữ danh sách task
  const [taskBuffer, setTaskBuffer] = useState<Task[]>([]);
  // State cho sidebar và AI assistant
  const [activeItem, setActiveItem] = useState<string>("upcoming");
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  // State để quản lý danh sách tùy chỉnh
  const [customLists, setCustomLists] = useState<TaskList[]>([]);
  // State cho thống kê sidebar
  const [overallStats, setOverallStats] = useState({
    allTasksCount: 0,
    upcomingTasksCount: 0
  });
  // State riêng cho số task trong tuần để hiển thị trên sidebar
  const [weeklyTaskCount, setWeeklyTaskCount] = useState<number>(0);

  // Gọi API khi component được mount
  useEffect(() => {
    fetchTasks();
    fetchTaskLists();
    fetchOverallStats();
    fetchWeeklyTasks(); // Thêm hàm fetch task tuần
  }, []);

  // Effect để mở AI assistant khi click vào menu
  useEffect(() => {
    if (activeItem === "ai-assistant") {
      setIsAIAssistantOpen(true);
    }
    // No longer need to handle list selection here as it's now done via setSelectedListId directly
  }, [activeItem]);

  // TaskLists giờ được fetch từ database, không cần update count ở đây nữa

  // Hàm gọi API và lấy danh sách task
  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?filter=all`); // Lấy tất cả tasks
      // Sắp xếp theo ngày tạo giảm dần (mới nhất lên đầu)
      const sortedTasks = res.data.tasks.sort((a: Task, b: Task) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTaskBuffer(sortedTasks);

    } catch (error) {
      console.error("Lỗi xảy ra khi truy xuất task", error);
      toast.error("Lỗi xảy ra khi truy xuất task");
    }
  };

  // Hàm gọi API và lấy danh sách TaskLists
  const fetchTaskLists = async () => {
    try {
      const res = await taskListAPI.getAllTaskLists();
      setCustomLists(res.lists);
    } catch (error) {
      console.error("Lỗi xảy ra khi truy xuất task lists", error);
      toast.error("Lỗi xảy ra khi truy xuất danh sách");
    }
  };

  // Hàm gọi API và lấy thống kê tổng quan
  const fetchOverallStats = async () => {
    try {
      const res = await taskStatsAPI.getOverallStats();
      setOverallStats({
        allTasksCount: res.allTasksCount,
        upcomingTasksCount: res.upcomingTasksCount
      });
      
      // Cập nhật count cho từng list dựa trên API stats
      if (res.tasksByList && res.tasksByList.length > 0) {
        setCustomLists(prevLists => 
          prevLists.map(list => ({
            ...list,
            count: res.tasksByList.find((stat: any) => stat._id === list.id)?.count || 0
          }))
        );
      }
    } catch (error) {
      console.error("Lỗi xảy ra khi truy xuất overall stats", error);
      toast.error("Lỗi xảy ra khi truy xuất thống kê");
    }
  };

  // Hàm gọi API và lấy số task trong tuần để hiển thị trên sidebar
  const fetchWeeklyTasks = async () => {
    try {
      const res = await api.get(`/tasks?filter=week`);
      setWeeklyTaskCount(res.data.tasks.length);
    } catch (error) {
      console.error("Lỗi xảy ra khi truy xuất weekly tasks", error);
    }
  };

  // Hàm gọi lại fetchTasks để làm mới danh sách task
  const handleTaskChanged = () => {
    fetchTasks();
    fetchTaskLists(); // Cập nhật lại count cho các lists
    fetchOverallStats(); // Cập nhật lại thống kê tổng quan
    fetchWeeklyTasks(); // Cập nhật lại số task tuần
  };

  // Hàm thêm list mới
  const handleAddList = async (name: string) => {
    try {
      const colors = [
        "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-red-500",
        "bg-yellow-500", "bg-teal-500", "bg-cyan-500", "bg-rose-500"
      ];
      const color = colors[customLists.length % colors.length];
      
      await taskListAPI.createTaskList(name, color);
      toast.success("Tạo danh sách mới thành công!");
      fetchTaskLists(); // Refresh list
    } catch (error) {
      console.error("Lỗi khi tạo danh sách:", error);
      toast.error("Lỗi khi tạo danh sách mới");
    }
  };

  // Không cần filter theo list vì Upcoming page hiển thị tất cả tasks có deadline
  const filteredTasks = taskBuffer;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        activeItem={activeItem} 
        setActiveItem={setActiveItem}
        allTasksCount={overallStats.allTasksCount}
        upcomingTaskCount={weeklyTaskCount} // Sử dụng số task trong tuần
        lists={customLists}
        onAddList={handleAddList}
      />

      {/* Main Content */}
      <UpcomingContent 
        visibleTasks={filteredTasks}
        handleTaskChanged={handleTaskChanged}
        selectedListId={undefined}
        lists={customLists}
      />

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={isAIAssistantOpen}
        onClose={() => {
          setIsAIAssistantOpen(false);
          setActiveItem("upcoming");
        }}
      />
    </div>
  )
}

export default UpcomingPage
