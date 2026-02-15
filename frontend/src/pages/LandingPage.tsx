import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { 
  Clock, 
  Link2, 
  Bell, 
  Shield, 
  BarChart3,
  ChevronRight,
  Play,
  CheckCircle2,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

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
      const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
      gradient.addColorStop(1, 'rgba(30, 41, 59, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((particle, i) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        ctx.fill();

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw connections
        particles.slice(i + 1).forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - distance / 150)})`;
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

// Feature Card Component
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color,
  delay 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <div 
      className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 
                 hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-500 
                 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10
                 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 
                      rounded-2xl transition-opacity duration-500`} />
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center 
                      mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// Stats Component
function StatItem({ value, label, suffix = '' }: { value: string; label: string; suffix?: string }) {
  return (
    <div className="text-center px-8 py-4">
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {value}<span className="text-blue-500">{suffix}</span>
      </div>
      <div className="text-slate-400 text-sm uppercase tracking-wider">{label}</div>
    </div>
  );
}

// Animated Text Component
function AnimatedText({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block animate-fade-in"
          style={{ 
            animationDelay: `${delay + i * 30}ms`,
            animationFillMode: 'both'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Animated gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" 
           style={{ animationDelay: '2s' }} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] 
                      bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />

      {/* Navigation */}
      <nav className="relative z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50 sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
              <Logo size="md" showText={false} />
              <span className="font-heading text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                QKron
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')} 
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/register')} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                         hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25"
              >
                Get Started
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 
                          text-blue-400 text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Now with AI-powered scheduling
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <AnimatedText text="Task Scheduling" />
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                <AnimatedText text="Made Simple" delay={500} />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
               style={{ animationDelay: '800ms' }}>
              Automate your workflows with intelligent task scheduling. 
              Set dependencies, track execution, and get notified — all in one powerful platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fade-in-up"
                 style={{ animationDelay: '1000ms' }}>
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                         hover:to-purple-700 text-white text-lg px-8 py-6 shadow-xl shadow-blue-500/25
                         group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                className="text-white border-slate-600 hover:bg-slate-800 text-lg px-8 py-6 group"
              >
                <Play className="w-5 h-5 mr-2 text-blue-400" />
                View Demo
              </Button>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div className="relative max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-2 
                            shadow-2xl shadow-blue-500/10">
                <div className="bg-slate-900 rounded-xl overflow-hidden">
                  {/* Mock Dashboard UI */}
                  <div className="flex">
                    {/* Sidebar */}
                    <div className="w-16 md:w-20 bg-slate-800/50 p-4 border-r border-slate-700/50">
                      <div className="space-y-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20" />
                        <div className="w-8 h-8 rounded-lg bg-slate-700/50" />
                        <div className="w-8 h-8 rounded-lg bg-slate-700/50" />
                        <div className="w-8 h-8 rounded-lg bg-slate-700/50" />
                      </div>
                    </div>
                    {/* Main Content */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-8 w-48 bg-slate-700/30 rounded-lg" />
                        <div className="h-10 w-32 bg-blue-500/20 rounded-lg" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/30" />
                        <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/30" />
                        <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/30" />
                      </div>
                      <div className="h-64 bg-slate-800/30 rounded-xl border border-slate-700/30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 border-y border-slate-800/50 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <StatItem value="10K" label="Tasks Scheduled" suffix="+" />
            <StatItem value="99.9" label="Uptime" suffix="%" />
            <StatItem value="50" label="Integrations" suffix="+" />
            <StatItem value="24/7" label="Support" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                automate
              </span>
            </h2>
            <p className="text-xl text-slate-400">
              Powerful features to help you schedule, monitor, and manage your tasks efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Clock}
              title="Flexible Scheduling"
              description="Schedule tasks using cron expressions, intervals, or one-time execution. Support for multiple timezones."
              color="from-blue-500 to-cyan-500"
              delay={0}
            />
            <FeatureCard
              icon={Link2}
              title="Task Dependencies"
              description="Set up complex task dependencies to ensure proper execution order and workflow orchestration."
              color="from-purple-500 to-pink-500"
              delay={100}
            />
            <FeatureCard
              icon={Bell}
              title="Smart Notifications"
              description="Get notified via email, SMS, or webhooks on task completion, failure, or any custom event."
              color="from-orange-500 to-red-500"
              delay={200}
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-time Analytics"
              description="Monitor task execution with detailed logs, performance metrics, and execution history."
              color="from-green-500 to-emerald-500"
              delay={300}
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Security"
              description="Role-based access control, audit logs, and secure API authentication with JWT tokens."
              color="from-indigo-500 to-purple-500"
              delay={400}
            />
            <FeatureCard
              icon={Zap}
              title="High Performance"
              description="Async execution engine with retry logic, rate limiting, and automatic failover handling."
              color="from-yellow-500 to-orange-500"
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-32 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              How it{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                works
              </span>
            </h2>
            <p className="text-xl text-slate-400">
              Get started in minutes with our simple three-step process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create Tasks',
                description: 'Define your tasks with custom commands, schedules, and configuration options.'
              },
              {
                step: '02',
                title: 'Set Dependencies',
                description: 'Link tasks together to create powerful workflows with conditional execution.'
              },
              {
                step: '03',
                title: 'Monitor & Optimize',
                description: 'Track execution in real-time and optimize with detailed analytics.'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 
                              hover:bg-slate-800/50 transition-all duration-300 group">
                  <div className="text-6xl font-bold text-slate-700 group-hover:text-blue-500/30 
                                transition-colors duration-300 mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 
                          rounded-3xl p-12 md:p-16 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
              
              <div className="relative z-10">
                <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to automate your workflows?
                </h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of teams already using QKron to streamline their task scheduling.
                  Start your free trial today.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    onClick={() => navigate('/register')}
                    size="lg"
                    className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 group"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-slate-400 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Free 14-day trial
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Cancel anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 border-t border-slate-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Logo size="md" showText={false} />
                <span className="font-heading text-2xl font-bold text-white">QKron</span>
              </div>
              <p className="text-slate-400 max-w-sm">
                The modern task scheduling platform for teams that demand reliability, 
                flexibility, and performance.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 QKron. All rights reserved.
            </p>
            <div className="flex gap-6 text-slate-500 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add custom styles for animations */}
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
