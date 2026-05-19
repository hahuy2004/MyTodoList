// Component dành riêng cho việc thêm task trong trang StickyNotes
import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Calendar, X, CheckCircle2, Circle, ClipboardList, List, StickyNote as StickyNoteIcon } from "lucide-react";
import api from '../lib/axios';
import { toast } from "sonner";
import { formatDateTimeLocal, getListIconColor } from '../lib/utils';
import { cn } from "../lib/utils";
import type { Subtask, TaskList as TaskListType } from "@/types";

interface AddTaskStickyProps {
    handleNewTaskAdded: () => void;
    selectedListId?: string;
    lists: TaskListType[];
    buttonClassName?: string;
}

const AddTaskSticky = ({ handleNewTaskAdded, selectedListId, lists, buttonClassName }: AddTaskStickyProps) => {
    // States for quick add
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [deadline, setDeadline] = useState("");
    const [selectedList, setSelectedList] = useState(selectedListId || "unknown");
    
    // States for detailed add dialog
    const [isDetailedDialogOpen, setIsDetailedDialogOpen] = useState(false);
    const [detailedTitle, setDetailedTitle] = useState("");
    const [detailedDescription, setDetailedDescription] = useState("");
    const [detailedDeadline, setDetailedDeadline] = useState("");
    const [detailedSelectedList, setDetailedSelectedList] = useState(selectedListId || "unknown");
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

    // Add new subtask
    const addSubtask = () => {
        if (!newSubtaskTitle.trim()) {
            toast.error("Vui lòng nhập nội dung subtask.");
            return;
        }
        const newSubtask: Subtask = {
            _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: newSubtaskTitle,
            completed: false
        };
        setSubtasks([...subtasks, newSubtask]);
        setNewSubtaskTitle("");
    };

    // Remove subtask
    const removeSubtask = (subtaskId: string) => {
        setSubtasks(subtasks.filter(subtask => subtask._id !== subtaskId));
    };

    // Toggle subtask completion
    const toggleSubtask = (subtaskId: string) => {
        setSubtasks(subtasks.map(subtask =>
            subtask._id === subtaskId
                ? { ...subtask, completed: !subtask.completed }
                : subtask
        ));
    };

    // Update subtask title
    const updateSubtaskTitle = (subtaskId: string, newTitle: string) => {
        setSubtasks(subtasks.map(subtask =>
            subtask._id === subtaskId
                ? { ...subtask, title: newTitle }
                : subtask
        ));
    };

    // Reset detailed form
    const resetDetailedForm = () => {
        setDetailedTitle("");
        setDetailedDescription("");
        setDetailedDeadline("");
        setDetailedSelectedList(selectedListId || "unknown");
        setSubtasks([]);
        setNewSubtaskTitle("");
    };
    
    // Quick add task
    const addTask = async () => {
        if (newTaskTitle.trim() && deadline) {
            try {
                const taskData = { 
                    title: newTaskTitle,
                    deadline: new Date(deadline).toISOString(),
                    list: selectedList
                };
                
                await api.post("/tasks", taskData);
                toast.success(`Sticky Note "${newTaskTitle}" đã được tạo!`);
                handleNewTaskAdded();
                setNewTaskTitle("");
                setDeadline("");
            } catch (error) {
                console.error("Lỗi xảy ra khi tạo sticky note.", error);
                toast.error("Lỗi xảy ra khi tạo sticky note mới.");
            }
        } else {
            if (!newTaskTitle.trim()) {
                toast.error("Bạn cần nhập nội dung của sticky note.");
            }
            if (!deadline) {
                toast.error("Bạn cần chọn thời hạn hoàn thành.");
            }
        }
    };

    // Detailed add task
    const addDetailedTask = async () => {
        if (!detailedTitle.trim()) {
            toast.error("Bạn cần nhập nội dung của sticky note.");
            return;
        }
        
        if (!detailedDeadline) {
            toast.error("Bạn cần chọn thời hạn hoàn thành.");
            return;
        }

        try {
            // Clean subtasks - remove temporary IDs for new subtasks
            const cleanedSubtasks = subtasks.map(subtask => {
                if (subtask._id.startsWith('temp_')) {
                    // Remove _id for new subtasks, let MongoDB generate new ones
                    const { _id, ...subtaskWithoutId } = subtask;
                    return subtaskWithoutId;
                }
                return subtask;
            });

            const taskData = {
                title: detailedTitle,
                description: detailedDescription,
                deadline: new Date(detailedDeadline).toISOString(),
                list: detailedSelectedList,
                subtasks: cleanedSubtasks
            };
            
            await api.post("/tasks", taskData);
            toast.success(`Sticky Note "${detailedTitle}" đã được tạo!`);
            setIsDetailedDialogOpen(false);
            resetDetailedForm();
            handleNewTaskAdded();
        } catch (error) {
            console.error("Lỗi xảy ra khi tạo sticky note.", error);
            toast.error("Lỗi xảy ra khi tạo sticky note mới.");
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            addTask();
        }
    };

    return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl border-2 border-white shadow-lg">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <StickyNoteIcon className="w-6 h-6 text-yellow-600" />
                    <h3 className="text-lg font-bold text-gray-800">Tạo task mới</h3>
                </div>
                <p className="text-sm text-gray-600">Thêm nhiệm vụ mới vào bộ sưu tập sticky notes của bạn</p>
            </div>

            <div className="space-y-6">
                {/* Tên nhiệm vụ - Full width và nổi bật */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-yellow-600" />
                        <label className="text-base font-semibold text-gray-700">
                            Tên nhiệm vụ <span className="text-red-500">*</span>:
                        </label>
                    </div>
                    <Input
                        type="text"
                        placeholder="Cần phải làm gì?"
                        className="h-14 text-lg px-4 py-3 bg-white border-2 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200 rounded-lg shadow-sm"
                        value={newTaskTitle}
                        onChange={(event) => setNewTaskTitle(event.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                </div>

                {/* Layout responsive cho Thời hạn và Danh sách */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thời hạn */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-yellow-600" />
                            <label className="text-base font-semibold text-gray-700">
                                Thời hạn <span className="text-red-500">*</span>:
                            </label>
                        </div>
                        <Input
                            type="datetime-local"
                            value={deadline}
                            onChange={(event) => setDeadline(event.target.value)}
                            className="h-12 text-base bg-white border-2 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200 rounded-lg shadow-sm"
                            min={formatDateTimeLocal()}
                            required
                        />
                    </div>
                    
                    {/* Danh sách */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <List className="w-5 h-5 text-yellow-600" />
                            <label className="text-base font-semibold text-gray-700">
                                Danh sách:
                            </label>
                        </div>
                        <Select value={selectedList} onValueChange={setSelectedList}>
                            <SelectTrigger size="lg" className="text-base bg-white border-2 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200 rounded-lg shadow-sm">
                                <SelectValue placeholder="Chọn danh sách" />
                            </SelectTrigger>
                            <SelectContent>
                                {lists.map((list) => (
                                    <SelectItem key={list.id} value={list.id}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${getListIconColor(list.color)}`} />
                                            <span>{list.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Buttons - Full width và đẹp mắt */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        className={
                            buttonClassName
                                ? buttonClassName
                                : "flex-1 h-12 text-base font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        }
                        onClick={addTask}
                        disabled={!newTaskTitle.trim() || !deadline}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Tạo Sticky Note
                    </Button>

                    <Dialog open={isDetailedDialogOpen} onOpenChange={setIsDetailedDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex-1 h-12 text-base font-semibold border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <StickyNoteIcon className="w-5 h-5 mr-2" />
                                Tạo Chi Tiết
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <StickyNoteIcon className="w-5 h-5 text-yellow-600" />
                                    Tạo nhiệm vụ chi tiết
                                </DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4 bg-white rounded-xl border-2 border-white p-2">
                                {/* Task Title */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <ClipboardList className="size-4" />
                                        Tên nhiệm vụ <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="Nhập tên nhiệm vụ"
                                        value={detailedTitle}
                                        onChange={(e) => setDetailedTitle(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mô tả chi tiết</label>
                                    <Textarea
                                        placeholder="Nhập mô tả chi tiết cho sticky note..."
                                        value={detailedDescription}
                                        onChange={(e) => setDetailedDescription(e.target.value)}
                                        rows={4}
                                        className="w-full"
                                    />
                                </div>

                                {/* Deadline */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="size-4" />
                                        Thời hạn <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={detailedDeadline}
                                        onChange={(e) => setDetailedDeadline(e.target.value)}
                                        min={formatDateTimeLocal()}
                                        className="w-full"
                                    />
                                </div>

                                {/* List Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <List className="size-4" />
                                        Danh sách
                                    </label>
                                    <Select value={detailedSelectedList} onValueChange={setDetailedSelectedList}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn danh sách" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {lists.map((list) => (
                                                <SelectItem key={list.id} value={list.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${getListIconColor(list.color)}`} />
                                                        <span>{list.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Subtasks */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Subtasks</label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addSubtask}
                                            className="text-xs"
                                            disabled={!newSubtaskTitle.trim()}
                                        >
                                            <Plus className="size-3 mr-1" />
                                            Tạo Subtask
                                        </Button>
                                    </div>

                                    {/* Add new subtask input */}
                                    <Input
                                        placeholder="Nhập tên subtask và nhấn 'Tạo Subtask'"
                                        value={newSubtaskTitle}
                                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                                        className="w-full"
                                    />

                                    {/* Subtasks list */}
                                    {subtasks.length > 0 && (
                                        <div className={cn(
                                            "space-y-2 border rounded-lg p-3 bg-gray-50",
                                            subtasks.length > 4 && "max-h-60 overflow-y-auto"
                                        )}>
                                            {subtasks.map((subtask) => (
                                                <div key={subtask._id} className="flex items-center gap-2 group/subtask">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn(
                                                            "size-6 rounded-full",
                                                            subtask.completed 
                                                                ? "text-green-600 hover:text-green-700" 
                                                                : "text-gray-400 hover:text-blue-600"
                                                        )}
                                                        onClick={() => toggleSubtask(subtask._id)}
                                                    >
                                                        {subtask.completed ? (
                                                            <CheckCircle2 className="size-4" />
                                                        ) : (
                                                            <Circle className="size-4" />
                                                        )}
                                                    </Button>
                                                    <Input
                                                        value={subtask.title}
                                                        onChange={(e) => updateSubtaskTitle(subtask._id, e.target.value)}
                                                        className={cn(
                                                            "flex-1 border-none bg-transparent px-0 text-sm",
                                                            subtask.completed && "line-through text-gray-500"
                                                        )}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-6 text-gray-400 hover:text-red-600 opacity-0 group-hover/subtask:opacity-100 transition-opacity"
                                                        onClick={() => removeSubtask(subtask._id)}
                                                    >
                                                        <X className="size-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    onClick={addDetailedTask}
                                    disabled={!detailedTitle.trim() || !detailedDeadline}
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                                >
                                    <StickyNoteIcon className="w-4 h-4 mr-2" />
                                    Tạo Sticky Note
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default AddTaskSticky;