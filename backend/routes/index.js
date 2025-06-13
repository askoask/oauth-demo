import express from 'express';
import authRouter from '../routes/auth.router.js';
import profileRouter from '../routes/profile.router.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import chatRouter from './chat.router.js';
import productRouter from './product.router.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/profile', authMiddleware, profileRouter);
router.use('/chat', authMiddleware, chatRouter);
router.use('/products', authMiddleware, productRouter);

export default router;
