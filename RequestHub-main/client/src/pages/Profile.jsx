import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { User, Mail, Building, Lock, Save, Key } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        department: user?.department || ""
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const departments = ["IT", "HR", "Finance", "Operations", "Sales", "Marketing"];

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const res = await api.put("/auth/profile", profileData);
            updateUser(res.data.user);
            setSuccess("Profile updated successfully!");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await api.put("/auth/password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccess("Password updated successfully!");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
        >
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Account Settings</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Information */}
                <div className="glass-panel p-8">
                    <h2 className="text-xl font-bold font-display text-slate-800 mb-6 flex items-center gap-2">
                        <User size={20} className="text-primary" /> Profile Information
                    </h2>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <User size={18} />
                                </span>
                                <input
                                    type="text"
                                    className="input-field pl-10"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Mail size={18} />
                                </span>
                                <input
                                    type="email"
                                    className="input-field pl-10"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Building size={18} />
                                </span>
                                <select
                                    className="input-field pl-10"
                                    value={profileData.department}
                                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                >
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>

                {/* Password Change */}
                <div className="glass-panel p-8">
                    <h2 className="text-xl font-bold font-display text-slate-800 mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-primary" /> Change Password
                    </h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="input-field pl-10"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Key size={18} />
                                </span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="input-field pl-10"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Key size={18} />
                                </span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="input-field pl-10"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-secondary w-full flex items-center justify-center gap-2"
                        >
                            <Lock size={18} /> {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
