import { useState, useContext, useEffect, useCallback, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import toast from "react-hot-toast";
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    Users,
    LogOut,
    Menu,
    X,
    User as UserIcon
} from "lucide-react";

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const socket = useContext(SocketContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [urgentData, setUrgentData] = useState(null);
    const hasFetchedRef = useRef(false);

    const handleAction = useCallback(async (id, status, toastId) => {
        try {
            await api.put(`/requests/${id}/status`, { status });
            if (toastId) toast.dismiss(toastId);
            toast.success(`Request ${status} successfully!`);
            // Trigger a refresh event for components listening
            window.dispatchEvent(new CustomEvent("refreshRequests"));
        } catch (error) {
            console.error("Failed to update status from notification", error);
            toast.error("Failed to update status");
        }
    }, []);

    const handleUrgentAction = async (id, status) => {
        await handleAction(id, status);
        // Remove the handled request from the urgent list
        setUrgentData(prev => {
            if (!prev) return null;
            const updatedRequests = prev.requests.filter(r => r.id !== id);
            if (updatedRequests.length === 0) return null;
            return { ...prev, requests: updatedRequests };
        });
    };

    const showActionableToast = useCallback((message, requestId) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-primary overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]`}
                onClick={() => {
                    navigate("/hr-dashboard");
                    toast.dismiss(t.id);
                }}
            >
                <div className="flex-1 w-0 p-5">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                🔔
                            </div>
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-bold text-slate-900 capitalize">
                                New Request
                            </p>
                            <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                                {message}
                            </p>
                            <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => handleAction(requestId, "approved", t.id)}
                                    className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleAction(requestId, "rejected", t.id)}
                                    className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: "top-right"
        });
    }, [navigate, handleAction]);

    useEffect(() => {
        const fetchUnread = async () => {
            if (user?.id && !hasFetchedRef.current) {
                hasFetchedRef.current = true;
                try {
                    const res = await api.get('/notifications/unread');
                    const unread = res.data;

                    if (unread.length > 0) {
                        // Check for urgent notifications
                        const urgentNotif = unread.find(n => n.type === 'urgent');
                        if (urgentNotif && (user.role === 'hr' || user.role === 'admin')) {
                            setUrgentData(urgentNotif.data);
                        }

                        // Limit to showing only the 3 most recent standard notifications
                        const recentUnread = unread.filter(n => n.type !== 'urgent').slice(-3);
                        recentUnread.forEach(notif => {
                            if (notif.type === 'newRequest' && (user.role === 'hr' || user.role === 'admin')) {
                                showActionableToast(notif.message, notif.requestId);
                            } else {
                                // Standard notification for status updates or other types
                                toast.success(notif.message, {
                                    duration: 5000,
                                    icon: "✅"
                                });
                            }
                        });

                        const ids = unread.map(n => n._id);
                        await api.post('/notifications/read', { notificationIds: ids });
                    }
                } catch (err) {
                    console.error("Failed to fetch notifications", err);
                    hasFetchedRef.current = false; // Allow retry on failure
                }
            }
        };

        fetchUnread();
    }, [user?.id, user?.role, showActionableToast]);

    useEffect(() => {
        if (!socket || !user?.id) return;

        const handleNewRequest = (data) => {
            if (user.role === "hr" || user.role === "admin") {
                showActionableToast(data.message, data.requestId);
            }
        };

        const handleStatusUpdate = (data) => {
            toast.success(data.message, {
                duration: 4000,
                icon: "✅"
            });
        };

        const handleUrgentReminder = (data) => {
            console.log("Layout: Received urgentReminder via socket", data);
            if (user.role === "hr" || user.role === "admin") {
                setUrgentData(data);
            }
        };

        socket.on("newRequest", handleNewRequest);
        socket.on("statusUpdate", handleStatusUpdate);
        socket.on("urgentReminder", handleUrgentReminder);

        return () => {
            socket.off("newRequest", handleNewRequest);
            socket.off("statusUpdate", handleStatusUpdate);
            socket.off("urgentReminder", handleUrgentReminder);
        };
    }, [socket, user?.id, user?.role, showActionableToast]);

    // Define navigation items based on role
    const navItems = [
        {
            label: "Dashboard",
            path: "/dashboard",
            icon: <LayoutDashboard size={20} />,
            roles: ["user", "admin", "hr"],
        },
        {
            label: "My Requests",
            path: "/my-requests",
            icon: <FileText size={20} />,
            roles: ["user"],
        },
        {
            label: "Submit Request",
            path: "/submit-request",
            icon: <PlusCircle size={20} />,
            roles: ["user"],
        },
        {
            label: "HR Dashboard",
            path: "/hr-dashboard",
            icon: <Users size={20} />,
            roles: ["admin", "hr"],
        },
        {
            label: "Profile",
            path: "/profile",
            icon: <UserIcon size={20} />,
            roles: ["user", "admin", "hr"],
        },
    ];

    const filteredNavItems = navItems.filter((item) =>
        item.roles.includes(user?.role || "user")
    );

    return (
        <div className="flex h-screen bg-background text-content">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white/70 backdrop-blur-3xl border-r border-slate-200 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.05)]">
                <div className="p-8 border-b border-slate-100">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-primary to-accent rounded-2xl shadow-lg shadow-primary/20 transform group-hover:scale-110 transition duration-500">
                                <span className="text-white text-xl font-black tracking-tighter">R</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold font-display tracking-tight text-slate-800 leading-none">Request</span>
                            <span className="text-sm font-bold font-display tracking-[0.2em] text-primary uppercase mt-1">Hub</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {filteredNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-5 py-3.5 mt-1 rounded-xl transition-all duration-300 font-medium ${location.pathname === item.path
                                ? "bg-primary text-white shadow-md shadow-primary/25"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <div className="flex items-center gap-4 px-2 mb-6 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                            {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 w-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 text-sm font-bold tracking-wide"
                    >
                        <LogOut size={18} strokeWidth={2.5} />
                        LOGOUT
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-100 p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center text-white font-black text-sm">R</div>
                        <h1 className="text-lg font-extrabold font-display tracking-tight text-slate-800">Request<span className="text-primary">Hub</span></h1>
                    </div>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}>
                        <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-xl p-4 flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-primary">Menu</h2>
                                <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
                            </div>
                            <nav className="flex-1 space-y-2">
                                {filteredNavItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <div className="flex items-center gap-3 px-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                    </div>
                                </div>
                                <button onClick={logout} className="flex items-center gap-3 px-2 w-full text-red-600">
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Urgent Reminder Modal (Big Window) */}
            {urgentData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border-4 border-red-500/20 animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-8 text-white relative">
                            <div className="absolute top-4 right-4 text-white/20">
                                <FileText size={120} strokeWidth={1} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                                        <Users className="text-white" size={24} />
                                    </div>
                                    <span className="text-sm font-bold tracking-widest uppercase text-white/80">Action Required</span>
                                </div>
                                <h2 className="text-4xl font-extrabold tracking-tight">Urgent Reminders</h2>
                                <p className="text-red-100 mt-2 font-medium">Please process these pending requests immediately.</p>
                            </div>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 bg-slate-50/50">
                            {urgentData.requests.map((req) => (
                                <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                {req.type}
                                            </span>
                                            <span className="text-slate-400 font-medium text-xs">•</span>
                                            <span className="text-slate-500 text-xs font-semibold">Submitted by {req.submittedBy}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">{req.title}</h3>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleUrgentAction(req.id, "approved")}
                                            className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-95 text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleUrgentAction(req.id, "rejected")}
                                            className="flex-1 md:flex-none px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/25 active:scale-95 text-sm"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-white border-t border-slate-100 flex flex-col items-center">
                            <p className="text-slate-400 text-xs font-medium italic mb-2">
                                This window will reappear every 2 hours until all pending tasks are cleared.
                            </p>
                            <button
                                onClick={() => setUrgentData(null)}
                                className="text-slate-500 hover:text-slate-800 font-bold text-sm tracking-tight transition-colors flex items-center gap-2"
                            >
                                <X size={16} /> CLOSE FOR NOW
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
