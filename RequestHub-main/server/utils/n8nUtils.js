const axios = require("axios");

/**
 * Sends a notification payload to the n8n webhook.
 * @param {Object} data - The notification data (message, requestId, user info, etc.)
 */
const sendToN8n = async (data) => {
    try {
        const webhookUrl = process.env.N8N_WEBHOOK_URL;

        if (!webhookUrl || webhookUrl.includes("your-n8n-instance.com")) {
            console.warn("n8nUtils: N8N_WEBHOOK_URL is not configured. Skipping webhook call.");
            return;
        }

        const response = await axios.post(webhookUrl, data, {
            headers: {
                "Content-Type": "application/json",
                "x-n8n-api-key": process.env.N8N_API_KEY
            }
        });

        console.log("n8nUtils: Webhook sent successfully", response.status);
    } catch (error) {
        console.error("n8nUtils: Error sending to n8n", error.message);
    }
};

module.exports = { sendToN8n };
