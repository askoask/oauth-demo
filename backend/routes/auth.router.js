import express from "express";
import authService from "../services/auth.service.js";
import googleRouter from "./google.router.js";

const router = express.Router();

router.use("/google", googleRouter);

/**
 * Logout route: clears the session cookie.
 */
router.post("/logout", async (req, res) => {
  const payload = authService.getAuthCookie(req);
  authService.clearAuthCookie(res);
  res.sendStatus(204); // Send no content response
});

export default router;
