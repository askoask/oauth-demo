import express from 'express'; // Web framework for handling routes and HTTP
import cors from 'cors'; // To enable cross-origin requests
import 'dotenv/config';
import tokenRouter from './routes/token.router.js';
import { inspect } from 'node:util';

// Configure console to show colors and nested objects by default
inspect.defaultOptions.colors = true;
inspect.defaultOptions.depth = 4;

const PORT = process.env.PORT || 4500;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/steal', tokenRouter);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
