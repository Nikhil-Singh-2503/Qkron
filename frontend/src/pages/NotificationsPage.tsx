import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingCard, ButtonLoader } from '@/components/ui/loading-spinner';
import { useToast } from '@/contexts/ToastContext';
import { notificationsApi, tasksApi, type NotificationChannel, type NotificationConfig, type NotificationLog, type Task } from '@/services/api';
import { 
    AlertCircle, 
    Bell, 
    Edit, 
    FileText, 
    Mail, 
    Plus, 
    Trash2, 
    Webhook, 
    ArrowLeft,
    Send,
    CheckCircle2,
    MessageSquare,
    AlertTriangle,
    Clock,
    Check,
    X
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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

// Channel Icon Component
function ChannelIcon({ channel, size = 'md' }: { channel: NotificationChannel; size?: 'sm' | 'md' | 'lg' }) {
    const config = {
        email: {
            icon: Mail,
            bgColor: 'bg-blue-500/20',
            borderColor: 'border-blue-500/30',
            textColor: 'text-blue-400',
            gradient: 'from-blue-500 to-cyan-500'
        },
        webhook: {
            icon: Webhook,
            bgColor: 'bg-purple-500/20',
            borderColor: 'border-purple-500/30',
            textColor: 'text-purple-400',
            gradient: 'from-purple-500 to-pink-500'
        },
        sms: {
            icon: MessageSquare,
            bgColor: 'bg-orange-500/20',
            borderColor: 'border-orange-500/30',
            textColor: 'text-orange-400',
            gradient: 'from-orange-500 to-red-500'
        }
    };

    const c = config[channel];
    const Icon = c.icon;
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14'
    };
    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-7 w-7'
    };

    return (
        <div className={`${sizeClasses[size]} rounded-xl ${c.bgColor} ${c.borderColor} border 
                       flex items-center justify-center ${c.textColor}`}>
            <Icon className={iconSizes[size]} />
        </div>
    );
}

