const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;
  const post = await prisma.post.create({
    data: {
      content,
      userId,
    },
  });
  res.json(post);
});

router.get("/newsfeed", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const follows = await prisma.follows.findMany({
    where: { followerId: userId },
    include: { following: true },
  });
  const followingIds = follows.map((f) => f.followingId);
  const posts = await prisma.post.findMany({
    where: { userId: { in: followingIds } },
    orderBy: { createdAt: "desc" },
  });
  res.json(posts);
});

module.exports = router;
