import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">QKron</h1>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => navigate('/login')} className="text-white">
                            Login
                        </Button>
                        <Button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700">
                            Sign Up
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-5xl font-bold text-white mb-6">
                        Task Scheduling Made Simple
                    </h2>
                    <p className="text-xl text-slate-300 mb-8">
                        QKron is a powerful task scheduling and execution system that helps you
                        automate your workflows with ease. Schedule tasks, set dependencies,
                        and get notified on execution results.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button
                            onClick={() => navigate('/register')}
                            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                        >
                            Get Started
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/login')}
                            className="text-white text-lg px-8 py-3"
                        >
                            Login
                        </Button>
                    </div>
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <div className="text-3xl mb-4">⏰</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Flexible Scheduling</h3>
                        <p className="text-slate-400">
                            Schedule tasks using cron expressions, intervals, or one-time execution.
                        </p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <div className="text-3xl mb-4">🔗</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Task Dependencies</h3>
                        <p className="text-slate-400">
                            Set up task dependencies to ensure proper execution order.
                        </p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <div className="text-3xl mb-4">🔔</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Notifications</h3>
                        <p className="text-slate-400">
                            Get notified via email, SMS, or webhooks on task completion or failure.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
