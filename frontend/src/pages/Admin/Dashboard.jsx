import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { Search, Filter, MessageCircle, ExternalLink, UserPlus, X, LogOut, CheckCircle, Clock, AlertCircle, Star, ArrowRightCircle, Divide, Loader, Lock } from 'lucide-react';
import logo from '../../assets/educode_logo.png';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState([]);
    const [filters, setFilters] = useState({ status: 'All', sortBy: 'newest', search: '' });
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(null); // Ticket ID or null
    const [showTransferModal, setShowTransferModal] = useState(null); // Ticket ID

    // Password Change State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    const [targetAdmin, setTargetAdmin] = useState('');
    const [remark, setRemark] = useState('');
    const [adminUser, setAdminUser] = useState(null);
    const [admins, setAdmins] = useState([]); // List of admins for transfer
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', specialization: 'General' });
    const [myTicketsOnly, setMyTicketsOnly] = useState(false);
    const [showInbox, setShowInbox] = useState(false); // New Inbox State

    useEffect(() => {
        if (adminUser && adminUser.role !== 'super-admin') {
            setMyTicketsOnly(true);
        }
    }, [adminUser]);
    const navigate = useNavigate();

    // Theme Classes
    const cardClass = "bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl";
    const inputClass = "bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full";
    const btnClass = "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2";

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const userStr = localStorage.getItem('adminUser');
        if (!token || !userStr) {
            navigate('/sse/educode');
            return;
        }
        setAdminUser(JSON.parse(userStr));
        fetchStats();
        fetchAdmins();
    }, []);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchTickets();
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [filters, pagination.page, myTicketsOnly, showInbox]);

    const fetchAdmins = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/all`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) setAdmins(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchTickets = async () => {
        try {
            const query = new URLSearchParams({
                page: pagination.page,
                limit: 10,
                status: filters.status,
                search: filters.search,
                sortBy: filters.sortBy,
                assignedToMe: myTicketsOnly,
                pendingForMe: showInbox // Add this param
            }).toString();

            setIsLoading(true);
            const res = await fetch(`${API_URL}/api/tickets?${query}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const data = await res.json();
            setTickets(data.tickets || []);
            setPagination({ page: data.currentPage, totalPages: data.pages, total: data.total });
            setIsLoading(false);
        } catch (err) { console.error(err); setIsLoading(false); }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/stats`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const data = await res.json();
            setStats(data);
        } catch (err) { console.error(err); }
    };

    // Find current admin stats
    const myStats = stats.find(s => s.id === adminUser?.id);

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(newAdmin)
            });
            if (res.ok) {
                alert('Sub Admin Added!');
                setShowCreateAdmin(false);
                setNewAdmin({ name: '', email: '', password: '' });
            } else {
                const err = await res.json();
                alert(err.error || 'Failed');
            }
        } catch (err) { alert('Error creating admin'); }
    };

    const handleResolveTicket = async (ticketId) => {
        if (!remark) return alert("Please enter a remark.");
        try {
            const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}/resolve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ status: 'Resolved', adminRemark: remark })
            });
            if (res.ok) {
                setShowResolveModal(null);
                setRemark('');
                fetchTickets();
            }
        } catch (err) { alert('Failed to resolve'); }
    };

    const handleLockTicket = async (ticketId) => {
        try {
            const res = await fetch(`${API_URL}/api/tickets/${ticketId}/lock`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) fetchTickets();
            else alert('Failed to lock.');
        } catch (err) { alert('Error locking ticket'); }
    };

    const handleTransferTicket = async () => {
        if (!targetAdmin) return alert("Select an admin");
        try {
            const res = await fetch(`${API_URL}/api/tickets/${showTransferModal}/transfer/initiate`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ targetAdminId: parseInt(targetAdmin) })
            });
            if (res.ok) {
                setShowTransferModal(null);
                setTargetAdmin('');
                fetchTickets();
            } else alert('Transfer Failed');
        } catch (err) { alert('Error transferring ticket'); }
    };

    const handleAcceptTransfer = async (ticketId) => {
        try {
            await fetch(`${API_URL}/api/tickets/${ticketId}/transfer/accept`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            fetchTickets();
        } catch (err) { alert('Error accepting transfer'); }
    };

    const handleRejectTransfer = async (ticketId) => {
        try {
            await fetch(`${API_URL}/api/tickets/${ticketId}/transfer/reject`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            fetchTickets();
        } catch (err) { console.error(err); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/admin/change-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Password updated successfully!");
                setShowPasswordModal(false);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(data.error || "Failed to update password");
            }
        } catch (err) {
            console.error(err);
            alert("Error updating password");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/sse/educode');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination({ ...pagination, page: newPage });
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Navbar */}
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="EduCode Logo" className="w-10 h-10 object-contain" />
                        <span className="font-bold text-lg tracking-tight text-white">EduCode Admin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{adminUser?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-400 capitalize">{adminUser?.role}</p>
                        </div>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Change Password"
                        >
                            <Lock size={20} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-8">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Ticket Management</h1>
                        <p className="text-slate-400 text-sm mt-1">Manage and resolve student enquiries.</p>
                    </div>
                    {adminUser?.role === 'super-admin' && (
                        <button onClick={() => setShowCreateAdmin(true)} className={btnClass}>
                            <UserPlus size={18} /> Add Sub-Admin
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className={`${cardClass} bg-indigo-900/20 border-indigo-500/30 flex items-center justify-between`}>
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Queries Resolved</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{myStats?.queriesResolved || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                    <div className={`${cardClass} bg-indigo-900/20 border-indigo-500/30 flex items-center justify-between`}>
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Average Rating</p>
                            <h3 className="text-3xl font-bold text-white mt-1 flex items-center gap-2">
                                {myStats?.averageRating ? (Number(myStats.averageRating).toFixed(1)) : 'N/A'}
                                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                            <Star size={24} />
                        </div>
                    </div>
                </div>

                {/* ADVANCED FILTER BAR */}
                <div className={`${cardClass} mb-8 flex flex-col lg:flex-row gap-4 p-4`}>

                    {/* My Tickets Toggle */}
                    <button
                        onClick={() => { setMyTicketsOnly(!myTicketsOnly); setShowInbox(false); setPagination({ ...pagination, page: 1 }); }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border ${myTicketsOnly
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <CheckCircle size={18} /> My Tickets
                    </button>

                    <button
                        onClick={() => { setShowInbox(!showInbox); setMyTicketsOnly(false); setPagination({ ...pagination, page: 1 }); }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border ${showInbox
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <ArrowRightCircle size={18} /> Inbox
                    </button>

                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search email..."
                            className={`${inputClass} pl-10`}
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, status: filters.status, sortBy: filters.sortBy })} // Keep other filters
                        />
                    </div>

                    {/* Filters Group */}
                    <div className="flex gap-4">
                        {/* Status */}
                        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 border border-slate-700">
                            <Filter size={16} className="text-slate-500" />
                            <select
                                className="bg-transparent text-slate-200 py-2 outline-none border-none cursor-pointer"
                                value={filters.status}
                                onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPagination({ ...pagination, page: 1 }); }}
                            >
                                <option value="All">All Status</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 border border-slate-700">
                            <Clock size={16} className="text-slate-500" />
                            <select
                                className="bg-transparent text-slate-200 py-2 outline-none border-none cursor-pointer"
                                value={filters.sortBy}
                                onChange={(e) => { setFilters({ ...filters, sortBy: e.target.value }); setPagination({ ...pagination, page: 1 }); }}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Ticket Grid */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`${cardClass} animate-pulse`}>
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex gap-2">
                                                <div className="h-5 w-20 bg-slate-800 rounded"></div>
                                                <div className="h-5 w-24 bg-slate-800 rounded"></div>
                                            </div>
                                            <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
                                            <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
                                        </div>
                                        <div className="w-full md:w-32 h-10 bg-slate-800 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">No tickets found.</div>
                    ) : tickets.map(ticket => (
                        <div key={ticket.id} className={`${cardClass} hover:border-indigo-500/30 transition-all group`}>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold 
                                            ${ticket.status === 'Open' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                ticket.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                    'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                            {ticket.status.toUpperCase()}
                                        </span>
                                        <span className="text-slate-500 text-xs font-mono">#{ticket.id.slice(0, 8)}</span>
                                        <span className="text-indigo-400 text-xs font-medium bg-indigo-500/10 px-2 py-0.5 rounded">{ticket.category}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{ticket.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                        <span>User: {ticket.user.email}</span>
                                        {ticket.user.whatsappNumber && (
                                            <span className="flex items-center gap-1 text-green-400/80">
                                                <MessageCircle size={12} /> {ticket.user.whatsappNumber}
                                            </span>
                                        )}
                                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {ticket.adminRemark && (
                                        <div className="mt-3 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                            <span className="text-indigo-400 font-semibold text-xs uppercase tracking-wider block mb-1">Resolution Note</span>
                                            {ticket.adminRemark}
                                            <div className="mt-1 text-xs text-slate-500 text-right">- Resolved by {ticket.resolvedBy?.name || 'Admin'}</div>
                                        </div>
                                    )}
                                    {ticket.forwardedBy && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 bg-slate-800/30 p-2 rounded-lg border border-slate-700/30 w-fit">
                                            <ArrowRightCircle size={14} className="text-indigo-400" />
                                            Forwarded by <span className="text-white">{ticket.forwardedBy.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex md:flex-col gap-2 justify-start md:justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-4 min-w-[140px]">

                                    {/* Action Logic */}
                                    {ticket.status === 'Open' && (
                                        <button
                                            onClick={() => handleLockTicket(ticket.id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 w-full"
                                        >
                                            <Clock size={16} /> Pick Up
                                        </button>
                                    )}

                                    {ticket.status === 'In Progress' && (
                                        ticket.resolvedById === adminUser?.id ? (
                                            <>
                                                <button
                                                    onClick={() => setShowResolveModal(ticket.id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 w-full"
                                                >
                                                    <CheckCircle size={16} /> Resolve
                                                </button>
                                                <button
                                                    onClick={() => setShowTransferModal(ticket.id)}
                                                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full mt-2"
                                                >
                                                    <ArrowRightCircle size={16} /> Transfer
                                                </button>
                                                {ticket.pendingTransferTo && (
                                                    <div className="mt-2 text-xs text-center text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded p-1">
                                                        Waiting for {ticket.pendingTransferTo.name}...
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            ticket.pendingTransferToId === adminUser?.id ? (
                                                <div className="space-y-2">
                                                    <div className="bg-indigo-600/20 text-indigo-300 px-3 py-2 rounded-lg text-xs font-medium border border-indigo-500/30 text-center w-full animate-pulse">
                                                        Incoming Transfer from <br /> <span className="text-white font-bold">{ticket.resolvedBy?.name}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleAcceptTransfer(ticket.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-xs font-medium">Accept</button>
                                                        <button onClick={() => handleRejectTransfer(ticket.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-xs font-medium">Reject</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-800 text-slate-400 px-3 py-2 rounded-lg text-xs font-medium border border-slate-700 text-center w-full">
                                                    Locked by <br /> <span className="text-white">{ticket.resolvedBy?.name || 'Admin'}</span>
                                                </div>
                                            )
                                        )
                                    )}

                                    {/* Inbox Action Logic - Reuse Transfer APIs */}
                                    {showInbox && ticket.pendingTransferToId === adminUser?.id && (
                                        <div className="flex gap-2 w-full mt-2">
                                            <button
                                                onClick={() => handleAcceptTransfer(ticket.id)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-green-500/20 flex-1 flex items-center justify-center gap-1"
                                            >
                                                <CheckCircle size={16} /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleRejectTransfer(ticket.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-red-500/20 flex-1 flex items-center justify-center gap-1"
                                            >
                                                <X size={16} /> Reject
                                            </button>
                                        </div>
                                    )}

                                    {ticket.status === 'Resolved' && (
                                        <div className="text-center w-full py-1.5 text-slate-500 text-sm flex items-center justify-center gap-1 cursor-default">
                                            <CheckCircle size={16} className="text-green-500" /> Closed
                                        </div>
                                    )}

                                    {ticket.user.whatsappNumber && (
                                        <a
                                            href={`https://wa.me/${ticket.user.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi, regarding your support request #${ticket.id.slice(0, 8)}: "${ticket.description.slice(0, 40)}..."`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-slate-800 hover:bg-green-600/20 hover:text-green-400 text-slate-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-green-500/30 flex items-center justify-center gap-2 w-full text-center"
                                        >
                                            <MessageCircle size={16} /> WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* PAGINATION CONTROLS */}
                <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-slate-400 text-sm">
                        Page <span className="text-white font-bold">{pagination.page}</span> of <span className="text-white font-bold">{pagination.totalPages}</span>
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>

            </main>

            {/* Resolve Modal */}
            {showResolveModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`${cardClass} w-full max-w-md animate-in fade-in zoom-in-95`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Resolve Ticket</h2>
                            <button onClick={() => setShowResolveModal(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold tracking-wider block mb-2">Resolution Remark</label>
                                <textarea
                                    className={`${inputClass} min-h-[120px] resize-none`}
                                    placeholder="Explain how the issue was resolved..."
                                    value={remark}
                                    onChange={e => setRemark(e.target.value)}
                                    autoFocus
                                ></textarea>
                            </div>
                            <button
                                onClick={() => handleResolveTicket(showResolveModal)}
                                className={`${btnClass} w-full py-3 text-lg`}
                            >
                                <CheckCircle size={20} /> Mark as Resolved
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`${cardClass} w-full max-w-md animate-in fade-in zoom-in-95`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Transfer Ticket</h2>
                            <button onClick={() => setShowTransferModal(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-semibold tracking-wider block mb-2">Select New Owner</label>
                                <select
                                    className={inputClass}
                                    value={targetAdmin}
                                    onChange={e => setTargetAdmin(e.target.value)}
                                >
                                    <option value="" className="bg-slate-900 text-slate-200">Select Admin...</option>
                                    {admins && adminUser && admins.filter(a => String(a.id) !== String(adminUser.id)).map(admin => (
                                        <option key={admin.id} value={admin.id} className="bg-slate-900 text-slate-200">{admin.name} ({admin.email})</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleTransferTicket}
                                className={`${btnClass} w-full py-3 text-lg`}
                            >
                                <ArrowRightCircle size={20} /> Transfer Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE ADMIN MODAL */}
            {showCreateAdmin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <UserPlus className="text-indigo-500" /> Add Sub-Admin
                            </h2>
                            <button onClick={() => setShowCreateAdmin(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <input type="text" placeholder="Full Name" className={inputClass} required value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} />
                            <input type="email" placeholder="Email Address" className={inputClass} required value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} />
                            <input type="password" placeholder="Password" className={inputClass} required value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />

                            <div className="space-y-1">
                                <label className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Specialization</label>
                                <select
                                    className={inputClass}
                                    value={newAdmin.specialization}
                                    onChange={e => setNewAdmin({ ...newAdmin, specialization: e.target.value })}
                                >
                                    <option value="General" className="bg-slate-900 text-slate-200">General Support</option>
                                    <option value="Technical" className="bg-slate-900 text-slate-200">Technical</option>
                                    <option value="Academic" className="bg-slate-900 text-slate-200">Academic</option>
                                    <option value="Billing" className="bg-slate-900 text-slate-200">Billing</option>
                                    <option value="Career" className="bg-slate-900 text-slate-200">Career Guidance</option>
                                </select>
                            </div>

                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                                <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-200/80">Sub-Admins can resolve tickets but cannot create other admins.</p>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                                Create Admin
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* PASSWORD CHANGE MODAL */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Lock className="text-indigo-500" /> Change Password
                            </h2>
                            <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Current Password</label>
                                <input
                                    type="password"
                                    className={inputClass}
                                    required
                                    value={passwordData.oldPassword}
                                    onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">New Password</label>
                                <input
                                    type="password"
                                    className={inputClass}
                                    required
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Confirm New Password</label>
                                <input
                                    type="password"
                                    className={inputClass}
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mt-2">
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
