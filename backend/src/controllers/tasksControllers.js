import Task from '../models/Task.js';

// Lấy thống kê tasks theo list cụ thể
export const getTaskStatsByList = async (req, res) => {
    try {
        const { listId } = req.params;
        const { sortBy = 'deadline' } = req.query; // Lấy sortBy từ query params
        const userId = req.user.userId; // Lấy userId từ token
        
        // Tạo sort object dựa trên sortBy parameter
        let sortObject = {};
        if (sortBy === 'createdAt') {
            sortObject = { createdAt: -1 }; // Mới nhất lên đầu
        } else if (sortBy === 'deadline') {
            sortObject = { deadline: 1, createdAt: -1 }; // Deadline sớm nhất lên đầu, sau đó theo createdAt
        } else {
            // Default sorting
            sortObject = { deadline: 1, createdAt: -1 };
        }
        
        // Aggregation để tính số lượng tasks theo trạng thái trong list cụ thể
        const result = await Task.aggregate([
            { $match: { list: listId, userId: userId } }, // Thêm filter theo userId
            {
                $facet: {
                    tasks: [{ $sort: sortObject }], // Sử dụng sort object động
                    totalCount: [{ $count: "count" }],
                    activeCount: [{ $match: { status: "active" } }, { $count: "count" }],
                    completeCount: [{ $match: { status: "complete" } }, { $count: "count" }],
                },
            },
        ]);

        const tasks = result[0].tasks;
        const totalCount = result[0].totalCount[0]?.count || 0;
        const activeCount = result[0].activeCount[0]?.count || 0;
        const completeCount = result[0].completeCount[0]?.count || 0;

        res.status(200).json({ 
            tasks, 
            totalCount,
            activeCount, 
            completeCount 
        });
    } catch (error) {
        console.error('Lỗi khi gọi getTaskStatsByList', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};

// Lấy tổng quan thống kê cho sidebar
export const getOverallStats = async (req, res) => {
    try {
        const userId = req.user.userId; // Lấy userId từ token
        
        // Lấy thống kê tổng quan
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const result = await Task.aggregate([
            { $match: { userId: userId } }, // Filter theo userId
            {
                $facet: {
                    // Tất cả tasks
                    allTasks: [{ $count: "count" }],
                    // Tasks có deadline (upcoming)
                    upcomingTasks: [
                        { $match: { deadline: { $exists: true, $ne: null } } },
                        { $count: "count" }
                    ],
                    // Tasks theo từng list
                    tasksByList: [
                        { $group: { _id: "$list", count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        const allTasksCount = result[0].allTasks[0]?.count || 0;
        const upcomingTasksCount = result[0].upcomingTasks[0]?.count || 0;
        const tasksByList = result[0].tasksByList || [];

        res.status(200).json({
            allTasksCount,
            upcomingTasksCount,
            tasksByList
        });
    } catch (error) {
        console.error('Lỗi khi gọi getOverallStats', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};

// Logic của Get
export const getAllTasks = async (req, res) => {
    const { filter = "today", sortBy = 'deadline' } = req.query;
    const userId = req.user.userId; // Lấy userId từ token
    const now = new Date();
    let query = { userId: userId }; // Base query với userId

    switch (filter) {
        case "today": {
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            query.deadline = { 
                $gte: startOfToday,
                $lte: endOfToday
            };
            break;
        }
        case "tomorrow": {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0, 0);
            const endOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59, 999);
            query.deadline = { 
                $gte: startOfTomorrow,
                $lte: endOfTomorrow
            };
            break;
        }
        case "week": {
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay(); // 0 = Chủ nhật, 1 = Thứ hai, ..., 6 = Thứ bảy
            
            // Tính số ngày cần lùi để về Thứ hai tuần này
            // Nếu hôm nay là Chủ nhật (0), thì cần lùi 6 ngày để về Thứ hai tuần này
            // Nếu hôm nay là Thứ hai (1), thì không cần lùi (0 ngày)
            // Nếu hôm nay là Thứ ba (2), thì cần lùi 1 ngày
            const daysToMonday = day === 0 ? 6 : day - 1;
            
            startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
            startOfWeek.setHours(0, 0, 0, 0);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Thêm 6 ngày để đến Chủ nhật
            endOfWeek.setHours(23, 59, 59, 999);
            
            query.deadline = { 
                $gte: startOfWeek,
                $lte: endOfWeek
            };
            break;
        }
        case "month": {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            query.deadline = { 
                $gte: startOfMonth,
                $lte: endOfMonth
            };
            break;
        }
        case "all":
        default: {
            // query đã có userId, không cần thêm gì
        }
    }

    try {
        // Tạo sort object dựa trên sortBy parameter
        let sortObject = {};
        if (sortBy === 'createdAt') {
            sortObject = { createdAt: -1 }; // Mới nhất lên đầu
        } else if (sortBy === 'deadline') {
            sortObject = { deadline: 1, createdAt: -1 }; // Deadline sớm nhất lên đầu, sau đó theo createdAt
        } else {
            // Default sorting
            sortObject = { deadline: 1, createdAt: -1 };
        }

        // Sử dụng aggregation để lấy thêm thống kê mà không cần gọi nhiều lần CSDL
        const result = await Task.aggregate([
            { $match: query },
            {
                $facet: {
                    tasks: [{ $sort: sortObject }], // Sử dụng sort object động
                    activeCount: [{ $match: { status: "active" } }, { $count: "count" }],
                    completeCount: [{ $match: { status: "complete" } }, { $count: "count" }],
                },
            },
        ]);

        const tasks = result[0].tasks;
        const activeCount = result[0].activeCount[0]?.count || 0;
        const completeCount = result[0].completeCount[0]?.count || 0;

        res.status(200).json({ tasks, activeCount, completeCount });
    } catch (error) {
        console.error('Lỗi khi gọi getAllTasks', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};

// Logic của Post
export const createTask = async (req, res) => {
    try {
        const { title, description, deadline, subtasks, list } = req.body;
        const userId = req.user.userId; // Lấy userId từ token
        
        const taskData = { 
            title,
            description: description || '',
            list: list || 'unknown', // Đảm bảo có list field
            userId: userId // Thêm userId
        };
        
        // Chỉ thêm deadline nếu có giá trị
        if (deadline) {
            taskData.deadline = new Date(deadline);
        }
        
        // Thêm subtasks nếu có
        if (subtasks && Array.isArray(subtasks)) {
            taskData.subtasks = subtasks;
        }
        
        const task = new Task(taskData);

        // Lưu task mới vào CSDL
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error("Lỗi khi gọi createTask", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Logic của Put
export const updateTask = async (req, res) => {
    try {
        const { title, description, status, completedAt, deadline, subtasks, list } = req.body;
        const userId = req.user.userId; // Lấy userId từ token
        
        const updateData = {};
        
        // Chỉ cập nhật các field được gửi lên
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (completedAt !== undefined) updateData.completedAt = completedAt;
        if (list !== undefined) updateData.list = list; // Thêm xử lý list field
        
        // Chỉ thêm deadline nếu có giá trị
        if (deadline !== undefined) {
            updateData.deadline = deadline ? new Date(deadline) : null;
        }
        
        // Thêm subtasks nếu có
        if (subtasks !== undefined) {
            updateData.subtasks = Array.isArray(subtasks) ? subtasks : [];
        }
        
        console.log('Update data:', updateData); // Debug log
        
        // Tìm và cập nhật task theo ID và userId để đảm bảo user chỉ có thể update task của mình
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: userId }, // Thêm userId vào query
            updateData,
            // Sau khi cập nhật thì trả về bản ghi mới
            { new: true }
        );

        if (!updatedTask) {
        return res.status(404).json({ message: "Task không tồn tại hoặc bạn không có quyền chỉnh sửa" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Lỗi khi gọi updateTask", error);
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

// Logic của Delete
export const deleteTask = async (req, res) => {
    try {
        const userId = req.user.userId; // Lấy userId từ token
        
        // Tìm và xóa task theo ID và userId để đảm bảo user chỉ có thể xóa task của mình
        const deleteTask = await Task.findOneAndDelete({ 
            _id: req.params.id, 
            userId: userId 
        });

        if (!deleteTask) {
        return res.status(404).json({ message: "Task không tồn tại hoặc bạn không có quyền xóa" });
        }

        res.status(200).json(deleteTask);
    } catch (error) {
        console.error("Lỗi khi gọi deleteTask", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};