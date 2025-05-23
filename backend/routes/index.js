import express from "express";
import authRouter from "./auth.router.js";
import profileRouter from "./profile.router.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/profile", profileRouter);

export default router;
