import api from './axios';

export const taskListAPI = {
  // Lấy tất cả TaskLists
  getAllTaskLists: async () => {
    const response = await api.get('/task-lists');
    return response.data;
  },

  // Tạo TaskList mới
  createTaskList: async (name: string, color: string) => {
    const response = await api.post('/task-lists', { name, color });
    return response.data;
  },

  // Cập nhật TaskList
  updateTaskList: async (listId: string, name: string, color: string) => {
    const response = await api.put(`/task-lists/${listId}`, { name, color });
    return response.data;
  },

  // Xóa TaskList
  deleteTaskList: async (listId: string) => {
    const response = await api.delete(`/task-lists/${listId}`);
    return response.data;
  }
};

export const taskStatsAPI = {
  // Lấy thống kê tổng quan cho sidebar
  getOverallStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  },

  // Lấy thống kê tasks theo list cụ thể
  getTaskStatsByList: async (listId: string, sortBy: string = 'deadline') => {
    const response = await api.get(`/tasks/list/${listId}/stats?sortBy=${sortBy}`);
    return response.data;
  }
};
