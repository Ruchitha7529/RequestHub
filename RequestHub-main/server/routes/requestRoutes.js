const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const n8nAuth = require("../middleware/n8nAuthMiddleware");

// Create request (Protected)
router.post("/", auth, upload.single("attachment"), requestController.createRequest);

// Get requests (Protected)
router.get("/", auth, requestController.getRequests);

// Update request status (Admin only - Protected)
router.put("/:id/status", auth, requestController.updateRequestStatus);

// Trigger urgent reminders (n8n/Cron - Protected by API Key)
router.post("/remind-hr", n8nAuth, requestController.triggerReminders);

module.exports = router;
