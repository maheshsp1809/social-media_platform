const express = require("express");
const userController = require("../controllers/userController");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

router.get("/me", authenticateToken, userController.getMe);
router.get("/", authenticateToken, userController.getAllUsers);
router.get("/:id", authenticateToken, userController.getUserById);
router.put("/:id", authenticateToken, userController.updateUser);

module.exports = router;
