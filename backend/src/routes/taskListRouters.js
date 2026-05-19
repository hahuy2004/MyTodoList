import express from 'express';
import {
  getAllTaskLists,
  createTaskList,
  updateTaskList,
  deleteTaskList
} from '../controllers/taskListControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes trong task-lists đều cần authentication
router.use(authenticateToken);

// GET /api/task-lists - Lấy tất cả TaskLists
router.get('/', getAllTaskLists);

// POST /api/task-lists - Tạo TaskList mới
router.post('/', createTaskList);

// PUT /api/task-lists/:listId - Cập nhật TaskList
router.put('/:listId', updateTaskList);

// DELETE /api/task-lists/:listId - Xóa TaskList
router.delete('/:listId', deleteTaskList);

export default router;
