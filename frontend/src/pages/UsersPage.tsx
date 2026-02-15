import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingScreen, ButtonLoader } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { usersApi, type User } from '@/services/api';
import { 
    Plus, 
    ShieldAlert, 
    Trash2, 
    User as UserIcon,
    ArrowLeft,
    Mail,
    Lock,
    Crown,
    CheckCircle2,
    AlertCircle,
    Save,
    X,
    UserPlus
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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

// Avatar with Initials Component
function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
    const initials = user.username.slice(0, 2).toUpperCase();
    const isSuperuser = user.is_superuser;
    
    const sizeClasses = {
        sm: 'w-10 h-10 text-sm',
        md: 'w-14 h-14 text-lg',
        lg: 'w-20 h-20 text-2xl'
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold
                       ${isSuperuser 
                           ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                           : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                       }`}>
            {initials}
        </div>
    );
}

// Role Badge Component
function RoleBadge({ isSuperuser }: { isSuperuser: boolean }) {
    if (isSuperuser) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                           bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                           text-purple-400 border border-purple-500/30">
                <Crown className="h-3 w-3" />
                Superuser
            </span>
        );
    }
    
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                       bg-slate-700 text-slate-300 border border-slate-600">
            <UserIcon className="h-3 w-3" />
            User
        </span>
    );
}

// User Card Component
function UserCard({ 
    user, 
    currentUser, 
    onDelete, 
    deleting 
}: { 
    user: User; 
    currentUser: User | null; 
    onDelete: () => void;
    deleting: boolean;
}) {
    const isCurrentUser = user.id === currentUser?.id;
    
    return (
        <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6
                      hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-300
                      hover:shadow-xl hover:shadow-blue-500/5 animate-fade-in-up">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Avatar user={user} size="md" />
                    <div>
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {user.username}
                        </h3>
                        <p className="text-sm text-slate-400">{user.email}</p>
                        <div className="mt-2">
                            <RoleBadge isSuperuser={user.is_superuser} />
                        </div>
                    </div>
                </div>
                
                {!isCurrentUser && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        disabled={deleting}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                        {deleting ? (
                            <ButtonLoader size="sm" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                <span>ID: {user.id.slice(0, 8)}...</span>
                {isCurrentUser && <span className="text-blue-400 font-medium">You</span>}
            </div>
        </div>
    );
}

// Password Strength Indicator Component
function PasswordStrengthIndicator({ password }: { password: string }) {
    const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;

        const levels = [
            { label: 'Too weak', color: 'bg-red-500' },
            { label: 'Weak', color: 'bg-orange-500' },
            { label: 'Fair', color: 'bg-yellow-500' },
            { label: 'Good', color: 'bg-blue-500' },
            { label: 'Strong', color: 'bg-green-500' }
        ];

        return { score, ...levels[score] };
    };

    const { score, label, color } = calculateStrength(password);
    const percentage = (score / 4) * 100;

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Password strength:</span>
                <span className={`font-medium ${
                    score <= 1 ? 'text-red-400' : 
                    score === 2 ? 'text-yellow-400' : 
                    score === 3 ? 'text-blue-400' : 'text-green-400'
                }`}>
                    {label}
                </span>
            </div>
        </div>
    );
}

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
        setError('');
        setSuccess('');
    };

    if (loading) {
        return <LoadingScreen text="Loading users..." />;
    }

    if (!currentUser?.is_superuser) {
        return null;
    }

    return (
        <Layout>
            <ConfirmDialog />
            <div className="min-h-screen bg-slate-950 relative">
                <AnimatedBackground />
                
                {/* Gradient orbs */}
                <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

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

                    {/* Create User Form */}
                    {showForm && (
                        <Card className="mb-10 bg-slate-800/50 backdrop-blur-sm border-slate-700/50 animate-fade-in-up overflow-hidden">
                            <CardHeader className="bg-slate-900/30 border-b border-slate-700/50">
                                <CardTitle className="font-heading text-xl text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                                                  flex items-center justify-center">
                                        <UserPlus className="h-5 w-5 text-white" />
                                    </div>
                                    Create New User
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Add a new user to the system
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl 
                                                       flex items-center gap-3 animate-fade-in">
                                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {success && (
                                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl 
                                                       flex items-center gap-3 animate-fade-in">
                                            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                                            <span>{success}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300 flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-blue-400" />
                                                Email Address
                                            </Label>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="admin@example.com"
                                                required
                                                className="bg-slate-900/50 border-slate-700 text-white h-12
                                                         focus:border-blue-500/50 focus:ring-blue-500/20
                                                         placeholder:text-slate-600 transition-all duration-300"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300 flex items-center gap-2">
                                                <UserIcon className="h-4 w-4 text-blue-400" />
                                                Username
                                            </Label>
                                            <Input
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="johndoe"
                                                required
                                                className="bg-slate-900/50 border-slate-700 text-white h-12
                                                         focus:border-blue-500/50 focus:ring-blue-500/20
                                                         placeholder:text-slate-600 transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300 flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-blue-400" />
                                                Password
                                            </Label>
                                            <Input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="bg-slate-900/50 border-slate-700 text-white h-12
                                                         focus:border-blue-500/50 focus:ring-blue-500/20
                                                         placeholder:text-slate-600 transition-all duration-300"
                                            />
                                            <PasswordStrengthIndicator password={password} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300 flex items-center gap-2">
                                                <ShieldAlert className="h-4 w-4 text-blue-400" />
                                                User Role
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSuperuser(false)}
                                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                                                        !isSuperuser
                                                            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50 text-white'
                                                            : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                                    }`}
                                                >
                                                    <UserIcon className={`h-6 w-6 ${!isSuperuser ? 'text-blue-400' : 'text-slate-500'}`} />
                                                    <span className="font-medium">Regular User</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSuperuser(true)}
                                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                                                        isSuperuser
                                                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 text-white'
                                                            : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                                    }`}
                                                >
                                                    <Crown className={`h-6 w-6 ${isSuperuser ? 'text-purple-400' : 'text-slate-500'}`} />
                                                    <span className="font-medium">Superuser</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowForm(false);
                                                resetForm();
                                            }}
                                            className="border-slate-600 text-white hover:bg-slate-800"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={saving}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                                                     hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25"
                                        >
                                            {saving ? (
                                                <ButtonLoader size="sm" text="Creating..." />
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Create User
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Users List Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-heading font-bold text-2xl text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                                              flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-white" />
                                </div>
                                Team Members
                            </h2>
                            <p className="text-slate-400 mt-1">Manage users and their access levels</p>
                        </div>
                        <Button 
                            onClick={() => setShowForm(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                                     hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25
                                     transition-all duration-300 hover:scale-105"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </div>

                    {/* Users Grid */}
                    {users.length === 0 ? (
                        <div className="text-center py-16 bg-slate-800/30 border border-slate-700/30 rounded-2xl">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center animate-pulse">
                                <UserIcon className="h-10 w-10 text-slate-500" />
                            </div>
                            <p className="text-slate-400 text-lg">No users found</p>
                            <p className="text-slate-500 mt-2">Create your first user to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.map((user, index) => (
                                <div key={user.id} style={{ animationDelay: `${index * 50}ms` }}>
                                    <UserCard
                                        user={user}
                                        currentUser={currentUser}
                                        onDelete={() => handleDelete(user.id)}
                                        deleting={deletingUserId === user.id}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
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
