import aiService from '../services/aiService.js';

// Xử lý chat với AI Assistant (session-based)
export const chatWithAI = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.userId;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const result = await aiService.processChatWithSession(userId, sessionId, message.trim());

    if (result.success) {
      res.json({
        success: true,
        response: result.response,
        provider: result.provider,
        sessionId: result.sessionId,
        session: result.session
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Lấy danh sách chat sessions
export const getChatSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await aiService.getChatSessions(userId);

    if (result.success) {
      res.json({
        success: true,
        sessions: result.sessions
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in getChatSessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Lấy chi tiết một chat session
export const getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const result = await aiService.getChatSession(userId, sessionId);

    if (result.success) {
      res.json({
        success: true,
        session: result.session
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in getChatSession:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Xóa chat session
export const deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const result = await aiService.deleteChatSession(userId, sessionId);

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in deleteChatSession:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Cập nhật tên chat session
export const updateChatSessionTitle = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    const userId = req.user.userId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const result = await aiService.updateChatSessionTitle(userId, sessionId, title);

    if (result.success) {
      res.json({
        success: true,
        session: result.session
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error in updateChatSessionTitle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Lấy gợi ý thông minh dựa trên dữ liệu người dùng
export const getSmartSuggestions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const suggestions = await aiService.getSmartSuggestions(userId);
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error in getSmartSuggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Kiểm tra trạng thái AI API
export const getAIStatus = async (req, res) => {
  try {
    const availableAPI = aiService.getAvailableAPI();
    
    res.json({
      success: true,
      hasAPI: !!availableAPI,
      provider: availableAPI?.provider || null
    });
  } catch (error) {
    console.error('Error in getAIStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};