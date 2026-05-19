import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import AddTask from "./AddTask";
import TaskList from "./TaskList";
import TaskListPagination from "./TaskListPagination";
import DateTimeFilter from "./DateTimeFilter";
import SortFilter from "./SortFilter";
// import { getListIconColor } from "@/lib/utils";
import type { Task, FilterType, SortType, TaskList as TaskListType } from "@/types";
import Footer from "./Footer";

interface MainContentProps {
  activeTaskCount: number;
  completeTaskCount: number;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  dateQuery: string;
  setDateQuery: (value: string) => void;
  sortBy: SortType;
  setSortBy: (value: SortType) => void;
  page: number;
  totalPages: number;
  visibleTasks: Task[];
  handleTaskChanged: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  handlePageChange: (page: number) => void;
  selectedListId?: string;
  lists: TaskListType[];
}

const MainContent = ({
  activeTaskCount,
  completeTaskCount,
  filter,
  setFilter,
  dateQuery,
  setDateQuery,
  sortBy,
  setSortBy,
  page,
  totalPages,
  visibleTasks,
  handleTaskChanged,
  handleNext,
  handlePrev,
  handlePageChange,
  selectedListId,
  lists
}: MainContentProps) => {
  const [showAddTask, setShowAddTask] = useState(false);

  const getCurrentList = () => {
    if (selectedListId) {
      return lists.find(list => list.id === selectedListId);
    }
    return null;
  };

  const currentList = getCurrentList();

  const taskFilters = [
    { label: "Tất cả", value: "all" as FilterType, count: activeTaskCount + completeTaskCount },
    { label: "Đang làm", value: "active" as FilterType, count: activeTaskCount },
    { label: "Hoàn thành", value: "completed" as FilterType, count: completeTaskCount }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header Section */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        {/* Greeting Header */}
        {/* <div className="mb-4">
          {currentList ? (
            <>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getListIconColor(currentList.color)}`} />
                {currentList.name}
              </h1>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-gray-900">
                What do you plan to do today?
              </h1>
              <p className="text-sm text-gray-500">{getCurrentDate()}</p>
            </>
          )}
        </div> */}

        {/* Today's Tasks Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentList ? `${currentList.name} Tasks` : "To-do Lists"}
            </h1>
            <p className="text-sm text-gray-500">
              {currentList 
                ? `Quản lý công việc trong danh sách ${currentList.name}`
                : "Hãy tập trung và hoàn thành những gì quan trọng nhất ngày hôm nay"
              }
            </p>
          </div>
          <Button 
            onClick={() => setShowAddTask(!showAddTask)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>

        {/* Task Stats and Filters */}
        <div className="flex items-center justify-between">
          {/* Task Filters */}
          <div className="flex items-center gap-2">
            {taskFilters.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === item.value
                    ? item.value === "all" 
                      ? "bg-purple-100 text-purple-700 border border-purple-200" 
                      : item.value === "active"
                      ? "bg-gray-100 text-gray-700 border border-gray-200"
                      : "bg-green-100 text-green-700 border border-green-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span>{item.label}</span>
                <Badge 
                  variant="secondary" 
                  className={`${
                    filter === item.value
                      ? item.value === "all"
                        ? "bg-purple-200 text-purple-800"
                        : item.value === "active"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-green-200 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* Date Filter và Sort Filter */}
          <div className="flex items-center gap-2">
            <DateTimeFilter dateQuery={dateQuery} setDateQuery={setDateQuery} />
            <SortFilter sortBy={sortBy} setSortBy={setSortBy} />
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
          <Card>
            <CardContent className="p-4">
              <AddTask 
                handleNewTaskAdded={() => {
                  handleTaskChanged();
                  setShowAddTask(false);
                }}
                selectedListId={selectedListId}
                lists={lists}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-2">
        {/* Task List */}
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
          <TaskList 
            filteredTasks={visibleTasks}
            filter={filter}
            handleTaskChanged={handleTaskChanged}
            selectedListId={selectedListId}
            currentListName={currentList?.name}
            lists={lists}
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        {/* Pagination - Always show */}
        <div className="flex justify-center mb-1">
          <TaskListPagination 
            handleNext={handleNext}
            handlePrev={handlePrev}
            handlePageChange={handlePageChange}
            page={page}
            totalPages={Math.max(totalPages, 1)} // Ensure at least 1 page
          />
        </div>

        {/* Today's Summary */}
        <Footer
          activeTasksCount={activeTaskCount}
          completedTasksCount={completeTaskCount}
        />
      </div>
    </div>
  );
};

export default MainContent;
