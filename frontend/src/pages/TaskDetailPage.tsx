import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { useToast } from '@/contexts/ToastContext';
import { tasksApi, type Task, type TaskDependency, type TaskExecution } from '@/services/api';
import { Bell, CheckCircle, ChevronLeft, ChevronRight, Clock, Edit, Link as LinkIcon, Loader2, Play, Terminal, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function TaskDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [task, setTask] = useState<Task | null>(null);
    const [executions, setExecutions] = useState<TaskExecution[]>([]);
    const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [executing, setExecuting] = useState(false);
    const [executionsPage, setExecutionsPage] = useState(1);
    const [executionsTotal, setExecutionsTotal] = useState(0);
    const executionsPageSize = 10;
    const { confirm, ConfirmDialog } = useConfirm();

    useEffect(() => {
        loadTask();
    }, [id, executionsPage]);

    const loadTask = async () => {
        try {
            const [taskData, executionsData, depsData] = await Promise.all([
                tasksApi.getTask(id!),
                tasksApi.getTaskExecutions(id!, { page: executionsPage, page_size: executionsPageSize }),
                tasksApi.getTaskDependencies(id!),
            ]);
            setTask(taskData);
            setExecutions(executionsData.items || []);
            setExecutionsTotal(executionsData.total || 0);
            setDependencies(depsData.dependencies || []);
            setError(null);
        } catch (err) {
            console.error('Failed to load task:', err);
            setError(err instanceof Error ? err.message : 'Failed to load task');
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async () => {
        setExecuting(true);
        try {
            await tasksApi.executeTask(id!);
            showToast('Task execution started', 'success');
            await loadTask();
        } catch (error) {
            console.error('Failed to execute task:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to execute task';
            showToast(errorMessage, 'error');
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
            navigate('/dashboard');
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

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                    <div className="text-red-400 text-lg">Error: {error}</div>
                </div>
            </Layout>
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
                                    {dependencies.map((dep) => (
                                        <Button
                                            key={dep.task_id}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/tasks/${dep.task_id}`)}
                                            className={`border-slate-600 hover:bg-slate-700 hover:text-white ${dep.is_active ? 'text-slate-300' : 'text-red-400'
                                                }`}
                                        >
                                            {dep.name} ({dep.status}) {!dep.is_active && '- Disabled'}
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
                                <>
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
                                                            {new Date(execution.start_time).toLocaleString()}
                                                        </div>
                                                        {execution.error && (
                                                            <div className="text-sm text-red-400 mt-1">
                                                                {execution.error}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {executionsTotal > executionsPageSize && (
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setExecutionsPage(p => Math.max(1, p - 1))}
                                                disabled={executionsPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <span className="text-sm text-slate-400">
                                                Page {executionsPage} of {Math.ceil(executionsTotal / executionsPageSize)}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setExecutionsPage(p => p + 1)}
                                                disabled={executionsPage >= Math.ceil(executionsTotal / executionsPageSize)}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
