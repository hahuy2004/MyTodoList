
const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen text-center bg-slate-50">
    <img
        src="404_NotFound.png"
        alt="not found"
        className="mb-6 w-96 max-w-full"
    />
    <p className="text-xl font-semibold">🚫 Bạn không thể truy cập phần này 🚫</p>
    <a
        href="/"
        className="inline-block px-6 py-3 mt-6 font-medium text-white transition shadow-md bg-primary rounded-2xl hover:bg-primary-dark"
    >
        Quay về trang chủ
    </a>
    </div>

  );
};

export default NotFound;