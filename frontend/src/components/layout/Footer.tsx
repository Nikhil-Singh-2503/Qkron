import { Heart, Rocket } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Rocket className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-400">
                            QKron Task Scheduler
                        </span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6">
                        <a
                            href="#"
                            className="text-sm text-slate-500 hover:text-blue-400 transition-colors"
                        >
                            Documentation
                        </a>
                        <a
                            href="#"
                            className="text-sm text-slate-500 hover:text-blue-400 transition-colors"
                        >
                            API
                        </a>
                        <a
                            href="#"
                            className="text-sm text-slate-500 hover:text-blue-400 transition-colors"
                        >
                            Support
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>© {currentYear} QKron</span>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1">
                            Made with <Heart className="h-3 w-3 text-red-500" /> for developers
                        </span>
                    </div>
                </div>

                {/* Decorative line */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                        <div className="h-1 w-1 rounded-full bg-purple-500"></div>
                        <div className="h-1 w-1 rounded-full bg-pink-500"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
