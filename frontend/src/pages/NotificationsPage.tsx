import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingCard } from '@/components/ui/loading-spinner';
import { useToast } from '@/contexts/ToastContext';
import { notificationsApi, tasksApi, type NotificationChannel, type NotificationConfig, type NotificationLog, type Task } from '@/services/api';
import { AlertCircle, Bell, CheckCircle, Edit, FileText, Mail, Plus, Trash2, Webhook, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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

    // Custom confirm dialog
    const { confirm, ConfirmDialog } = useConfirm();
    const { showToast } = useToast();

    // Form state - only need recipient info
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

    // Load logs when tab changes to logs
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
            // Only send the recipient info - backend uses .env SMTP settings
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

        // Load recipient info based on channel
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
            // Extract recipient based on channel
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

    const getChannelIcon = (ch: NotificationChannel) => {
        switch (ch) {
            case 'email':
                return <Mail className="h-5 w-5" />;
            case 'webhook':
                return <Webhook className="h-5 w-5" />;
            case 'sms':
                return <Bell className="h-5 w-5" />;
        }
    };

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

    const globalConfigs = configs.filter((c) => !c.task_id);
    const taskSpecificConfigs = configs.filter((c) => c.task_id);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center">
                    <LoadingCard text="Fetching notifications..." />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <ConfirmDialog />
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-300">
                            ← Back
                        </Button>
                        <h1 className="text-2xl font-bold text-white">Notifications</h1>
                    </div>
                    <Button onClick={() => { setActiveTab('configs'); setShowForm(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Notification
                    </Button>
                </div>
                {/* Tabs */}
                <div className="container mx-auto px-4 pb-0">
                    <div className="flex space-x-1 bg-slate-900 p-1 rounded-t-lg w-fit">
                        <button
                            onClick={() => setActiveTab('configs')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'configs'
                                ? 'bg-slate-700 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <Bell className="h-4 w-4" />
                            Configurations
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'logs'
                                ? 'bg-slate-700 text-white'
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
                {/* Tab Content */}
                {activeTab === 'configs' ? (
                    <>
                        {/* Task Filter */}
                        <div className="mb-6">
                            <Label className="text-slate-300 mb-2 block">Filter by Task</Label>
                            <select
                                value={selectedTaskId || ''}
                                onChange={(e) => setSelectedTaskId(e.target.value || undefined)}
                                className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 max-w-md"
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
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <Card className="bg-slate-800 border-slate-700 w-full max-w-lg">
                                    <CardHeader>
                                        <CardTitle className="text-white">{editingId ? 'Edit Notification' : 'Create Notification'}</CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Configure where to send task notifications. SMTP settings are used from server config.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {error && (
                                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                                    {error}
                                                </div>
                                            )}
                                            {success && (
                                                <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                                                    {success}
                                                </div>
                                            )}

                                            {/* Task Selection */}
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
                                                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
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

                                            {/* Channel Selection */}
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">Channel</Label>
                                                <div className="flex gap-2">
                                                    {(['email', 'webhook', 'sms'] as NotificationChannel[]).map(
                                                        (ch) => (
                                                            <button
                                                                key={ch}
                                                                type="button"
                                                                onClick={() => setChannel(ch)}
                                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md ${channel === ch
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-slate-700 text-slate-300'
                                                                    }`}
                                                            >
                                                                {getChannelIcon(ch)}
                                                                {getChannelLabel(ch)}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* Recipient - only show what's needed based on channel */}
                                            {channel === 'email' && (
                                                <div className="space-y-2">
                                                    <Label className="text-slate-300">Email To</Label>
                                                    <Input
                                                        value={emailTo}
                                                        onChange={(e) => setEmailTo(e.target.value)}
                                                        placeholder="admin@example.com"
                                                        required
                                                        className="bg-slate-700 border-slate-600 text-white"
                                                    />
                                                    <p className="text-sm text-slate-500">
                                                        Notifications will be sent to this email address using server SMTP settings.
                                                    </p>
                                                </div>
                                            )}

                                            {channel === 'webhook' && (
                                                <div className="space-y-2">
                                                    <Label className="text-slate-300">Webhook URL</Label>
                                                    <Input
                                                        value={webhookUrl}
                                                        onChange={(e) => setWebhookUrl(e.target.value)}
                                                        placeholder="https://hooks.slack.com/services/..."
                                                        required
                                                        className="bg-slate-700 border-slate-600 text-white"
                                                    />
                                                </div>
                                            )}

                                            {channel === 'sms' && (
                                                <div className="space-y-2">
                                                    <Label className="text-slate-300">Phone Number</Label>
                                                    <Input
                                                        value={smsTo}
                                                        onChange={(e) => setSmsTo(e.target.value)}
                                                        placeholder="+1234567890"
                                                        required
                                                        className="bg-slate-700 border-slate-600 text-white"
                                                    />
                                                    <p className="text-sm text-slate-500">
                                                        Notifications will be sent to this number using server Twilio settings.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Notification triggers */}
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">Notify On</Label>
                                                <div className="flex flex-wrap gap-4">
                                                    <label className="flex items-center gap-2 text-slate-300">
                                                        <input
                                                            type="checkbox"
                                                            checked={onStart}
                                                            onChange={(e) => setOnStart(e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        Task Start
                                                    </label>
                                                    <label className="flex items-center gap-2 text-slate-300">
                                                        <input
                                                            type="checkbox"
                                                            checked={onSuccess}
                                                            onChange={(e) => setOnSuccess(e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        On Success
                                                    </label>
                                                    <label className="flex items-center gap-2 text-slate-300">
                                                        <input
                                                            type="checkbox"
                                                            checked={onFailure}
                                                            onChange={(e) => setOnFailure(e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        On Failure
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Enabled */}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="enabled"
                                                    checked={enabled}
                                                    onChange={(e) => setEnabled(e.target.checked)}
                                                    className="rounded"
                                                />
                                                <Label htmlFor="enabled" className="text-slate-300">
                                                    Enable notifications
                                                </Label>
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowForm(false);
                                                        resetForm();
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={saving}>
                                                    {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Global Notifications Section */}
                        {!selectedTaskId && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-white mb-4">Global Notifications</h2>
                                <p className="text-slate-400 mb-4">
                                    These notifications apply to all tasks created by you.
                                </p>
                                {globalConfigs.length === 0 ? (
                                    <Card className="bg-slate-800 border-slate-700">
                                        <CardContent className="py-8 text-center text-slate-400">
                                            No global notifications configured
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {globalConfigs.map((config) => (
                                            <Card key={config.id} className="bg-slate-800 border-slate-700">
                                                <CardContent className="py-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2 bg-slate-700 rounded-lg">
                                                                {getChannelIcon(config.channel)}
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-medium">
                                                                    {getChannelLabel(config.channel)}
                                                                </div>
                                                                <div className="text-slate-400 text-sm">
                                                                    {config.channel === 'email' && config.config.email_to}
                                                                    {config.channel === 'webhook' && config.config.url}
                                                                    {config.channel === 'sms' && config.config.to}
                                                                </div>
                                                                <div className="text-slate-500 text-xs mt-1">
                                                                    {config.on_start && 'on start '}
                                                                    {config.on_success && 'on success '}
                                                                    {config.on_failure && 'on failure'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs ${config.enabled
                                                                    ? 'bg-green-900 text-green-200'
                                                                    : 'bg-slate-700 text-slate-400'
                                                                    }`}
                                                            >
                                                                {config.enabled ? 'Enabled' : 'Disabled'}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleTest(config)}
                                                            >
                                                                Test
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(config)}
                                                            >
                                                                <Edit className="h-4 w-4 text-blue-400" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(config.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-400" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Task-specific Notifications Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-4">Task-specific Notifications</h2>
                            <p className="text-slate-400 mb-4">
                                These notifications apply to specific tasks only.
                            </p>
                            {taskSpecificConfigs.length === 0 ? (
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="py-8 text-center text-slate-400">
                                        No task-specific notifications configured
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {taskSpecificConfigs.map((config) => {
                                        const task = tasks.find((t) => t.id === config.task_id);
                                        return (
                                            <Card key={config.id} className="bg-slate-800 border-slate-700">
                                                <CardContent className="py-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2 bg-slate-700 rounded-lg">
                                                                {getChannelIcon(config.channel)}
                                                            </div>
                                                            <div>
                                                                <div className="text-white font-medium">
                                                                    {task?.name || 'Unknown Task'}
                                                                </div>
                                                                <div className="text-slate-400 text-sm">
                                                                    {getChannelLabel(config.channel)} -{' '}
                                                                    {config.channel === 'email' && config.config.email_to}
                                                                    {config.channel === 'webhook' && config.config.url}
                                                                    {config.channel === 'sms' && config.config.to}
                                                                </div>
                                                                <div className="text-slate-500 text-xs mt-1">
                                                                    {config.on_start && 'on start '}
                                                                    {config.on_success && 'on success '}
                                                                    {config.on_failure && 'on failure'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs ${config.enabled
                                                                    ? 'bg-green-900 text-green-200'
                                                                    : 'bg-slate-700 text-slate-400'
                                                                    }`}
                                                            >
                                                                {config.enabled ? 'Enabled' : 'Disabled'}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleTest(config)}
                                                            >
                                                                Test
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(config)}
                                                            >
                                                                <Edit className="h-4 w-4 text-blue-400" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(config.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-400" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-6">Notification Logs</h2>
                        {loadingLogs ? (
                            <LoadingCard text="Loading logs..." />
                        ) : logs.length === 0 ? (
                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="py-8 text-center text-slate-400">
                                    No notification logs yet
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {logs.map((log) => (
                                    <Card key={log.id} className="bg-slate-800 border-slate-700">
                                        <CardContent className="py-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${log.status === 'sent' ? 'bg-green-900/50' : log.status === 'pending' ? 'bg-yellow-900/50' : 'bg-red-900/50'}`}>
                                                        {log.status === 'sent' ? (
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                        ) : log.status === 'pending' ? (
                                                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-red-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white font-medium capitalize">{log.channel}</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs ${log.status === 'sent' ? 'bg-green-900 text-green-200' : log.status === 'pending' ? 'bg-yellow-900 text-yellow-200' : 'bg-red-900 text-red-200'}`}>
                                                                {log.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-slate-400 mt-1">
                                                            To: {log.recipient}
                                                        </div>
                                                        <div className="text-sm text-slate-500 mt-1">
                                                            {log.message}
                                                        </div>
                                                        {log.error && (
                                                            <div className="text-sm text-red-400 mt-1">
                                                                Error: {log.error}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-slate-500 mt-2">
                                                            {new Date(log.created_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
