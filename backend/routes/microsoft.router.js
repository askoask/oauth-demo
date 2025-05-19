import express from "express";
import authService from "../services/auth.service.js";
import microsoftService from "../services/microsoft.service.js";

const router = express.Router();

const frontendBaseUrl = process.env.FRONTEND_BASE_URL;

// Start the Microsoft OAuth login flow
router.get("/", async (req, res) => {
  // create a CSRF token and store it locally
  const state = microsoftService.generateAndPersistCSRFToken(res);
  res.redirect(microsoftService.buildAuthorizeUrl(state));
});

// Microsoft OAuth callback route using fetch
router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      throw new Error("No code");
    }
    microsoftService.compareCSRFToken(req, state);
    microsoftService.clearCSRFToken(res);

    // Exchange code for tokens
    const tokenData = await microsoftService.getTokenDataByCode(code);
    const accessToken = tokenData.access_token;

    // Fetch user profile
    const user = await microsoftService.fetchUserProfile(accessToken);
    const expirationDate = new Date(Date.now() + tokenData.expires_in * 1000);
    const email = user.mail || user.userPrincipalName;

    // Store session in secure cookie
    authService.setAuthCookie(
      res,
      expirationDate,
      "microsoft",
      email,
      user.displayName,
      user.givenName,
      user.surname,
      null,
    );

    await microsoftService.cacheAccessToken(email, accessToken, expirationDate);

    res.redirect(frontendBaseUrl + "/profile");
  } catch (err) {
    console.error("Microsoft auth error:", err);
    res.redirect(frontendBaseUrl);
  }
});

export default router;
