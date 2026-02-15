import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { usersApi, type User } from '@/services/api';
import { Loader2, Plus, ShieldAlert, Trash2, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { confirm, ConfirmDialog } = useConfirm();

    // Form state
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSuperuser, setIsSuperuser] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        // Only superusers can access this page
        if (!loading && currentUser && !currentUser.is_superuser) {
            navigate('/dashboard');
            return;
        }
        loadUsers();
    }, [currentUser, loading]);

    const loadUsers = async () => {
        try {
            const data = await usersApi.getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            await usersApi.createUser({
                email,
                username,
                password,
                is_superuser: isSuperuser,
            });

            setSuccess('User created successfully!');
            setShowForm(false);
            resetForm();
            loadUsers();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create user');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        // Prevent deleting yourself
        if (id === currentUser?.id) {
            showToast('You cannot delete your own account', 'error');
            return;
        }

        const confirmed = await confirm({
            title: 'Delete User',
            description: 'Are you sure you want to delete this user? This action cannot be undone.',
            confirmText: 'Delete',
            variant: 'destructive',
        });

        if (!confirmed) return;

        try {
            setDeletingUserId(id);
            await usersApi.deleteUser(id);
            loadUsers();
        } catch (err) {
            console.error('Failed to delete user:', err);
        } finally {
            setDeletingUserId(null);
        }
    };

    const resetForm = () => {
        setEmail('');
        setUsername('');
        setPassword('');
        setIsSuperuser(false);
    };

    if (loading) {
        return (
            <LoadingScreen text="Loading users..." />
        );
    }

    // Redirect non-superusers
    if (!currentUser?.is_superuser) {
        return null;
    }

    return (
        <Layout>
            <ConfirmDialog />
            <div className="container mx-auto px-4 py-8">
                {/* Create User Form */}
                {showForm && (
                    <div className="mb-8">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Create New User</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Add a new user to the system
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Email</Label>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="admin@example.com"
                                                required
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Username</Label>
                                            <Input
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="admin"
                                                required
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Password</Label>
                                            <Input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Role</Label>
                                            <div className="flex items-center gap-4 mt-2">
                                                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        checked={!isSuperuser}
                                                        onChange={() => setIsSuperuser(false)}
                                                        className="w-4 h-4"
                                                    />
                                                    <UserIcon className="h-4 w-4" />
                                                    Regular User
                                                </label>
                                                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        checked={isSuperuser}
                                                        onChange={() => setIsSuperuser(true)}
                                                        className="w-4 h-4"
                                                    />
                                                    <ShieldAlert className="h-4 w-4 text-red-400" />
                                                    Superuser
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
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
                                            {saving ? 'Creating...' : 'Create User'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Users List */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">All Users</h2>
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </div>

                    {users.length === 0 ? (
                        <div className="text-slate-400 text-center py-8">
                            No users found. Create your first user.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {users.map((user) => (
                                <Card key={user.id} className="bg-slate-800 border-slate-700">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                                                    {user.is_superuser ? (
                                                        <ShieldAlert className="h-5 w-5 text-red-400" />
                                                    ) : (
                                                        <UserIcon className="h-5 w-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{user.username}</div>
                                                    <div className="text-sm text-slate-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${user.is_superuser
                                                    ? 'bg-red-900 text-red-200'
                                                    : 'bg-slate-700 text-slate-300'
                                                    }`}
                                            >
                                                {user.is_superuser ? 'Superuser' : 'User'}
                                            </span>
                                            <div className="flex gap-2">
                                                {user.id !== currentUser?.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        {deletingUserId === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4 text-red-400" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
