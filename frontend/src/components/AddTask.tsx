// Dùng để thêm task mới cho ứng dụng ToDoList
import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Calendar, X, CheckCircle2, Circle, ClipboardList, List } from "lucide-react";
import api from '../lib/axios';
import { toast } from "sonner";
import { formatDateTimeLocal, getListIconColor } from '../lib/utils';
import { cn } from "../lib/utils";
import type { Subtask, TaskList as TaskListType } from "@/types";

interface AddTaskProps {
    handleNewTaskAdded: () => void;
    selectedListId?: string;
    lists: TaskListType[];
}

const AddTask = ({ handleNewTaskAdded, selectedListId, lists }: AddTaskProps) => {
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
            _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique temporary ID
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
                    deadline: new Date(deadline).toISOString(), // datetime-local đã tự động theo múi giờ local
                    list: selectedList
                };
                
                await api.post("/tasks", taskData);
                toast.success(`Nhiệm vụ "${newTaskTitle}" đã được thêm vào.`);
                handleNewTaskAdded();
                setNewTaskTitle("");
                setDeadline("");
            } catch (error) {
                console.error("Lỗi xảy ra khi thêm task.", error);
                toast.error("Lỗi xảy ra khi thêm nhiệm vụ mới.");
            }
        } else {
            if (!newTaskTitle.trim()) {
                toast.error("Bạn cần nhập nội dung của nhiệm vụ.");
            }
            if (!deadline) {
                toast.error("Bạn cần chọn thời hạn hoàn thành.");
            }
        }
    };

    // Detailed add task
    const addDetailedTask = async () => {
        if (!detailedTitle.trim()) {
            toast.error("Bạn cần nhập nội dung của nhiệm vụ.");
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
                deadline: new Date(detailedDeadline).toISOString(), // datetime-local đã tự động theo múi giờ local
                list: detailedSelectedList,
                subtasks: cleanedSubtasks
            };
            
            console.log('Sending create data:', taskData); // Debug log
            
            await api.post("/tasks", taskData);
            toast.success(`Nhiệm vụ "${detailedTitle}" đã được thêm vào.`);
            setIsDetailedDialogOpen(false);
            resetDetailedForm();
            handleNewTaskAdded();
        } catch (error) {
            console.error("Lỗi xảy ra khi thêm task.", error);
            toast.error("Lỗi xảy ra khi thêm nhiệm vụ mới.");
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            addTask();
        }
    };

    return (
        <>
            <Card className="p-6 border-2 bg-gradient-card shadow-custom-lg">
                <div className="flex flex-col gap-4">
                    {/* Hàng 1: Tên nhiệm vụ (label + input) */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-gray-600" />
                            <label className="text-sm font-medium text-gray-700">
                                Tên nhiệm vụ <span className="text-red-500">*</span>:
                            </label>
                        </div>
                        <Input
                            type="text"
                            placeholder="Cần phải làm gì?"
                            className="h-12 text-base bg-slate-50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                            value={newTaskTitle}
                            onChange={(event) => setNewTaskTitle(event.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                    </div>

                    {/* Hàng 2: Grid layout cho Danh sách + Thời hạn + Buttons */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Thời hạn (label + input) - 5 cột - Bên phải cùng */}
                        <div className="lg:col-span-5 space-y-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-600" />
                                <label className="text-sm font-medium text-gray-700">
                                    Thời hạn <span className="text-red-500">*</span>:
                                </label>
                            </div>
                            <Input
                                type="datetime-local"
                                value={deadline}
                                onChange={(event) => setDeadline(event.target.value)}
                                className="h-12 text-sm bg-slate-50 border-border/50 focus:border-primary/50 focus:ring-primary/20 w-full"
                                min={formatDateTimeLocal()}
                                required
                            />
                        </div>
                        
                        {/* Danh sách (label + select) - 3 cột */}
                        <div className="lg:col-span-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <List className="w-5 h-5 text-gray-600" />
                                <label className="text-sm font-medium text-gray-700">
                                    Danh sách:
                                </label>
                            </div>
                            <Select value={selectedList} onValueChange={setSelectedList}>
                                <SelectTrigger size="lg" className="text-sm bg-slate-50 border-border/50 focus:border-primary/50 focus:ring-primary/20">
                                    <SelectValue placeholder="Chọn danh sách" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lists.map((list) => (
                                        <SelectItem key={list.id} value={list.id}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getListIconColor(list.color)}`} />
                                                <span>{list.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Buttons (Thêm nhanh + Thêm chi tiết) - 4 cột */}
                        <div className="lg:col-span-4 space-y-0.5">
                            <div className="h-[28px]"></div> {/* Spacer để align với các input khác */}
                            <div className="flex gap-2">
                                <Button
                                    variant="gradient"
                                    className="h-12 flex-1 px-4"
                                    onClick={addTask}
                                    disabled={!newTaskTitle.trim() || !deadline}
                                >
                                    <Plus className="size-5" />
                                    Thêm nhanh
                                </Button>

                                <Dialog open={isDetailedDialogOpen} onOpenChange={setIsDetailedDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-12 flex-1 px-4"
                                        >
                                            Thêm chi tiết
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Tạo nhiệm vụ chi tiết</DialogTitle>
                                        </DialogHeader>
                                        
                                        <div className="space-y-4">
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
                                                <label className="text-sm font-medium">Mô tả</label>
                                                <Textarea
                                                    placeholder="Nhập mô tả chi tiết cho nhiệm vụ"
                                                    value={detailedDescription}
                                                    onChange={(e) => setDetailedDescription(e.target.value)}
                                                    rows={3}
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
                                                        Tạo Subtask mới
                                                    </Button>
                                                </div>

                                                {/* Add new subtask input */}
                                                <Input
                                                    placeholder="Nhập tên subtask và nhấn 'Tạo Subtask mới'"
                                                    value={newSubtaskTitle}
                                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                                                    className="w-full"
                                                />

                                                {/* Subtasks list */}
                                                {subtasks.length > 0 && (
                                                    <div className={cn(
                                                        "space-y-2 border rounded-lg p-3",
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
                                            >
                                                Tạo nhiệm vụ
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
};

export default AddTask;