import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';
import { tasksApi, type Task } from '@/services/api';
import { AlertCircle, CheckCircle, Clock, Loader2, Pause, Play, Plus, Terminal, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { confirm, ConfirmDialog } = useConfirm();

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await tasksApi.getTasks();
            setTasks(data.items);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async (taskId: string) => {
        setExecutingTaskId(taskId);
        try {
            await tasksApi.executeTask(taskId);
            await loadTasks();
        } catch (error) {
            console.error('Failed to execute task:', error);
        } finally {
            setExecutingTaskId(null);
        }
    };

    const handleToggleEnabled = async (task: Task) => {
        try {
            await tasksApi.updateTask(task.id, { is_active: !task.is_active });
            await loadTasks();
        } catch (error) {
            console.error('Failed to toggle task:', error);
        }
    };

    const handleDelete = async (taskId: string) => {
        const confirmed = await confirm({
            title: 'Delete Task',
            description: 'Are you sure you want to delete this task? This action cannot be undone.',
            confirmText: 'Delete',
            variant: 'destructive',
        });

        if (!confirmed) return;

        try {
            setDeletingTaskId(taskId);
            await tasksApi.deleteTask(taskId);
            await loadTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
        } finally {
            setDeletingTaskId(null);
        }
    };

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'running':
                return 'text-blue-500';
            case 'completed':
                return 'text-green-500';
            case 'failed':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const getStatusIcon = (status: Task['status']) => {
        switch (status) {
            case 'running':
                return <Loader2 className="h-4 w-4 animate-spin" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'failed':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <LoadingScreen text="Loading tasks..." />
        );
    }

    return (
        <Layout>
            <ConfirmDialog />
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                        <p className="text-slate-400 mt-1">Manage your scheduled tasks</p>
                    </div>
                    <Button onClick={() => navigate('/tasks/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                    </Button>
                </div>

                {tasks.length === 0 ? (
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Terminal className="h-12 w-12 text-slate-500 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
                            <p className="text-slate-400 mb-4">Create your first task to get started</p>
                            <Button onClick={() => navigate('/tasks/new')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Task
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {tasks.map((task) => (
                            <Card key={task.id} className="bg-slate-800 border-slate-700">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-white text-lg">
                                            <Link to={`/tasks/${task.id}`} className="hover:underline">
                                                {task.name}
                                            </Link>
                                        </CardTitle>
                                        <div className={`flex items-center ${getStatusColor(task.status)}`}>
                                            {getStatusIcon(task.status)}
                                        </div>
                                    </div>
                                    <CardDescription className="text-slate-400">
                                        {task.description || 'No description'}
                                        {task.owner_username && user && task.owner_id !== user.id && (
                                            <span className="block mt-1 text-xs text-blue-400">
                                                Owner: {task.owner_username}
                                            </span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-slate-400">
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span className="font-mono">{task.schedule}</span>
                                        </div>
                                        {task.last_run && (
                                            <div className="flex items-center text-sm text-slate-400">
                                                <span>Last run: {new Date(task.last_run).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {task.next_run && (
                                            <div className="flex items-center text-sm text-slate-400">
                                                <span>Next run: {new Date(task.next_run).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleEnabled(task)}
                                            className="text-slate-300"
                                        >
                                            {task.is_active ? (
                                                <>
                                                    <Pause className="h-4 w-4 mr-1" />
                                                    Disable
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-4 w-4 mr-1" />
                                                    Enable
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleExecute(task.id)}
                                            disabled={executingTaskId === task.id}
                                            className="text-slate-300"
                                        >
                                            {executingTaskId === task.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Play className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(task.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            {deletingTaskId === task.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
