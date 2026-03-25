const express = require("express");
const router = express.Router();
const n8nController = require("../controllers/n8nController");
const n8nAuth = require("../middleware/n8nAuthMiddleware");

// Get all pending requests protected by n8n API key
router.get("/requests/pending", n8nAuth, n8nController.getPendingRequests);

module.exports = router;
