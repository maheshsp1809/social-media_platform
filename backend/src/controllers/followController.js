const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.followUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const followerId = req.user.userId;

    if (userId === followerId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { followers: { connect: { id: followerId } } },
    });

    res.json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error following user" });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const followerId = req.user.userId;

    await prisma.user.update({
      where: { id: userId },
      data: { followers: { disconnect: { id: followerId } } },
    });

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error unfollowing user" });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = req.user.userId;

    const followers = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.json(followers.followers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching followers" });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const userId = req.user.userId;

    const following = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.json(following.following);
  } catch (error) {
    res.status(500).json({ error: "Error fetching following users" });
  }
};
