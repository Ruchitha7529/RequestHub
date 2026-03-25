import { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Send, Calendar, FileType, AlignLeft, Paperclip } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const SubmitRequest = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        type: "",
        description: "",
        dueDate: "",
        attachment: null
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const requestTypes = ["Leave", "Purchase", "IT Support", "Travel", "Maintenance", "Other"];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, attachment: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (new Date(formData.dueDate) < new Date()) {
            setError("Due date must be in the future.");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("type", formData.type);
            data.append("description", formData.description);
            data.append("dueDate", formData.dueDate);
            if (formData.attachment) {
                data.append("attachment", formData.attachment);
            }

            await api.post("/requests", data);

            toast.success("Request submitted successfully!");
            navigate("/my-requests");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl mx-auto"
        >
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                    <Send size={24} strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Request</h1>
                <p className="text-slate-500 font-medium mt-2">Fill in the details below to initiate your process.</p>
            </div>

            <div className="card p-8 md:p-12 bg-white/60">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="label">Request Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="Briefly name your request..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="label">Category</label>
                            <div className="relative">
                                <FileType size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-11"
                                >
                                    <option value="">Select Category</option>
                                    {requestTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="label">Deadline</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-11"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="input-field resize-none"
                            placeholder="Provide full context for your request..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="label">Supporting Documents</label>
                        <div className="mt-2 p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-all duration-300 group cursor-pointer relative">
                            <input
                                type="file"
                                name="attachment"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors duration-300 mb-3">
                                    <Paperclip size={20} />
                                </div>
                                <p className="text-sm font-bold text-slate-700">
                                    {formData.attachment ? formData.attachment.name : "Click or drag to upload"}
                                </p>
                                <p className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-wider">PDF, PNG, JPG (Max 5MB)</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn btn-primary py-4 text-sm tracking-[0.1em] uppercase ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Processing..." : "Create Request"}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default SubmitRequest;
