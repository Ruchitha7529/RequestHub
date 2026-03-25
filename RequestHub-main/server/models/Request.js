const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["Leave", "Purchase", "IT Support", "Travel", "Maintenance", "Other"],
    },
    dueDate: {
        type: Date,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    attachment: {
        type: String, // Store file path or URL
        default: null,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "in-review"],
        default: "pending",
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Request", requestSchema);
