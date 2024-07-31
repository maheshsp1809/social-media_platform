const express = require("express");
const followController = require("../controllers/followController");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

router.post("/:id/follow", authenticateToken, followController.followUser);
router.delete(
  "/:id/unfollow",
  authenticateToken,
  followController.unfollowUser
);
router.get("/me/followers", authenticateToken, followController.getFollowers);
router.get("/me/following", authenticateToken, followController.getFollowing);

module.exports = router;
