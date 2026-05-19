import { useState } from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddTask from "./AddTask";
import TaskCard from "./TaskCard";
import TaskListPagination from "./TaskListPagination";
import type { Task, TaskList as TaskListType } from "@/types";

interface TaskSectionCollapsibleProps {
  title: string;
  tasks: Task[];
  handleTaskChanged: () => void;
  badgeCount?: number;
  isDefaultOpen?: boolean;
  onToggle?: () => void;
  lists: TaskListType[];
  selectedListId?: string;
}

const TaskSectionCollapsible = ({ 
  title, 
  tasks, 
  handleTaskChanged, 
  badgeCount,
  isDefaultOpen = false,
  onToggle,
  lists,
  selectedListId
}: TaskSectionCollapsibleProps) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sử dụng prop isDefaultOpen trực tiếp làm state
  const isExpanded = isDefaultOpen;
  
  const tasksPerPage = 4;
  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  
  // Sort tasks by deadline tăng dần (earliest first)
  const sortedTasks = [...tasks].sort((a, b) => {
    // Nếu không có deadline thì để xuống cuối
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
  
  // Get tasks for current page
  const startIndex = (currentPage - 1) * tasksPerPage;
  const paginatedTasks = sortedTasks.slice(startIndex, startIndex + tasksPerPage);

  const handleNewTaskAdded = () => {
    handleTaskChanged();
    setShowAddTask(false);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleExpanded = () => {
    // Gọi onToggle từ parent để handle việc đóng/mở sections
    if (onToggle) {
      onToggle();
    }
    // Reset to first page when expanding
    if (!isExpanded) {
      setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {badgeCount !== undefined && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {badgeCount}
            </Badge>
          )}
        </button>
        {isExpanded && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAddTask(!showAddTask)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4" />
            Add New Task
          </Button>
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-4 pl-2 overflow-hidden">
          {/* Add Task Form */}
          {showAddTask && (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-4">
                <AddTask 
                  handleNewTaskAdded={handleNewTaskAdded}
                  selectedListId={selectedListId}
                  lists={lists}
                />
              </CardContent>
            </Card>
          )}

          {/* Task List - Contained scrolling */}
          <div className="space-y-3 max-h-123 overflow-y-auto">
            {paginatedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                <p>No tasks for {title.toLowerCase()}</p>
              </div>
            ) : (
              paginatedTasks.map((task) => (
                <TaskCard 
                  key={task._id}
                  task={task}
                  index={0}
                  handleTaskChanged={handleTaskChanged}
                  lists={lists}
                />
              ))
            )}
          </div>

          {/* Pagination - Always show */}
          <div className="flex justify-center">
            <TaskListPagination 
              handleNext={handleNext}
              handlePrev={handlePrev}
              handlePageChange={handlePageChange}
              page={currentPage}
              totalPages={Math.max(totalPages, 1)} // Ensure at least 1 page
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSectionCollapsible;
