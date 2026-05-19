import dotenv from 'dotenv';
import Task from '../models/Task.js';
import TaskList from '../models/TaskList.js';
import User from '../models/User.js';
import ChatSession from '../models/ChatSession.js';
import mongoose from 'mongoose';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables từ .env file trong thư mục backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

class AIService {
  constructor() {
    this.apiGemini = process.env.API_GEMINI;
    this.apiGPT = process.env.API_GPT;
  }

  // Kiểm tra API key nào có sẵn và ưu tiên GPT nếu cả hai đều có
  getAvailableAPI() {
    const hasGPT = this.apiGPT && this.apiGPT !== 'YOUR API HERE';
    const hasGemini = this.apiGemini && this.apiGemini !== 'YOUR API HERE';

    console.log(`API Keys check - GPT: ${hasGPT ? 'available' : 'not available'}, Gemini: ${hasGemini ? 'available' : 'not available'}`);

    if (hasGPT) {
      return { provider: 'gpt', key: this.apiGPT };
    } else if (hasGemini) {
      return { provider: 'gemini', key: this.apiGemini };
    } else {
      return null;
    }
  }

  // Lấy dữ liệu từ database để cung cấp context cho AI
  async getUserContext(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
      const taskLists = await TaskList.find({ userId });

      // Phân tích thống kê
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'complete').length;
      const activeTasks = tasks.filter(task => task.status === 'active').length;
      
      // Tìm các task có deadline sắp tới (trong vòng 7 ngày)
      const upcomingDeadlines = tasks.filter(task => {
        if (!task.deadline) return false;
        const daysUntilDeadline = Math.ceil((task.deadline - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline <= 7 && daysUntilDeadline > 0 && task.status === 'active';
      });

      // Tìm các task quá hạn
      const overdueTasks = tasks.filter(task => {
        if (!task.deadline) return false;
        return task.deadline < new Date() && task.status === 'active';
      });

      return {
        user: user.fullName,
        username: user.username,
        totalTasks,
        completedTasks,
        activeTasks,
        taskLists: taskLists.map(list => ({ id: list.id, name: list.name, color: list.color })),
        upcomingDeadlines: upcomingDeadlines.map(task => ({
          title: task.title,
          deadline: task.deadline,
          list: task.list
        })),
        overdueTasks: overdueTasks.map(task => ({
          title: task.title,
          deadline: task.deadline,
          list: task.list
        })),
        recentTasks: tasks.slice(0, 5).map(task => ({
          title: task.title,
          status: task.status,
          list: task.list,
          createdAt: task.createdAt
        }))
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      throw error;
    }
  }

  // Gọi API GPT
  async callGPTAPI(messages, context) {
    try {
      console.log('Calling GPT API with', messages.length, 'messages');
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant for a task management application. 
            
User context:
- Name: ${context.user}
- Total tasks: ${context.totalTasks}
- Completed tasks: ${context.completedTasks}
- Active tasks: ${context.activeTasks}
- Task lists: ${context.taskLists.map(list => list.name).join(', ')}
- Upcoming deadlines: ${context.upcomingDeadlines.length} tasks
- Overdue tasks: ${context.overdueTasks.length} tasks

Recent tasks:
${context.recentTasks.map(task => `- ${task.title} (${task.status}, in ${task.list})`).join('\n')}

Upcoming deadlines:
${context.upcomingDeadlines.map(task => `- ${task.title} (due: ${task.deadline.toLocaleDateString()})`).join('\n')}

Overdue tasks:
${context.overdueTasks.map(task => `- ${task.title} (overdue: ${task.deadline.toLocaleDateString()})`).join('\n')}

Please provide helpful insights about their tasks, productivity tips, or answer questions about their task management. Always be encouraging and specific to their actual data.`
          },
          ...messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        ],
        max_tokens: 500,
        temperature: 0.7
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiGPT}`
        }
      });

