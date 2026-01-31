import { useState, useEffect, useMemo, useRef } from 'react';
import logo from '../../assets/educode_logo.png';
import {
    LayoutDashboard, MessageSquare, Plus, CheckCircle, Clock, Star, LogOut, Menu, X,
    Search, Filter, Moon, Sun, Send, ChevronRight, ArrowRight, HelpCircle, Loader2, MessageCircle
} from 'lucide-react';
import { API_URL } from '../../config';
import { useAlert } from '../../components/AlertContext';
import { useTheme } from '../../components/ThemeContext';
import TicketSkeleton from '../../components/TicketSkeleton';
import EmptyState from '../../components/EmptyState';
import TicketDetailModal from '../../components/TicketDetailModal';
import FloatingActionButton from '../../components/FloatingActionButton';
import SlideDrawer from '../../components/SlideDrawer';
import TicketTimeline, { generateTimelineEvents } from '../../components/TicketTimeline';
import Avatar from '../../components/Avatar';
import useKeyboardShortcuts, { ShortcutHint } from '../../hooks/useKeyboardShortcuts';
import { Button, Badge } from '../../components/ui';
import WelcomeBanner from '../../components/WelcomeBanner';
import AnnouncementBanner from '../../components/AnnouncementBanner';
import FAQSection from '../../components/FAQSection';
import QuickLinks from '../../components/QuickLinks';
import Confetti from '../../components/Confetti';
import { CopyableText } from '../../components/CopyButton';
import { FieldProgress } from '../../components/FormProgress';
import RefreshButton from '../../components/RefreshButton';
import ConnectionStatus from '../../components/ConnectionStatus';
import ScrollToTop from '../../components/ScrollToTop';

