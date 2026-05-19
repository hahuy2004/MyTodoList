import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { initializeDefaultTaskListsForUser } from './taskListControllers.js';

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d' // Token hết hạn sau 7 ngày
  });
};

// Đăng ký tài khoản mới
export const register = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!fullName || !username || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp'
      });
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Tên tài khoản đã tồn tại'
      });
    }

    // Tạo user mới
    const newUser = new User({
      fullName,
      username,
      password
    });

    await newUser.save();

    // Tạo TaskList mặc định cho user mới
    await initializeDefaultTaskListsForUser(newUser._id);

    // Tạo token
    const token = generateToken(newUser._id);

    // Trả về thông tin user (không bao gồm password) và token
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: newUser.toSafeObject(),
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    
    // Xử lý lỗi validation từ MongoDB
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errorMessages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên tài khoản và mật khẩu'
      });
    }

    // Tìm user theo username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên tài khoản hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Tên tài khoản hoặc mật khẩu không đúng'
      });
    }

    // Tạo token
    const token = generateToken(user._id);

    // Trả về thông tin user và token
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: user.toSafeObject(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// Lấy thông tin user hiện tại (từ token)
export const getCurrentUser = async (req, res) => {
  try {
    // req.user được set bởi auth middleware
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// Cập nhật thông tin user
export const updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user.userId;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Họ và tên là bắt buộc'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        user: updatedUser.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errorMessages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};