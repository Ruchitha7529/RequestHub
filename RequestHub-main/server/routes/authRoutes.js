const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Profile routes (Protected)
router.get("/me", auth, authController.getMe);
router.put("/profile", auth, authController.updateProfile);
router.put("/password", auth, authController.updatePassword);

module.exports = router;
