import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/educode_logo.png';
import { LayoutDashboard, MessageSquare, Plus, CheckCircle, Clock, Star, LogOut, Menu, X, Search, Filter, MessageCircle, Moon, Sun } from 'lucide-react';
import { API_URL } from '../../config';

export default function StudentDashboard({ clientEmail, onLogout }) {
    const [activeTab, setActiveTab] = useState('overview'); // overview, tickets, new
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    // New Ticket State
    const [ticket, setTicket] = useState({ category: 'Enquiry', description: '', whatsappNumber: '', consent: false });
    const [loading, setLoading] = useState(false);

    // Feedback State
    const [activeFeedbackId, setActiveFeedbackId] = useState(null);
    const [feedbackData, setFeedbackData] = useState({ rating: 0, feedback: '' });

    // Components State
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchTickets();
    }, [clientEmail]);

    const fetchTickets = async () => {
        try {
            const res = await fetch(`${API_URL}/api/tickets/history?email=${clientEmail}`);
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
                // Calculate Stats
                setStats({
                    total: data.length,
                    open: data.filter(t => t.status === 'Open').length,
                    resolved: data.filter(t => t.status === 'Resolved').length
                });
            }
        } catch (err) { console.error(err); }
    };

    const handleSubmitTicket = async () => {
        if (ticket.whatsappNumber && !ticket.consent) return alert("Please check the consent box.");

        // Basic Phone Validation (10-15 digits, optional +)
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (ticket.whatsappNumber && !phoneRegex.test(ticket.whatsappNumber.replace(/\s/g, ''))) {
            return alert("Please enter a valid WhatsApp number.");
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...ticket, email: clientEmail }),
            });
            if (res.ok) {
                setTicket({ category: 'Enquiry', description: '', whatsappNumber: '', consent: false });
                alert('Ticket Created Successfully!');
                setActiveTab('tickets');
                fetchTickets();
            }
        } catch (err) { alert('Failed'); }
        finally { setLoading(false); }
    };

    const handleSubmitFeedback = async (ticketId) => {
        if (feedbackData.rating === 0) return alert("Please select a star rating.");
        try {
            const res = await fetch(`${API_URL}/api/tickets/${ticketId}/feedback`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData)
            });
            if (res.ok) {
                setActiveFeedbackId(null);
                setFeedbackData({ rating: 0, feedback: '' });
                fetchTickets();
            }
        } catch (err) { alert('Failed to submit feedback'); }
    };

    // Filter Logic
    const filteredTickets = tickets.filter(t => {
        const matchesFilter = filter === 'All' || t.status === filter;
        const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search);
        return matchesFilter && matchesSearch;
    });

    // Styles
    const baseBg = isDarkMode ? "bg-slate-950" : "bg-gray-50";
    const sidebarBg = isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200";
    const textPrimary = isDarkMode ? "text-slate-200" : "text-gray-800";
    const textSecondary = isDarkMode ? "text-slate-400" : "text-gray-500";
    const cardClass = isDarkMode
        ? "bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl"
        : "bg-white border border-gray-200 rounded-2xl p-6 shadow-xl";
    const inputClass = isDarkMode
        ? "bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full placeholder:text-slate-500"
        : "bg-gray-50 border border-gray-300 text-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full placeholder:text-gray-400";
    const btnClass = "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2";

    const dropdownOptionClass = isDarkMode ? "bg-slate-900 text-slate-200" : "bg-white text-gray-800";

    return (
        <div className={`min-h-screen ${baseBg} ${textPrimary} flex transition-colors duration-300`}>
            {/* Sidebar (Desktop) */}
            <aside className={`fixed inset-y-0 left-0 ${sidebarBg} border-r w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30 flex flex-col`}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <img src={logo} alt="EduCode" className="w-10 h-10 object-contain" />
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-indigo-300">EduCode</h1>
                    </div>
                    {/* Removed Student Portal Text */}
                </div>
                <nav className="px-4 space-y-2 flex-1">
                    <button onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : `${textSecondary} hover:bg-indigo-500/10 hover:text-indigo-500`}`}>
                        <LayoutDashboard size={20} /> Overview
                    </button>
                    <button onClick={() => { setActiveTab('tickets'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : `${textSecondary} hover:bg-indigo-500/10 hover:text-indigo-500`}`}>
                        <MessageSquare size={20} /> My Tickets
                    </button>
                    <button onClick={() => { setActiveTab('new'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'new' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : `${textSecondary} hover:bg-indigo-500/10 hover:text-indigo-500`}`}>
                        <Plus size={20} /> New Ticket
                    </button>
                </nav>
                <div className="px-4 mb-4">
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-100 text-orange-500 hover:bg-gray-200'}`}>
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />} {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>
                <div className="px-6 pb-6 mt-auto">
                    <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-100 border-gray-200'} p-4 rounded-xl border mb-4`}>
                        <p className={`text-xs ${textSecondary}`}>Logged in as</p>
                        <p className={`text-sm font-medium ${textPrimary} truncate`}>{clientEmail}</p>
                    </div>
                    <button onClick={onLogout} className={`w-full flex items-center gap-2 ${textSecondary} hover:text-red-500 transition-colors text-sm px-2`}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen relative">
                {/* Mobile Header */}
                <div className={`md:hidden flex items-center justify-between p-4 border-b ${sidebarBg} backdrop-blur-md sticky top-0 z-20`}>
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="EduCode" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-lg">EduCode</span>
                    </div>
                    <button onClick={() => setSidebarOpen(true)} className={textPrimary}><Menu size={24} /></button>
                </div>
                {/* Overlay for mobile sidebar */}
                {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

                <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <>
                            <header className="mb-8">
                                <h2 className={`text-3xl font-bold ${textPrimary}`}>Welcome Back</h2>
                                <p className={`${textSecondary} mt-2`}>Track and manage your support requests.</p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className={`${cardClass} bg-indigo-900/20 border-indigo-500/30`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`${textSecondary} text-sm font-medium uppercase`}>Total Tickets</p>
                                            <h3 className={`text-4xl font-bold ${textPrimary} mt-2`}>{stats.total}</h3>
                                        </div>
                                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><MessageSquare size={24} /></div>
                                    </div>
                                </div>
                                <div className={`${cardClass} bg-green-900/10 border-green-500/20`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`${textSecondary} text-sm font-medium uppercase`}>Resolved</p>
                                            <h3 className="text-4xl font-bold text-green-500 mt-2">{stats.resolved}</h3>
                                        </div>
                                        <div className="p-3 bg-green-500/10 rounded-xl text-green-400"><CheckCircle size={24} /></div>
                                    </div>
                                </div>
                                <div className={`${cardClass} bg-yellow-900/10 border-yellow-500/20`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`${textSecondary} text-sm font-medium uppercase`}>Pending</p>
                                            <h3 className="text-4xl font-bold text-yellow-500 mt-2">{stats.open}</h3>
                                        </div>
                                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400"><Clock size={24} /></div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Recent Activity</h3>
                                {tickets.length === 0 ? (
                                    <p className={textSecondary}>No activity yet. Create a ticket to get started.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {tickets.slice(0, 3).map(t => (
                                            <div key={t.id} className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200'} border p-4 rounded-xl flex items-center justify-between hover:border-indigo-500/30 transition-colors`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-2 h-12 rounded-full ${t.status === 'Resolved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                    <div>
                                                        <h4 className={`${textPrimary} font-medium`}>{t.description.slice(0, 50)}...</h4>
                                                        <p className={`${textSecondary} text-xs mt-1`}>#{t.id.slice(0, 8)} • {new Date(t.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${t.status === 'Resolved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{t.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* TICKETS TAB */}
                    {activeTab === 'tickets' && (
                        <>
                            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <div>
                                    <h2 className={`text-3xl font-bold ${textPrimary}`}>My Tickets</h2>
                                    <p className={`${textSecondary} mt-1`}>View and manage your support history.</p>
                                </div>
                                <button onClick={() => setActiveTab('new')} className={btnClass}><Plus size={18} /> New Ticket</button>
                            </header>

                            {/* Filters */}
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                                    <input type="text" placeholder="Search description or ID..." className={`${inputClass} pl-10`} value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 min-w-[150px]">
                                    <Filter size={16} className="text-slate-500" />
                                    <select className={`bg-transparent ${textSecondary} py-3 outline-none border-none w-full cursor-pointer`} value={filter} onChange={e => setFilter(e.target.value)}>
                                        <option value="All" className={dropdownOptionClass}>All Status</option>
                                        <option value="Open" className={dropdownOptionClass}>Open</option>
                                        <option value="Resolved" className={dropdownOptionClass}>Resolved</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {filteredTickets.map(t => (
                                    <div key={t.id} className={`${cardClass} hover:border-indigo-500/30 transition-all group`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${t.status === 'Open' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                                    {t.status.toUpperCase()}
                                                </span>
                                                <span className={`${textSecondary} text-xs font-mono`}>#{t.id.slice(0, 8)}</span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>{t.category}</span>
                                            </div>
                                            <span className={`${textSecondary} text-xs`}>{new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-700'} text-sm leading-relaxed mb-4`}>{t.description}</p>

                                        {t.adminRemark && (
                                            <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-100 border-gray-200'} p-4 rounded-xl border mb-4`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                                                    <span className="text-indigo-400 font-semibold text-xs uppercase tracking-wider">Admin Response</span>
                                                </div>
                                                <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-700'} text-sm`}>{t.adminRemark}</p>
                                            </div>
                                        )}

                                        {/* Feedback UI */}
                                        {t.status === 'Resolved' && (
                                            <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                                                {t.userRating ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex text-yellow-400">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={14} className={i < t.userRating ? "fill-current" : "text-slate-700"} />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-slate-500">Thank you for rating!</span>
                                                    </div>
                                                ) : activeFeedbackId === t.id ? (
                                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-xs text-slate-400">How was your experience?</p>
                                                            <button onClick={() => setActiveFeedbackId(null)}><X size={14} className="text-slate-500" /></button>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button key={star} onClick={() => setFeedbackData({ ...feedbackData, rating: star })}>
                                                                    <Star size={24} className={`${feedbackData.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'} transition-transform hover:scale-110`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea placeholder="Any comments?" className={`${inputClass} text-sm py-2 min-h-[60px] resize-none`} value={feedbackData.feedback} onChange={e => setFeedbackData({ ...feedbackData, feedback: e.target.value })}></textarea>
                                                        <button onClick={() => handleSubmitFeedback(t.id)} className="bg-white text-slate-900 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Submit</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => { setActiveFeedbackId(t.id); setFeedbackData({ rating: 0, feedback: '' }); }} className="text-slate-400 hover:text-yellow-400 text-sm flex items-center gap-2 transition-colors">
                                                        <Star size={16} /> Rate this response
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* NEW TICKET TAB */}
                    {activeTab === 'new' && (
                        <div className="max-w-2xl mx-auto">
                            <header className="mb-8 text-center">
                                <h2 className={`text-3xl font-bold ${textPrimary}`}>Create New Ticket</h2>
                                <p className={`${textSecondary} mt-2`}>Describe your issue and we'll help you out.</p>
                            </header>

                            <div className={`${cardClass} space-y-6`}>
                                <div>
                                    <label className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider ml-1 mb-2 block`}>Issue Category</label>
                                    <select className={inputClass} value={ticket.category} onChange={e => setTicket({ ...ticket, category: e.target.value })}>
                                        <option value="Technical Support" className={dropdownOptionClass}>Technical Support</option>
                                        <option value="Course Enquiry" className={dropdownOptionClass}>Course Enquiry</option>
                                        <option value="Access Issue" className={dropdownOptionClass}>Access Issue</option>
                                        <option value="Report a Bug" className={dropdownOptionClass}>Report a Bug</option>
                                        <option value="Feedback / Suggestion" className={dropdownOptionClass}>Feedback / Suggestion</option>
                                        <option value="Other" className={dropdownOptionClass}>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider ml-1 mb-2 block`}>Description</label>
                                    <textarea className={`${inputClass} min-h-[150px] resize-none`} placeholder="Please describe your issue in detail..." value={ticket.description} onChange={e => setTicket({ ...ticket, description: e.target.value })}></textarea>
                                </div>
                                <div className="bg-indigo-500/10 p-5 rounded-xl border border-indigo-500/20">
                                    <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3 block">WhatsApp Updates</label>
                                    <div className="flex flex-col gap-3">
                                        <div className="relative">
                                            <MessageCircle className="absolute left-3 top-3 text-slate-500" size={18} />
                                            <input type="tel" placeholder="+91 98765 43210" className={`${inputClass} pl-10`} value={ticket.whatsappNumber} onChange={e => setTicket({ ...ticket, whatsappNumber: e.target.value })} />
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" id="consent" className="mt-1 w-4 h-4 rounded bg-slate-800 border-slate-600 text-indigo-600 focus:ring-indigo-500" checked={ticket.consent} onChange={e => setTicket({ ...ticket, consent: e.target.checked })} />
                                            <label htmlFor="consent" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none">
                                                I authorize EduCode to send support updates to this number via WhatsApp.
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleSubmitTicket} disabled={loading} className={`${btnClass} w-full py-4 text-lg shadow-xl shadow-indigo-500/10`}>
                                    {loading ? "Submitting..." : "Submit Ticket"}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
