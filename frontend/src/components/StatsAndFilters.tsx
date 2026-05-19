// Dùng để hiển thị thống kê và bộ lọc cho ứng dụng ToDoList
import { Badge } from "./ui/badge";
import { FilterType } from "@/lib/data";
import { Filter } from "lucide-react";
import { Button } from "./ui/button";
import type { StatsAndFiltersProps } from "@/types";

const StatsAndFilters = ({
  completedTasksCount = 0,
  activeTasksCount = 0,
  filter = "all",
  // Hàm để cập nhật trạng thái lựa chọn bộ lọc
  setFilter,
}: StatsAndFiltersProps) => {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      {/* Phần thống kê */}
      <div className="flex gap-3">
        <Badge
          variant="secondary"
          className="bg-white/50 text-accent-foreground border-info/20"
        >
          {/* Đưa ra số lượng task đang làm + chữ "Đang làm" */}
          {activeTasksCount} {FilterType.active}
        </Badge>
        <Badge
          variant="secondary"
          className="bg-white/50 text-success border-success/20"
        >
          {/* Đưa ra số lượng task hoàn thành + chữ "Hoàn thành" */}
          {completedTasksCount} {FilterType.completed}
        </Badge>
      </div>

      {/* Phần filter */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {Object.keys(FilterType).map((type) => (
          <Button
            key={type}
            variant={filter === type ? "gradient" : "ghost"}
            size="sm"
            className="capitalize"
            // Khi click vào nút thì gọi hàm setFilter để cập nhật bộ lọc
            onClick={() => setFilter(type as keyof typeof FilterType)}
          >
            <Filter className="size-4" />
            {FilterType[type as keyof typeof FilterType]}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StatsAndFilters;