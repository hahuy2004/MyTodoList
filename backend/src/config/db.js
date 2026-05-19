import mongoose from "mongoose";

// Hàm này chịu trách nhiệm kết nối đến CSDL MongoDB
// Sử dụng biến môi trường để lấy chuỗi kết nối
export const connectDB = async () => {
  try {
    await mongoose.connect(
        process.env.MONGODB_CONNECTIONSTRING
    );

    console.log("Liên kết CSDL thành công!");
  } catch (error) {
    console.error("Lỗi khi kết nối CSDL:", error);
    process.exit(1); // exit with error
  }
};