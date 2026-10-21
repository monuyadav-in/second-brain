import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, UserModel } from "./db.js";
import { JWT_Pass } from "./config.js";
import { userMiddleware } from "./middleware.js";
const app = express();
app.use(express.json());

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

    const exitingUser = await UserModel.findOne({
      username,
      password,
    });

    if (exitingUser) {
      const token = jwt.sign(
        {
          id: exitingUser._id,
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
                message: "link and title are required"
            });
        }

        // 2. Added async to the route and properly closed the create() block
        await ContentModel.create({
            link,
            title,
            //@ts-ignore
            userId: req.userId,
            tags: []
        }); // <-- Properly closed ContentModel.create here

        return res.json({
            message: "Content added successfully"
        });

    } catch (error) {
        console.error("Error adding content:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;
  const content = await ContentModel.find({
    userId: userId
  }).populate("userId", "username")
  res.json({
    content
  })
});

app.delete("/api/v1/content", async (req, res) => {
  const contentId = req.body.contentId;
  await ContentModel.deleteMany({
    contentId: contentId,
    //@ts-ignore
    userId: req.userId
  })
  res.json({
    "message": "Deleted"
  })
});

app.post("/api/v1/brain/share", (req, res) => {});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
