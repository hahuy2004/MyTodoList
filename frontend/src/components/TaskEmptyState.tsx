import { Card } from './ui/card'
import { Circle } from 'lucide-react'
import type { TaskEmptyStateProps } from '@/types'

const TaskEmptyState = ({ filter, selectedListId, currentListName }: TaskEmptyStateProps) => {
  const getEmptyMessage = () => {
    if (selectedListId) {
      return {
        title: "Không có task nào trong list này",
        description: `Danh sách "${currentListName}" hiện chưa có task nào. Thêm task mới để bắt đầu!`
      };
    }

    if (filter === "active") {
      return {
        title: "Không có nhiệm vụ nào đang làm.",
        description: `Chuyển sang "tất cả" để thấy những nhiệm vụ đã hoàn thành.`
      };
    }

    if (filter === "completed") {
      return {
        title: "Chưa có nhiệm vụ nào hoàn thành.",
        description: `Chuyển sang "tất cả" để thấy những nhiệm vụ đang làm.`
      };
    }

    return {
      title: "Chưa có nhiệm vụ.",
      description: "Thêm nhiệm vụ đầu tiên vào để bắt đầu!"
    };
  };

  const { title, description } = getEmptyMessage();

  return (
    <Card className="p-8 text-center border-0 bg-gradient-card shadow-custom-md">
      <div className="space-y-3">
        <Circle className="mx-auto size-12 text-muted-foreground" />
        <div>
          <h3 className="font-medium text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default TaskEmptyState