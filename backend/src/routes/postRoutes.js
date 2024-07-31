const express = require("express");
const postController = require("../controllers/postController");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

router.post("/", authenticateToken, postController.createPost);
router.get("/", authenticateToken, postController.getAllPosts);
router.get("/:id", authenticateToken, postController.getPostById);
router.put("/:id", authenticateToken, postController.updatePost);
router.delete("/:id", authenticateToken, postController.deletePost);

module.exports = router;
