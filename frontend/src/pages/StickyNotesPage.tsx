import React, { useState, useEffect } from 'react';
import StickyNote from '../components/StickyNote';
import Sidebar from '../components/Sidebar';
import TaskDetailModal from '../components/TaskDetailModal';
import AddTaskSticky from '../components/AddTaskSticky';
import { Dialog, DialogContent } from '../components/ui/dialog';
import type { Task, TaskList } from '../types';
import api from '../lib/axios';
import { taskListAPI } from '../lib/taskListAPI';
import AIAssistant from '../components/AIAssistant';

const StickyNotesPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState("sticky-wall");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  // State riêng cho số task trong tuần để hiển thị trên sidebar
  const [weeklyTaskCount, setWeeklyTaskCount] = useState<number>(0);

  // Mảng màu sắc cho sticky notes
  const colors = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

  useEffect(() => {
    fetchData();
    fetchWeeklyTasks(); // Lấy số task tuần
  }, []);

  // Sync selectedTask with updated tasks data
  useEffect(() => {
    if (selectedTask) {
      const updatedTask = tasks.find(task => task._id === selectedTask._id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  }, [tasks, selectedTask]);

  const fetchData = async () => {
    try {
      const [tasksResponse, listsResponse] = await Promise.all([
        api.get('/tasks?filter=all'),
        taskListAPI.getAllTaskLists()
      ]);
      
      const tasks = tasksResponse.data.tasks || [];
      setTasks(tasks);
      
      // Xử lý dữ liệu TaskLists - Backend trả về format { success: true, lists: [...] }
      let taskLists = [];
      if (listsResponse && listsResponse.lists) {
        taskLists = listsResponse.lists;
      } else if (listsResponse && listsResponse.data && listsResponse.data.lists) {
        taskLists = listsResponse.data.lists;
      } else if (Array.isArray(listsResponse)) {
        taskLists = listsResponse;
      } else if (listsResponse && Array.isArray(listsResponse.data)) {
        taskLists = listsResponse.data;
      }
      
      // Backend đã tính count rồi, chỉ cần format lại cho frontend
      const formattedLists = taskLists.map((list: any) => ({
        id: list.id,
        name: list.name,
        color: list.color,
        count: list.count || 0
      }));
      
      setLists(formattedLists);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      setError('Không thể tải dữ liệu từ server');
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

  const handleTaskChanged = () => {
    fetchData();
    fetchWeeklyTasks(); // Cập nhật lại số task tuần
  };

  const handleAddList = async (name: string) => {
    try {
      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      await taskListAPI.createTaskList(name, randomColor);
      fetchData(); // Refresh data after creating new list
    } catch (error) {
      console.error('Lỗi khi tạo danh sách:', error);
    }
  };

  const handleTaskClick = (task: Task, mode: 'view' | 'edit' = 'view') => {
    setSelectedTask(task);
    setModalMode(mode);
  };

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          upcomingTaskCount={weeklyTaskCount}
          lists={lists}
          onAddList={handleAddList}
          allTasksCount={tasks.length}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeItem}
        setActiveItem={(item) => {
          setActiveItem(item);
          if (item === "ai-assistant") {
            setIsAIAssistantOpen(true);
          }
        }}
        upcomingTaskCount={weeklyTaskCount}
        lists={lists}
        onAddList={handleAddList}
        allTasksCount={tasks.length}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Sticky Notes
              </h1>
              <p className="text-gray-600">
                Tất cả tasks của bạn hiển thị dưới dạng sticky notes
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block text-2xl font-bold text-gray-800 bg-blue-100 px-4 py-2 rounded-lg shadow-sm">{tasks.length}</div>
              <div className="text-sm text-gray-600 mt-1">Tổng số tasks</div>
            </div>
          </div>
        </div>

        {/* Content Area */}
  <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6">
            {tasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">📝</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Chưa có tasks nào
                </h2>
                <p className="text-gray-600 mb-8">
                  Hãy tạo tasks đầu tiên để xem chúng dưới dạng sticky notes
                </p>
              </div>
            ) : (
              <>
                {/* Thống kê nhanh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Hoàn thành</p>
                        <p className="text-2xl font-bold text-green-600">
                          {tasks.filter(task => task.status === 'complete').length}
                        </p>
                      </div>
                      <div className="text-3xl">✅</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Đang làm</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {tasks.filter(task => task.status === 'active').length}
                        </p>
                      </div>
                      <div className="text-3xl">🔄</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Quá hạn</p>
                        <p className="text-2xl font-bold text-red-600">
                          {tasks.filter(task => {
                            if (!task.deadline) return false;
                            const deadline = new Date(task.deadline);
                            const now = new Date();
                            return deadline < now && task.status === 'active';
                          }).length}
                        </p>
                      </div>
                      <div className="text-3xl">⚠️</div>
                    </div>
                  </div>
                </div>

                {/* Sticky Notes Grid */}
                <div className="sticky-notes-container">
                  <div 
                    className="grid gap-6 auto-rows-max"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    }}
                  >
                    {/* Add Task Sticky Note */}
                    <div className="flex justify-center">
                      <div 
                        className="
                          sticky-note relative w-64 h-64 p-4 m-3 cursor-pointer group
                          bg-gradient-to-br from-green-100 to-green-200 border-green-300
                          border-2 rounded-lg shadow-lg transform hover:rotate-0 
                          transition-all duration-300 hover:scale-105
                          border-dashed
                        "
                        style={{
                          fontFamily: 'Comic Sans MS, cursive, sans-serif',
                          boxShadow: '5px 5px 15px rgba(0,0,0,0.2)',
                        }}
                        onClick={() => setShowAddTaskModal(true)}
                      >
                        {/* Ghim sticky note */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <div className="w-4 h-4 bg-green-500 rounded-full shadow-md border-2 border-green-600"></div>
                        </div>
                        
                        {/* Add icon và text */}
                        <div className="flex flex-col items-center justify-center h-full text-green-700">
                          <div className="text-6xl mb-4">➕</div>
                          <h3 className="text-xl font-bold text-center">
                            Thêm Sticky Note
                          </h3>
                          <p className="text-sm text-center mt-2 opacity-70">
                            Click để tạo task mới
                          </p>
                        </div>
                        
                        {/* Hiệu ứng rách giấy ở dưới */}
                        <div className="absolute bottom-0 left-0 right-0 h-3">
                          <svg 
                            viewBox="0 0 100 5" 
                            className="w-full h-full opacity-30"
                            preserveAspectRatio="none"
                          >
                            <path
                              d="M0,2 Q5,0 10,2 Q15,4 20,2 Q25,0 30,2 Q35,4 40,2 Q45,0 50,2 Q55,4 60,2 Q65,0 70,2 Q75,4 80,2 Q85,0 90,2 Q95,4 100,2 L100,5 L0,5 Z"
                              fill="currentColor"
                              className="text-gray-400"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Existing Tasks */}
                    {tasks.map((task, index) => (
                      <div 
                        key={task._id}
                        className="flex justify-center"
                        style={{
                          transform: `rotate(${(index % 3 - 1) * 2}deg)`,
                        }}
                      >
                        <StickyNote 
                          task={task} 
                          color={colors[index % colors.length]}
                          onTaskClick={handleTaskClick}
                          onTaskChanged={handleTaskChanged}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => {
          setIsAIAssistantOpen(false);
          setActiveItem("sticky-wall");
        }}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          lists={lists}
          onClose={() => setSelectedTask(null)}
          onTaskChanged={handleTaskChanged}
          mode={modalMode}
        />
      )}

      {/* Add Task Modal - Dành riêng cho Sticky Notes */}
      {showAddTaskModal && (
        <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto p-0 border border-white/80 bg-white">
            <AddTaskSticky 
              handleNewTaskAdded={() => {
                handleTaskChanged();
                setShowAddTaskModal(false);
              }}
              lists={lists}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StickyNotesPage;