      console.log('GPT API response status:', response.status);
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const aiResponse = response.data.choices[0].message.content;
        console.log('GPT response received, length:', aiResponse.length);
        return aiResponse;
      } else {
        console.error('Unexpected GPT API response format:', response.data);
        throw new Error('Invalid response format from GPT API');
      }
    } catch (error) {
      console.error('Error calling GPT API:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid API key for GPT');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded for GPT API');
      } else {
        throw new Error(`GPT API error: ${error.message}`);
      }
    }
  }

  // Gọi API Gemini
  async callGeminiAPI(messages, context) {
    try {
      const prompt = `You are a helpful AI assistant for a task management application. 

User context:
- Name: ${context.user}
- Total tasks: ${context.totalTasks}
- Completed tasks: ${context.completedTasks}
- Active tasks: ${context.activeTasks}
- Task lists: ${context.taskLists.map(list => list.name).join(', ')}
- Upcoming deadlines: ${context.upcomingDeadlines.length} tasks
- Overdue tasks: ${context.overdueTasks.length} tasks

Recent tasks:
${context.recentTasks.map(task => `- ${task.title} (${task.status}, in ${task.list})`).join('\n')}

Upcoming deadlines:
${context.upcomingDeadlines.map(task => `- ${task.title} (due: ${task.deadline.toLocaleDateString()})`).join('\n')}

Overdue tasks:
${context.overdueTasks.map(task => `- ${task.title} (overdue: ${task.deadline.toLocaleDateString()})`).join('\n')}

Please provide helpful insights about their tasks, productivity tips, or answer questions about their task management. Always be encouraging and specific to their actual data.

User question: ${messages[messages.length - 1].content}`;

      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiGemini}`, {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error.response?.data || error.message);
      throw error;
    }
  }

  // Phương thức chính để xử lý chat với session
  async processChatWithSession(userId, sessionId, messageContent) {
    try {
      console.log(`Processing chat for user: ${userId}, session: ${sessionId}, message: ${messageContent}`);
      
      const availableAPI = this.getAvailableAPI();
      
      if (!availableAPI) {
        console.log('No API available');
        return {
          success: false,
          message: 'No AI API key configured. Please set up API_GPT or API_GEMINI in environment variables.'
        };
      }

      console.log(`Using API provider: ${availableAPI.provider}`);

      // Tìm hoặc tạo chat session
      let chatSession;
      if (sessionId && !sessionId.startsWith('temp-') && mongoose.Types.ObjectId.isValid(sessionId)) {
        try {
          chatSession = await ChatSession.findOne({ _id: sessionId, userId });
          if (!chatSession) {
            console.log(`Chat session not found: ${sessionId} for user: ${userId}`);
            return {
              success: false,
              message: 'Chat session not found'
            };
          }
          console.log(`Found existing session: ${chatSession._id} with ${chatSession.messages.length} messages`);
        } catch (error) {
          console.error('Error finding chat session:', error);
          return {
            success: false,
            message: 'Error accessing chat session'
          };
        }
      } else {
        // Tạo session mới (hoặc sessionId là temp hoặc invalid)
        const title = ChatSession.generateTitle(messageContent);
        chatSession = new ChatSession({
          title,
          userId,
          messages: []
        });
        console.log(`Created new session with title: ${title}`);
      }

      // Thêm message của user
      chatSession.messages.push({
        type: 'user',
        content: messageContent,
        timestamp: new Date()
      });

      // Chuẩn bị messages cho AI (chỉ lấy 10 messages gần nhất để tránh quá dài)
      const recentMessages = chatSession.messages.slice(-10).map(msg => ({
        type: msg.type,
        content: msg.content
      }));

      console.log(`Preparing ${recentMessages.length} messages for AI`);

      const context = await this.getUserContext(userId);
      let response;

      try {
        if (availableAPI.provider === 'gpt') {
          response = await this.callGPTAPI(recentMessages, context);
        } else {
          response = await this.callGeminiAPI(recentMessages, context);
        }
        console.log(`AI response received: ${response.substring(0, 100)}...`);
      } catch (apiError) {
        console.error('Error calling AI API:', apiError);
        return {
          success: false,
          message: 'Failed to get response from AI service. Please try again.'
        };
      }

      // Thêm response của AI
      chatSession.messages.push({
        type: 'assistant',
        content: response,
        timestamp: new Date()
      });

      // Update lastMessageAt
      chatSession.lastMessageAt = new Date();

      // Save session
      try {
        await chatSession.save();
        console.log(`Session saved successfully: ${chatSession._id}`);
      } catch (saveError) {
        console.error('Error saving chat session:', saveError);
        return {
          success: false,
          message: 'Failed to save chat session'
        };
      }

      return {
        success: true,
        response,
        provider: availableAPI.provider,
        sessionId: chatSession._id,
        session: chatSession.toSafeObject()
      };
    } catch (error) {
      console.error('Error processing chat with session:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error while processing your request. Please try again later.'
      };
    }
  }

  // Phương thức cũ để tương thích ngược
  async processChat(userId, messages) {
    // Chuyển đổi để sử dụng session-based chat
    const lastMessage = messages[messages.length - 1];
    return await this.processChatWithSession(userId, null, lastMessage.content);
  }

  // Lấy danh sách chat sessions của user
  async getChatSessions(userId) {
    try {
      // Không cần filter isActive nữa vì đã xóa thật sự khỏi database
      const sessions = await ChatSession.find({ 
        userId
      })
      .sort({ lastMessageAt: -1 })
      .limit(50) // Giới hạn 50 sessions gần nhất
      .select('title lastMessageAt createdAt messages');

      return {
        success: true,
        sessions: sessions.map(session => ({
          _id: session._id,
          title: session.title,
          lastMessageAt: session.lastMessageAt,
          createdAt: session.createdAt,
          messageCount: session.messages.length,
          lastMessage: session.messages.length > 0 
            ? session.messages[session.messages.length - 1].content.substring(0, 100) + '...'
            : ''
        }))
      };
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return {
        success: false,
        message: 'Error retrieving chat sessions'
      };
    }
  }

  // Lấy chi tiết một chat session
  async getChatSession(userId, sessionId) {
    try {
      const session = await ChatSession.findOne({ 
        _id: sessionId, 
        userId
        // Không cần filter isActive nữa vì đã xóa thật sự khỏi database
      });

      if (!session) {
        return {
          success: false,
          message: 'Chat session not found'
        };
      }

      return {
        success: true,
        session: session.toSafeObject()
      };
    } catch (error) {
      console.error('Error getting chat session:', error);
      return {
        success: false,
        message: 'Error retrieving chat session'
      };
    }
  }

  // Xóa chat session
  async deleteChatSession(userId, sessionId) {
    try {
      // Xóa thật sự khỏi database thay vì chỉ set isActive: false
      const session = await ChatSession.findOneAndDelete(
        { _id: sessionId, userId }
      );

      if (!session) {
        return {
          success: false,
          message: 'Chat session not found'
        };
      }

      console.log(`Chat session ${sessionId} deleted permanently from database`);
      
      return {
        success: true,
        message: 'Chat session deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting chat session:', error);
      return {
        success: false,
        message: 'Error deleting chat session'
      };
    }
  }

  // Cập nhật tên chat session
  async updateChatSessionTitle(userId, sessionId, newTitle) {
    try {
      const session = await ChatSession.findOneAndUpdate(
        { _id: sessionId, userId, isActive: true },
        { title: newTitle.trim() },
        { new: true }
      );

      if (!session) {
        return {
          success: false,
          message: 'Chat session not found'
        };
      }

      return {
        success: true,
        session: session.toSafeObject()
      };
    } catch (error) {
      console.error('Error updating chat session title:', error);
      return {
        success: false,
        message: 'Error updating chat session title'
      };
    }
  }

  // Lấy gợi ý dựa trên dữ liệu người dùng
  async getSmartSuggestions(userId) {
    try {
      const context = await this.getUserContext(userId);
      
      const suggestions = [];

      if (context.overdueTasks.length > 0) {
        suggestions.push(`You have ${context.overdueTasks.length} overdue task${context.overdueTasks.length > 1 ? 's' : ''}. Which one should I help you prioritize?`);
      }

      if (context.upcomingDeadlines.length > 0) {
        suggestions.push(`What's your plan for the ${context.upcomingDeadlines.length} task${context.upcomingDeadlines.length > 1 ? 's' : ''} due this week?`);
      }

      if (context.activeTasks > 0) {
        suggestions.push('How can I help you stay focused and productive today?');
      }

      if (suggestions.length === 0) {
        suggestions.push(
          'What new task would you like to add?',
          'Tell me about your productivity goals',
          'How can I help you organize better?'
        );
      }

      return suggestions.slice(0, 3); // Giới hạn 3 gợi ý
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      return [
        'How can I help you with your tasks today?',
        'What would you like to know about your productivity?',
        'Ask me anything about organizing your work!'
      ];
    }
  }
}

export default new AIService();