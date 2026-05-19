import TaskEmptyState from './TaskEmptyState';
import TaskCard from './TaskCard';
import type { TaskListProps } from '@/types'

const TaskList = ({ filteredTasks, filter, handleTaskChanged, selectedListId, currentListName, lists }: TaskListProps) => {
    if (!filteredTasks || filteredTasks.length === 0) {
        return <TaskEmptyState 
          filter={filter} 
          selectedListId={selectedListId}
          currentListName={currentListName}
        />
    }
    return (
        <div className="h-full overflow-y-auto p-4">
            <div className="space-y-3">
                {filteredTasks.map((task, index)  => (
                    <TaskCard
                        key={task._id ?? index}
                        task={task}
                        index={index}
                        handleTaskChanged={handleTaskChanged}
                        lists={lists}
                    />
                ))}
            </div>
        </div>
    )
}

export default TaskList