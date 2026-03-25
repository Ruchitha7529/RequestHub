const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// Get unread notifications for a user
exports.getUnreadNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Build role filter - Admin should see HR notifications too
        let rolesToSearch = [userRole];
        if (userRole === "admin") rolesToSearch.push("hr");
        if (userRole === "hr") rolesToSearch.push("admin");

        const unread = await Notification.find({
            $and: [
                {
                    $or: [
                        { recipientRole: { $in: rolesToSearch }, recipientId: null },
                        { recipientId: new mongoose.Types.ObjectId(userId) }
                    ]
                },
                { readBy: { $ne: new mongoose.Types.ObjectId(userId) } }
            ]
        }).sort({ createdAt: -1 });

        console.log(`notificationController: Found ${unread.length} unread notifications`);
        res.json(unread);
    } catch (error) {
        console.error("notificationController Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Mark notifications as read
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { notificationIds } = req.body; // Array of IDs

        await Notification.updateMany(
            { _id: { $in: notificationIds } },
            { $addToSet: { readBy: userId } }
        );

        res.json({ message: "Notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
