import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Họ và tên là bắt buộc'],
    trim: true,
    maxlength: [100, 'Họ và tên không được quá 100 ký tự']
  },
  username: {
    type: String,
    required: [true, 'Tên tài khoản là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [3, 'Tên tài khoản phải có ít nhất 3 ký tự'],
    maxlength: [50, 'Tên tài khoản không được quá 50 ký tự'],
    match: [/^[a-zA-Z0-9_]+$/, 'Tên tài khoản chỉ được chứa chữ cái, số và dấu gạch dưới']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
  },
  avatar: {
    type: String,
    default: null // Có thể thêm URL ảnh đại diện sau này
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để hash password trước khi lưu
userSchema.pre('save', async function(next) {
  // Chỉ hash password nếu nó được thay đổi (hoặc là mới)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password với salt rounds = 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware để cập nhật updatedAt khi document được cập nhật
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method để tạo object user an toàn (không bao gồm password)
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Note: Index cho username đã được tạo tự động bởi unique: true
// Không cần thêm userSchema.index({ username: 1 }) để tránh duplicate

const User = mongoose.model('User', userSchema);

export default User;