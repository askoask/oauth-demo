import express from "express";
import googleService from "../services/google.service.js";
import authService from "../services/auth.service.js";

const frontendBaseUrl = process.env.FRONTEND_BASE_URL;

const router = express.Router();
/**
 * Route to start Google OAuth login flow.
 * Redirects the user to Google's OAuth consent screen.
 */
router.get("/", (req, res) => {
  res.redirect(googleService.generateAuthUrl()); // Send user to Google login page
});

/**
 * Google OAuth callback route.
 * Exchanges code for tokens and stores profile info in a secure cookie.
 */
router.get("/callback", async (req, res) => {
  try {
    const { code } = req.query; // Authorization code from Google
    if (!code) {
      throw new Error("No code");
    }

    const payload = await googleService.getTokenPayload(code); // Contains user's profile info

    authService.setAuthCookie(
      res,
      new Date(payload.exp * 1000),
      "google",
      payload.email,
      payload.name,
      payload.given_name,
      payload.family_name,
      payload.picture,
    );

    // Redirect user to the frontend profile page
    res.redirect(frontendBaseUrl + "/profile");
  } catch (err) {
    console.error("Google auth error:", err);
    // On failure, redirect to the frontend login page
    res.redirect(frontendBaseUrl);
  }
});

export default router;
