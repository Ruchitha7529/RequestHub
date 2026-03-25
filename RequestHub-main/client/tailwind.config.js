/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: "#3b82f6", // Blue-500
                    hover: "#2563eb",   // Blue-600
                    light: "#eff6ff",   // Blue-50
                },
                secondary: {
                    DEFAULT: "#10b981", // Emerald-500
                    hover: "#059669",
                },
                accent: {
                    DEFAULT: "#8b5cf6", // Violet-500
                    hover: "#7c3aed",
                },
                danger: {
                    DEFAULT: "#ef4444",
                    hover: "#dc2626",
                },
                background: "#f8fafc", // Slate-50 - softer background
                surface: "#ffffff",
                content: "#334155", // Slate-700
                'content-muted': "#64748b", // Slate-500
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 15px rgba(59, 130, 246, 0.3)',
                'btn-primary': '0 4px 12px -2px rgba(59, 130, 246, 0.3)',
                'btn-secondary': '0 4px 12px -2px rgba(16, 185, 129, 0.3)',
                'btn-danger': '0 4px 12px -2px rgba(239, 68, 68, 0.3)',
                'card-premium': '0 8px 30px rgba(0, 0, 0, 0.04)',
                'card-premium-hover': '0 12px 40px rgba(0, 0, 0, 0.08)',
                'glass-premium': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            }
        },
    },
    plugins: [],
}
