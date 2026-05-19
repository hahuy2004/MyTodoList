import express from 'express';
import tasksRouter from './routes/tasksRouters.js';
import taskListRouter from './routes/taskListRouters.js';
import authRouter from './routes/authRouters.js';
import aiRouter from './routes/aiRouters.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables từ .env file trong thư mục backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Sử dụng cổng từ biến môi trường hoặc mặc định là 3000
const PORT = process.env.PORT || 3000;

// Tạo ứng dụng Express
// Đây là điểm khởi đầu của ứng dụng
const app = express();

// Middleware để phân tích JSON trong body của request
// Giúp chúng ta dễ dàng làm việc với dữ liệu JSON
app.use(express.json());

// Cấu hình CORS để cho phép các yêu cầu từ frontend
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL || true // Cho phép tất cả origins trong production nếu không set FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'], // Development
  credentials: true,
}));

app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/task-lists', taskListRouter);
app.use('/api/ai', aiRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });
}

// Kết nối đến cơ sở dữ liệu MongoDB và khởi động server
connectDB().then(async () => {
  // TaskList mặc định giờ được tạo cho từng user khi đăng ký
  // Không cần khởi tạo global TaskList mặc định nữa
  
  app.listen(PORT, () => {
    console.log(`Server đang chạy ở http://localhost:${PORT}`);
  });
});