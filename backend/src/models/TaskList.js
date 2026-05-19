import mongoose from 'mongoose';

const taskListSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false, // Để phân biệt list mặc định và list tùy chỉnh
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true, // createdAt và updatedAt tự động thêm vào
});

// Tạo compound index để đảm bảo id duy nhất trong từng user
taskListSchema.index({ id: 1, userId: 1 }, { unique: true });

const TaskList = mongoose.model("TaskList", taskListSchema);
export default TaskList;
