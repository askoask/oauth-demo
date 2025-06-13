import express from 'express';
import zod from 'zod';
import authService from '../services/auth.service.js';
import googleRouter from './google.router.js';
import microsoftRouter from './microsoft.router.js';
import userService from '../services/user.service.js';

// for await (let user of usersData) {
//   user.password = user.email + "123";
//   user.password = await cryptoService.hashPassword(user.password);
// }
// console.log(JSON.stringify(usersData));

// Zod schema
const loginSchema = zod.object({
  username: zod
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(100, 'Username must be at most 100 characters long'),
  password: zod
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be at most 100 characters long'),
});

const router = express.Router();

router.use('/google', googleRouter);
router.use('/microsoft', microsoftRouter);
/**
 * Logout route: clears the session cookie.
 */
router.post('/login', async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error('Validation failed:', parseResult.error.errors);
    return res.status(400).json({
      error: 'Validation failed',
      details: parseResult.error.errors,
    });
  }

  const { username, password } = parseResult.data;
  const user = await userService.findUserByUsernamePassword(username, password);
  // console.log("user", user);
  if (!user?.id) {
    // Don't tell whether username exists or password is wrong
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const payload = {
    // provider: "custom",
    // email: user.email,
    // name: user.name,
    // given_name: user.given_name,
    // family_name: user.family_name,
    // picture: user.picture,
    sub: user.id,
    // exp:
    //   Math.floor(Date.now() / 1000) +
    //   parseInt(process.env.AUTH_EXPIRATION_DEFAULT_SEC),
  };
  const accessToken = await authService.generateJWT(payload);
  res.json({ accessToken });
});

export default router;
