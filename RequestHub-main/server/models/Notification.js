const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipientRole: {
        type: String,
        enum: ["admin", "hr", "user"],
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null // null means send to everyone with the recipientRole
    },
    message: {
        type: String,
        required: true
    },
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
        required: false // Optional for urgent summaries
    },
    type: {
        type: String,
        enum: ["newRequest", "statusUpdate", "urgent"],
        required: true
    },
    data: {
        type: Object,
        default: null
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Notification", notificationSchema);
