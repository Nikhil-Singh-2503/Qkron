import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { LoadingScreen, ButtonLoader, LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { tasksApi, type Task } from '@/services/api';
import {
    AlertCircle,
    CheckCircle,
    CheckCircle2,
    Clock,
    Pause,
    Play,
    Plus,
    Terminal,
    Trash2,
    Zap,
    Activity,
    XCircle
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Animated background component with floating particles
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
            const particleCount = Math.min(30, Math.floor(window.innerWidth / 40));
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

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.08 * (1 - distance / 120)})`;
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

// Stats Card Component
function StatCard({
    title,
    value,
    icon: Icon,
    color,
    delay
}: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    delay: number;
}) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const duration = 1000;
            const steps = 30;
            const increment = value / steps;
            let current = 0;

            const interval = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setDisplayValue(value);
                    clearInterval(interval);
                } else {
                    setDisplayValue(Math.floor(current));
                }
            }, duration / steps);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return (
        <div
            className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6
                 hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-500
                 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 animate-fade-in-up"
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10
                      rounded-2xl transition-opacity duration-500`} />
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{displayValue}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center
                          group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}

// Task Card Component
function TaskCard({
    task,
    onExecute,
    onToggle,
    onDelete,
    executing,
    deleting
}: {
    task: Task;
    onExecute: (id: string) => void;
    onToggle: (task: Task) => void;
    onDelete: (id: string) => void;
    executing: boolean;
    deleting: boolean;
}) {
    const navigate = useNavigate();

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'running':
                return 'from-blue-500 to-cyan-500';
            case 'completed':
                return 'from-green-500 to-emerald-500';
            case 'failed':
                return 'from-red-500 to-orange-500';
            default:
                return 'from-slate-500 to-gray-500';
        }
    };

    const getStatusIcon = (status: Task['status']) => {
        switch (status) {
            case 'running':
                return <LoadingSpinner size="sm" variant="orbit" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'failed':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusText = (status: Task['status']) => {
        switch (status) {
            case 'running':
                return 'Running';
            case 'completed':
                return 'Completed';
            case 'failed':
                return 'Failed';
            default:
                return 'Idle';
        }
    };

    return (
        <div className="group relative animate-fade-in-up" style={{ animationDelay: `${Math.random() * 200}ms`, animationFillMode: 'both' }}>
            <Card className="relative bg-slate-800/50 backdrop-blur-sm border-slate-700/50 overflow-hidden
                     hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-500
                     hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
                {/* Gradient border on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-lg" />
                </div>

                <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="font-heading text-white text-lg group-hover:text-blue-400 transition-colors duration-300">
                            <Link to={`/tasks/${task.id}`} className="hover:underline">
                                {task.name}
                            </Link>
                        </CardTitle>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(task.status)} bg-opacity-20`}>
                            {getStatusIcon(task.status)}
                            <span className="text-xs font-medium text-white">{getStatusText(task.status)}</span>
                        </div>
                    </div>
                    <CardDescription className="text-slate-400">
                        {task.description || 'No description'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-slate-400">
                            <Clock className="h-4 w-4 mr-2 text-blue-400" />
                            <span className="font-mono">{task.schedule}</span>
                        </div>
                        {task.last_run && (
                            <div className="flex items-center text-sm text-slate-400">
                                <Activity className="h-4 w-4 mr-2 text-green-400" />
                                <span>Last run: {new Date(task.last_run).toLocaleString()}</span>
                            </div>
                        )}
                        {task.next_run && (
                            <div className="flex items-center text-sm text-slate-400">
                                <Zap className="h-4 w-4 mr-2 text-purple-400" />
                                <span>Next run: {new Date(task.next_run).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggle(task)}
                            className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
                        >
                            {task.is_active ? (
                                <>
                                    <Pause className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Pause</span>
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Resume</span>
                                </>
                            )}
                        </Button>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onExecute(task.id)}
                                disabled={executing}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-300"
                            >
                                {executing ? (
                                    <ButtonLoader size="sm" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/tasks/${task.id}`)}
                                className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
                            >
                                <Terminal className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(task.id)}
                                disabled={deleting}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
                            >
                                {deleting ? (
                                    <ButtonLoader size="sm" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Empty State Component
function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="relative animate-fade-in-up">
            <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 relative overflow-hidden">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-50" />

                    <div className="relative z-10 text-center">
                        <div className="relative inline-block mb-6">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20
                                      flex items-center justify-center animate-pulse">
                                <Terminal className="h-12 w-12 text-slate-400" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500/30 animate-bounce" style={{ animationDelay: '0.5s' }} />
                            <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-purple-500/30 animate-bounce" style={{ animationDelay: '1s' }} />
                        </div>

                        <h3 className="font-heading text-2xl font-bold text-white mb-3">No tasks yet</h3>
                        <p className="text-slate-400 mb-8 max-w-sm">
                            Create your first scheduled task to start automating your workflows
                        </p>

                        <Button
                            onClick={onCreate}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700
                                 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25
                                 group transition-all duration-300 hover:scale-105"
                        >
                            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                            Create Your First Task
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { confirm, ConfirmDialog } = useConfirm();
    const { showToast } = useToast();

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
            showToast('Task executed successfully', 'success');
            await loadTasks();
        } catch (error: any) {
            console.error('Failed to execute task:', error);
            const errorMessage = error?.response?.data?.detail || 'Failed to execute task';
            showToast(errorMessage, 'error');
        } finally {
            setExecutingTaskId(null);
        }
    };

    const handleToggleEnabled = async (task: Task) => {
        try {
            await tasksApi.updateTask(task.id, { is_active: !task.is_active });
            showToast(`Task ${task.is_active ? 'paused' : 'resumed'} successfully`, 'success');
            await loadTasks();
        } catch (error) {
            console.error('Failed to toggle task:', error);
            showToast('Failed to update task', 'error');
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
            showToast('Task deleted successfully', 'success');
            await loadTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
            showToast('Failed to delete task', 'error');
        } finally {
            setDeletingTaskId(null);
        }
    };

    const stats = {
        total: tasks.length,
        running: tasks.filter(t => t.status === 'running').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <AnimatedBackground />
                <LoadingScreen text="Loading your tasks..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
            <AnimatedBackground />

            {/* Animated gradient orbs */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

            <Layout>
                <ConfirmDialog />
                <div className="container mx-auto px-4 py-8 relative z-10">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div className="animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600
                                      flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-heading font-bold text-3xl text-white">
                                        {getGreeting()}, {user?.username || 'User'}!
                                    </h2>
                                </div>
                            </div>
                            <p className="text-slate-400 ml-13">
                                Manage your scheduled tasks and monitor their execution
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate('/tasks/new')}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700
                                 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25
                                 group transition-all duration-300 hover:scale-105 animate-fade-in-up"
                            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                        >
                            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                            New Task
                        </Button>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            title="Total Tasks"
                            value={stats.total}
                            icon={Terminal}
                            color="from-blue-500 to-cyan-500"
                            delay={200}
                        />
                        <StatCard
                            title="Running"
                            value={stats.running}
                            icon={Activity}
                            color="from-green-500 to-emerald-500"
                            delay={300}
                        />
                        <StatCard
                            title="Completed"
                            value={stats.completed}
                            icon={CheckCircle2}
                            color="from-purple-500 to-pink-500"
                            delay={400}
                        />
                        <StatCard
                            title="Failed"
                            value={stats.failed}
                            icon={XCircle}
                            color="from-red-500 to-orange-500"
                            delay={500}
                        />
                    </div>

                    {/* Tasks Grid */}
                    {tasks.length === 0 ? (
                        <EmptyState onCreate={() => navigate('/tasks/new')} />
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {tasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onExecute={handleExecute}
                                    onToggle={handleToggleEnabled}
                                    onDelete={handleDelete}
                                    executing={executingTaskId === task.id}
                                    deleting={deletingTaskId === task.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Layout>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
