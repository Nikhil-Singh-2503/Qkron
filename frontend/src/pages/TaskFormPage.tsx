import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { tasksApi, type ScheduleType, type Task } from '@/services/api';
import { Clock, Loader2, Terminal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function TaskFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [command, setCommand] = useState('');
    const [scheduleType, setScheduleType] = useState<ScheduleType>('cron');
    const [schedule, setSchedule] = useState('*/5 * * * *');
    const [timezone, setTimezone] = useState('UTC');
    const [timeout, setTimeout] = useState(300);
    const [maxRetries, setMaxRetries] = useState(3);
    const [priority, setPriority] = useState(5);
    const [dependencies, setDependencies] = useState<string[]>([]);
    const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(isEditing);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAvailableTasks();
        if (id) {
            loadTask();
        }
    }, [id]);

    const loadAvailableTasks = async () => {
        try {
            const response = await tasksApi.getTasks({ page_size: 100 });
            // Filter out the current task when editing
            const tasks = response.items.filter(t => t.id !== id);
            setAvailableTasks(tasks);
        } catch (err) {
            console.error('Failed to load tasks:', err);
        } finally {
            setTasksLoading(false);
        }
    };

    // Reset schedule value when schedule type changes
    useEffect(() => {
        if (!isEditing) {
            switch (scheduleType) {
                case 'cron':
                    setSchedule('*/5 * * * *');
                    break;
                case 'interval':
                    setSchedule('5m');
                    break;
                case 'once':
                    setSchedule(new Date(Date.now() + 3600000).toISOString().slice(0, 19));
                    break;
            }
        }
    }, [scheduleType, isEditing]);

    const loadTask = async () => {
        try {
            const task = await tasksApi.getTask(id!);
            setName(task.name);
            setDescription(task.description || '');
            setCommand(task.command);
            setScheduleType(task.schedule_type);
            setSchedule(task.schedule);
            setTimezone(task.timezone);
            setTimeout(task.timeout);
            setMaxRetries(task.max_retries);
            setPriority(task.priority);
            setDependencies(task.dependencies || []);
            setIsActive(task.is_active);
        } catch (err) {
            setError('Failed to load task');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDependency = (taskId: string) => {
        if (taskId && !dependencies.includes(taskId)) {
            setDependencies([...dependencies, taskId]);
        }
    };

    const handleRemoveDependency = (dep: string) => {
        setDependencies(dependencies.filter(d => d !== dep));
    };

    const getTaskName = (taskId: string) => {
        const task = availableTasks.find(t => t.id === taskId);
        return task ? task.name : taskId;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const taskData = {
                name,
                description,
                command,
                schedule_type: scheduleType,
                schedule,
                timezone,
                timeout,
                max_retries: maxRetries,
                priority,
                dependencies: dependencies.length > 0 ? dependencies : null,
                is_active: isActive,
            };

            if (isEditing) {
                await tasksApi.updateTask(id!, taskData);
            } else {
                await tasksApi.createTask(taskData);
            }

            navigate('/dashboard');
        } catch (err) {
            setError('Failed to save task');
        } finally {
            setSaving(false);
        }
    };

    const getSchedulePlaceholder = () => {
        switch (scheduleType) {
            case 'cron':
                return '*/5 * * * *';
            case 'interval':
                return '5m';
            case 'once':
                return '2024-12-31T23:59:00';
        }
    };

    const getScheduleHint = () => {
        switch (scheduleType) {
            case 'cron':
                return 'Cron expression: minute hour day month weekday (e.g., */5 * * * * runs every 5 minutes)';
            case 'interval':
                return 'Enter interval as <number><unit> where unit is s, m, h, or d (e.g. 30s, 2h, 1d)';
            case 'once':
                return 'Date/time in ISO format (e.g., 2024-12-31T23:59:00)';
        }
    };

    if (loading) {
        return (
            <LoadingScreen text="Loading task..." />
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">
                            {isEditing ? 'Edit Task' : 'Create New Task'}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {isEditing ? 'Update the task details below' : 'Fill in the details to create a new scheduled task'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Task Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-300">Task Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="My Task"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-slate-300">Description</Label>
                                <Input
                                    id="description"
                                    type="text"
                                    placeholder="What does this task do?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            </div>

                            {/* Command */}
                            <div className="space-y-2">
                                <Label htmlFor="command" className="text-slate-300">
                                    <Terminal className="h-4 w-4 inline mr-2" />
                                    Command
                                </Label>
                                <Input
                                    id="command"
                                    type="text"
                                    placeholder="echo 'Hello World'"
                                    value={command}
                                    onChange={(e) => setCommand(e.target.value)}
                                    required
                                    className="bg-slate-700 border-slate-600 text-white font-mono"
                                />
                                <p className="text-sm text-slate-500">
                                    The command to execute. Can include shell scripts or application commands.
                                </p>
                            </div>

                            {/* Schedule Type */}
                            <div className="space-y-2">
                                <Label htmlFor="scheduleType" className="text-slate-300">Schedule Type</Label>
                                <select
                                    id="scheduleType"
                                    value={scheduleType}
                                    onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                                >
                                    <option value="cron">Cron (Recurring)</option>
                                    <option value="interval">Interval (Fixed interval)</option>
                                    <option value="once">Once (One-time)</option>
                                </select>
                            </div>

                            {/* Schedule */}
                            <div className="space-y-2">
                                <Label htmlFor="schedule" className="text-slate-300">
                                    <Clock className="h-4 w-4 inline mr-2" />
                                    Schedule
                                </Label>
                                <Input
                                    id="schedule"
                                    type="text"
                                    placeholder={getSchedulePlaceholder()}
                                    value={schedule}
                                    onChange={(e) => setSchedule(e.target.value)}
                                    required
                                    className="bg-slate-700 border-slate-600 text-white font-mono"
                                />
                                <p className="text-sm text-slate-500">
                                    {getScheduleHint()}
                                </p>
                            </div>

                            {/* Timezone */}
                            <div className="space-y-2">
                                <Label htmlFor="timezone" className="text-slate-300">Timezone</Label>
                                <Input
                                    id="timezone"
                                    type="text"
                                    placeholder="UTC"
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            </div>

                            {/* Timeout, Max Retries, Priority */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="timeout" className="text-slate-300">Timeout (sec)</Label>
                                    <Input
                                        id="timeout"
                                        type="number"
                                        min={1}
                                        max={86400}
                                        value={timeout}
                                        onChange={(e) => setTimeout(parseInt(e.target.value) || 300)}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxRetries" className="text-slate-300">Max Retries</Label>
                                    <Input
                                        id="maxRetries"
                                        type="number"
                                        min={0}
                                        max={10}
                                        value={maxRetries}
                                        onChange={(e) => setMaxRetries(parseInt(e.target.value) || 0)}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority" className="text-slate-300">Priority</Label>
                                    <Input
                                        id="priority"
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={priority}
                                        onChange={(e) => setPriority(parseInt(e.target.value) || 5)}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </div>

                            {/* Dependencies */}
                            <div className="space-y-2">
                                <Label htmlFor="dependency" className="text-slate-300">Dependencies</Label>
                                <p className="text-sm text-slate-500 mb-2">
                                    Select tasks that must complete before this task runs
                                </p>
                                {tasksLoading ? (
                                    <p className="text-sm text-slate-500">Loading tasks...</p>
                                ) : (
                                    <>
                                        <select
                                            id="dependency"
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleAddDependency(e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                                        >
                                            <option value="">Select a task to add as dependency...</option>
                                            {availableTasks
                                                .filter(t => !dependencies.includes(t.id))
                                                .map((task) => (
                                                    <option key={task.id} value={task.id}>
                                                        {task.name}
                                                    </option>
                                                ))}
                                        </select>
                                        {dependencies.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {dependencies.map((dep) => (
                                                    <span
                                                        key={dep}
                                                        className="inline-flex items-center gap-1 bg-slate-700 text-white px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {getTaskName(dep)}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveDependency(dep)}
                                                            className="hover:text-red-400"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center space-x-2">
                                <input
                                    id="isActive"
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                                />
                                <Label htmlFor="isActive" className="text-slate-300">
                                    Enable task immediately
                                </Label>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : isEditing ? 'Update Task' : 'Create Task'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
