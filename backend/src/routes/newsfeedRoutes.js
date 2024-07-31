const express = require("express");
const newsfeedController = require("../controllers/newsfeedController");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

router.get("/", authenticateToken, newsfeedController.getNewsfeed);

module.exports = router;
