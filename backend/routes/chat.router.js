import express from 'express';
import { Cacheable } from 'cacheable';
import authMiddleware from '../middlewares/auth.middleware.js';
import userService from '../services/user.service.js';
import { chatMessages } from '../data/chat.data.js';
import crypto from 'node:crypto';

/**
 * Express router for chat message endpoints
 * Handles storing and retrieving chat messages with user details
 */
const router = express.Router();

/**
 * Cache instance for storing messages in memory
 * Uses Cacheable library for automatic expiration
 */
const cache = new Cacheable();

/**
 * Cache key for storing chat messages
 * Format: "chat:messages"
 */
const CACHE_KEY = 'chat:messages';

// Preload chat messages into cache with 24h expiry at module load
(async () => {
  if (!(await cache.get(CACHE_KEY))) {
    await cache.set(CACHE_KEY, chatMessages, 24 * 60 * 60 * 1000);
  }
})();

/**
 * POST /messages - Store a new chat message
 *
 * Protected by auth middleware to ensure only logged in users can post
 *
 * Request body:
 * - text: String - The message content
 *
 * Response:
 * - 201: Message stored successfully
 * - 400: Invalid/missing message text
 * - 401: User not authenticated
 * - 500: Server error
 */
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    // Extract and validate message text
    const { text } = req.body;
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Verify user is authenticated
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get existing messages from cache
    let messages = (await cache.get(CACHE_KEY)) || [];

    // Create and append new message
    const message = { user: userId, text, id: crypto.randomUUID() };
    messages.push(message);

    // Store updated messages with 24h expiry
    await cache.set(CACHE_KEY, messages, 24 * 60 * 60 * 1000);

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to store message' });
  }
});

/**
 * GET /messages - Retrieve all chat messages
 *
 * Protected by auth middleware to ensure only logged in users can view
 * Enriches messages with user details from user service
 *
 * Response:
 * - 200: Array of messages with user details
 * - 401: User not authenticated
 * - 500: Server error
 */
router.get('/messages', authMiddleware, async (req, res) => {
  try {
    // Get messages from cache
    const messages = (await cache.get(CACHE_KEY)) || [];

    // Enrich each message with user details
    const enrichedMessages = messages.map((message) => {
      const user = userService.findUserById(message.user);
      return {
        ...message,
        user: {
          id: message.user,
          name: user?.name,
          email: user?.email,
          picture: user?.picture,
        },
      };
    });

    res.json(enrichedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
export { cache, CACHE_KEY };
