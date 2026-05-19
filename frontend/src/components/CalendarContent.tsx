import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddTask from "./AddTask";
import TaskDetailModal from "./TaskDetailModal";
import { getListIconColor } from "@/lib/utils";
import type { Task, TaskList as TaskListType } from "@/types";

interface CalendarContentProps {
  tasks: Task[];
  handleTaskChanged: () => void;
  selectedListId?: string;
  lists: TaskListType[];
}

type ViewType = "Day" | "Week" | "Month";

const CalendarContent = ({ tasks, handleTaskChanged, selectedListId, lists }: CalendarContentProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("Day");
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(false);
  };

  // Navigation functions
  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (viewType === "Day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewType === "Week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewType === "Month") {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === "Day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewType === "Week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewType === "Month") {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Filter tasks by current view
  const getTasksForView = () => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      
      if (viewType === "Day") {
        return (
          taskDate.getDate() === currentDate.getDate() &&
          taskDate.getMonth() === currentDate.getMonth() &&
          taskDate.getFullYear() === currentDate.getFullYear()
        );
      } else if (viewType === "Week") {
        // Tính tuần từ Thứ 2 đến Chủ nhật
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = currentDate.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu là Chủ nhật thì lùi 6 ngày, còn lại thì tính từ Thứ 2
        startOfWeek.setDate(currentDate.getDate() + mondayOffset);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Chủ nhật
        endOfWeek.setHours(23, 59, 59, 999);
        
        return taskDate >= startOfWeek && taskDate <= endOfWeek;
      } else if (viewType === "Month") {
        return (
          taskDate.getMonth() === currentDate.getMonth() &&
          taskDate.getFullYear() === currentDate.getFullYear()
        );
      }
      return false;
    });
  };

  const getDateTitle = () => {
    if (viewType === "Day") {
      return currentDate.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    } else if (viewType === "Week") {
      // Tính tuần từ Thứ 2 đến Chủ nhật
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu là Chủ nhật thì lùi 6 ngày, còn lại thì tính từ Thứ 2
      startOfWeek.setDate(currentDate.getDate() + mondayOffset);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Chủ nhật
      
      return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${startOfWeek.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })}`;
    } else if (viewType === "Month") {
      return currentDate.toLocaleDateString('vi-VN', {
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    }
  };

  // Get current list info for display
  const currentList = selectedListId ? lists.find(list => list.id === selectedListId) : null;

  return (
    <div className="flex-1 h-full overflow-hidden bg-gray-50">
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 p-6 pb-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {getDateTitle()}
                {currentList && (
                  <span className="ml-3 text-xl text-gray-600">
                    - <span className="inline-flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getListIconColor(currentList.color)}`} />
                      {currentList.name}
                    </span>
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigatePrev}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateNext}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={() => setShowAddTask(!showAddTask)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </div>

          {/* View Type Buttons */}
          <div className="flex items-center gap-2 mb-3">
            {(["Day", "Week", "Month"] as ViewType[]).map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewType === type
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Add Task Form */}
          {showAddTask && (
            <Card className="mb-3">
              <CardContent className="p-4">
                <AddTask
                  handleNewTaskAdded={() => {
                    handleTaskChanged();
                    setShowAddTask(false);
                  }}
                  selectedListId={selectedListId}
                  lists={lists}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Calendar View - Takes remaining space */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-white rounded-lg border border-gray-200 mx-2 mb-4">
            {viewType === "Day" && <DayView currentDate={currentDate} tasks={getTasksForView()} onTaskClick={handleTaskClick} />}
            {viewType === "Week" && <WeekView currentDate={currentDate} tasks={getTasksForView()} onTaskClick={handleTaskClick} />}
            {viewType === "Month" && <MonthView currentDate={currentDate} tasks={getTasksForView()} onTaskClick={handleTaskClick} />}
          </div>
        </div>

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          onTaskChanged={handleTaskChanged}
          lists={lists}
        />
      </div>
    </div>
  );
};

// Day View Component
const DayView = ({ currentDate, tasks, onTaskClick }: { currentDate: Date; tasks: Task[]; onTaskClick: (task: Task) => void }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getTasksForHour = (hour: number) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return taskDate.getHours() === hour;
    });
  };

  const getTaskColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-l-blue-400',
      'bg-green-100 text-green-800 border-l-green-400', 
      'bg-yellow-100 text-yellow-800 border-l-yellow-400',
      'bg-red-100 text-red-800 border-l-red-400',
      'bg-purple-100 text-purple-800 border-l-purple-400',
    ];
    return colors[index % colors.length];
  };

  // Get current time for the time indicator
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return { hours, minutes };
  };

  const currentTime = getCurrentTime();
  const isToday = currentDate.toDateString() === new Date().toDateString();

  // Auto-scroll to current time on component mount
  useEffect(() => {
    if (isToday) {
      const currentTimeElement = document.getElementById(`hour-${currentTime.hours}`);
      if (currentTimeElement) {
        currentTimeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [currentTime.hours, isToday]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="text-center text-sm text-gray-600 font-medium">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' }).toUpperCase()}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto" id="day-view-container">
        <div className="relative">
          {hours.map(hour => {
            const hourTasks = getTasksForHour(hour);
            const isCurrentHour = isToday && hour === currentTime.hours;
            
            return (
              <div 
                key={hour} 
                id={`hour-${hour}`}
                className="relative flex items-start border-b border-gray-100 min-h-[60px]"
              >
                <div className="w-16 flex-shrink-0 text-sm text-gray-500 pt-3 px-4">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 ml-4 min-h-[60px] flex items-center relative">
                  {/* Current time indicator */}
                  {isCurrentHour && isToday && (
                    <div 
                      className="absolute left-0 right-4 z-10 flex items-center"
                      style={{ 
                        top: `${(currentTime.minutes / 60) * 60}px`
                      }}
                    >
                      <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
                      <div className="flex-1 h-0.5 bg-red-500 ml-2"></div>
                      <span className="text-xs font-medium text-red-600 ml-2 bg-white px-2 py-1 rounded shadow-sm">
                        {currentTime.hours.toString().padStart(2, '0')}:{currentTime.minutes.toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  
                  {hourTasks.length > 0 ? (
                    <div className="space-y-2 w-full py-2">
                      {hourTasks.map((task, index) => (
                        <div
                          key={task._id}
                          className={`p-2 rounded text-sm border-l-4 ${getTaskColor(index)} cursor-pointer hover:shadow-md transition-shadow`}
                          onClick={() => onTaskClick(task)}
                        >
                          {task.title}
                          {task.description && (
                            <div className="text-xs opacity-80 mt-1">
                              {task.description.substring(0, 50)}{task.description.length > 50 ? '...' : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-12 flex items-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Week View Component
const WeekView = ({ currentDate, tasks, onTaskClick }: { currentDate: Date; tasks: Task[]; onTaskClick: (task: Task) => void }) => {
  // Tính tuần từ Thứ 2 đến Chủ nhật
  const startOfWeek = new Date(currentDate);
  const dayOfWeek = currentDate.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu là Chủ nhật thì lùi 6 ngày, còn lại thì tính từ Thứ 2
  startOfWeek.setDate(currentDate.getDate() + mondayOffset);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']; // Thứ 2 đến Chủ nhật
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getTasksForDayAndHour = (date: Date, hour: number) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getHours() === hour
      );
    });
  };

  const getTaskColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800', 
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-purple-100 text-purple-800',
    ];
    return colors[index % colors.length];
  };

  // Get current time for the time indicator
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return { hours, minutes };
  };

  const currentTime = getCurrentTime();
  const today = new Date().toDateString();
  const isTodayInWeek = weekDays.some(day => day.toDateString() === today);

  // Auto-scroll to current time on component mount
  useEffect(() => {
    if (isTodayInWeek) {
      const currentTimeElement = document.getElementById(`week-hour-${currentTime.hours}`);
      if (currentTimeElement) {
        currentTimeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [currentTime.hours, isTodayInWeek]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex">
          <div className="w-16 flex-shrink-0"></div> {/* Space for time column */}
          <div className="flex-1 grid grid-cols-7 gap-4 ml-4">
            {weekDays.map((date, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 font-medium mb-1">
                  {dayNames[index]}
                </div>
                <div className={`text-sm font-semibold ${
                  date.toDateString() === today ? 'text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''
                }`}>
                  {date.getDate().toString().padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time slots - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {hours.map(hour => {
            const isCurrentHour = hour === currentTime.hours;
            
            return (
              <div 
                key={hour} 
                id={`week-hour-${hour}`}
                className="relative flex items-start border-b border-gray-100 min-h-[60px]"
              >
                {/* Time column */}
                <div className="w-16 flex-shrink-0 text-sm text-gray-500 pt-3 px-4">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                
                {/* Days grid */}
                <div className="flex-1 ml-4 min-h-[60px] grid grid-cols-7 gap-4 relative">
                  {weekDays.map((date, dayIndex) => {
                    const dayTasks = getTasksForDayAndHour(date, hour);
                    
                    return (
                      <div key={dayIndex} className="relative min-h-[50px] p-1">
                        {/* Tasks */}
                        {dayTasks.map((task, taskIndex) => (
                          <div
                            key={task._id}
                            className={`p-1 rounded text-xs mb-1 cursor-pointer hover:shadow-md transition-shadow ${getTaskColor(taskIndex)}`}
                            onClick={() => onTaskClick(task)}
                            title={task.title + (task.description ? ' - ' + task.description : '')}
                          >
                            {task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title}
                          </div>
                        ))}
                        
                        {/* Empty slot indicator */}
                        {dayTasks.length === 0 && (
                          <div className="w-full h-12 flex items-center">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Current time indicator */}
                  {isCurrentHour && isTodayInWeek && (
                    <div 
                      className="absolute left-0 right-4 z-10 flex items-center"
                      style={{ 
                        top: `${(currentTime.minutes / 60) * 60}px`
                      }}
                    >
                      <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
                      <div className="flex-1 h-0.5 bg-red-500 ml-2"></div>
                      <span className="text-xs font-medium text-red-600 ml-2 bg-white px-2 py-1 rounded shadow-sm">
                        {currentTime.hours.toString().padStart(2, '0')}:{currentTime.minutes.toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Month View Component  
const MonthView = ({ currentDate, tasks, onTaskClick }: { currentDate: Date; tasks: Task[]; onTaskClick: (task: Task) => void }) => {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Tính ngày đầu tuần (Thứ 2) của tuần chứa ngày đầu tháng
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
  const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Số ngày cần lùi để đến Thứ 2
  
  const daysInMonth = lastDayOfMonth.getDate();
  const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
  
  const calendarDays = [];
  
  // Previous month days (để fill từ Thứ 2)
  for (let i = mondayOffset - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, daysInPrevMonth - i)
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day)
    });
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getTaskColor = (index: number) => {
    const colors = [
      'bg-blue-200',
      'bg-green-200', 
      'bg-yellow-200',
      'bg-red-200',
      'bg-purple-200',
    ];
    return colors[index % colors.length];
  };

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']; // Thứ 2 đến Chủ nhật
  const today = new Date().toDateString();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid - Fills remaining space */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-7 gap-2 h-full">
          {calendarDays.map((calendarDay, index) => {
            const dayTasks = getTasksForDate(calendarDay.date);
            const isToday = calendarDay.date.toDateString() === today;
            
            return (
              <div
                key={index}
                className={`border border-gray-200 rounded flex flex-col ${
                  !calendarDay.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${isToday ? 'ring-2 ring-blue-300' : ''}`}
              >
                <div className={`text-sm font-medium p-2 ${
                  !calendarDay.isCurrentMonth ? 'text-gray-400' : 
                  isToday ? 'text-blue-600 font-bold' : 'text-gray-900'
                }`}>
                  {calendarDay.day}
                </div>
                <div className="flex-1 p-2 pt-0 overflow-hidden">
                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map((task, taskIndex) => (
                      <div
                        key={task._id}
                        className={`p-1 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow ${getTaskColor(taskIndex)}`}
                        onClick={() => onTaskClick(task)}
                        title={task.title + (task.description ? ' - ' + task.description : '')}
                      >
                        {task.title.length > 12 ? task.title.substring(0, 12) + '...' : task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-gray-500 font-medium px-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarContent;
