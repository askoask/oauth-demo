import express from "express"; // Web framework for handling routes and HTTP
import cookieParser from "cookie-parser"; // To parse cookies from requests
import cors from "cors"; // To enable cross-origin requests
import "dotenv/config";

const PORT = process.env.PORT || 4000;
const frontendBaseUrl = process.env.FRONTEND_BASE_URL;

import routes from "./routes/index.js";

const app = express();

// Enable CORS for frontend domain with credentials (cookies)
app.use(cors({ origin: frontendBaseUrl, credentials: true }));
// Enable cookie parsing for incoming requests
app.use(cookieParser());
app.use(express.json());
app.use("/", routes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
