// Định nghĩa types cho ứng dụng ToDo

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'active' | 'complete';
  createdAt: string;
  completedAt?: string;
  deadline?: string;
  subtasks?: Subtask[];
  list?: string; // List/category that the task belongs to
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
  count: number;
}

export type FilterType = 'all' | 'active' | 'completed';

export type SortType = 'deadline' | 'createdAt';

export interface TaskListProps {
  filteredTasks: Task[];
  filter: FilterType;
  handleTaskChanged: () => void;
  selectedListId?: string;
  currentListName?: string;
  lists: TaskList[];
}

export interface TaskEmptyStateProps {
  filter: FilterType;
  selectedListId?: string;
  currentListName?: string;
}

export interface TaskCardProps {
  task: Task;
  index: number;
  handleTaskChanged: () => void;
  lists: TaskList[];
}

export interface StatsAndFiltersProps {
  completedTasksCount: number;
  activeTasksCount: number;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

export interface FooterProps {
  activeTasksCount: number;
  completedTasksCount: number;
}

export interface TaskListPaginationProps {
  handleNext: () => void;
  handlePrev: () => void;
  handlePageChange: (page: number) => void;
  page: number;
  totalPages: number;
}

export interface DateTimeFilterProps {
  dateQuery: string;
  setDateQuery: (value: string) => void;
}

export interface SortFilterProps {
  sortBy: SortType;
  setSortBy: (value: SortType) => void;
}

export interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  upcomingTaskCount?: number;
  lists: TaskList[];
  onAddList: (name: string) => void;
  selectedListId?: string;
}