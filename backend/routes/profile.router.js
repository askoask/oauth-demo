import express from "express";
import userService from "../services/user.service.js";
const router = express.Router();

/**
 * Protected route that returns user profile info if logged in.
 * Reads session data from a cookie.
 */
router.get("/", async (req, res) => {
  try {
    const user = await userService.findUserById(req.userId);
    if (!user?.id) {
      throw new Error("User not found");
    }

    res.json({
      email: user.email,
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
      picture: user.picture,
    });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
