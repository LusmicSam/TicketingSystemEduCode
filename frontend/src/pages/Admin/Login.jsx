import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { Loader2, Lock, Mail, ArrowRight, Shield, Sparkles, Zap, Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/educode_logo.png';
import { useAlert } from '../../components/AlertContext';
import { useTheme } from '../../components/ThemeContext';
import { Button, Card, Input } from '../../components/ui';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { showAlert } = useAlert();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return showAlert('Please fill in all fields', 'warning');

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.admin));
                navigate('/sse/educode/ad/min/dashboard');
            } else {
                showAlert(data.error || 'Login failed', 'error');
            }
        } catch (err) {
            showAlert('Network error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 gradient-mesh relative overflow-hidden">
                {/* Decorative Orbs */}
                <div className="orb orb-primary w-80 h-80 top-10 left-10 animate-float"></div>
                <div className="orb orb-secondary w-96 h-96 bottom-10 right-10 animate-float" style={{ animationDelay: '1.5s' }}></div>
                <div className="orb orb-accent w-72 h-72 top-1/2 left-1/3 animate-float" style={{ animationDelay: '3s' }}></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `linear-gradient(var(--color-text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-muted) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center p-16">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse-glow">
                            <img src={logo} alt="EduCode" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold theme-text">EduCode</h1>
                            <p className="text-indigo-400">Admin Portal</p>
                        </div>
                    </div>

                    <h2 className="text-5xl font-bold theme-text leading-tight mb-6">
                        Manage Support<br />
                        <span className="text-gradient-primary">Like a Pro</span>
                    </h2>

                    <p className="theme-text-secondary text-lg max-w-md mb-10">
                        Powerful dashboard to resolve student queries, track performance, and streamline your support workflow.
                    </p>

                    <div className="space-y-5">
                        <div className="flex items-center gap-4 theme-text-secondary group">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <Shield size={22} />
                            </div>
                            <span className="text-lg">Secure JWT Authentication</span>
                        </div>
                        <div className="flex items-center gap-4 theme-text-secondary group">
                            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                                <Sparkles size={22} />
                            </div>
                            <span className="text-lg">Real-time Ticket Management</span>
                        </div>
                        <div className="flex items-center gap-4 theme-text-secondary group">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <Zap size={22} />
                            </div>
                            <span className="text-lg">Advanced Analytics</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 theme-bg flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30 animate-pulse-glow">
                            <img src={logo} alt="EduCode" className="w-10 h-10 object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold theme-text">EduCode Admin</h1>
                    </div>

                    <div className="theme-surface rounded-3xl border theme-border p-8 animate-scale-in relative overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl"></div>

                        <div className="relative">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-2xl text-indigo-400 mb-4">
                                    <Lock size={32} />
                                </div>
                                <h2 className="text-2xl font-bold theme-text">Welcome Back</h2>
                                <p className="theme-text-muted text-sm mt-2">Sign in to access the admin dashboard</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                <Input
                                    icon={Mail}
                                    type="email"
                                    placeholder="admin@support.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    label="Email Address"
                                />

                                <div className="relative">
                                    <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-2">Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-muted" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3.5 rounded-xl theme-surface border theme-border theme-text placeholder:theme-text-muted focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    loading={loading}
                                    size="lg"
                                    className="w-full mt-6 btn-glow"
                                >
                                    {!loading && <>Sign In <ArrowRight size={18} /></>}
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t theme-border text-center">
                                <p className="text-xs theme-text-muted">
                                    Protected area. Unauthorized access is prohibited.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs theme-text-muted mt-6">
                        © 2026 EduCode Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
