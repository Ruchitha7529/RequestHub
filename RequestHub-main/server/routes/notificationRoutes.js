const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/authMiddleware");

// Get unread notifications
router.get("/unread", auth, notificationController.getUnreadNotifications);

// Mark as read
router.post("/read", auth, notificationController.markAsRead);

module.exports = router;
