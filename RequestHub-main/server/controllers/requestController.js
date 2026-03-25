const Request = require("../models/Request");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendToN8n } = require("../utils/n8nUtils");

// Create a new request
// Create a new request
exports.createRequest = async (req, res) => {
    try {
        const { title, description, type, dueDate } = req.body;

        // Basic validation
        if (!title || !description || !type || !dueDate) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        // Handle file attachment
        let attachmentPath = null;
        if (req.file) {
            attachmentPath = `/uploads/${req.file.filename}`;
        }

        const newRequest = new Request({
            title,
            description,
            type,
            dueDate,
            department: req.user.department || "Unassigned",
            submittedBy: req.user.userId,
            attachment: attachmentPath
        });

        await newRequest.save();

        // Emit real-time notification to all HR/Admin
        const io = req.app.get("io");
        const notificationData = {
            message: `New request from ${req.user.name || "a user"}: ${title}`,
            requestId: newRequest._id,
            title: title
        };

        if (io) {
            console.log("requestController: Emitting newRequest event", { title, requestId: newRequest._id });
            io.emit("newRequest", notificationData);
        }

        // Save persistent notification for HR/Admin
        try {
            await new Notification({
                recipientRole: "hr",
                message: notificationData.message,
                requestId: newRequest._id,
                type: "newRequest"
            }).save();
            console.log("requestController: Persistent notification saved successfully for HR");
        } catch (err) {
            console.error("Failed to save persistent notification", err);
        }

        // Send to n8n for Automation (Mails, Slack, etc.)
        try {
            await sendToN8n({
                event: "request.created",
                request: newRequest,
                user: {
                    id: req.user.userId,
                    name: req.user.name,
                    email: req.user.email,
                    department: req.user.department
                }
            });
        } catch (err) {
            console.error("Error triggering n8n automation", err);
        }

        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get requests
// Get requests
exports.getRequests = async (req, res) => {
    try {
        let requests;
        const { status, type, department, search } = req.query;

        let query = {};

        // Filters
        if (status) query.status = status;
        if (type) query.type = type;

        if (req.user.role === "admin" || req.user.role === "hr") {
            if (department) query.department = department;
            if (search && search.match(/^[0-9a-fA-F]{24}$/)) query._id = search;

            requests = await Request.find(query)
                .populate("submittedBy")
                .sort({ createdAt: -1 });
        } else {
            query.submittedBy = req.user.userId;
            requests = await Request.find(query)
                .populate("submittedBy")
                .sort({ createdAt: -1 });
        }

        console.log(`requestController: Found ${requests.length} requests`);
        if (requests.length > 0) {
            console.log("requestController: First request submittedBy detail:", JSON.stringify(requests[0].submittedBy, null, 2));
        }

        console.log("requestController: Fetching requests for role:", req.user.role);
        console.log("requestController: Query:", query);
        if (requests && requests.length > 0) {
            console.log("requestController: Sample request submittedBy:", requests[0].submittedBy);
        }
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update request status (Admin only)
// Update request status (Admin/HR only)
exports.updateRequestStatus = async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user.role !== "hr") {
            return res.status(403).json({ message: "Access denied" });
        }

        const { status } = req.body;
        const allowedStatuses = ["approved", "rejected", "pending", "in-review"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("submittedBy", "name email");

        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Send to n8n for Automation
        try {
            await sendToN8n({
                event: "request.statusUpdated",
                request: updatedRequest,
                oldStatus: "pending", // Simplified for now
                newStatus: status
            });
        } catch (err) {
            console.error("Error triggering n8n automation for status update", err);
        }

        res.json(updatedRequest);

        // Emit real-time notification to the user
        const io = req.app.get("io");
        const userSockets = req.app.get("userSockets");
        const statusNotification = {
            message: `Your request "${updatedRequest.title}" has been ${status}`,
            requestId: updatedRequest._id,
            status: status
        };

        if (io && userSockets) {
            const socketId = userSockets.get(updatedRequest.submittedBy._id.toString());
            if (socketId) {
                io.to(socketId).emit("statusUpdate", statusNotification);
            }
        }

        // Save persistent notification for the user
        try {
            await new Notification({
                recipientRole: "user",
                recipientId: updatedRequest.submittedBy._id,
                message: statusNotification.message,
                requestId: updatedRequest._id,
                type: "statusUpdate"
            }).save();
        } catch (err) {
            console.error("Failed to save persistent status notification", err);
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Trigger urgent reminders for pending requests
exports.triggerReminders = async (req, res) => {
    try {
        // Only Admin or HR can trigger (should be hit by n8n)
        if (req.user.role !== "admin" && req.user.role !== "hr") {
            return res.status(403).json({ message: "Not authorized" });
        }

        const pendingRequests = await Request.find({ status: "pending" }).populate("submittedBy", "name");

        if (pendingRequests.length === 0) {
            return res.json({ message: "No pending requests found" });
        }

        const io = req.app.get("io");
        const reminderData = {
            message: `URGENT: There are ${pendingRequests.length} pending requests requiring action!`,
            requests: pendingRequests.map(r => ({
                id: r._id,
                title: r.title,
                submittedBy: r.submittedBy.name,
                type: r.type
            })),
            timestamp: new Date()
        };

        if (io) {
            console.log(`requestController: Emitting urgentReminder for ${pendingRequests.length} tasks`);
            io.emit("urgentReminder", reminderData);
        }

        // Save a persistent urgent notification so it shows on login/refresh
        try {
            await new Notification({
                recipientRole: "hr",
                message: reminderData.message,
                type: "urgent",
                data: reminderData // Storing the list of requests
            }).save();
        } catch (err) {
            console.error("Failed to save persistent urgent notification", err);
        }

        res.json({ message: "Urgent reminders sent", count: pendingRequests.length });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
