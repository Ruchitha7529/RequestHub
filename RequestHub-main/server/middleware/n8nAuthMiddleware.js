const dotenv = require("dotenv");
dotenv.config();

module.exports = (req, res, next) => {
    const apiKey = req.header("x-n8n-api-key");

    if (!apiKey) {
        return res.status(401).json({ success: false, message: "No API key, authorization denied" });
    }

    if (apiKey !== process.env.N8N_API_KEY) {
        return res.status(401).json({ success: false, message: "Invalid API key" });
    }

    // Set system user context so downstream controllers (like triggerReminders) pass role checks
    req.user = {
        role: 'admin',
        name: 'n8n System',
        id: 'system'
    };

    next();
};
