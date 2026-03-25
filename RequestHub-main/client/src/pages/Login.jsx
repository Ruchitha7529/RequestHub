import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const result = await login(email, password);
        if (result.success) {
            // Role-based redirect
            if (result.user.role === "admin" || result.user.role === "hr") {
                navigate("/hr-dashboard");
            } else {
                navigate("/dashboard");
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-light via-background to-background py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 glass-panel p-10"
            >
                <div className="text-center">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-accent rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20 mb-4 animate-bounce-slow">R</div>
                        <h2 className="text-4xl font-black font-display tracking-tight text-slate-900">
                            Request<span className="text-primary">Hub</span>
                        </h2>
                        <p className="text-slate-500 font-medium mt-2 tracking-wide uppercase text-xs">Premium Request Management</p>
                    </div>
                    <p className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100 pb-2">
                        Don&apos;t have an account?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="font-bold text-primary hover:text-indigo-600 underline transition-colors"
                        >
                            Register here
                        </button>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px"> {/* Tailwind Grouping if needed, but separate is cleaner */}
                        <div className="mb-4">
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="input-field"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="input-field"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
