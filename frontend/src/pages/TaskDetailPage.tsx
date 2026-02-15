import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { tasksApi, type Task, type TaskExecution } from '@/services/api';
import { Bell, CheckCircle, Clock, Edit, Link as LinkIcon, Loader2, Play, Terminal, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function TaskDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState<Task | null>(null);
    const [executions, setExecutions] = useState<TaskExecution[]>([]);
    const [dependencies, setDependencies] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const { confirm, ConfirmDialog } = useConfirm();

    useEffect(() => {
        loadTask();
    }, [id]);

    const loadTask = async () => {
        try {
            const [taskData, executionsData, depsData] = await Promise.all([
                tasksApi.getTask(id!),
                tasksApi.getTaskExecutions(id!),
                tasksApi.getTaskDependencies(id!),
            ]);
            setTask(taskData);
            setExecutions(executionsData.items);
            setDependencies(depsData.dependencies || []);
        } catch (error) {
            console.error('Failed to load task:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async () => {
        setExecuting(true);
        try {
            await tasksApi.executeTask(id!);
            await loadTask();
        } catch (error) {
            console.error('Failed to execute task:', error);
        } finally {
            setExecuting(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Delete Task',
            description: 'Are you sure you want to delete this task? This action cannot be undone.',
            confirmText: 'Delete',
            variant: 'destructive',
        });

        if (!confirmed) return;

        try {
            await tasksApi.deleteTask(id!);
            navigate('/');
        } catch (error) {
            console.error('Failed to delete task:', error);
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

    const getExecutionStatusIcon = (status: TaskExecution['status']) => {
        switch (status) {
            case 'running':
                return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <LoadingScreen text="Loading task details..." />
        );
    }

    if (!task) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                    <div className="text-white">Task not found</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <ConfirmDialog />
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">{task.name}</h2>
                        <p className="text-slate-400 mt-1">{task.description || 'No description'}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handleExecute} disabled={executing}>
                            {executing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4 mr-2" />
                            )}
                            Execute Now
                        </Button>
                        <Button variant="outline" onClick={() => navigate(`/tasks/${id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button variant="outline" onClick={() => navigate(`/notifications?task_id=${id}`)}>
                            <Bell className="h-4 w-4 mr-2" />
                            Notifications
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Task Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400">Status</label>
                                <div className={`flex items-center mt-1 ${getStatusColor(task.status)}`}>
                                    <span className="text-lg font-medium capitalize">{task.status}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400">Schedule</label>
                                <div className="flex items-center mt-1 text-white font-mono">
                                    <Clock className="h-4 w-4 mr-2 text-slate-400" />
                                    {task.schedule}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400">Command</label>
                                <div className="flex items-center mt-1 text-white font-mono bg-slate-900 p-3 rounded">
                                    <Terminal className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                                    <span className="break-all">{task.command}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400">Enabled</label>
                                    <div className="mt-1 text-white">
                                        {task.is_active ? 'Yes' : 'No'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Created</label>
                                    <div className="mt-1 text-white">
                                        {new Date(task.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            {task.last_run && (
                                <div>
                                    <label className="text-sm text-slate-400">Last Run</label>
                                    <div className="mt-1 text-white">
                                        {new Date(task.last_run).toLocaleString()}
                                    </div>
                                </div>
                            )}
                            {task.next_run && (
                                <div>
                                    <label className="text-sm text-slate-400">Next Run</label>
                                    <div className="mt-1 text-white">
                                        {new Date(task.next_run).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {dependencies.length > 0 && (
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <LinkIcon className="h-5 w-5 mr-2" />
                                    Dependencies
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Tasks that must complete before this task runs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {dependencies.map((depId) => (
                                        <Button
                                            key={depId}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/tasks/${depId}`)}
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                        >
                                            Task #{depId}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Execution History</CardTitle>
                            <CardDescription className="text-slate-400">
                                Recent executions of this task
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {executions.length === 0 ? (
                                <p className="text-slate-400 text-center py-8">No executions yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {executions.map((execution) => (
                                        <div
                                            key={execution.id}
                                            className="flex items-center justify-between p-3 bg-slate-900 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                {getExecutionStatusIcon(execution.status)}
                                                <div>
                                                    <div className="text-white capitalize">{execution.status}</div>
                                                    <div className="text-sm text-slate-400">
                                                        {new Date(execution.started_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
