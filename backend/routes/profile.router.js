import express from "express";
import authService from "../services/auth.service.js";

const router = express.Router();

/**
 * Protected route that returns user profile info if logged in.
 * Reads session data from a cookie.
 */
router.get("/", async (req, res) => {
  try {
    // Attempt to parse session cookie
    const payload = authService.getAuthCookie(req);

    // If no session found, reject the request
    if (!payload.email) {
      throw new Error("No session");
    }

    // Return user profile + sample secret info
    res.json({
      email: payload.email,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture,
      secretInfo: "Server memory usage " + getMemoryUsage(),
    });
  } catch (e) {
    // If invalid or missing cookie, return 401 Unauthorized
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;

function getMemoryUsage() {
  const memoryUsage = process.memoryUsage();

  const formatBytes = (bytes) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
  };

  return formatBytes(memoryUsage.rss);
}
