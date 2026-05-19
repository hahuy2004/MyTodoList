import api from './axios';

export interface ChatMessage {
  _id?: string;
  id?: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatSession {
  _id: string;
  title: string;
  messages: ChatMessage[];
  lastMessageAt: Date;
  createdAt: Date;
  messageCount: number;
  lastMessage?: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  provider?: string;
  sessionId?: string;
  session?: ChatSession;
  message?: string;
}

export interface SessionsResponse {
  success: boolean;
  sessions?: ChatSession[];
  message?: string;
}

export interface SessionResponse {
  success: boolean;
  session?: ChatSession;
  message?: string;
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions?: string[];
  message?: string;
}

export interface AIStatusResponse {
  success: boolean;
  hasAPI?: boolean;
  provider?: string;
  message?: string;
}

// Chat với AI Assistant (session-based)
export const chatWithAI = async (message: string, sessionId?: string): Promise<ChatResponse> => {
  try {
    const response = await api.post('/ai/chat', { message, sessionId });
    return response.data;
  } catch (error: any) {
    console.error('Error chatting with AI:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to chat with AI'
    };
  }
};

// Lấy danh sách chat sessions
export const getChatSessions = async (): Promise<SessionsResponse> => {
  try {
    const response = await api.get('/ai/sessions');
    return response.data;
  } catch (error: any) {
    console.error('Error getting chat sessions:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get chat sessions'
    };
  }
};

// Lấy chi tiết một chat session
export const getChatSession = async (sessionId: string): Promise<SessionResponse> => {
  try {
    const response = await api.get(`/ai/sessions/${sessionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting chat session:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get chat session'
    };
  }
};

// Xóa chat session
export const deleteChatSession = async (sessionId: string): Promise<ChatResponse> => {
  try {
    const response = await api.delete(`/ai/sessions/${sessionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting chat session:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete chat session'
    };
  }
};

// Cập nhật tên chat session
export const updateChatSessionTitle = async (sessionId: string, title: string): Promise<SessionResponse> => {
  try {
    const response = await api.put(`/ai/sessions/${sessionId}/title`, { title });
    return response.data;
  } catch (error: any) {
    console.error('Error updating chat session title:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update chat session title'
    };
  }
};

// Lấy gợi ý thông minh
export const getSmartSuggestions = async (): Promise<SuggestionsResponse> => {
  try {
    const response = await api.get('/ai/suggestions');
    return response.data;
  } catch (error: any) {
    console.error('Error getting smart suggestions:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get suggestions'
    };
  }
};

// Kiểm tra trạng thái AI API
export const getAIStatus = async (): Promise<AIStatusResponse> => {
  try {
    const response = await api.get('/ai/status');
    return response.data;
  } catch (error: any) {
    console.error('Error getting AI status:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get AI status'
    };
  }
};