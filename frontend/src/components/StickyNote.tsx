import React, { useState } from 'react';
import { Trash2, Edit, Circle, CheckCircle2 } from 'lucide-react';
import type { Task } from '../types';
import api from '../lib/axios';
import { toast } from 'sonner';
import { calculateTimeRemaining, formatDeadline } from '../lib/utils';

interface StickyNoteProps {
  task: Task;
  color?: string;
  onTaskClick?: (task: Task, mode: 'view' | 'edit') => void;
  onTaskChanged?: () => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({ task, color = 'yellow', onTaskClick, onTaskChanged }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getTimeRemaining = (dateString?: string) => {
    if (!dateString) return null;
    
    const timeInfo = calculateTimeRemaining(dateString);
    if (!timeInfo) return null;
    
    if (timeInfo.isOverdue) {
      return {
        text: `Đã quá hạn`,
        color: 'text-red-600'
      };
    } else if (timeInfo.isUrgent) {
      return {
        text: `Còn ${timeInfo.timeRemaining}`,
        color: 'text-orange-600'
      };
    } else {
      return {
        text: `Còn ${timeInfo.timeRemaining}`,
        color: 'text-blue-600'
      };
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-200 border-yellow-300 shadow-yellow-100',
      pink: 'bg-pink-200 border-pink-300 shadow-pink-100',
      blue: 'bg-blue-200 border-blue-300 shadow-blue-100',
      green: 'bg-green-200 border-green-300 shadow-green-100',
      purple: 'bg-purple-200 border-purple-300 shadow-purple-100',
      orange: 'bg-orange-200 border-orange-300 shadow-orange-100',
    };
    return colorMap[color] || colorMap.yellow;
  };

  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onTaskChanged) return;
    
    setIsLoading(true);
    
    try {
      const newStatus = task.status === 'complete' ? 'active' : 'complete';
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'complete') {
        updateData.completedAt = new Date().toISOString();
      } else {
        updateData.completedAt = null;
      }
      
      await api.put(`/tasks/${task._id}`, updateData);
      toast.success(
        newStatus === 'complete' 
          ? `${task.title} đã hoàn thành!` 
          : `${task.title} đã chuyển về chưa hoàn thành!`
      );
      onTaskChanged();
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái task:', error);
      toast.error('Không thể cập nhật trạng thái task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onTaskChanged) return;
    
    setIsLoading(true);
    
    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success(`Đã xóa task "${task.title}"`);
      onTaskChanged();
    } catch (error) {
      console.error('Lỗi khi xóa task:', error);
      toast.error('Không thể xóa task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTaskClick) {
      onTaskClick(task, 'edit');
    }
  };

  const handleStickyClick = () => {
    if (onTaskClick) {
      onTaskClick(task, 'view');
    }
  };

  return (
    <div 
      className={`
        sticky-note relative w-64 h-64 p-4 m-3 cursor-pointer group
        ${getColorClasses(color)}
        border-2 rounded-lg shadow-lg transform rotate-1 hover:rotate-0 
        transition-all duration-300 hover:scale-105
        ${task.status === 'complete' ? 'opacity-70' : ''}
        ${isLoading ? 'pointer-events-none opacity-50' : ''}
      `}
      style={{
        fontFamily: 'Comic Sans MS, cursive, sans-serif',
        boxShadow: '5px 5px 15px rgba(0,0,0,0.2)',
      }}
      onClick={handleStickyClick}
    >
      {/* Ghim sticky note */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <div className="w-4 h-4 bg-red-500 rounded-full shadow-md border-2 border-red-600"></div>
      </div>
      
      {/* Action buttons - chỉ hiện khi có onTaskChanged và onTaskClick */}
      {(onTaskChanged || onTaskClick) && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onTaskClick && (
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
              title="Chỉnh sửa"
            >
              <Edit className="w-3 h-3" />
            </button>
          )}
          {onTaskChanged && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Status checkbox - chỉ hiện khi có onTaskChanged */}
      {onTaskChanged && (
        <div className="absolute top-2 left-2">
          <button
            onClick={handleToggleComplete}
            disabled={isLoading}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              task.status === 'complete'
                ? 'text-green-600 hover:text-green-700'
                : 'text-gray-400 hover:text-blue-600'
            }`}
            title={task.status === 'complete' ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
          >
            {task.status === 'complete' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
        </div>
      )}

      {/* Status badge - hiện khi không có interactive controls */}
      {!onTaskChanged && task.status === 'complete' && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          ✓ Hoàn thành
        </div>
      )}
      
      {/* Tiêu đề task */}
      <div className={`mb-4 ${onTaskChanged ? 'mt-8' : 'mt-2'}`}>
        <h3 className={`text-lg font-bold text-gray-800 leading-tight line-clamp-3 ${
          task.status === 'complete' ? 'line-through' : ''
        }`}>
          {task.title}
        </h3>
        
        {/* Thông tin subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="text-xs text-gray-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>
              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
            </span>
          </div>
        )}
      </div>
      
      {/* Thời gian và deadline */}
      <div className="absolute bottom-4 left-4 right-4">
        {task.status === 'complete' ? (
          /* Hiển thị trạng thái hoàn thành */
          <div className="text-sm font-medium text-green-600">
            ✅ Đã hoàn thành
          </div>
        ) : (
          /* Thời gian còn lại */
          (() => {
            const timeRemaining = getTimeRemaining(task.deadline);
            return timeRemaining ? (
              <div className={`text-sm font-medium ${timeRemaining.color}`}>
                ⏰ {timeRemaining.text}
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-600">
                ⏰ Không có deadline
              </div>
            );
          })()
        )}
        
        {/* Deadline */}
        <div className="text-xs text-gray-500 mt-1">
          📅 Deadline: {task.deadline ? formatDeadline(task.deadline) : 'Chưa đặt'}
        </div>
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
  );
};

export default StickyNote;