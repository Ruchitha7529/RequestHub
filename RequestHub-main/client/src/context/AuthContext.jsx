import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If token exists, try to get user details?
        // Since we don't have a /me endpoint yet, we'll just check if token is valid via login response
        // Or we decode the token if needed. For now, we trust the token if it exists.
        // Ideally, we should fetch user profile on load.
        // For simplicity, we'll assume if token is there, we are logged in.
        // A rigorous check would be to call an API.

        // Let's decode the token to get basic info if possible, or just rely on stored user data if we stored it.
        // We didn't store user data in localStorage, only token.
        // Let's modify login to store user too, or decoding it.

        const storedUser = localStorage.getItem("user");
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post("/auth/login", { email, password });
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            return { success: true, user: res.data.user };
        } catch (error) {
            console.error("Login failed:", error);
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    };

    const register = async (name, email, password, role, department) => {
        try {
            await api.post("/auth/register", { name, email, password, role, department });
            return { success: true };
        } catch (error) {
            console.error("Registration failed:", error);
            return { success: false, message: error.response?.data?.message || "Registration failed" };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
