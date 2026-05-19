import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const chatSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Tiêu đề chat không được quá 100 ký tự']
  },
  messages: [messageSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // Không cần index: true vì đã có compound index bên dưới
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // createdAt và updatedAt tự động
});

// Index compound để tối ưu query theo user và thời gian
chatSessionSchema.index({ userId: 1, lastMessageAt: -1 });
chatSessionSchema.index({ userId: 1, isActive: 1, lastMessageAt: -1 });

// Middleware để tự động cập nhật lastMessageAt khi thêm message
chatSessionSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp || new Date();
  }
  next();
});

// Method để thêm message mới
chatSessionSchema.methods.addMessage = function(type, content) {
  const newMessage = {
    type,
    content,
    timestamp: new Date()
  };
  
  this.messages.push(newMessage);
  this.lastMessageAt = newMessage.timestamp;
  
  return this.save();
};

// Method để lấy chat session an toàn (không bao gồm thông tin nhạy cảm)
chatSessionSchema.methods.toSafeObject = function() {
  const sessionObject = this.toObject();
  
  // Format messages để đảm bảo có đủ thông tin cần thiết
  const formattedMessages = sessionObject.messages.map(msg => ({
    _id: msg._id,
    type: msg.type,
    content: msg.content,
    timestamp: msg.timestamp
  }));
  
  return {
    _id: sessionObject._id,
    title: sessionObject.title,
    messages: formattedMessages,
    isActive: sessionObject.isActive,
    lastMessageAt: sessionObject.lastMessageAt,
    createdAt: sessionObject.createdAt,
    updatedAt: sessionObject.updatedAt,
    messageCount: formattedMessages.length
  };
};

// Static method để tạo title tự động từ message đầu tiên
chatSessionSchema.statics.generateTitle = function(firstMessage) {
  if (!firstMessage || firstMessage.length === 0) {
    return 'New Chat';
  }
  
  // Lấy 50 ký tự đầu của message đầu tiên
  const title = firstMessage.length > 50 
    ? firstMessage.substring(0, 47) + '...'
    : firstMessage;
    
  return title;
};

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;