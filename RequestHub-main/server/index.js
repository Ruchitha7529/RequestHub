const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Load environment variables from .env file
dotenv.config();

// Ensure models are registered
require("./models/User");
require("./models/Request");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST", "PUT"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON bodies
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Socket.io connection mapping
const userSockets = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSockets.set(userId, socket.id);
    console.log(`User connected: ${userId} (Socket: ${socket.id})`);
  }

  socket.on("disconnect", () => {
    if (userId) {
      userSockets.delete(userId);
      console.log(`User disconnected: ${userId}`);
    }
  });
});

// Export io and userSockets for use in controllers
app.set("io", io);
app.set("userSockets", userSockets);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Basic Route
app.get("/", (req, res) => {
  res.send("Request Management System API is running...");
});

// Routes
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const n8nRoutes = require("./routes/n8nRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/n8n", n8nRoutes);
app.use("/api/notifications", notificationRoutes);

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
