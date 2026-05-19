// File này nhằm mục đích hiển thị chi tiết task trong một modal
// Cho phép người dùng xem, chỉnh sửa, hoàn thành hoặc xoá task
// Cũng hỗ trợ quản lý subtasks
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CheckCircle2, Circle, Calendar, Clock, Plus, X, SquarePen, Trash2 } from "lucide-react";
import { cn, formatDeadline, formatDateTimeLocal, getListIconColor } from "@/lib/utils";
import type { Task, TaskList as TaskListType, Subtask } from "@/types";
import { toast } from "sonner";
import api from '../lib/axios';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskChanged: () => void;
  lists: TaskListType[];
  mode?: 'view' | 'edit';
}

const TaskDetailModal = ({ 
  task, 
  isOpen, 
  onClose, 
  onTaskChanged, 
  lists,
  mode: initialMode = 'view'
}: TaskDetailModalProps) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(task);
  
  // Edit form states
  const [updateTaskTitle, setUpdateTaskTitle] = useState("");
  const [updateTaskDescription, setUpdateTaskDescription] = useState("");
  const [updateDeadline, setUpdateDeadline] = useState("");
  const [updateTaskList, setUpdateTaskList] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Update current task when task prop changes
  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  // Initialize form data when task changes
  useEffect(() => {
    if (currentTask) {
      setUpdateTaskTitle(currentTask.title || "");
      setUpdateTaskDescription(currentTask.description || "");
      setUpdateTaskList(currentTask.list || "unknown");
      setSubtasks(currentTask.subtasks || []);
      
      if (currentTask.deadline) {
        // Debug log để kiểm tra giá trị
        console.log('Task deadline from DB:', currentTask.deadline);
        
        // Nếu deadline được lưu dưới dạng ISO string từ database
        const deadlineDate = new Date(currentTask.deadline);
        console.log('Converted to Date object:', deadlineDate);
        console.log('Local time string:', deadlineDate.toLocaleString());
        
        // Để hiển thị đúng trong datetime-local input
        // Chúng ta cần format thành local time format YYYY-MM-DDTHH:MM
        const year = deadlineDate.getFullYear();
        const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
        const day = String(deadlineDate.getDate()).padStart(2, '0');
        const hours = String(deadlineDate.getHours()).padStart(2, '0');
        const minutes = String(deadlineDate.getMinutes()).padStart(2, '0');
        
        const localDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
        console.log('Setting input value to:', localDateTimeString);
        
        setUpdateDeadline(localDateTimeString);
      } else {
        setUpdateDeadline("");
      }
    }
  }, [currentTask]);

  // Reset mode when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!currentTask) return null;

  const handleClose = () => {
    setMode('view');
    onClose();
  };

  const toggleTaskComplete = async () => {
    if (!currentTask) return;
    
    setIsLoading(true);
    try {
      const newStatus = currentTask.status === "active" ? "complete" : "active";
      const updateData: any = { status: newStatus };
      
      if (newStatus === "complete") {
        updateData.completedAt = new Date().toISOString();
      } else {
        updateData.completedAt = null;
      }

      await api.put(`/tasks/${currentTask._id}`, updateData);
      
      // Update currentTask immediately for instant UI feedback
      setCurrentTask(prev => prev ? {
        ...prev,
        status: newStatus,
        completedAt: updateData.completedAt
      } : null);
      
      toast.success(
        newStatus === "complete" 
          ? `${currentTask.title} đã hoàn thành.`
          : `${currentTask.title} đã đổi sang chưa hoàn thành.`
      );
      
      // Refresh data from server to update parent components
      onTaskChanged();
    } catch (error) {
      console.error("Lỗi xảy ra khi update task.", error);
      toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async () => {
    if (!currentTask) return;
    
    setIsLoading(true);
    try {
      await api.delete(`/tasks/${currentTask._id}`);
      toast.success("Nhiệm vụ đã xoá thành công.");
      onTaskChanged();
      handleClose();
    } catch (error) {
      console.error("Lỗi xảy ra khi xoá task.", error);
      toast.error("Lỗi xảy ra khi xoá nhiệm vụ.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async () => {
    if (!updateTaskTitle.trim()) {
      toast.error("Bạn cần nhập nội dung của nhiệm vụ.");
      return;
    }
    
    if (!updateDeadline) {
      toast.error("Bạn cần chọn thời hạn hoàn thành.");
      return;
    }

    if (!currentTask) return;

    setIsLoading(true);
    try {
      const cleanedSubtasks = subtasks.map(subtask => {
        if (subtask._id.startsWith('temp_')) {
          const { _id, ...subtaskWithoutId } = subtask;
          return subtaskWithoutId;
        }
        return subtask;
      });

      const deadlineToSave = new Date(updateDeadline);
      const updateData = {
        title: updateTaskTitle,
        description: updateTaskDescription,
        deadline: deadlineToSave.toISOString(),
        list: updateTaskList,
        subtasks: cleanedSubtasks
      };
      await api.put(`/tasks/${currentTask._id}`, updateData);
      toast.success("Nhiệm vụ đã được cập nhật thành công!");
      setMode('view');
      onTaskChanged();
      handleClose(); // Đóng modal sau khi cập nhật
    } catch (error) {
      console.error("Lỗi xảy ra khi update task.", error);
      toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
    } finally {
      setIsLoading(false);
    }
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) {
      toast.error("Vui lòng nhập nội dung subtask.");
      return;
    }
    const newSubtask: Subtask = {
      _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newSubtaskTitle,
      completed: false
    };
    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle("");
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(subtask => subtask._id !== subtaskId));
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.map(subtask =>
      subtask._id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    ));
  };

  const updateSubtaskTitle = (subtaskId: string, newTitle: string) => {
    setSubtasks(subtasks.map(subtask =>
      subtask._id === subtaskId
        ? { ...subtask, title: newTitle }
        : subtask
    ));
  };

  // Toggle subtask in view mode - updates directly to server
  const toggleSubtaskInViewMode = async (subtaskId: string) => {
    if (!currentTask) return;
    
    setIsLoading(true);
    try {
      // Find the subtask to toggle
      const subtaskToToggle = currentTask.subtasks?.find(st => st._id === subtaskId);
      if (!subtaskToToggle) return;

      // Create updated subtasks array
      const updatedSubtasks = currentTask.subtasks?.map(subtask =>
        subtask._id === subtaskId
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      ) || [];

      // Update task on server
      await api.put(`/tasks/${currentTask._id}`, {
        subtasks: updatedSubtasks
      });

      // Update currentTask state immediately
      setCurrentTask(prev => prev ? {
        ...prev,
        subtasks: updatedSubtasks
      } : null);

      toast.success(`Subtask "${subtaskToToggle.title}" đã được cập nhật!`);
      
      // Refresh parent data
      onTaskChanged();
    } catch (error) {
      console.error("Lỗi khi cập nhật subtask:", error);
      toast.error("Không thể cập nhật subtask");
    } finally {
      setIsLoading(false);
    }
  };

  const currentList = lists.find(list => list.id === currentTask?.list);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{mode === 'edit' ? 'Chỉnh sửa nhiệm vụ' : 'Chi tiết nhiệm vụ'}</span>
            <div className="flex gap-2">
              {mode === 'view' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode('edit')}
                  disabled={isLoading}
                >
                  <SquarePen className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "transition-all duration-200",
                  currentTask?.status === "complete"
                    ? "text-green-600 hover:text-green-700"
                    : "text-gray-400 hover:text-blue-600"
                )}
                onClick={toggleTaskComplete}
                disabled={isLoading}
              >
                {currentTask?.status === "complete" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {mode === 'view' ? (
          // View Mode
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h3 className={cn(
                "text-lg font-semibold",
                currentTask?.status === "complete" && "line-through text-gray-500"
              )}>
                {currentTask?.title}
              </h3>
            </div>

            {/* Description */}
            {currentTask?.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Mô tả:</label>
                <p className="text-gray-600 mt-1">{currentTask.description}</p>
              </div>
            )}

            {/* Deadline */}
            {currentTask?.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Deadline: {formatDeadline(currentTask.deadline)}
                </span>
              </div>
            )}

            {/* List */}
            {currentList && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getListIconColor(currentList.color)}`} />
                <span className="text-sm text-gray-600">
                  List: {currentList.name}
                </span>
              </div>
            )}

            {/* Subtasks */}
            {currentTask?.subtasks && currentTask.subtasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Subtasks: {(currentTask.subtasks || []).filter(st => st.completed).length}/{(currentTask.subtasks || []).length} hoàn thành
                  </span>
                </div>
                
                {/* Subtask list with scroll if >4 items */}
                <div className={cn(
                  "space-y-2 border rounded-lg p-3 bg-gray-50",
                  (currentTask.subtasks || []).length > 4 && "max-h-48 overflow-y-auto"
                )}>
                  {(currentTask.subtasks || []).map((subtask) => (
                    <div key={subtask._id} className="flex items-center gap-2 group/subtask">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "size-6 rounded-full",
                          subtask.completed 
                            ? "text-green-600 hover:text-green-700" 
                            : "text-gray-400 hover:text-blue-600"
                        )}
                        onClick={() => toggleSubtaskInViewMode(subtask._id)}
                        disabled={isLoading}
                        title={subtask.completed ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                      </Button>
                      <span className={cn(
                        "text-sm flex-1",
                        subtask.completed && "line-through text-gray-500"
                      )}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Created/Completed dates */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  Tạo: {currentTask && new Date(currentTask.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              {currentTask?.completedAt && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-500">
                      Hoàn thành: {new Date(currentTask.completedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button
                variant="destructive"
                onClick={deleteTask}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa Task
              </Button>
              <Button onClick={handleClose}>
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            {/* Task Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tên nhiệm vụ <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập tên nhiệm vụ"
                value={updateTaskTitle}
                onChange={(e) => setUpdateTaskTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea
                placeholder="Nhập mô tả chi tiết cho nhiệm vụ"
                value={updateTaskDescription}
                onChange={(e) => setUpdateTaskDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Thời hạn <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                value={updateDeadline}
                onChange={(e) => setUpdateDeadline(e.target.value)}
                min={formatDateTimeLocal()}
              />
            </div>

            {/* List Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Danh sách</label>
              <Select value={updateTaskList} onValueChange={setUpdateTaskList}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh sách" />
                </SelectTrigger>
                <SelectContent>
                  {lists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getListIconColor(list.color)}`} />
                        <span>{list.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subtasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Subtasks</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSubtask}
                  disabled={!newSubtaskTitle.trim() || isLoading}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Tạo Subtask mới
                </Button>
              </div>

              <Input
                placeholder="Nhập tên subtask và nhấn 'Tạo Subtask mới'"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
              />

              {subtasks.length > 0 && (
                <div className={cn(
                  "space-y-2 border rounded-lg p-3",
                  subtasks.length > 4 && "max-h-60 overflow-y-auto"
                )}>
                  {subtasks.map((subtask) => (
                    <div key={subtask._id} className="flex items-center gap-2 group/subtask">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "size-6 rounded-full",
                          subtask.completed 
                            ? "text-green-600 hover:text-green-700" 
                            : "text-gray-400 hover:text-blue-600"
                        )}
                        onClick={() => toggleSubtask(subtask._id)}
                        disabled={isLoading}
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                      </Button>
                      <Input
                        value={subtask.title}
                        onChange={(e) => updateSubtaskTitle(subtask._id, e.target.value)}
                        className={cn(
                          "flex-1 border-none bg-transparent px-0 text-sm",
                          subtask.completed && "line-through text-gray-500"
                        )}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 text-gray-400 hover:text-red-600 opacity-0 group-hover/subtask:opacity-100 transition-opacity"
                        onClick={() => removeSubtask(subtask._id)}
                        disabled={isLoading}
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={deleteTask}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa Task
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setMode('view')}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  onClick={updateTask}
                  disabled={!updateTaskTitle.trim() || !updateDeadline || isLoading}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
