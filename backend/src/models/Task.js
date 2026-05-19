import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  }
}, { _id: true });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "complete"],
    default: 'active', // Không truyền gì vào thì mặc định là 'active'
  },
  list: {
    type: String,
    default: 'unknown', // Mặc định là 'unknown' nếu không được chỉ định
    trim: true,
  },
  deadline: {
    type: Date,
    required: false,
  },
  subtasks: [subtaskSchema],
  completedAt: {
      type: Date,
      default: null,
    },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
  },
  {
    timestamps: true, // createdAt và updatedAt tự động thêm vào
  }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;