import express from "express";
import microsoftService from "../services/microsoft.service.js";
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

    if (payload.provider === "microsoft" && !payload.picture) {
      payload.picture = await microsoftService.getUserPhoto(payload.email);
    }

    // Return user profile + sample secret info
    res.json({
      email: payload.email,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture,
      secretInfo: "This is a secret info from server " + Math.random(),
    });
  } catch (e) {
    // If invalid or missing cookie, return 401 Unauthorized
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;
