import TaskList from '../models/TaskList.js';
import Task from '../models/Task.js';

// Lấy tất cả các lists
export const getAllTaskLists = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy userId từ token
    const taskLists = await TaskList.find({ userId: userId }).sort({ createdAt: 1 }); // Filter theo userId
    
    // Đếm số lượng task trong mỗi list
    const listsWithCount = await Promise.all(
      taskLists.map(async (list) => {
        const count = await Task.countDocuments({ list: list.id, userId: userId }); // Thêm userId vào count
        return {
          id: list.id,
          name: list.name,
          color: list.color,
          isDefault: list.isDefault,
          count: count,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      lists: listsWithCount
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách TaskList:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách TaskList"
    });
  }
};

// Tạo TaskList mới
export const createTaskList = async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.user.userId; // Lấy userId từ token

    // Kiểm tra dữ liệu đầu vào
    if (!name || !color) {
      return res.status(400).json({
        success: false,
        message: "Tên và màu của list là bắt buộc"
      });
    }

    // Tạo ID duy nhất cho list
    const listId = `custom-${Date.now()}`;

    // Tạo TaskList mới
    const newTaskList = new TaskList({
      id: listId,
      name: name.trim(),
      color: color.trim(),
      isDefault: false,
      userId: userId // Thêm userId
    });

    await newTaskList.save();

    // Đếm số lượng task (mới tạo nên count = 0)
    const listWithCount = {
      id: newTaskList.id,
      name: newTaskList.name,
      color: newTaskList.color,
      isDefault: newTaskList.isDefault,
      count: 0,
      createdAt: newTaskList.createdAt,
      updatedAt: newTaskList.updatedAt
    };

    res.status(201).json({
      success: true,
      message: "Tạo TaskList thành công",
      list: listWithCount
    });
  } catch (error) {
    console.error("Lỗi khi tạo TaskList:", error);
    
    // Xử lý lỗi trùng lặp
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "ID của TaskList đã tồn tại"
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo TaskList"
    });
  }
};

// Cập nhật TaskList
export const updateTaskList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, color } = req.body;
    const userId = req.user.userId; // Lấy userId từ token

    // Kiểm tra dữ liệu đầu vào
    if (!name || !color) {
      return res.status(400).json({
        success: false,
        message: "Tên và màu của list là bắt buộc"
      });
    }

    // Tìm và cập nhật TaskList - chỉ của user hiện tại
    const updatedTaskList = await TaskList.findOneAndUpdate(
      { id: listId, userId: userId }, // Thêm userId vào query
      { 
        name: name.trim(),
        color: color.trim()
      },
      { new: true, runValidators: true }
    );

    if (!updatedTaskList) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy TaskList hoặc bạn không có quyền chỉnh sửa"
      });
    }

    // Đếm số lượng task trong list
    const count = await Task.countDocuments({ list: listId, userId: userId });

    const listWithCount = {
      id: updatedTaskList.id,
      name: updatedTaskList.name,
      color: updatedTaskList.color,
      isDefault: updatedTaskList.isDefault,
      count: count,
      createdAt: updatedTaskList.createdAt,
      updatedAt: updatedTaskList.updatedAt
    };

    res.status(200).json({
      success: true,
      message: "Cập nhật TaskList thành công",
      list: listWithCount
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật TaskList:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật TaskList"
    });
  }
};

// Xóa TaskList
export const deleteTaskList = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.userId; // Lấy userId từ token

    // Kiểm tra xem list có phải là default không và thuộc về user hiện tại
    const taskList = await TaskList.findOne({ id: listId, userId: userId });
    
    if (!taskList) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy TaskList hoặc bạn không có quyền xóa"
      });
    }

    if (taskList.isDefault) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa list mặc định"
      });
    }

    // Chuyển tất cả task trong list này về "unknown" - chỉ của user hiện tại
    await Task.updateMany(
      { list: listId, userId: userId },
      { list: "unknown" }
    );

    // Xóa TaskList
    await TaskList.deleteOne({ id: listId, userId: userId });

    res.status(200).json({
      success: true,
      message: "Xóa TaskList thành công"
    });
  } catch (error) {
    console.error("Lỗi khi xóa TaskList:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa TaskList"
    });
  }
};

// Khởi tạo các TaskList mặc định cho user mới
export const initializeDefaultTaskListsForUser = async (userId) => {
  try {
    // Kiểm tra xem đã có TaskList mặc định cho user này chưa
    const existingDefaultLists = await TaskList.find({ userId: userId, isDefault: true });
    
    if (existingDefaultLists.length === 0) {
      // Tạo các TaskList mặc định cho user
      const defaultLists = [
        { id: "unknown", name: "Unknown", color: "bg-gray-400", isDefault: true, userId: userId },
        { id: "personal", name: "Personal", color: "bg-orange-400", isDefault: true, userId: userId },
        { id: "work", name: "Work", color: "bg-blue-500", isDefault: true, userId: userId },
        { id: "study", name: "Study", color: "bg-green-500", isDefault: true, userId: userId },
      ];

      await TaskList.insertMany(defaultLists);
      console.log(`Đã khởi tạo các TaskList mặc định cho user ${userId}`);
    }
  } catch (error) {
    console.error("Lỗi khi khởi tạo TaskList mặc định cho user:", error);
    throw error;
  }
};

// Khởi tạo các TaskList mặc định (legacy function - không dùng nữa)
export const initializeDefaultTaskLists = async () => {
  try {
    console.log("Legacy initializeDefaultTaskLists function called - this function is deprecated");
    // Function này không còn được sử dụng vì giờ mỗi user sẽ có TaskList riêng
  } catch (error) {
    console.error("Lỗi khi khởi tạo TaskList mặc định:", error);
  }
};
