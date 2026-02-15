import { useAuth } from '@/contexts/AuthContext';
import {
    Bell,
    LayoutDashboard,
    LogOut,
    Menu,
    Shield,
    ShieldAlert,
    X
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';

export default function Header() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard' || location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <Logo size="md" showText={false} />
                        <span className="font-heading text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                            QKron
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {user && (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${isActive('/dashboard')
                                            ? 'bg-blue-600/20 text-blue-400'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/notifications"
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${isActive('/notifications')
                                            ? 'bg-blue-600/20 text-blue-400'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    <Bell className="h-4 w-4" />
                                    Notifications
                                </Link>
                                {user.is_superuser && (
                                    <Link
                                        to="/users"
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${isActive('/users')
                                                ? 'bg-blue-600/20 text-blue-400'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        <Shield className="h-4 w-4" />
                                        Users
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>

                    {/* User Section */}
                    <div className="hidden md:flex items-center gap-4">
                        {user && (
                            <>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full">
                                    {user.is_superuser ? (
                                        <ShieldAlert className="h-4 w-4 text-red-400" />
                                    ) : (
                                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                            <span className="text-xs font-medium text-white">
                                                {user.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-sm text-slate-300">{user.username}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && user && (
                    <div className="md:hidden py-4 border-t border-slate-700">
                        <nav className="flex flex-col gap-2">
                            <Link
                                to="/dashboard"
                                className={`px-4 py-3 rounded-lg flex items-center gap-3 ${isActive('/dashboard')
                                        ? 'bg-blue-600/20 text-blue-400'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                Dashboard
                            </Link>
                            <Link
                                to="/notifications"
                                className={`px-4 py-3 rounded-lg flex items-center gap-3 ${isActive('/notifications')
                                        ? 'bg-blue-600/20 text-blue-400'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Bell className="h-5 w-5" />
                                Notifications
                            </Link>
                            {user.is_superuser && (
                                <Link
                                    to="/users"
                                    className={`px-4 py-3 rounded-lg flex items-center gap-3 ${isActive('/users')
                                            ? 'bg-blue-600/20 text-blue-400'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Shield className="h-5 w-5" />
                                    Users
                                </Link>
                            )}
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="px-4 py-3 rounded-lg flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 mt-2 border-t border-slate-700"
                            >
                                <LogOut className="h-5 w-5" />
                                Logout
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
