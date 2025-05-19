import express from "express";
import zod from "zod";
import authService from "../services/auth.service.js";
import googleRouter from "./google.router.js";
import microsoftRouter from "./microsoft.router.js";
import microsoftService from "../services/microsoft.service.js";

// Zod schema
const loginSchema = zod.object({
  username: zod
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(10, "Username must be at most 10 characters long"),
  password: zod
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(10, "Password must be at most 10 characters long"),
});

const router = express.Router();

router.use("/google", googleRouter);
router.use("/microsoft", microsoftRouter);
/**
 * Logout route: clears the session cookie.
 */
router.post("/login", (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("Validation failed:", parseResult.error.errors);
    return res.status(400).json({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  authService.setAuthCookie(
    res,
    new Date(Date.now() + process.env.AUTH_EXPIRATION_DEFAULT_SEC * 1000),
    "custom",
    "test@example.com",
    "John Smith",
    "John",
    "Smith",
    null,
  );
  res.sendStatus(200);
});

/**
 * Logout route: clears the session cookie.
 */
router.post("/logout", async (req, res) => {
  const payload = authService.getAuthCookie(req);
  authService.clearAuthCookie(res);
  await microsoftService.clearAccessTokenCached(payload.email);
  res.sendStatus(204); // Send no content response
});

export default router;
