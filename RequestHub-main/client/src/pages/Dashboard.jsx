import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await api.get("/requests");
                setRequests(res.data);
            } catch (error) {
                console.error("Failed to fetch requests", error);
            } finally {
                setLoading(false);
            }
        };
        if (user?.role !== "admin" && user?.role !== "hr") {
            fetchRequests();
        }
    }, [user]);

    // Calculate stats
    const total = requests.length;
    const pending = requests.filter(r => r.status === "pending").length;
    const approved = requests.filter(r => r.status === "approved").length;
    const rejected = requests.filter(r => r.status === "rejected").length;

    // Find overdue requests (pending and past due date)
    const overdue = requests.filter(r => {
        return r.status === "pending" && new Date(r.dueDate) < new Date();
    }).length;

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
                <p className="text-gray-600 mt-2">Here is an overview of your requests.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="card group bg-white/50 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                            <FileText size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Total Requests</p>
                            <p className="text-3xl font-black font-display text-slate-800 mt-1">{total}</p>
                        </div>
                    </div>
                </div>

                <div className="card group bg-white/50 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 shadow-inner">
                            <Clock size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Pending</p>
                            <p className="text-3xl font-black font-display text-slate-800 mt-1">{pending}</p>
                        </div>
                    </div>
                </div>

                <div className="card group bg-white/50 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner">
                            <CheckCircle size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Approved</p>
                            <p className="text-3xl font-black font-display text-slate-800 mt-1">{approved}</p>
                        </div>
                    </div>
                </div>

                <div className="card group bg-white/50 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-red-50 rounded-2xl text-red-600 shadow-inner">
                            <AlertTriangle size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Action Needed</p>
                            <div className="flex gap-2 text-xs mt-1 items-center">
                                <span className="text-red-600 font-black">{overdue} Overdue</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-slate-500 font-bold">{rejected} Rejected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Requests */}
            <div className="card p-0 overflow-hidden bg-white/60">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-black font-display text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        Recent Requests
                    </h2>
                    <Link to="/my-requests" className="text-primary hover:bg-primary/5 px-4 py-2 rounded-lg transition-colors text-[11px] font-black tracking-widest uppercase">View All</Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/80">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Title</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Category</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Expected By</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Current Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {requests.slice(0, 5).map((req) => (
                                <tr key={req._id} className="hover:bg-slate-50/50 transition-colors duration-300">
                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-800">{req.title}</td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className="text-[11px] font-black text-primary uppercase tracking-widest">{req.type}</span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock size={14} className="text-slate-300" />
                                            <span className="text-sm font-medium">{new Date(req.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className={`badge ${req.status === 'approved' ? 'badge-success' :
                                            req.status === 'rejected' ? 'badge-danger' :
                                                req.status === 'in-review' ? 'badge-info' :
                                                    'badge-warning'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText size={32} className="text-slate-300" />
                                            <span>No requests found.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