// Notification Card Component
function NotificationCard({ 
    config, 
    task, 
    onEdit, 
    onDelete, 
    onTest 
}: { 
    config: NotificationConfig;
    task?: Task;
    onEdit: () => void;
    onDelete: () => void;
    onTest: () => void;
}) {
    const getRecipient = () => {
        switch (config.channel) {
            case 'email':
                return config.config.email_to;
            case 'webhook':
                return config.config.url;
            case 'sms':
                return config.config.to;
            default:
                return '';
        }
    };

    const triggers = [
        config.on_start && { label: 'Start', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        config.on_success && { label: 'Success', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
        config.on_failure && { label: 'Failure', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    ].filter(Boolean) as { label: string; color: string }[];

    return (
        <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6
                      hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-300
                      hover:shadow-xl hover:shadow-blue-500/5 animate-fade-in-up">
            <div className="flex items-start gap-4">
                <ChannelIcon channel={config.channel} size="lg" />
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                {task?.name || 'Global Notification'}
                            </h3>
                            <p className="text-slate-400 text-sm mt-1 truncate">
                                {getChannelLabel(config.channel)}: {getRecipient()}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            config.enabled 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                : 'bg-slate-700 text-slate-400 border-slate-600'
                        }`}>
                            {config.enabled ? 'Active' : 'Disabled'}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {triggers.map((trigger, index) => (
                            <span key={index} className={`px-3 py-1 rounded-full text-xs border ${trigger.color}`}>
                                {trigger.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-700/50">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onTest}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                    <Send className="h-4 w-4 mr-2" />
                    Test
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </Button>
            </div>
        </div>
    );
}

// Log Item Component
function LogItem({ log, index }: { log: NotificationLog; index: number }) {
    const statusConfig = {
        sent: {
            icon: Check,
            bgColor: 'bg-green-500/20',
            borderColor: 'border-green-500/30',
            textColor: 'text-green-400',
            statusBg: 'bg-green-500/20 text-green-400 border-green-500/30'
        },
        pending: {
            icon: Clock,
            bgColor: 'bg-yellow-500/20',
            borderColor: 'border-yellow-500/30',
            textColor: 'text-yellow-400',
            statusBg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        },
        failed: {
            icon: X,
            bgColor: 'bg-red-500/20',
            borderColor: 'border-red-500/30',
            textColor: 'text-red-400',
            statusBg: 'bg-red-500/20 text-red-400 border-red-500/30'
        }
    };

    const config = statusConfig[log.status];
    const Icon = config.icon;

    return (
        <div 
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5
                     hover:bg-slate-800/70 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${config.bgColor} ${config.borderColor} border 
                               flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${config.textColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                            <ChannelIcon channel={log.channel} size="sm" />
                            <span className="font-medium text-white capitalize">{log.channel}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${config.statusBg}`}>
                                {log.status}
                            </span>
                        </div>
                        <span className="text-xs text-slate-500">
                            {new Date(log.created_at).toLocaleString()}
                        </span>
                    </div>
                    
                    <div className="text-sm text-slate-400 mb-2">
                        To: <span className="text-slate-300">{log.recipient}</span>
                    </div>
                    
                    <div className="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3">
                        {log.message}
                    </div>
                    
                    {log.error && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">Error</span>
                            </div>
                            <div className="text-red-300 text-sm mt-1">{log.error}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const getChannelLabel = (ch: NotificationChannel) => {
    switch (ch) {
        case 'email':
            return 'Email';
        case 'webhook':
            return 'Webhook';
        case 'sms':
            return 'SMS';
    }
};

export default function NotificationsPage() {
    const [searchParams] = useSearchParams();
    const taskIdParam = searchParams.get('task_id');
    const navigate = useNavigate();

    const [configs, setConfigs] = useState<NotificationConfig[]>([]);
    const [logs, setLogs] = useState<NotificationLog[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [activeTab, setActiveTab] = useState<'configs' | 'logs'>('configs');
    const [showForm, setShowForm] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(
        taskIdParam || undefined
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const { confirm, ConfirmDialog } = useConfirm();
    const { showToast } = useToast();

    const [channel, setChannel] = useState<NotificationChannel>('email');
    const [emailTo, setEmailTo] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [smsTo, setSmsTo] = useState('');
    const [onSuccess, setOnSuccess] = useState(false);
    const [onFailure, setOnFailure] = useState(true);
    const [onStart, setOnStart] = useState(false);
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'logs' && logs.length === 0) {
            loadLogs();
        }
    }, [activeTab]);

    const loadData = async () => {
        try {
            const [configsData, tasksData] = await Promise.all([
                notificationsApi.getConfigs(selectedTaskId),
                tasksApi.getTasks(),
            ]);
            setConfigs(configsData);
            setTasks(tasksData.items);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async () => {
        setLoadingLogs(true);
        try {
            const logsData = await notificationsApi.getLogs({ limit: 50 });
            setLogs(logsData);
        } catch (err) {
            console.error('Failed to load logs:', err);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            let config: Record<string, string> = {};

            switch (channel) {
                case 'email':
                    config = { email_to: emailTo };
                    break;
                case 'webhook':
                    config = { url: webhookUrl };
                    break;
                case 'sms':
                    config = { to: smsTo };
                    break;
            }

            const data = {
                channel,
                config,
                enabled,
                on_success: onSuccess,
                on_failure: onFailure,
                on_start: onStart,
                task_id: selectedTaskId,
            };

            if (editingId) {
                await notificationsApi.updateConfig(editingId, data);
                setSuccess('Notification config updated successfully!');
            } else {
                await notificationsApi.createConfig(data);
                setSuccess('Notification config created successfully!');
            }

            setShowForm(false);
            setEditingId(null);
            resetForm();
            loadData();
        } catch (err) {
            setError(editingId ? 'Failed to update notification config' : 'Failed to create notification config');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (config: NotificationConfig) => {
        setEditingId(config.id);
        setChannel(config.channel);
        setEnabled(config.enabled);
        setOnSuccess(config.on_success);
        setOnFailure(config.on_failure);
        setOnStart(config.on_start);

        if (config.channel === 'email') {
            setEmailTo(config.config.email_to || '');
            setWebhookUrl('');
            setSmsTo('');
        } else if (config.channel === 'webhook') {
            setWebhookUrl(config.config.url || '');
            setEmailTo('');
            setSmsTo('');
        } else if (config.channel === 'sms') {
            setSmsTo(config.config.to || '');
            setEmailTo('');
            setWebhookUrl('');
        }

        setSelectedTaskId(config.task_id || undefined);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: 'Delete Notification',
            description: 'Are you sure you want to delete this notification config? This action cannot be undone.',
            confirmText: 'Delete',
            variant: 'destructive',
        });

        if (!confirmed) return;

        try {
            await notificationsApi.deleteConfig(id);
            loadData();
        } catch (err) {
            console.error('Failed to delete config:', err);
        }
    };

    const handleTest = async (config: NotificationConfig) => {
        const confirmed = await confirm({
            title: 'Send Test Notification',
            description: 'Send a test notification to the configured recipient?',
            confirmText: 'Send',
        });

        if (!confirmed) return;

        try {
            let recipient = '';
            if (config.channel === 'email') {
                recipient = config.config.email_to || '';
            } else if (config.channel === 'webhook') {
                recipient = config.config.url || '';
            } else if (config.channel === 'sms') {
                recipient = config.config.to || '';
            }

            if (!recipient) {
                showToast('No recipient configured', 'error');
                return;
            }

            const result = await notificationsApi.testNotification(config.channel, recipient);
            showToast(result.message, result.success ? 'success' : 'error');
        } catch (err) {
            showToast('Failed to send test notification', 'error');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setChannel('email');
        setEmailTo('');
        setWebhookUrl('');
        setSmsTo('');
        setOnSuccess(false);
        setOnFailure(true);
        setOnStart(false);
        setEnabled(true);
    };

    const globalConfigs = configs.filter((c) => !c.task_id);
    const taskSpecificConfigs = configs.filter((c) => c.task_id);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                    <LoadingCard text="Fetching notifications..." />
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

                <div className="relative z-10">
                    {/* Header */}
                    <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50">
                        <div className="container mx-auto px-4 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center
                                                 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <div>
                                        <h1 className="font-heading font-bold text-2xl text-white flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                                                          flex items-center justify-center">
                                                <Bell className="h-5 w-5 text-white" />
                                            </div>
                                            Notifications
                                        </h1>
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => { setActiveTab('configs'); setShowForm(true); }}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                                             hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25
                                             transition-all duration-300 hover:scale-105"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Notification
                                </Button>
                            </div>
                        </div>

                        {/* Animated Tabs */}
                        <div className="container mx-auto px-4 pb-0">
                            <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-t-xl w-fit backdrop-blur-sm">
                                <button
                                    onClick={() => setActiveTab('configs')}
                                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                                        activeTab === 'configs'
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    <Bell className="h-4 w-4" />
                                    Configurations
                                </button>
                                <button
                                    onClick={() => setActiveTab('logs')}
                                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                                        activeTab === 'logs'
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    <FileText className="h-4 w-4" />
                                    Logs
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="container mx-auto px-4 py-8">
                        {activeTab === 'configs' ? (
                            <>
                                {/* Task Filter */}
                                <div className="mb-8">
                                    <Label className="text-slate-300 mb-3 block text-sm font-medium">Filter by Task</Label>
                                    <select
                                        value={selectedTaskId || ''}
                                        onChange={(e) => setSelectedTaskId(e.target.value || undefined)}
                                        className="bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3
                                                 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300
                                                 max-w-md cursor-pointer hover:border-slate-600"
                                    >
                                        <option value="">All Notifications</option>
                                        <option value="__global__">Global (All Tasks)</option>
                                        {tasks.map((task) => (
                                            <option key={task.id} value={task.id}>
                                                {task.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Notification Form Modal */}
                                {showForm && (
                                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                                        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700/50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                            <CardHeader className="sticky top-0 bg-slate-800/90 backdrop-blur-xl z-10 border-b border-slate-700/50">
                                                 <CardTitle className="font-heading text-white text-xl flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                                                                  flex items-center justify-center">
                                                        {editingId ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                                                    </div>
                                                    {editingId ? 'Edit Notification' : 'Create Notification'}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <form onSubmit={handleSubmit} className="space-y-5">
                                                    {error && (
                                                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl 
                                                                       flex items-center gap-3">
                                                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                                            <span>{error}</span>
                                                        </div>
                                                    )}
                                                    {success && (
                                                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl 
                                                                       flex items-center gap-3">
                                                            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                                                            <span>{success}</span>
                                                        </div>
                                                    )}

                                                    {!taskIdParam && (
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-300">Apply To</Label>
                                                            <select
                                                                value={selectedTaskId || ''}
                                                                onChange={(e) =>
                                                                    setSelectedTaskId(
                                                                        e.target.value === '__global__'
                                                                            ? undefined
                                                                            : e.target.value || undefined
                                                                    )
                                                                }
                                                                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3
                                                                         focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300"
                                                            >
                                                                <option value="__global__">All Tasks (Global)</option>
                                                                {tasks.map((task) => (
                                                                    <option key={task.id} value={task.id}>
                                                                        {task.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <Label className="text-slate-300">Channel</Label>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {(['email', 'webhook', 'sms'] as NotificationChannel[]).map(
                                                                (ch) => (
                                                                    <button
                                                                        key={ch}
                                                                        type="button"
                                                                        onClick={() => setChannel(ch)}
                                                                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all duration-300 ${
                                                                            channel === ch
                                                                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                                                                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                                                        }`}
                                                                    >
                                                                        <ChannelIcon channel={ch} />
                                                                        <span className="text-sm font-medium capitalize">{getChannelLabel(ch)}</span>
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>

                                                    {channel === 'email' && (
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-300">Email To</Label>
                                                            <div className="relative">
                                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                                <Input
                                                                    value={emailTo}
                                                                    onChange={(e) => setEmailTo(e.target.value)}
                                                                    placeholder="admin@example.com"
                                                                    required
                                                                    className="bg-slate-900/50 border-slate-700 text-white pl-12 h-12
                                                                             focus:border-blue-500/50 focus:ring-blue-500/20"
                                                                />
                                                            </div>
                                                            <p className="text-sm text-slate-500">
                                                                Notifications will be sent using server SMTP settings.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {channel === 'webhook' && (
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-300">Webhook URL</Label>
                                                            <div className="relative">
                                                                <Webhook className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                                <Input
                                                                    value={webhookUrl}
                                                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                                                    placeholder="https://hooks.slack.com/services/..."
                                                                    required
                                                                    className="bg-slate-900/50 border-slate-700 text-white pl-12 h-12
                                                                             focus:border-blue-500/50 focus:ring-blue-500/20"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {channel === 'sms' && (
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-300">Phone Number</Label>
                                                            <div className="relative">
                                                                <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                                                                <Input
                                                                    value={smsTo}
                                                                    onChange={(e) => setSmsTo(e.target.value)}
                                                                    placeholder="+1234567890"
                                                                    required
                                                                    className="bg-slate-900/50 border-slate-700 text-white pl-12 h-12
                                                                             focus:border-blue-500/50 focus:ring-blue-500/20"
                                                                />
                                                            </div>
                                                            <p className="text-sm text-slate-500">
                                                                Notifications will be sent using server Twilio settings.
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="space-y-3">
                                                        <Label className="text-slate-300">Notify On</Label>
                                                        <div className="flex flex-wrap gap-3">
                                                            {[
                                                                { id: 'onStart', label: 'Task Start', state: onStart, setState: setOnStart },
                                                                { id: 'onSuccess', label: 'Success', state: onSuccess, setState: setOnSuccess },
                                                                { id: 'onFailure', label: 'Failure', state: onFailure, setState: setOnFailure }
                                                            ].map((item) => (
                                                                <label 
                                                                    key={item.id}
                                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all duration-300 ${
                                                                        item.state 
                                                                            ? 'bg-blue-500/20 border-blue-500/50 text-white' 
                                                                            : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={item.state}
                                                                        onChange={(e) => item.setState(e.target.checked)}
                                                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 
                                                                                 checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500
                                                                                 focus:ring-blue-500/20"
                                                                    />
                                                                    <span className="font-medium">{item.label}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                                        <input
                                                            type="checkbox"
                                                            id="enabled"
                                                            checked={enabled}
                                                            onChange={(e) => setEnabled(e.target.checked)}
                                                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 
                                                                     checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500
                                                                     focus:ring-blue-500/20 cursor-pointer"
                                                        />
                                                        <Label htmlFor="enabled" className="text-slate-300 cursor-pointer">
                                                            Enable notifications
                                                        </Label>
                                                    </div>

                                                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setShowForm(false);
                                                                resetForm();
                                                            }}
                                                            className="border-slate-600 text-white hover:bg-slate-800"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button 
                                                            type="submit" 
                                                            disabled={saving}
                                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                                                                     hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25"
                                                        >
                                                            {saving ? (
                                                                <ButtonLoader size="sm" text="Saving..." />
                                                            ) : editingId ? 'Update' : 'Create'}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Global Notifications Section */}
                                {!selectedTaskId && (
                                    <div className="mb-10">
                                        <h2 className="font-heading text-xl font-semibold text-white mb-2">Global Notifications</h2>
                                        <p className="text-slate-400 mb-6">
                                            These notifications apply to all tasks created by you.
                                        </p>
                                        {globalConfigs.length === 0 ? (
                                            <div className="text-center py-12 bg-slate-800/30 border border-slate-700/30 rounded-2xl">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                                                    <Bell className="h-8 w-8 text-slate-500" />
                                                </div>
                                                <p className="text-slate-400">No global notifications configured</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {globalConfigs.map((config) => (
                                                    <NotificationCard
                                                        key={config.id}
                                                        config={config}
                                                        onEdit={() => handleEdit(config)}
                                                        onDelete={() => handleDelete(config.id)}
                                                        onTest={() => handleTest(config)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Task-specific Notifications Section */}
                                <div>
                                    <h2 className="font-heading text-xl font-semibold text-white mb-2">Task-specific Notifications</h2>
                                    <p className="text-slate-400 mb-6">
                                        These notifications apply to specific tasks only.
                                    </p>
                                    {taskSpecificConfigs.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-800/30 border border-slate-700/30 rounded-2xl">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                                                <Bell className="h-8 w-8 text-slate-500" />
                                            </div>
                                            <p className="text-slate-400">No task-specific notifications configured</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {taskSpecificConfigs.map((config) => {
                                                const task = tasks.find((t) => t.id === config.task_id);
                                                return (
                                                    <NotificationCard
                                                        key={config.id}
                                                        config={config}
                                                        task={task}
                                                        onEdit={() => handleEdit(config)}
                                                        onDelete={() => handleDelete(config.id)}
                                                        onTest={() => handleTest(config)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div>
                                <h2 className="font-heading text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                    <FileText className="h-6 w-6 text-blue-400" />
                                    Notification Logs
                                </h2>
                                {loadingLogs ? (
                                    <div className="flex items-center justify-center py-12">
                                        <LoadingCard text="Loading logs..." />
                                    </div>
                                ) : logs.length === 0 ? (
                                    <div className="text-center py-16 bg-slate-800/30 border border-slate-700/30 rounded-2xl">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center animate-pulse">
                                            <FileText className="h-10 w-10 text-slate-500" />
                                        </div>
                                        <p className="text-slate-400 text-lg">No notification logs yet</p>
                                        <p className="text-slate-500 mt-2">Send some notifications to see logs here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {logs.map((log, index) => (
                                            <LogItem key={log.id} log={log} index={index} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
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
                    animation: fade-in 0.4s ease-out forwards;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
            `}</style>
        </Layout>
    );
}
