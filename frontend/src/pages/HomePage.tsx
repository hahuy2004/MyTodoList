import { useState, useEffect } from "react";
import { toast } from "sonner";
import Sidebar from '../components/Sidebar'
import MainContent from '../components/MainContent'
import AIAssistant from '../components/AIAssistant'
import type { Task, FilterType, SortType, TaskList } from "@/types";
import api from '../lib/axios';
import { taskListAPI, taskStatsAPI } from '../lib/taskListAPI';
import { visibleTaskLimit } from '@/lib/data'

const HomePage = () => {
  // State để lưu trữ danh sách task
  const [taskBuffer, setTaskBuffer] = useState<Task[]>([]);
  // State để lưu trữ số lượng task hoàn thành và đang làm
  const [activeTaskCount, setActiveTaskCount] = useState<number>(0);
  const [completeTaskCount, setCompleteTaskCount] = useState<number>(0);
  // State để lưu trữ bộ lọc hiện tại
  const [filter, setFilter] = useState<FilterType>("all");
  // State để lưu trữ truy vấn ngày giờ (nếu cần)
  const [dateQuery, setDateQuery] = useState<string>("all");
  // State để lưu trữ cách sắp xếp
  const [sortBy, setSortBy] = useState<SortType>("deadline");
  // State để lưu trữ trang hiện tại
  const [page, setPage] = useState<number>(1);
  // State cho sidebar và AI assistant
  const [activeItem, setActiveItem] = useState<string>("todolist");
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
    fetchOverallStats(); // Lấy thống kê tổng quan
    fetchWeeklyTasks(); // Lấy số task tuần
  }, [dateQuery, sortBy]);

  // Khi filter, dateQuery hoặc sortBy thay đổi, đặt lại trang về 1
  useEffect(() => {
    setPage(1);
  }, [filter, dateQuery, sortBy]);

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
      const res = await api.get(`/tasks?filter=${dateQuery}&sortBy=${sortBy}`);
      setTaskBuffer(res.data.tasks);
      // Cập nhật số lượng task hoàn thành và đang làm
      setActiveTaskCount(res.data.activeCount);
      setCompleteTaskCount(res.data.completeCount);

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

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Danh sách các task đã được lọc dựa trên bộ lọc hiện tại
  const filteredTasks = taskBuffer.filter((task: Task) => {
    // Chỉ lọc theo trạng thái
    if (filter === "all") return true;
    if (filter === "active") return task.status === "active";
    if (filter === "completed") return task.status === "complete";
    return true;
  });

  // Hiển thị visibleTaskLimit task mỗi trang
  const visibleTasks = 
    filteredTasks.slice((page - 1) * visibleTaskLimit, page * visibleTaskLimit);

  // Nếu không còn task nào để hiển thị trên trang hiện tại, chuyển về trang trước
  if (visibleTasks.length === 0 && page > 1) {
    setPage(page - 1);
  }

  // Tính tổng số trang dựa trên số lượng task đã lọc
  const totalPages = Math.ceil(filteredTasks.length / visibleTaskLimit);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        activeItem={activeItem} 
        setActiveItem={setActiveItem}
        lists={customLists}
        onAddList={handleAddList}
        allTasksCount={overallStats.allTasksCount}
        upcomingTaskCount={weeklyTaskCount}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <MainContent 
          activeTaskCount={activeTaskCount}
          completeTaskCount={completeTaskCount}
          filter={filter}
          setFilter={setFilter}
          dateQuery={dateQuery}
          setDateQuery={setDateQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          page={page}
          totalPages={totalPages}
          visibleTasks={visibleTasks}
          handleTaskChanged={handleTaskChanged}
          handleNext={handleNext}
          handlePrev={handlePrev}
          handlePageChange={handlePageChange}
          selectedListId={undefined}
          lists={customLists}
        />
      </div>

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={isAIAssistantOpen}
        onClose={() => {
          setIsAIAssistantOpen(false);
          setActiveItem("todolist");
        }}
      />
    </div>
  )
}

export default HomePage