import express from "express";
import zod from "zod";
import authService from "../services/auth.service.js";
import googleRouter from "./google.router.js";
import microsoftRouter from "./microsoft.router.js";
import microsoftService from "../services/microsoft.service.js";
import { usersData } from "../users.data.js";
import cryptoService from "../services/crypto.service.js";

// for await (let user of usersData) {
//   user.password = user.email + "123";
//   user.password = await cryptoService.hashPassword(user.password);
// }
// console.log(JSON.stringify(usersData));

// Zod schema
const loginSchema = zod.object({
  username: zod
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(100, "Username must be at most 100 characters long"),
  password: zod
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must be at most 100 characters long"),
});

const router = express.Router();

router.use("/google", googleRouter);
router.use("/microsoft", microsoftRouter);
/**
 * Logout route: clears the session cookie.
 */
router.post("/login", async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("Validation failed:", parseResult.error.errors);
    return res.status(400).json({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { username, password } = parseResult.data;
  const user = usersData.find(
    (user) => user.email.toLowerCase() === username.toLowerCase(),
  );
  if (!user) {
    // Don't tell that this username does not exist
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (!(await cryptoService.verifyPassword(password, user.password))) {
    // Don't tell that username exists but password is wrong
    return res.status(401).json({ error: "Invalid credentials" });
  }

  authService.setAuthCookie(
    res,
    new Date(Date.now() + process.env.AUTH_EXPIRATION_DEFAULT_SEC * 1000),
    "custom",
    user.email,
    user.name,
    user.given_name,
    user.family_name,
    user.picture,
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
