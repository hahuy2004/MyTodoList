import express from 'express';
import { 
  chatWithAI, 
  getChatSessions, 
  getChatSession,
  deleteChatSession,
  updateChatSessionTitle,
  getSmartSuggestions, 
  getAIStatus 
} from '../controllers/aiControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// POST /api/ai/chat - Chat với AI Assistant (session-based)
router.post('/chat', chatWithAI);

// GET /api/ai/sessions - Lấy danh sách chat sessions
router.get('/sessions', getChatSessions);

// GET /api/ai/sessions/:sessionId - Lấy chi tiết một chat session
router.get('/sessions/:sessionId', getChatSession);

// DELETE /api/ai/sessions/:sessionId - Xóa chat session
router.delete('/sessions/:sessionId', deleteChatSession);

// PUT /api/ai/sessions/:sessionId/title - Cập nhật tên chat session
router.put('/sessions/:sessionId/title', updateChatSessionTitle);

// GET /api/ai/suggestions - Lấy gợi ý thông minh
router.get('/suggestions', getSmartSuggestions);

// GET /api/ai/status - Kiểm tra trạng thái AI API
router.get('/status', getAIStatus);

export default router;