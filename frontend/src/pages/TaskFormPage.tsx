import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingScreen, ButtonLoader, LoadingCard } from '@/components/ui/loading-spinner';
import { tasksApi, type ScheduleType, type Task } from '@/services/api';
import {
    Clock,
    Terminal,
    X,
    ArrowLeft,
    Save,
    CheckCircle2,
    AlertCircle,
    FileText,
    Globe,
    Timer,
    Flag,
    Link as LinkIcon,
    ChevronRight,
    ChevronLeft,
    Plus,
    RefreshCw
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
            const particleCount = Math.min(25, Math.floor(window.innerWidth / 60));
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

// Step Indicator Component
function StepIndicator({ currentStep, totalSteps, labels }: { currentStep: number; totalSteps: number; labels: string[] }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                {labels.map((label, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all duration-300 ${
                            index < currentStep 
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                                : index === currentStep 
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                            {index < currentStep ? (
                                <CheckCircle2 className="h-5 w-5" />
                            ) : (
                                index + 1
                            )}
                        </div>
                        <span className={`text-xs ${index <= currentStep ? 'text-white' : 'text-slate-500'}`}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
            </div>
        </div>
    );
}

// Form Input with Icon Component
function FormInput({ 
    icon: Icon, 
    label, 
    required, 
    children,
    hint
}: { 
    icon: React.ElementType; 
    label: string; 
    required?: boolean;
    children: React.ReactNode;
    hint?: string;
}) {
    return (
        <div className="space-y-2 group">
            <Label className="text-slate-300 flex items-center gap-2">
                <Icon className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                {label}
                {required && <span className="text-red-400">*</span>}
            </Label>
            {children}
            {hint && <p className="text-xs text-slate-500">{hint}</p>}
        </div>
    );
}

// Dependency Tag Component
function DependencyTag({ task, onRemove }: { task: Task; onRemove: () => void }) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                       border border-blue-500/30 rounded-lg text-white text-sm backdrop-blur-sm
                       hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <LinkIcon className="h-3 w-3 text-blue-400" />
            </div>
            <span className="truncate max-w-[150px]">{task.name}</span>
            <button
                type="button"
                onClick={onRemove}
                className="w-5 h-5 rounded-full hover:bg-red-500/20 flex items-center justify-center
                         hover:text-red-400 transition-colors"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}

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
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        loadAvailableTasks();
        if (id) {
            loadTask();
        }
    }, [id]);

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

    const loadAvailableTasks = async () => {
        try {
            const response = await tasksApi.getTasks({ page_size: 100 });
            const tasks = response.items.filter(t => t.id !== id);
            setAvailableTasks(tasks);
        } catch (err) {
            console.error('Failed to load tasks:', err);
        } finally {
            setTasksLoading(false);
        }
    };

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

    const getTaskById = (taskId: string) => {
        return availableTasks.find(t => t.id === taskId);
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
                return 'Cron expression: minute hour day month weekday';
            case 'interval':
                return '<number><unit>: s, m, h, or d (e.g. 30s, 2h, 1d)';
            case 'once':
                return 'ISO format: YYYY-MM-DDTHH:mm:ss';
        }
    };

    const canProceedToNextStep = () => {
        switch (currentStep) {
            case 0:
                return name.trim() && command.trim();
            case 1:
                return schedule.trim();
            default:
                return true;
        }
    };

    const steps = ['Basic Info', 'Schedule', 'Advanced'];

    if (loading) {
        return <LoadingScreen text={isEditing ? "Loading task..." : "Loading..."} />;
    }

    return (
        <Layout>
            <div className="min-h-screen bg-slate-950 relative">
                <AnimatedBackground />
                
                {/* Gradient orbs */}
                <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
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

                    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 animate-fade-in-up">
                        <CardHeader className="pb-2">
                        <CardTitle className="font-heading text-2xl text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                                          flex items-center justify-center">
                                {isEditing ? <Save className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                            </div>
                            {isEditing ? 'Edit Task' : 'Create New Task'}
                        </CardTitle>
                            <CardDescription className="text-slate-400 text-base">
                                {isEditing 
                                    ? 'Update the task details below' 
                                    : 'Configure your automated task in three simple steps'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <StepIndicator 
                                currentStep={currentStep} 
                                totalSteps={steps.length} 
                                labels={steps}
                            />

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl 
                                                   flex items-center gap-3 animate-fade-in">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Step 1: Basic Info */}
                                {currentStep === 0 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <FormInput icon={FileText} label="Task Name" required>
                                            <Input
                                                type="text"
                                                placeholder="My Scheduled Task"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="bg-slate-900/50 border-slate-700 text-white h-12
                                                         focus:border-blue-500/50 focus:ring-blue-500/20
                                                         placeholder:text-slate-600 transition-all duration-300"
                                            />
                                        </FormInput>

                                        <FormInput icon={FileText} label="Description">
                                            <Input
                                                type="text"
                                                placeholder="What does this task do? (optional)"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="bg-slate-900/50 border-slate-700 text-white h-12
                                                         focus:border-blue-500/50 focus:ring-blue-500/20
                                                         placeholder:text-slate-600 transition-all duration-300"
                                            />
                                        </FormInput>

                                        <FormInput 
                                            icon={Terminal} 
                                            label="Command" 
                                            required
                                            hint="The command to execute. Can include shell scripts or application commands."
                                        >
                                            <textarea
                                                value={command}
                                                onChange={(e) => setCommand(e.target.value)}
                                                placeholder="echo 'Hello World'"
                                                required
                                                rows={3}
                                                className="w-full bg-slate-900/50 border border-slate-700 text-white font-mono
                                                         focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
                                                         placeholder:text-slate-600 rounded-lg p-3
                                                         transition-all duration-300 resize-none"
                                            />
                                        </FormInput>
                                    </div>
                                )}

                                {/* Step 2: Schedule */}
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <FormInput icon={Clock} label="Schedule Type" required>
                                            <div className="grid grid-cols-3 gap-3">
                                                {(['cron', 'interval', 'once'] as ScheduleType[]).map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setScheduleType(type)}
                                                        className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                                                            scheduleType === type
                                                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                                                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                                        }`}
                                                    >
                                                        <div className="font-medium capitalize mb-1">
                                                            {type === 'cron' ? 'Cron' : type}
                                                        </div>
                                                        <div className="text-xs opacity-70">
                                                            {type === 'cron' && 'Recurring schedule'}
                                                            {type === 'interval' && 'Fixed intervals'}
                                                            {type === 'once' && 'One-time execution'}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </FormInput>

                                        <FormInput 
                                            icon={Timer} 
                                            label="Schedule Value" 
                                            required
                                            hint={getScheduleHint()}
                                        >
                                            <Input
                                                type="text"
                                                placeholder={getSchedulePlaceholder()}
                                                value={schedule}
                                                onChange={(e) => setSchedule(e.target.value)}
                                                required
                                                className="bg-slate-900/50 border-slate-700 text-white font-mono h-12
                                                         focus:border-blue-500/50 focus:ring-blue-500/20
                                                         placeholder:text-slate-600 transition-all duration-300"
                                            />
                                        </FormInput>

                                        <FormInput icon={Globe} label="Timezone">
                                            <Input
                                                type="text"
                                                placeholder="UTC"
                                                value={timezone}
                                                onChange={(e) => setTimezone(e.target.value)}
                                                className="bg-slate-900/50 border-slate-700 text-white h-12
                                                         focus:border-blue-500/50 focus:ring-blue-500/20
                                                         placeholder:text-slate-600 transition-all duration-300"
                                            />
                                        </FormInput>
                                    </div>
                                )}

                                {/* Step 3: Advanced */}
                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-3 gap-4">
                                            <FormInput icon={Timer} label="Timeout (sec)">
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={86400}
                                                    value={timeout}
                                                    onChange={(e) => setTimeout(parseInt(e.target.value) || 300)}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-12
                                                             focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300"
                                                />
                                            </FormInput>
                                            <FormInput icon={RefreshCw} label="Max Retries">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={10}
                                                    value={maxRetries}
                                                    onChange={(e) => setMaxRetries(parseInt(e.target.value) || 0)}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-12
                                                             focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300"
                                                />
                                            </FormInput>
                                            <FormInput icon={Flag} label="Priority (1-10)">
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={10}
                                                    value={priority}
                                                    onChange={(e) => setPriority(parseInt(e.target.value) || 5)}
                                                    className="bg-slate-900/50 border-slate-700 text-white h-12
                                                             focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300"
                                                />
                                            </FormInput>
                                        </div>

                                        {/* Dependencies */}
                                        <FormInput icon={LinkIcon} label="Task Dependencies">
                                            <div className="space-y-3">
                                                {tasksLoading ? (
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <LoadingCard text="Loading available tasks..." />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <select
                                                            value=""
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    handleAddDependency(e.target.value);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                            className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg px-4 py-3
                                                                     focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300
                                                                     cursor-pointer hover:border-slate-600"
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
                                                            <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
                                                                {dependencies.map((depId) => {
                                                                    const task = getTaskById(depId);
                                                                    return task ? (
                                                                        <DependencyTag 
                                                                            key={depId} 
                                                                            task={task} 
                                                                            onRemove={() => handleRemoveDependency(depId)}
                                                                        />
                                                                    ) : null;
                                                                })}
                                                            </div>
                                                        )}
                                                        {dependencies.length === 0 && (
                                                            <p className="text-sm text-slate-500">No dependencies added yet</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </FormInput>

                                        {/* Active Toggle */}
                                        <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                            <input
                                                id="isActive"
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={(e) => setIsActive(e.target.checked)}
                                                className="w-5 h-5 rounded border-slate-600 bg-slate-800 
                                                         checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500
                                                         focus:ring-blue-500/20 cursor-pointer"
                                            />
                                            <Label htmlFor="isActive" className="text-slate-300 cursor-pointer">
                                                Enable task immediately
                                            </Label>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between pt-6 border-t border-slate-700/50">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                        disabled={currentStep === 0}
                                        className="border-slate-600 text-white hover:bg-slate-800
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Previous
                                    </Button>

                                    {currentStep < steps.length - 1 ? (
                                        <Button
                                            type="button"
                                            onClick={() => setCurrentStep(currentStep + 1)}
                                            disabled={!canProceedToNextStep()}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                                                     hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                                                     hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25
                                                     disabled:opacity-70"
                                        >
                                                {saving ? (
                                                    <ButtonLoader size="sm" text="Saving..." />
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        {isEditing ? 'Update Task' : 'Create Task'}
                                                    </>
                                                )}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Layout>
    );
}