export default function StudentDashboard({ clientEmail, onLogout }) {
    const { showAlert, showToast } = useAlert();
    const { isDarkMode, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('overview');
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setLoading] = useState(true);

    const [ticket, setTicket] = useState({ category: 'Technical Support', description: '', whatsappNumber: '', consent: false });
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const descriptionRef = useRef(null);

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [drawerTicket, setDrawerTicket] = useState(null);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const searchInputRef = useRef(null);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        'ctrl+k': () => {
            setActiveTab('tickets');
            setTimeout(() => searchInputRef.current?.focus(), 100);
        },
        'escape': () => {
            setSelectedTicket(null);
            setDrawerTicket(null);
            setSidebarOpen(false);
        },
        'n': () => {
            setActiveTab('new');
            setTimeout(() => descriptionRef.current?.focus(), 100);
        }
    });

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => { fetchTickets(); }, [clientEmail]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('clientToken');
            const res = await fetch(`${API_URL}/api/tickets/history?email=${clientEmail}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
                setStats({
                    total: data.length,
                    open: data.filter(t => t.status === 'Open').length,
                    inProgress: data.filter(t => t.status === 'In Progress').length,
                    resolved: data.filter(t => t.status === 'Resolved').length
                });
            } else if (res.status === 401) {
                showAlert('Session expired. Please login again.', 'error');
                onLogout();
            }
        } catch (err) { console.error(err); showAlert('Failed to fetch tickets', 'error'); }
        finally { setLoading(false); }
    };

    const handleSubmitTicket = async () => {
        if (!ticket.description.trim()) return showAlert("Please describe your issue.", 'warning');
        if (ticket.description.length < 10) return showAlert("Description must be at least 10 characters.", 'warning');

        // Validate WhatsApp number
        if (!ticket.whatsappNumber) {
            return showAlert("WhatsApp number is required.", 'warning');
        }

        const digitsOnly = ticket.whatsappNumber.replace(/[^0-9]/g, '');
        const last10 = digitsOnly.slice(-10);
        if (last10.length !== 10) {
            return showAlert("Please enter a valid 10-digit phone number.", 'warning');
        }
        if (!ticket.consent) return showAlert("Please check the consent box.", 'warning');

        if ((stats.open + (stats.inProgress || 0)) >= 5) return showAlert("You have reached the limit of 5 open tickets.", 'warning');

        setIsSubmittingTicket(true);
        try {
            const token = localStorage.getItem('clientToken');
            const res = await fetch(`${API_URL}/api/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...ticket, email: clientEmail }),
            });
            if (res.ok) {
                setTicket({ category: 'Technical Support', description: '', whatsappNumber: '', consent: false });
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
                showToast('Ticket Created Successfully!', 'success');
                setActiveTab('tickets');
                fetchTickets();
            } else showAlert('Failed to create ticket', 'error');
        } catch (err) { showAlert('Failed to create ticket', 'error'); }
        finally { setIsSubmittingTicket(false); }
    };

    const handleSubmitFeedback = async (ticketId, feedbackData) => {
        if (feedbackData.rating === 0) return showAlert("Please select a star rating.", 'warning');
        try {
            const res = await fetch(`${API_URL} /api/tickets / ${ticketId}/feedback`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData)
            });
            if (res.ok) {
                setSelectedTicket(null);
                showToast('Thanks for your feedback!', 'success');
                fetchTickets();
            } else showAlert('Failed to submit feedback', 'error');
        } catch (err) { showAlert('Failed to submit feedback', 'error'); }
    };

    // Filtered tickets with search highlighting
    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const matchesFilter = filter === 'All' || t.status === filter;
            const matchesSearch = t.description.toLowerCase().includes(debouncedSearch.toLowerCase()) || t.id.includes(debouncedSearch);
            return matchesFilter && matchesSearch;
        });
    }, [tickets, filter, debouncedSearch]);

    // Highlight matching text
    const highlightText = (text, query) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <mark key={i} className="bg-amber-500/30 px-0.5 rounded">{part}</mark>
                : part
        );
    };

    const categoryOptions = [
        { value: 'Technical Support', label: 'Technical Support', icon: '🔧' },
        { value: 'Course Enquiry', label: 'Course Enquiry', icon: '📚' },
        { value: 'Access Issue', label: 'Access Issue', icon: '🔐' },
        { value: 'Report a Bug', label: 'Report a Bug', icon: '🐛' },
        { value: 'Feedback / Suggestion', label: 'Feedback / Suggestion', icon: '💡' },
        { value: 'Other', label: 'Other', icon: '📝' },
    ];

    const NavButton = ({ icon: Icon, label, tab, badge }) => (
        <button
            onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
            className={`nav-item w-full group ${activeTab === tab ? 'active' : ''}`}
        >
            <Icon size={18} className="transition-transform group-hover:scale-110" />
            <span className="flex-1 text-left font-medium text-sm">{label}</span>
            {badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-500 text-white rounded-full min-w-[20px] text-center">
                    {badge}
                </span>
            )}
            {activeTab === tab && !badge && <ChevronRight size={16} />}
        </button>
    );

    const StatCard = ({ label, value, icon: Icon, variant, delay }) => (
        <div className={`stat-card stat-card-${variant} group animate-slide-up stagger-${delay}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="theme-text-muted text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
                    <h3 className="text-3xl font-bold theme-text">{value}</h3>
                </div>
                <div className={`icon-box icon-box-${variant}`}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );

    const descriptionLength = ticket.description.length;
    const maxDescription = 500;

    return (
        <div className="min-h-screen gradient-mesh flex">
            {/* Confetti celebration */}
            <Confetti trigger={showConfetti} />

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 z-30 flex flex-col`}>
                {/* Logo */}
                <div className="p-5 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="EduCode" className="w-10 h-10 object-contain drop-shadow-sm" />
                        <div>
                            <h1 className="font-semibold theme-text">TheEduCode</h1>
                            <p className="text-xs theme-text-muted">Support Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1 flex-1">
                    <NavButton icon={LayoutDashboard} label="Overview" tab="overview" />
                    <NavButton icon={MessageSquare} label="My Tickets" tab="tickets" badge={stats.open + (stats.inProgress || 0)} />
                    <NavButton icon={Plus} label="New Ticket" tab="new" />
                    <NavButton icon={HelpCircle} label="Help & FAQ" tab="help" />

                    {/* Shortcut hints */}
                    <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                        <p className="text-xs theme-text-muted uppercase tracking-wide mb-3 px-2">Shortcuts</p>
                        <div className="space-y-2 text-xs theme-text-muted px-2">
                            <div className="flex justify-between items-center">
                                <span>Search</span>
                                <ShortcutHint keys={['Ctrl', 'K']} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>New Ticket</span>
                                <ShortcutHint keys={['N']} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Close</span>
                                <ShortcutHint keys={['Esc']} />
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-[var(--color-border)] space-y-2">
                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="nav-item w-full">
                        {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
                        <span className="flex-1 text-left text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    {/* User Info */}
                    <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-hover)]">
                        <div className="flex items-center gap-3">
                            <Avatar email={clientEmail} size="sm" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs theme-text-muted">Logged in as</p>
                                <p className="text-sm theme-text truncate font-medium">{clientEmail}</p>
                            </div>
                        </div>
                    </div>

                    <button onClick={onLogout} className="nav-item w-full hover:!text-red-500 hover:!bg-red-500/10">
                        <LogOut size={16} />
                        <span className="flex-1 text-left text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] p-4 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[var(--color-primary)] rounded-[var(--radius-md)] flex items-center justify-center">
                        <img src={logo} alt="EduCode" className="w-5 h-5 object-contain" />
                    </div>
                    <span className="font-semibold theme-text">EduCode</span>
                </div>
                <button onClick={() => setSidebarOpen(true)} className="theme-text p-2 hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-sm)] transition-colors">
                    <Menu size={20} />
                </button>
            </div>
            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0">
                <div className="p-6 md:p-8 max-w-5xl mx-auto">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in">
                            {/* Welcome Banner */}
                            <WelcomeBanner
                                userEmail={clientEmail}
                                stats={{ resolved: stats.resolved, pending: stats.open + (stats.inProgress || 0) }}
                            />

                            {/* Announcements */}
                            <AnnouncementBanner />

                            {/* Stats Grid */}
                            {isLoading ? (
                                <TicketSkeleton variant="stat" />
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <StatCard label="Total" value={stats.total} icon={MessageSquare} variant="primary" delay={1} />
                                    <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} variant="success" delay={2} />
                                    <StatCard label="Open" value={stats.open} icon={Clock} variant="warning" delay={3} />
                                    <StatCard label="In Progress" value={stats.inProgress || 0} icon={Loader2} variant="info" delay={4} />
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={() => setActiveTab('new')}
                                    className="card-interactive card-primary-hover p-5 text-left group animate-slide-up stagger-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="icon-box icon-box-primary">
                                            <Plus size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium theme-text">Create New Ticket</h3>
                                            <p className="theme-text-muted text-sm mt-0.5">Get help from our support team</p>
                                        </div>
                                        <ArrowRight size={18} className="theme-text-muted group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab('tickets')}
                                    className="card-interactive card-primary-hover p-5 text-left group animate-slide-up stagger-5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="icon-box icon-box-success">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium theme-text">View All Tickets</h3>
                                            <p className="theme-text-muted text-sm mt-0.5">Check your ticket history</p>
                                        </div>
                                        <ArrowRight size={18} className="theme-text-muted group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>
                            </div>

                            {/* Recent Activity */}
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-medium theme-text flex items-center gap-2">
                                        <Clock size={16} className="theme-text-muted" />
                                        Recent Tickets
                                    </h3>
                                    {tickets.length > 3 && (
                                        <button onClick={() => setActiveTab('tickets')} className="text-sm text-[var(--color-primary)] hover:underline font-medium">
                                            View all
                                        </button>
                                    )}
                                </div>
                                {isLoading ? <TicketSkeleton count={3} /> : tickets.length === 0 ? (
                                    <EmptyState type="no-tickets" onAction={() => setActiveTab('new')} isDarkMode={isDarkMode} />
                                ) : (
                                    <div className="space-y-3">
                                        {tickets.slice(0, 3).map((t, idx) => (
                                            <div
                                                key={t.id}
                                                onClick={() => setDrawerTicket(t)}
                                                className={`p-4 rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] cursor-pointer transition-all hover:-translate-y-0.5 animate-slide-in stagger-${idx + 1}`}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="theme-text text-sm font-medium truncate">{t.description.slice(0, 60)}...</p>
                                                        <p className="theme-text-muted text-xs mt-1.5">#{t.id.slice(0, 8)} • {new Date(t.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <Badge variant={t.status === 'Resolved' ? 'success' : 'warning'} size="sm">{t.status}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TICKETS TAB */}
                    {activeTab === 'tickets' && (
                        <div className="animate-fade-in">
                            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-semibold theme-text">My Tickets</h2>
                                    <p className="theme-text-muted text-sm mt-1">View and manage your support history.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RefreshButton onClick={fetchTickets} isLoading={isLoading} />
                                    <Button onClick={() => setActiveTab('new')} size="sm" className="btn-glow active:scale-95 transition-transform"><Plus size={16} /> New Ticket</Button>
                                </div>
                            </header>

                            {/* Filters */}
                            <div className="flex flex-col md:flex-row gap-3 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted" size={16} />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search tickets... (Ctrl+K)"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] theme-text placeholder:theme-text-muted focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-subtle)] outline-none text-sm transition-all"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter size={16} className="theme-text-muted" />
                                    <select
                                        className="px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] theme-text outline-none text-sm min-w-[140px] focus:border-[var(--color-primary)] transition-colors cursor-pointer"
                                        value={filter}
                                        onChange={e => setFilter(e.target.value)}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>
                            </div>

                            {/* Ticket Count */}
                            {filteredTickets.length > 0 && (
                                <p className="theme-text-muted text-sm mb-4">
                                    Showing {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
                                    {debouncedSearch && ` matching "${debouncedSearch}"`}
                                </p>
                            )}

                            {/* Ticket List */}
                            <div className="space-y-4">
                                {isLoading ? (
                                    <TicketSkeleton count={5} />
                                ) : filteredTickets.length === 0 ? (
                                    <EmptyState
                                        type={tickets.length === 0 ? "no-tickets" : "no-results"}
                                        onAction={() => tickets.length === 0 ? setActiveTab('new') : setSearch('')}
                                        isDarkMode={isDarkMode}
                                    />
                                ) : filteredTickets.map((t, idx) => (
                                    <div
                                        key={t.id}
                                        onClick={() => setDrawerTicket(t)}
                                        className={`card p-5 hover:border-[var(--color-border-hover)] cursor-pointer transition-all hover:-translate-y-0.5 animate-slide-up stagger-${(idx % 5) + 1}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant={t.status === 'Open' ? 'warning' : t.status === 'In Progress' ? 'info' : 'success'} size="sm">
                                                    {t.status}
                                                </Badge>
                                                <span className="theme-text-muted text-xs font-mono bg-[var(--color-surface-hover)] px-2 py-0.5 rounded">#{t.id.slice(0, 8)}</span>
                                                <span className="theme-text-muted text-xs">•</span>
                                                <span className="theme-text-muted text-xs">{t.category}</span>
                                            </div>
                                            <span className="theme-text-muted text-xs">{new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <p className="theme-text-secondary text-sm leading-relaxed mb-3">
                                            {debouncedSearch ? highlightText(t.description.slice(0, 150), debouncedSearch) : t.description.slice(0, 150)}
                                            {t.description.length > 150 && '...'}
                                        </p>

                                        {/* Quick Info */}
                                        <div className="flex items-center gap-4 text-xs theme-text-muted">
                                            {t.adminRemark && (
                                                <span className="flex items-center gap-1 text-[var(--color-primary)]">
                                                    <CheckCircle size={12} /> Has response
                                                </span>
                                            )}
                                            {t.userRating && (
                                                <span className="flex items-center gap-1 text-amber-500">
                                                    <Star size={12} className="fill-current" /> Rated {t.userRating}/5
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* NEW TICKET TAB */}
                    {activeTab === 'new' && (
                        <div className="max-w-xl mx-auto animate-fade-in">
                            <header className="mb-6 text-center">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--color-primary)] rounded-[var(--radius-lg)] mb-4 shadow-md">
                                    <Plus size={28} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-semibold theme-text">Create New Ticket</h2>
                                <p className="theme-text-muted text-sm mt-1">Describe your issue and we'll help you out.</p>
                            </header>

                            <div className="card p-6 space-y-5">
                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium theme-text mb-2">Issue Category</label>
                                    <select
                                        value={ticket.category}
                                        onChange={e => setTicket({ ...ticket, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] theme-text outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-subtle)] transition-all cursor-pointer"
                                    >
                                        {categoryOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-sm font-medium theme-text mb-2 block">Description</label>
                                    <textarea
                                        ref={descriptionRef}
                                        placeholder="Please describe your issue in detail..."
                                        value={ticket.description}
                                        onChange={e => setTicket({ ...ticket, description: e.target.value.slice(0, maxDescription) })}
                                        className={`w-full px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] border theme-text placeholder:theme-text-muted focus:ring-2 focus:ring-[var(--color-primary-subtle)] outline-none min-h-[140px] resize-none transition-all ${descriptionLength < 10 && descriptionLength > 0
                                            ? 'border-amber-500 focus:border-amber-500'
                                            : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'
                                            }`}
                                    />
                                    <div className="mt-2">
                                        <FieldProgress value={descriptionLength} max={maxDescription} warningThreshold={0.9} />
                                    </div>
                                    {descriptionLength > 0 && descriptionLength < 10 && (
                                        <p className="text-xs text-amber-500 mt-1">Please provide at least 10 characters</p>
                                    )}
                                </div>

                                {/* WhatsApp */}
                                <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                                    <label className="text-sm font-medium theme-text mb-3 flex items-center gap-2">
                                        <MessageCircle size={16} className="text-[var(--color-primary)]" />
                                        WhatsApp Updates (Required)
                                    </label>
                                    <div className="space-y-3 mt-3">
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 py-3 rounded-l-[var(--radius-md)] bg-[var(--color-primary-subtle)] border border-r-0 border-[var(--color-border)] text-sm font-medium text-[var(--color-primary)]">
                                                +91
                                            </span>
                                            <input
                                                type="tel"
                                                placeholder="98765 43210"
                                                value={ticket.whatsappNumber}
                                                onChange={e => {
                                                    // Only allow digits and limit to 10
                                                    const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                                    setTicket({ ...ticket, whatsappNumber: digits });
                                                }}
                                                maxLength={10}
                                                className="flex-1 px-4 py-3 rounded-r-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] theme-text placeholder:theme-text-muted focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-subtle)] outline-none transition-all"
                                            />
                                        </div>
                                        <label className="flex items-start gap-3 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                className="mt-0.5 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
                                                checked={ticket.consent}
                                                onChange={e => setTicket({ ...ticket, consent: e.target.checked })}
                                            />
                                            <span className="text-sm theme-text-secondary leading-relaxed">
                                                I authorize EduCode to send support updates via WhatsApp.
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Submit */}
                                <Button
                                    onClick={handleSubmitTicket}
                                    loading={isSubmittingTicket}
                                    disabled={!ticket.description.trim() || ticket.description.length < 10}
                                    className="w-full btn-glow active:scale-[0.98] transition-transform"
                                >
                                    {!isSubmittingTicket && <>Submit Ticket <Send size={16} /></>}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* HELP & FAQ TAB */}
                    {activeTab === 'help' && (
                        <div className="animate-fade-in">
                            <header className="mb-8">
                                <h2 className="text-2xl font-semibold theme-text">Help & FAQ</h2>
                                <p className="theme-text-muted text-sm mt-1">Find answers to common questions and helpful resources.</p>
                            </header>

                            <div className="grid gap-6 md:grid-cols-2 mb-8">
                                {/* Quick Action Cards */}
                                <button
                                    onClick={() => setActiveTab('new')}
                                    className="card-interactive card-primary-hover p-5 text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="icon-box icon-box-primary">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium theme-text">Still Need Help?</h3>
                                            <p className="theme-text-muted text-sm mt-0.5">Create a support ticket</p>
                                        </div>
                                        <ArrowRight size={18} className="theme-text-muted group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>

                                <div className="card p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="icon-box icon-box-success">
                                            <Clock size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium theme-text">Support Hours</h3>
                                            <p className="theme-text-muted text-sm mt-0.5">Mon - Sat, 9 AM - 9 PM IST</p>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/* Quick Links */}
                            <QuickLinks />
                        </div>
                    )}
                </div>
            </main>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onSubmitFeedback={handleSubmitFeedback}
                    isDarkMode={isDarkMode}
                    email={clientEmail}
                />
            )}

            {/* Quick View Drawer */}
            <SlideDrawer
                isOpen={!!drawerTicket}
                onClose={() => setDrawerTicket(null)}
                title="Ticket Details"
            >
                {drawerTicket && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={drawerTicket.status === 'Open' ? 'warning' : drawerTicket.status === 'In Progress' ? 'info' : 'success'}>
                                {drawerTicket.status}
                            </Badge>
                            <span className="text-xs font-mono theme-text-muted">#{drawerTicket.id.slice(0, 8)}</span>
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-sm font-medium theme-text mb-2">Description</h4>
                            <p className="theme-text-secondary text-sm leading-relaxed">{drawerTicket.description}</p>
                        </div>

                        {/* Timeline */}
                        <div>
                            <h4 className="text-sm font-medium theme-text mb-3">Activity Timeline</h4>
                            <TicketTimeline events={generateTimelineEvents(drawerTicket)} />
                        </div>

                        {/* Admin Response */}
                        {drawerTicket.adminRemark && (
                            <div className="p-4 bg-[var(--color-primary-subtle)] rounded-[var(--radius-md)] border-l-3 border-l-[var(--color-primary)]" style={{ borderLeftWidth: '3px' }}>
                                <h4 className="text-sm font-medium theme-text mb-2 flex items-center gap-2">
                                    <CheckCircle size={14} className="text-[var(--color-primary)]" />
                                    Admin Response
                                </h4>
                                <p className="theme-text-secondary text-sm">{drawerTicket.adminRemark}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="flex-1"
                                onClick={() => { setSelectedTicket(drawerTicket); setDrawerTicket(null); }}
                            >
                                Full Details
                            </Button>
                            {drawerTicket.status === 'Resolved' && !drawerTicket.userRating && (
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => { setSelectedTicket(drawerTicket); setDrawerTicket(null); }}
                                >
                                    <Star size={14} /> Give Feedback
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </SlideDrawer>

            {/* Floating Action Button (Mobile) */}
            <FloatingActionButton
                onClick={() => setActiveTab('new')}
                pulse={stats.open < 5}
            />

            {/* Connection Status */}
            <ConnectionStatus />

            {/* Scroll to Top */}
            <ScrollToTop />
        </div>
    );
}
