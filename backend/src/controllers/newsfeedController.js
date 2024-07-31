const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getNewsfeed = async (req, res) => {
  try {
    const userId = req.user.userId;
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { authorId: userId },
          {
            author: {
              followers: {
                some: {
                  id: userId,
                },
              },
            },
          },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching newsfeed" });
  }
};
