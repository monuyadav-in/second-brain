declare global {
  namespace Express{
    export interface Request {
      userId ?: string;
    }
  }
}

import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_Pass } from "./config.js";
import { userMiddleware } from "./middleware.js";

function random(len: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    await UserModel.create({
      username,
      password,
    });
    res.json({ message: "User signed up successfully" });
  } catch (e) {
    res.status(409).json({ message: "User already exists or invalid data" });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await UserModel.findOne({
      username,
      password,
    });

    if (existingUser) {
      const token = jwt.sign(
        {
          id: existingUser._id,
        },
        JWT_Pass,
      );
      res.json({
        token,
      });
    } else {
      res.status(403).json({
        message: "Incorrect Credentials",
      });
    }
  } catch (error) {
    console.error("Signin Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const link = req.body.link;
    const title = req.body.title;

    if (!link || !title) {
      return res.status(400).json({
        message: "link and title are required",
      });
    }

    if (!req.userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await ContentModel.create({
      link,
      title,
      userId: req.userId,
      tags: [],
    });

    return res.json({
      message: "Content added successfully",
    });
  } catch (error) {
    console.error("Error adding content:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const content = await ContentModel.find({
      userId: userId,
    }).populate("userId", "username");

    return res.json({
      content,
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const contentId = req.body.contentId;
    if (!contentId) {
      return res.status(400).json({
        message: "contentId is required",
      });
    }

    if (!req.userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const result = await ContentModel.deleteOne({
      _id: contentId,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Content not found or unauthorized to delete",
      });
    }

    return res.json({
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  try {
    const { share } = req.body;

    if (!req.userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (share) {
      const existingLink = await LinkModel.findOne({
        userId: req.userId,
      });

      if (existingLink) {
        return res.json({
          hash: existingLink.hash,
        });
      }

      const hash = random(10);
      await LinkModel.create({
        userId: req.userId,
        hash: hash,
      });

      return res.json({
        hash,
      });
    } else {
      await LinkModel.deleteOne({
        userId: req.userId,
      });

      return res.json({
        message: "Removed link",
      });
    }
  } catch (error) {
    console.error("Error sharing brain:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  try {
    const hash = req.params.shareLink;
    if (!hash) {
      return res.status(400).json({
        message: "shareLink is required",
      });
    }

    const link = await LinkModel.findOne({
      hash,
    });

    if (!link) {
      return res.status(404).json({
        message: "Shared link not found or invalid",
      });
    }

    const content = await ContentModel.find({
      userId: link.userId,
    });

    const user = await UserModel.findOne({
      _id: link.userId,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      username: user.username,
      content: content,
    });
  } catch (error) {
    console.error("Error fetching shared brain:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
