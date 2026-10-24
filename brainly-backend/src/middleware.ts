import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_Pass } from "./config.js";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"] || (req.headers["token"] as string | undefined);

  if (!header) {
    res.status(403).json({
      message: "Authorization token missing. You are not logged in.",
    });
    return;
  }

  // Handle both "Bearer <token>" and raw "<token>"
  const token = typeof header === "string" && header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : (header as string).trim();

  try {
    const decoded = jwt.verify(token, JWT_Pass);
    if (decoded && typeof decoded !== "string" && "id" in decoded) {
      req.userId = (decoded as JwtPayload).id;
      next();
    } else {
      res.status(403).json({
        message: "Invalid token payload",
      });
      return;
    }
  } catch (error) {
    res.status(403).json({
      message: "Invalid or expired token",
    });
    return;
  }
};

