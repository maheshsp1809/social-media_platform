const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res
      .status(201)
      .json({ message: "User created successfully", userId: user.id });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

// User routes
app.get("/api/users/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

app.get("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

app.put("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const { avatar, bio } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { avatar, bio },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
});

// Follow/Unfollow routes
app.post("/api/users/:id/follow", authenticateToken, async (req, res) => {
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
});

app.delete("/api/users/:id/unfollow", authenticateToken, async (req, res) => {
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
});

// Followers and Following routes
app.get("/api/users/me/followers", authenticateToken, async (req, res) => {
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
});

app.get("/api/users/me/following", authenticateToken, async (req, res) => {
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
});

// Post routes
app.post("/api/posts", authenticateToken, async (req, res) => {
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
});

app.get("/api/posts", authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: { select: { username: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching posts" });
  }
});

app.get("/api/posts/:id", authenticateToken, async (req, res) => {
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
});

app.put("/api/posts/:id", authenticateToken, async (req, res) => {
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
});

app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.post.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting post" });
  }
});

// Newsfeed route
app.get("/api/newsfeed", authenticateToken, async (req, res) => {
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
