import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { LoadingScreen, ButtonLoader } from '@/components/ui/loading-spinner';
import { useToast } from '@/contexts/ToastContext';
import { tasksApi, type Task, type TaskDependency, type TaskExecution } from '@/services/api';
import {
    Bell,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    Link as LinkIcon,
    Terminal,
    Trash2,
    XCircle,
    Activity,
    Calendar,
    Zap,
    ArrowLeft,
    PlayCircle,
    AlertTriangle,
    CheckCircle2,
    Info,
    Loader2
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Animated background component
function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            opacity: number;
        }> = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles = [];
            const particleCount = Math.min(30, Math.floor(window.innerWidth / 50));
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.3 + 0.1,
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle, i) => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
                ctx.fill();

                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                particles.slice(i + 1).forEach((other) => {
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.05 * (1 - distance / 100)})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(drawParticles);
        };

        resize();
        createParticles();
        drawParticles();

        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
}

// Status Badge Component
function StatusBadge({ status }: { status: Task['status'] }) {
    const config = {
        running: {
            color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            icon: Loader2,
            animate: 'animate-spin'
        },
        completed: {
            color: 'bg-green-500/20 text-green-400 border-green-500/30',
            icon: CheckCircle,
            animate: ''
        },
        failed: {
            color: 'bg-red-500/20 text-red-400 border-red-500/30',
            icon: XCircle,
            animate: ''
        },
        pending: {
            color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            icon: Clock,
            animate: ''
        },
        cancelled: {
            color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
            icon: XCircle,
            animate: ''
        }
    };

    const c = config[status] || config.pending;
    const Icon = c.icon;

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${c.color} backdrop-blur-sm`}>
            <Icon className={`h-4 w-4 ${c.animate}`} />
            <span className="font-medium capitalize">{status}</span>
        </div>
    );
}

// Timeline Item Component
function TimelineItem({ execution, index }: { execution: TaskExecution; index: number }) {
    const getStatusConfig = (status: TaskExecution['status']) => {
        switch (status) {
            case 'running':
                return {
                    icon: Loader2,
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-500/20',
                    borderColor: 'border-blue-500/30',
                    animate: 'animate-spin'
                };
            case 'completed':
                return {
                    icon: CheckCircle,
                    color: 'text-green-400',
                    bgColor: 'bg-green-500/20',
                    borderColor: 'border-green-500/30',
                    animate: ''
                };
            case 'failed':
                return {
                    icon: XCircle,
                    color: 'text-red-400',
                    bgColor: 'bg-red-500/20',
                    borderColor: 'border-red-500/30',
                    animate: ''
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-yellow-400',
                    bgColor: 'bg-yellow-500/20',
                    borderColor: 'border-yellow-500/30',
                    animate: ''
                };
        }
    };

    const config = getStatusConfig(execution.status);
    const Icon = config.icon;

    return (
        <div 
            className="relative flex items-start gap-4 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Timeline line */}
            <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-700/50" />
            
            {/* Status icon */}
            <div className={`relative z-10 w-10 h-10 rounded-full ${config.bgColor} ${config.borderColor} border flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${config.color} ${config.animate}`} />
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/70 transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <div className={`font-semibold capitalize ${config.color}`}>
                            {execution.status}
                        </div>
                        <div className="text-sm text-slate-400">
                            {new Date(execution.start_time).toLocaleString()}
                        </div>
                    </div>
                    {execution.end_time && (
                        <div className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                            Duration: {Math.round((new Date(execution.end_time).getTime() - new Date(execution.start_time).getTime()) / 1000)}s
                        </div>
                    )}
                </div>
                {execution.error && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-medium">Error</span>
                        </div>
                        <div className="text-red-300 text-sm font-mono">{execution.error}</div>
                    </div>
                )}
                {execution.output && (
                    <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                        <div className="text-slate-500 text-xs font-medium mb-1">Output</div>
                        <div className="text-slate-300 text-sm font-mono line-clamp-3">{execution.output}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Dependency Card Component
function DependencyCard({ dep, onClick }: { dep: TaskDependency; onClick: () => void }) {
    const getStatusIcon = (status: TaskDependency['status']) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
            case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
            case 'running': return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
            default: return <Clock className="h-4 w-4 text-yellow-400" />;
        }
    };

    return (
        <button
            onClick={onClick}
            className="group w-full text-left p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl
                     hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-300
                     hover:shadow-lg hover:shadow-blue-500/10"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 
                              flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <LinkIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                        {dep.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        {getStatusIcon(dep.status)}
                        <span className="capitalize">{dep.status}</span>
                    </div>
                </div>
                {!dep.is_active && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                        Disabled
                    </span>
                )}
            </div>
        </button>
    );
}

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

    if (loading) {
        return (
            <LoadingScreen text="Loading task details..." />
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                    <div className="text-red-400 text-lg animate-fade-in">Error: {error}</div>
                </div>
            </Layout>
        );
    }

    if (!task) {
        return (
            <Layout>
                <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                    <div className="text-white animate-fade-in">Task not found</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <ConfirmDialog />
            <div className="min-h-screen bg-slate-950 relative">
                <AnimatedBackground />
                
                {/* Gradient orbs */}
                <div className="fixed top-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="fixed bottom-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 container mx-auto px-4 py-8">
                    {/* Back button */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors animate-fade-in"
                    >
                        <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700/50 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        <span>Back to Dashboard</span>
                    </button>

                    {/* Animated Header */}
                    <div className="mb-8 animate-fade-in-up">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="font-heading font-bold text-4xl text-white">{task.name}</h1>
                                    <StatusBadge status={task.status} />
                                </div>
                                <p className="text-slate-400 text-lg">{task.description || 'No description provided'}</p>
                                <div className="flex flex-wrap items-center gap-4 mt-4">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Calendar className="h-4 w-4 text-blue-400" />
                                        <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {task.last_run && (
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Activity className="h-4 w-4 text-green-400" />
                                            <span>Last run {new Date(task.last_run).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {task.next_run && (
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Zap className="h-4 w-4 text-purple-400" />
                                            <span>Next run {new Date(task.next_run).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Button 
                                    onClick={handleExecute} 
                                    disabled={executing}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                                             hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25
                                             transition-all duration-300 hover:scale-105"
                                >
                                    {executing ? (
                                        <ButtonLoader size="sm" text="Executing..." />
                                    ) : (
                                        <>
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                            Execute Now
                                        </>
                                    )}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => navigate(`/tasks/${id}/edit`)}
                                    className="border-slate-600 text-white hover:bg-slate-800 transition-all duration-300"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => navigate(`/notifications?task_id=${id}`)}
                                    className="border-slate-600 text-white hover:bg-slate-800 transition-all duration-300"
                                >
                                    <Bell className="h-4 w-4 mr-2" />
                                    Notifications
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={handleDelete}
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all duration-300"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Task Details Card */}
                        <Card className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border-slate-700/50 animate-fade-in-up" 
                              style={{ animationDelay: '100ms' }}>
                            <CardHeader>
                            <CardTitle className="font-heading text-white flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-400" />
                                Task Details
                            </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                            <label className="text-sm text-slate-400 flex items-center gap-2 mb-2">
                                                <Clock className="h-4 w-4" />
                                                Schedule
                                            </label>
                                            <div className="text-white font-mono text-lg">{task.schedule}</div>
                                            <div className="text-sm text-slate-500 mt-1 capitalize">{task.schedule_type} schedule</div>
                                        </div>
                                        
                                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                            <label className="text-sm text-slate-400 flex items-center gap-2 mb-2">
                                                <Terminal className="h-4 w-4" />
                                                Command
                                            </label>
                                            <div className="text-white font-mono text-sm bg-slate-950 p-3 rounded-lg overflow-x-auto">
                                                {task.command}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                                <label className="text-sm text-slate-400 block mb-1">Timeout</label>
                                                <div className="text-white font-medium">{task.timeout}s</div>
                                            </div>
                                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                                <label className="text-sm text-slate-400 block mb-1">Max Retries</label>
                                                <div className="text-white font-medium">{task.max_retries}</div>
                                            </div>
                                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                                <label className="text-sm text-slate-400 block mb-1">Priority</label>
                                                <div className="text-white font-medium">{task.priority}/10</div>
                                            </div>
                                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                                <label className="text-sm text-slate-400 block mb-1">Status</label>
                                                <div className={`font-medium ${task.is_active ? 'text-green-400' : 'text-red-400'}`}>
                                                    {task.is_active ? 'Active' : 'Disabled'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                            <label className="text-sm text-slate-400 block mb-1">Timezone</label>
                                            <div className="text-white font-medium">{task.timezone}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dependencies Card */}
                        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 animate-fade-in-up" 
                              style={{ animationDelay: '200ms' }}>
                            <CardHeader>
                            <CardTitle className="font-heading text-white flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-purple-400" />
                                Dependencies
                            </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Tasks that must complete before this task runs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {dependencies.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                                            <LinkIcon className="h-8 w-8 text-slate-500" />
                                        </div>
                                        <p className="text-slate-400">No dependencies</p>
                                        <p className="text-slate-500 text-sm mt-1">This task can run independently</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {dependencies.map((dep) => (
                                            <DependencyCard 
                                                key={dep.task_id} 
                                                dep={dep} 
                                                onClick={() => navigate(`/tasks/${dep.task_id}`)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Execution History Card */}
                        <Card className="lg:col-span-3 bg-slate-800/50 backdrop-blur-sm border-slate-700/50 animate-fade-in-up" 
                              style={{ animationDelay: '300ms' }}>
                            <CardHeader>
                            <CardTitle className="font-heading text-white flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-400" />
                                Execution History
                            </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Recent executions of this task
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {executions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center animate-pulse">
                                            <Clock className="h-10 w-10 text-slate-500" />
                                        </div>
                                        <p className="text-slate-400 text-lg">No executions yet</p>
                                        <p className="text-slate-500 mt-1">Run the task to see execution history</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-6">
                                            {executions.map((execution, index) => (
                                                <TimelineItem 
                                                    key={execution.id} 
                                                    execution={execution} 
                                                    index={index}
                                                />
                                            ))}
                                        </div>
                                        {executionsTotal > executionsPageSize && (
                                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setExecutionsPage(p => Math.max(1, p - 1))}
                                                    disabled={executionsPage === 1}
                                                    className="border-slate-600 text-white hover:bg-slate-800"
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
                                                    className="border-slate-600 text-white hover:bg-slate-800"
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
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
            `}</style>
        </Layout>
    );
}
