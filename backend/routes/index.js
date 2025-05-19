import express from "express";
import profileRouter from "./profile.router.js";
import authRouter from "./auth.router.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/profile", profileRouter);

export default router;
