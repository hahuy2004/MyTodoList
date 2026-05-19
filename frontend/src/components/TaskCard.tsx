import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { cn, calculateTimeRemaining, formatDeadline } from "@/lib/utils";
import { Button } from "./ui/button";
import { CheckCircle2, Circle, Calendar, SquarePen, Trash2, Clock, AlertTriangle } from "lucide-react";
import type { TaskCardProps } from "@/types";
import { toast } from "sonner";
import api from '../lib/axios';
import TaskDetailModal from './TaskDetailModal';

const TaskCard = ({ task, index, handleTaskChanged, lists }: TaskCardProps) => {
    // States for modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    
    const [timeInfo, setTimeInfo] = useState<{
        timeRemaining: string;
        isUrgent: boolean;
        isOverdue: boolean;
    } | null>(null);

    // Update time remaining every second for tasks with deadlines
    useEffect(() => {
        if (!task.deadline || task.status === "complete") return;

        const updateTime = () => {
            setTimeInfo(calculateTimeRemaining(task.deadline!));
        };

        updateTime(); // Initial update
        const interval = setInterval(updateTime, 1000); // Update every second

        return () => clearInterval(interval);
    }, [task.deadline, task.status]);

    // Handle task completion toggle
    const toggleTaskCompleteButton = async (e: React.MouseEvent) => {
        // Prevent event bubbling to avoid opening the detail modal
        e.stopPropagation();
        
        try {
            if (task.status === "active") {
                await api.put(`/tasks/${task._id}`, {
                    status: "complete",
                    completedAt: new Date().toISOString(),
                });
                toast.success(`${task.title} đã hoàn thành.`);
            } else {
                await api.put(`/tasks/${task._id}`, {
                    status: "active",
                    completedAt: null,
                });
                toast.success(`${task.title} đã đổi sang chưa hoàn thành.`);
            }
            handleTaskChanged();
        } catch (error) {
            console.error("Lỗi xảy ra khi update task.", error);
            toast.error("Lỗi xảy ra khi cập nhật nhiệm vụ.");
        }
    };

    // Handle card click to open detail modal in view mode
    const handleCardClick = () => {
        setModalMode('view');
        setIsDetailModalOpen(true);
    };

    // Handle edit button click to open detail modal in edit mode
    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModalMode('edit');
        setIsDetailModalOpen(true);
    };

    // Handle delete button click
    const handleDeleteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.delete(`/tasks/${task._id}`);
            toast.success("Nhiệm vụ đã xoá thành công.");
            handleTaskChanged();
        } catch (error) {
            console.error("Lỗi xảy ra khi xoá task.", error);
            toast.error("Lỗi xảy ra khi xoá nhiệm vụ.");
        }
    };


    return (
        <>
            <Card
                className={cn(
                    "p-4 border-0 shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer",
                    task.status === "complete" && "opacity-75",
                    // Urgent task styling
                    timeInfo?.isUrgent && task.status === "active" && "bg-red-50 border-red-200",
                    // Overdue task styling
                    timeInfo?.isOverdue && task.status === "active" && "bg-red-100 border-red-300"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={handleCardClick}
            >
                <div className="flex items-start gap-4">
                    {/* Completion Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "flex-shrink-0 size-8 rounded-full transition-all duration-200 mt-1",
                            task.status === "complete"
                                ? "text-green-600 hover:text-green-700"
                                : "text-gray-400 hover:text-blue-600"
                        )}
                        onClick={toggleTaskCompleteButton}
                    >
                        {task.status === "complete" ? (
                            <CheckCircle2 className="size-5" />
                        ) : (
                            <Circle className="size-5" />
                        )}
                    </Button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="space-y-2">
                            {/* Hàng 1: Tên task (in đậm) */}
                            <h3
                                className={cn(
                                    "text-base font-bold transition-all duration-200",
                                    task.status === "complete"
                                        ? "line-through text-gray-500"
                                        : "text-gray-900"
                                )}
                            >
                                {task.title}
                            </h3>

                            {/* Hàng 2: Deadline | Subtasks | List name */}
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                {/* Deadline */}
                                {task.deadline && (
                                    <>
                                        <span>Deadline: {formatDeadline(task.deadline)}</span>
                                        <span className="text-gray-400">|</span>
                                    </>
                                )}
                                
                                {/* Subtasks count */}
                                {task.subtasks && task.subtasks.length > 0 && (
                                    <>
                                        <span 
                                            className="hover:text-blue-600 cursor-pointer transition-colors"
                                            title="Click để xem chi tiết subtasks"
                                        >
                                            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                                        </span>
                                        <span className="text-gray-400">|</span>
                                    </>
                                )}
                                
                                {/* List name */}
                                {(() => {
                                    const currentList = lists.find(list => list.id === task.list);
                                    return (
                                        <span>{currentList ? currentList.name : 'Unknown'}</span>
                                    );
                                })()}
                            </div>

                            {/* Hàng 3: Thời gian còn lại hoặc trạng thái hoàn thành */}
                            {task.status === "complete" ? (
                                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                                    <CheckCircle2 className="size-4" />
                                    <span>Đã hoàn thành</span>
                                </div>
                            ) : (
                                task.deadline && timeInfo && (
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                                        timeInfo.isOverdue && "text-red-700 bg-red-100",
                                        timeInfo.isUrgent && !timeInfo.isOverdue && "text-orange-700 bg-orange-100",
                                        !timeInfo.isUrgent && !timeInfo.isOverdue && "text-blue-700 bg-blue-100"
                                    )}>
                                        {timeInfo.isOverdue ? (
                                            <AlertTriangle className="size-4" />
                                        ) : timeInfo.isUrgent ? (
                                            <AlertTriangle className="size-4" />
                                        ) : (
                                            <Clock className="size-4" />
                                        )}
                                        <span>
                                            {timeInfo.isOverdue ? (
                                                "Bạn đã trễ deadline! Không thể trì hoãn nữa"
                                            ) : timeInfo.isUrgent ? (
                                                <>Còn {timeInfo.timeRemaining} • Cần phải làm ngay!</>
                                            ) : (
                                                <>Còn {timeInfo.timeRemaining}</>
                                            )}
                                        </span>
                                    </div>
                                )
                            )}

                            {/* Hàng 4: Thời gian khởi tạo - thời gian hoàn thành */}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="size-3" />
                                <span>
                                    {new Date(task.createdAt).toLocaleString('vi-VN')}
                                </span>
                                {task.completedAt && (
                                    <>
                                        <span className="text-gray-400"> - </span>
                                        <span>
                                            {new Date(task.completedAt).toLocaleString('vi-VN')}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="hidden gap-2 group-hover:inline-flex">
                        {/* Edit button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 transition-colors size-8 text-gray-400 hover:text-blue-600"
                            onClick={handleEditClick}
                        >
                            <SquarePen className="size-4" />
                        </Button>

                        {/* Delete button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 transition-colors size-8 text-gray-400 hover:text-red-600"
                            onClick={handleDeleteClick}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Task Detail Modal */}
            <TaskDetailModal
                task={task}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onTaskChanged={handleTaskChanged}
                lists={lists}
                mode={modalMode}
            />
        </>
    );
};

export default TaskCard;