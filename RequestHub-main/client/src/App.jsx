import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./components/Layout";
import MyRequests from "./pages/MyRequests";
import SubmitRequest from "./pages/SubmitRequest";
import HRDashboard from "./pages/HRDashboard";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<Layout />}>
              {/* Common Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* User Routes */}
              <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-requests" element={<MyRequests />} />
                <Route path="/submit-request" element={<SubmitRequest />} />
              </Route>

              {/* HR/Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["hr", "admin"]} />}>
                <Route path="/hr-dashboard" element={<HRDashboard />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
