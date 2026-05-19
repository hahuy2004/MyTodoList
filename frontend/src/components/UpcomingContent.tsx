import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import AddTask from "./AddTask";
import TaskSectionCollapsible from "./TaskSectionCollapsible";
import { getListIconColor } from "@/lib/utils";
import type { Task, TaskList as TaskListType } from "@/types";

interface UpcomingContentProps {
  visibleTasks: Task[];
  handleTaskChanged: () => void;
  selectedListId?: string;
  lists: TaskListType[];
}

const UpcomingContent = ({
  visibleTasks,
  handleTaskChanged,
  selectedListId,
  lists
}: UpcomingContentProps) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("Today"); // State để track section nào đang mở

  // Get current list info for display
  const currentList = selectedListId ? lists.find(list => list.id === selectedListId) : null;

  // Categorize tasks by time period với logic cải tiến
  const categorizedTasks = categorizeTasksByTimeImproved(visibleTasks);

  // Handler để toggle sections (chỉ cho phép 1 section mở tại 1 thời điểm)
  const handleSectionToggle = (sectionName: string) => {
    if (openSection === sectionName) {
      setOpenSection(null); // Đóng section hiện tại nếu click lại
    } else {
      setOpenSection(sectionName); // Mở section mới và đóng các section khác
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      {/* Header Section */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-1.5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-3xl font-bold text-gray-900">
              Upcoming
              {currentList && (
                <span className="ml-3 text-xl text-gray-600">
                  in <span className="inline-flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getListIconColor(currentList.color)}`} />
                    {currentList.name}
                  </span>
                </span>
              )}
            </h1>
            <p className="text-gray-600">
              Xem trước các công việc sắp tới của bạn trong tuần này
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="inline-block text-2xl font-bold text-gray-800 bg-blue-100 px-4 py-2 rounded-lg shadow-sm">
              {categorizedTasks.thisWeek.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Tổng số task trong tuần</div>
          </div>
        </div>
      </div>

      {/* Global Add Task */}
      {showAddTask && (
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-8 py-4">
          <Card>
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
        </div>
      )}

      {/* Main Content Area - Fixed height with proper scroll containment */}
      <div className="flex-1 min-h-0 px-6 py-4">
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-5">
            <div className="w-full space-y-2 max-h-full">
              {/* Today Section - Default Open */}
              <TaskSectionCollapsible
                title="Today"
                tasks={categorizedTasks.today}
                handleTaskChanged={handleTaskChanged}
                badgeCount={categorizedTasks.today.length}
                isDefaultOpen={openSection === "Today"}
                onToggle={() => handleSectionToggle("Today")}
                lists={lists}
                selectedListId={selectedListId}
              />

              {/* Tomorrow Section - Default Closed */}
              <TaskSectionCollapsible
                title="Tomorrow"
                tasks={categorizedTasks.tomorrow}
                handleTaskChanged={handleTaskChanged}
                badgeCount={categorizedTasks.tomorrow.length}
                isDefaultOpen={openSection === "Tomorrow"}
                onToggle={() => handleSectionToggle("Tomorrow")}
                lists={lists}
                selectedListId={selectedListId}
              />

              {/* This Week Section - Default Closed */}
              <TaskSectionCollapsible
                title="This Week"
                tasks={categorizedTasks.thisWeek}
                handleTaskChanged={handleTaskChanged}
                badgeCount={categorizedTasks.thisWeek.length}
                isDefaultOpen={openSection === "This Week"}
                onToggle={() => handleSectionToggle("This Week")}
                lists={lists}
                selectedListId={selectedListId}
              />

              {/* No Deadline Section */}
              {categorizedTasks.noDeadline.length > 0 && (
                <TaskSectionCollapsible
                  title="No Deadline"
                  tasks={categorizedTasks.noDeadline}
                  handleTaskChanged={handleTaskChanged}
                  badgeCount={categorizedTasks.noDeadline.length}
                  isDefaultOpen={openSection === "No Deadline"}
                  onToggle={() => handleSectionToggle("No Deadline")}
                  lists={lists}
                  selectedListId={selectedListId}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function cải tiến để phân loại tasks
function categorizeTasksByTimeImproved(tasks: Task[]) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);
  
  const startOfTomorrow = new Date(tomorrow);
  startOfTomorrow.setHours(0, 0, 0, 0);
  
  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);
  
  // Tính start và end của tuần (từ Thứ 2 đến Chủ nhật)
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu là Chủ nhật thì lùi 6 ngày, còn lại thì tính từ Thứ 2
  startOfWeek.setDate(today.getDate() + mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Chủ nhật
  endOfWeek.setHours(23, 59, 59, 999);

  const todayTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    const taskDate = new Date(task.deadline);
    return taskDate >= startOfToday && taskDate <= endOfToday;
  }).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()); // Sắp xếp theo deadline tăng dần

  const tomorrowTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    const taskDate = new Date(task.deadline);
    return taskDate >= startOfTomorrow && taskDate <= endOfTomorrow;
  }).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()); // Sắp xếp theo deadline tăng dần

  // This Week bao gồm toàn bộ tuần từ Thứ 2 đến Chủ nhật, sắp xếp theo deadline tăng dần
  const thisWeekTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    const taskDate = new Date(task.deadline);
    return taskDate >= startOfWeek && taskDate <= endOfWeek;
  }).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()); // Sắp xếp theo deadline tăng dần

  const noDeadlineTasks = tasks.filter(task => !task.deadline);

  return {
    today: todayTasks,
    tomorrow: tomorrowTasks,
    thisWeek: thisWeekTasks,
    noDeadline: noDeadlineTasks
  };
}

export default UpcomingContent;
