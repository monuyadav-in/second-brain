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
  const { firstName, lastName, email, username, password } = req.body;
  const userEmail = (email || username || "").toLowerCase().trim();
  const fallbackUsername = username || (userEmail ? userEmail.split("@")[0] : `${firstName || ""}${lastName || ""}`);

  if (!userEmail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existing = await UserModel.findOne({
      $or: [{ email: userEmail }, { username: fallbackUsername }],
    });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const newUser = await UserModel.create({
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: userEmail,
      username: fallbackUsername,
      password,
    });

    return res.json({
      message: "User signed up successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (e) {
    console.error("Signup error:", e);
    return res.status(409).json({ message: "User already exists or invalid data" });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || "").toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
      password,
    });

    if (existingUser) {
      const token = jwt.sign(
        {
          id: existingUser._id,
        },
        JWT_Pass,
      );

      const displayName = existingUser.firstName || existingUser.username || existingUser.email?.split("@")[0] || "User";

      return res.json({
        token,
        user: {
          id: existingUser._id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          username: displayName,
        },
      });
    } else {
      return res.status(403).json({
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
    const { link, title, type, tags } = req.body;

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

    const newContent = await ContentModel.create({
      link,
      title,
      type: type || "Link",
      userId: req.userId,
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.json({
      message: "Content added successfully",
      content: newContent,
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

app.put(["/api/v1/content", "/api/v1/content/:id"], userMiddleware, async (req, res) => {
  try {
    const contentId = req.params.id || req.body?.contentId || req.body?._id;
    const { title, link, type, tags } = req.body;

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

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title;
    if (link !== undefined) updateData.link = link;
    if (type !== undefined) updateData.type = type;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];

    const updated = await ContentModel.findOneAndUpdate(
      { _id: contentId, userId: req.userId },
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Content not found or unauthorized to update",
      });
    }

    return res.json({
      message: "Content updated successfully",
      content: updated,
    });
  } catch (error) {
    console.error("Error updating content:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.delete(["/api/v1/content", "/api/v1/content/:id"], userMiddleware, async (req, res) => {
  try {
    const contentId = req.params.id || req.body?.contentId || req.query?.contentId;
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
