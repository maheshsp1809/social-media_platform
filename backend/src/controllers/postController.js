const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await prisma.post.create({
      data: {
        content,
        authorId: req.user.userId,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error creating post" });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: { select: { username: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching posts" });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { author: { select: { username: true, avatar: true } } },
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error fetching post" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(req.params.id) },
      data: { content },
    });
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: "Error updating post" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await prisma.post.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting post" });
  }
};
