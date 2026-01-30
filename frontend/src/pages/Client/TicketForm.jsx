import { useState, useEffect } from 'react';
import logo from '../../assets/educode_logo.png';
import StudentDashboard from './StudentDashboard';
import { Mail, Lock, Send, Loader2, ArrowRight, CheckCircle, Sparkles, Shield, Zap } from 'lucide-react';
import { API_URL } from '../../config';
import { AlertProvider, useAlert } from '../../components/AlertContext';
import { useTheme } from '../../components/ThemeContext';
import { Button, Card, Input } from '../../components/ui';

function TicketFormContent() {
    const { showAlert, showToast } = useAlert();
    const { isDarkMode } = useTheme();
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem('clientEmail');
        if (storedEmail) {
            setEmail(storedEmail);
            setIsVerified(true);
        }
    }, []);

    const handleSendOtp = async () => {
        if (!email || !email.includes('@')) return showAlert('Enter a valid email', 'warning');
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                setStep('otp');
                showToast('OTP sent! Check your inbox.', 'success');
            } else {
                showAlert(data.error || 'Failed to send OTP', 'error');
            }
        } catch (err) {
            showAlert('Failed to send OTP', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) return showAlert('OTP must be 6 digits', 'warning');
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('clientEmail', email);
                setIsVerified(true);
            } else {
                showAlert(data.error || 'Verification failed', 'error');
            }
        } catch (err) {
            showAlert('Verification failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('clientEmail');
        setIsVerified(false);
        setEmail('');
        setOtp('');
        setStep('email');
    };

    if (isVerified) {
        return <StudentDashboard clientEmail={email} onLogout={handleLogout} />;
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 gradient-mesh relative overflow-hidden">
                {/* Decorative Orbs */}
                <div className="orb orb-primary w-80 h-80 top-10 left-10 animate-float"></div>
                <div className="orb orb-secondary w-96 h-96 bottom-10 right-10 animate-float" style={{ animationDelay: '1.5s' }}></div>
                <div className="orb orb-accent w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '3s' }}></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `linear-gradient(var(--color-text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-muted) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center p-16">
                    <div className="flex items-center gap-4 mb-8">
                        <img src={logo} alt="TheEduCode" className="w-16 h-16 object-contain drop-shadow-xl" />
                        <div>
                            <h1 className="text-4xl font-bold theme-text">TheEduCode</h1>
                            <p className="text-indigo-400">Student Support Portal</p>
                        </div>
                    </div>

                    <h2 className="text-5xl font-bold theme-text leading-tight mb-6">
                        Get Help,<br />
                        <span className="text-gradient-primary">Anytime.</span>
                    </h2>

                    <p className="theme-text-secondary text-lg max-w-md mb-10">
                        Our dedicated support team is here to help you with any questions about your courses, technical issues, or account problems.
                    </p>

                    <div className="space-y-5">
                        <div className="flex items-center gap-4 theme-text-secondary group">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <Zap size={22} />
                            </div>
                            <span className="text-lg">Fast Response Times</span>
                        </div>
                        <div className="flex items-center gap-4 theme-text-secondary group">
                            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                                <Shield size={22} />
                            </div>
                            <span className="text-lg">Secure OTP Verification</span>
                        </div>
                        <div className="flex items-center gap-4 theme-text-secondary group">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <CheckCircle size={22} />
                            </div>
                            <span className="text-lg">Real-time Ticket Tracking</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 theme-bg flex items-center justify-center p-8">
                <div className="w-full max-w-md relative">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <img src={logo} alt="TheEduCode" className="w-16 h-16 object-contain drop-shadow-sm mb-4" />
                        <h1 className="text-2xl font-bold theme-text">TheEduCode Support</h1>
                    </div>

                    <div className="theme-surface rounded-3xl border theme-border p-8 animate-scale-in relative overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl"></div>

                        <div className="relative">
                            {step === 'email' ? (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-2xl text-indigo-400 mb-4">
                                            <Mail size={32} />
                                        </div>
                                        <h2 className="text-2xl font-bold theme-text">Welcome</h2>
                                        <p className="theme-text-muted text-sm mt-2">Enter your email to get started</p>
                                    </div>

                                    <div className="space-y-5">
                                        <Input
                                            icon={Mail}
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            label="Email Address"
                                        />

                                        <Button
                                            onClick={handleSendOtp}
                                            loading={isLoading}
                                            size="lg"
                                            className="w-full btn-glow"
                                        >
                                            {!isLoading && <>Continue <ArrowRight size={18} /></>}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl text-emerald-400 mb-4 animate-bounce-subtle">
                                            <Lock size={32} />
                                        </div>
                                        <h2 className="text-2xl font-bold theme-text">Check Your Email</h2>
                                        <p className="theme-text-muted text-sm mt-2">We've sent a 6-digit code to<br /><span className="text-indigo-400 font-medium">{email}</span></p>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-2">Verification Code</label>
                                            <input
                                                type="text"
                                                maxLength={6}
                                                className="w-full text-center text-3xl font-mono tracking-[0.5em] theme-surface border theme-border rounded-xl py-4 theme-text placeholder:theme-text-muted focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                                placeholder="••••••"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            />
                                        </div>

                                        <Button
                                            onClick={handleVerifyOtp}
                                            loading={isLoading}
                                            size="lg"
                                            className="w-full btn-glow"
                                        >
                                            {!isLoading && <>Verify & Continue <CheckCircle size={18} /></>}
                                        </Button>

                                        <button
                                            onClick={() => { setStep('email'); setOtp(''); }}
                                            className="w-full text-center text-sm theme-text-muted hover:theme-text transition-colors underline underline-offset-4"
                                        >
                                            Use a different email
                                        </button>
                                    </div>
                                </>
                            )}
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

export default function TicketForm() {
    return (
        <AlertProvider>
            <TicketFormContent />
        </AlertProvider>
    );
}
