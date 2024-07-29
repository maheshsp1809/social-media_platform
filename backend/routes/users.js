const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/profile/:username", async (req, res) => {
  const { username } = req.params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: { posts: true },
  });
  res.json(user);
});

router.post("/follow", authMiddleware, async (req, res) => {
  const { followId } = req.body;
  const followerId = req.user.id;
  const follow = await prisma.follows.create({
    data: {
      followerId,
      followingId: followId,
    },
  });
  res.json(follow);
});

module.exports = router;
