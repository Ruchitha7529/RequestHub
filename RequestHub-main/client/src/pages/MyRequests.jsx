import { useState, useEffect } from "react";
import api from "../utils/api";
import { FileText, Paperclip, Clock } from "lucide-react";
import { motion } from "framer-motion";

const MyRequests = () => {
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
        fetchRequests();
    }, []);

    if (loading) return <div>Loading requests...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Archive</h1>
                <p className="text-slate-500 font-medium mt-1">Manage and track your submitted requests.</p>
            </div>

            <div className="card p-0 overflow-hidden bg-white/60">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/80">
                        <tr>
                            <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">ID</th>
                            <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Request Details</th>
                            <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Category</th>
                            <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Deadline</th>
                            <th className="px-6 py-5 text-center text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Docs</th>
                            <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                        {requests.map((req) => (
                            <tr key={req._id} className="hover:bg-slate-50/50 transition-colors duration-300">
                                <td className="px-6 py-5 whitespace-nowrap text-[11px] font-bold text-slate-400">#{req._id.slice(-6)}</td>
                                <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-800">{req.title}</td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="text-[11px] font-black text-primary border border-primary/10 bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                        {req.type}
                                    </span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Clock size={14} className="text-slate-300" />
                                        <span className="text-sm font-medium">{new Date(req.dueDate).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-center">
                                    {req.attachment ? (
                                        <a href={`http://localhost:5001${req.attachment}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300">
                                            <Paperclip size={16} />
                                        </a>
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
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
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 py-12">
                                    <div className="flex flex-col items-center justify-center">
                                        <FileText size={48} className="text-gray-300 mb-2" />
                                        <p>No requests found.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default MyRequests;
