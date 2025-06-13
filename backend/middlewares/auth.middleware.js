import authService from '../services/auth.service.js';
import { inspect } from 'node:util';

// Middleware to verify JWT token and extract user ID
export default async function authMiddleware(req, res, next) {
  try {
    const s = `${req.method.toUpperCase()} ${req.originalUrl}`;
    const f = s === 'GET /chat/messages';
    if (!f) {
      console.log(inspect(s));
    }

    // Extract the Authorization header from the request
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with "Bearer "
    // The optional chaining (?.) ensures we don't get an error if authHeader is undefined
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Bearer authorization header is required');
    }

    // Split the Authorization header to get just the token part
    // Format is "Bearer <token>", so split on space and take second part
    const token = authHeader.split(' ')[1];

    // Verify the JWT token and extract the payload
    // verifyJWT returns null if token is invalid or expired
    // const payload = await authService.verifyJWT(token);
    const payload = await authService.verifyJWTInsecure(token);

    if (!f) {
      console.log('Verified JWT payload:', inspect(payload));
    }

    // Check if payload exists and contains a subject (user ID)
    // The optional chaining (?.) ensures we don't get an error if payload is null
    if (!payload?.sub) {
      console.log('No subject in token', inspect(token), inspect(payload));
      throw new Error('No subject in token');
    }

    // Add the user ID from the token payload to the request object
    // This makes it available to downstream middleware and route handlers
    req.userId = payload.sub;

    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    console.log(
      'req.headers.authorization:',
      inspect(req?.headers?.authorization)
    );
    console.error(err);
    // Handle any unexpected errors during token verification
    return res.status(401).json({ error: 'Error verifying token' });
  }
}
