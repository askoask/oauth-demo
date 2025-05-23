import { OAuth2Client } from "google-auth-library";

class GoogleService {
  static #instance;

  // Create an instance of Google's OAuth2 client
  #oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  constructor() {
    if (GoogleService.#instance) {
      return GoogleService.#instance;
    }
    GoogleService.#instance = this;
  }

  generateAuthUrl() {
    return this.#oauth2Client.generateAuthUrl({
      access_type: "offline", // Ensures refresh token is returned
      scope: ["profile", "email"], // Request basic user info
      prompt: "consent", // Always show consent screen
    });
  }

  async getTokenPayload(code) {
    // Exchange code for tokens (access_token, id_token, etc.)
    const { tokens } = await this.#oauth2Client.getToken(code);
    this.#oauth2Client.setCredentials(tokens);

    // Verify ID token and get user info (payload)
    const ticket = await this.#oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload(); // Contains user's profile info
  }
}

export default new GoogleService();
