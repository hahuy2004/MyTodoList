import express from 'express';
import { 
  createTask, 
  deleteTask, 
  getAllTasks, 
  updateTask, 
  getTaskStatsByList,
  getOverallStats 
} from '../controllers/tasksControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes trong tasks đều cần authentication
router.use(authenticateToken);

// Get là phương thức HTTP để lấy dữ liệu
// Post là phương thức HTTP để gửi dữ liệu
// Put là phương thức HTTP để cập nhật dữ liệu
// Delete là phương thức HTTP để xóa dữ liệu

// Lấy danh sách công việc
router.get('/', getAllTasks);

// Lấy thống kê tổng quan cho sidebar
router.get('/stats', getOverallStats);

// Lấy thống kê tasks theo list cụ thể
router.get('/list/:listId/stats', getTaskStatsByList);

// Thêm công việc mới
router.post('/', createTask);

// Cập nhật công việc với id cụ thể
router.put('/:id', updateTask);

// Xóa công việc với id cụ thể
router.delete('/:id', deleteTask);

export default router;