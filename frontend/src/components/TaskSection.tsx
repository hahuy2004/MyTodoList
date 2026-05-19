import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddTask from "./AddTask";
import TaskCard from "./TaskCard";
import type { Task, TaskList as TaskListType } from "@/types";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  handleTaskChanged: () => void;
  badgeCount?: number;
  lists: TaskListType[];
  selectedListId?: string;
}

const TaskSection = ({ 
  title, 
  tasks, 
  handleTaskChanged, 
  badgeCount,
  lists,
  selectedListId
}: TaskSectionProps) => {
  const [showAddTask, setShowAddTask] = useState(false);

  const handleNewTaskAdded = () => {
    handleTaskChanged();
    setShowAddTask(false);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {badgeCount !== undefined && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {badgeCount}
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowAddTask(!showAddTask)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Plus className="w-4 h-4" />
          Add New Task
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-4">
            <AddTask 
              handleNewTaskAdded={handleNewTaskAdded}
              selectedListId={selectedListId}
              lists={lists}
            />
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks for {title.toLowerCase()}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <TaskCard 
                      task={task}
                      index={0}
                      handleTaskChanged={handleTaskChanged}
                      lists={lists}
                    />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskSection;
