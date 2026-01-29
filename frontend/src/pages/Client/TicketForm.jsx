import { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import logo from '../../assets/educode_logo.png';
import StudentDashboard from './StudentDashboard';

export default function TicketForm() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Theme Colors
    const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all";
    const buttonClass = "w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    useEffect(() => {
        const savedToken = localStorage.getItem('clientToken');
        const savedEmail = localStorage.getItem('clientEmail');
        if (savedToken && savedEmail) {
            setEmail(savedEmail);
            setStep(3); // Go straight to Dashboard
        }
    }, []);

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            await fetch('http://localhost:5000/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            setStep(2);
        } catch (err) { alert('Failed to send OTP'); }
        finally { setLoading(false); }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('clientToken', data.token);
                localStorage.setItem('clientEmail', data.user.email);
                setStep(3);
            } else alert('Invalid OTP');
        } catch (err) { alert('Verify Failed'); }
        finally { setLoading(false); }
    };

    const handleLogout = () => {
        localStorage.clear();
        setStep(1);
        setEmail('');
        setOtp('');
    };

    if (step === 3) {
        return <StudentDashboard clientEmail={email} onLogout={handleLogout} />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="mb-8 relative z-10 text-center">
                    <img src={logo} alt="EduCode" className="w-12 h-12 object-contain mb-2 mx-auto" />
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">EduCode</h1>
                    <p className="text-slate-400 text-sm mt-1">Student Support Portal</p>
                </div>

                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="text-center space-y-2 mb-8">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
                                <Send size={32} />
                            </div>
                            <h2 className="text-xl font-semibold">Welcome Back</h2>
                            <p className="text-slate-400 text-sm">Enter your registered email to continue</p>
                        </div>
                        <input type="email" placeholder="student@university.edu" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} />
                        <button onClick={handleSendOtp} disabled={loading} className={buttonClass}>
                            {loading ? <Loader2 className="animate-spin" /> : "Send Login Code"}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-semibold">Verify Identity</h2>
                            <p className="text-slate-400 text-sm">We sent a code to <span className="text-white">{email}</span></p>
                        </div>
                        <input type="text" placeholder="000000" maxLength={6} className={`${inputClass} text-center text-2xl tracking-[0.5em] font-mono`} value={otp} onChange={e => setOtp(e.target.value)} />
                        <button onClick={handleVerifyOtp} disabled={loading} className={buttonClass}>
                            {loading ? <Loader2 className="animate-spin" /> : "Verify & Login"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
