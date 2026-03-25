const Request = require("../models/Request");
const User = require("../models/User");

// Get all pending and in-review requests for n8n automation
exports.getPendingRequests = async (req, res) => {
    try {
        // Fetch pending and in-review requests
        const requests = await Request.find({ status: { $in: ["pending", "in-review"] } })
            .populate("submittedBy", "name email department role")
            .sort({ createdAt: -1 });

        // Fetch HR and Admin users so n8n knows who to notify
        const adminsAndHR = await User.find({ role: { $in: ["admin", "hr"] } })
            .select("name email role department");

        res.json({
            success: true,
            count: requests.length,
            requests,
            approvers: adminsAndHR // n8n can use this list to notify the right people
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
