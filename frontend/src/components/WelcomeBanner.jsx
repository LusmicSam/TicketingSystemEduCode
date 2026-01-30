import { Sparkles, Clock, TrendingUp } from 'lucide-react';

/**
 * Welcome Banner with personalized greeting - Industry Level
 */
export default function WelcomeBanner({ userEmail, stats = {} }) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
        if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
        if (hour < 21) return { text: 'Good evening', emoji: '🌅' };
        return { text: 'Good evening', emoji: '🌙' };
    };

    const getUserName = () => {
        if (!userEmail) return 'there';
        const name = userEmail.split('@')[0];
        // Capitalize first letter
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const greeting = getGreeting();
    const resolutionRate = stats.resolved && (stats.resolved + stats.pending) > 0
        ? Math.round((stats.resolved / (stats.resolved + stats.pending)) * 100)
        : 0;

    return (
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 p-6 md:p-8 mb-8 animate-fade-in">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
                <p className="text-white/70 text-sm font-medium tracking-wide">
                    {greeting.emoji} {greeting.text}
                </p>

                <h1 className="text-2xl md:text-3xl font-semibold text-white mt-1 tracking-tight">
                    Welcome back, {getUserName()}
                </h1>

                <p className="text-white/60 text-sm mt-2 max-w-lg leading-relaxed">
                    Your support dashboard is ready. Create a new ticket or track existing requests below.
                </p>

                {/* Stats Pills - Cleaner design */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                        <Sparkles size={14} className="text-amber-300" />
                        <span className="text-white text-sm font-medium">{stats.resolved || 0} Resolved</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                        <Clock size={14} className="text-white/60" />
                        <span className="text-white text-sm font-medium">{stats.pending || 0} In Progress</span>
                    </div>
                    {resolutionRate > 0 && (
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                            <TrendingUp size={14} className="text-green-300" />
                            <span className="text-white text-sm font-medium">{resolutionRate}% Resolution Rate</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
