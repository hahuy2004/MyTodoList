import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions cho deadline
export function calculateTimeRemaining(deadline: string): {
  timeRemaining: string;
  isUrgent: boolean;
  isOverdue: boolean;
} {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate.getTime() - now.getTime();

  // Nếu đã quá hạn
  if (timeDiff < 0) {
    return {
      timeRemaining: "Đã quá hạn",
      isUrgent: false,
      isOverdue: true
    };
  }

  // Tính toán thời gian còn lại
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  // Kiểm tra xem có urgent không (còn lại <= 2 tiếng)
  const isUrgent = timeDiff <= 2 * 60 * 60 * 1000; // 2 giờ = 2 * 60 * 60 * 1000 ms

  let timeRemaining = "";

  if (days > 0) {
    timeRemaining = `${days} ngày`;
  } else if (hours > 0) {
    timeRemaining = `${hours} giờ`;
  } else if (minutes > 0) {
    timeRemaining = `${minutes} phút`;
  } else {
    timeRemaining = `${seconds} giây`;
  }

  return {
    timeRemaining,
    isUrgent,
    isOverdue: false
  };
}

export function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
    // Không cần chỉ định timeZone vì datetime đã được lưu đúng múi giờ local
  });
}

export function formatDateTimeLocal(date?: Date): string {
  if (!date) {
    date = new Date();
  }
  
  // Tính offset của múi giờ hiện tại và điều chỉnh cho datetime-local input
  const timezoneOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (timezoneOffset * 60000));
  return localDate.toISOString().slice(0, 16);
}

export function getListIconColor(colorClass: string): string {
  // Map backend color classes to frontend-ready Tailwind classes
  const colorMap: { [key: string]: string } = {
    'bg-gray-400': 'bg-gray-400',
    'bg-orange-400': 'bg-orange-400', 
    'bg-blue-500': 'bg-blue-500',
    'bg-green-500': 'bg-green-500',
    'bg-red-500': 'bg-red-500',
    'bg-purple-500': 'bg-purple-500',
    'bg-yellow-500': 'bg-yellow-500',
    'bg-pink-500': 'bg-pink-500',
    'bg-indigo-500': 'bg-indigo-500',
    'bg-teal-500': 'bg-teal-500',
  };
  
  return colorMap[colorClass] || 'bg-gray-400';
}

// Thêm utilities cho việc nhóm tasks theo thời gian
export function categorizeTasksByTime(tasks: any[]) {
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
  });

  const tomorrowTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    const taskDate = new Date(task.deadline);
    return taskDate >= startOfTomorrow && taskDate <= endOfTomorrow;
  });

  const thisWeekTasks = tasks.filter(task => {
    if (!task.deadline) return false;
    const taskDate = new Date(task.deadline);
    return taskDate >= startOfWeek && taskDate <= endOfWeek;
  });

  const noDeadlineTasks = tasks.filter(task => !task.deadline);

  return {
    today: todayTasks,
    tomorrow: tomorrowTasks,
    thisWeek: thisWeekTasks,
    noDeadline: noDeadlineTasks
  };
}
