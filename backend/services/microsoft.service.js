import crypto from "node:crypto";
import { Cacheable } from "cacheable";

const tenantId = process.env.MICROSOFT_TENANT_ID; // your tenant.on microsoft.com
const microsoftAuthUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`;
const microsoftTokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
const microsoftProfileUrl = "https://graph.microsoft.com/v1.0/me";
const microsoftPhotoUrl = "https://graph.microsoft.com/v1.0/me/photo/$value";

const microsoftScope = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "https://graph.microsoft.com/User.Read",
].join(" ");

class MicrosoftService {
  static #instance;
  #cache = new Cacheable();

  constructor() {
    if (MicrosoftService.#instance) {
      return MicrosoftService.#instance;
    }

    MicrosoftService.#instance = this;
  }

  buildAuthorizeUrl(state) {
    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      response_type: "code",
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
      response_mode: "query",
      scope: microsoftScope,
      prompt: "consent",
      state,
    });
    return `${microsoftAuthUrl}?${params.toString()}`;
  }

  async getUserPhoto(email) {
    try {
      const cachedData = await this.#cache.get(`photo:${email}`);
      if (cachedData) {
        console.info("Using cached photo");
        return cachedData;
      }
      const accessToken = await this.getAccessTokenCached(email);
      const photoRes = await fetch(microsoftPhotoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!photoRes.ok) {
        throw new Error("Could not fetch photo");
      }
      // Get binary data and convert to base64
      const arrayBuffer = await photoRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      await this.#cache.set(`photo:${email}`, data, 10 * 60 * 1000);
      return data;
    } catch (err) {
      return null;
    }
  }

  async getTokenDataByCode(code) {
    const tokenRes = await fetch(microsoftTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        code,
        // scope: microsoftScope,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("Token request failed");
    }

    return await tokenRes.json();
  }

  async fetchUserProfile(accessToken) {
    const profileRes = await fetch(microsoftProfileUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileRes.ok) {
      throw new Error("Profile request failed");
    }

    return await profileRes.json();
  }

  generateAndPersistCSRFToken(res) {
    const latestCSRFToken = crypto.randomBytes(16).toString("hex");
    res.cookie("csrf-token", latestCSRFToken, {
      httpOnly: true, // JavaScript can't access this cookie
      secure: true, // Sent only over HTTPS
      sameSite: "Lax", // Cookie isn't sent on cross-site subrequests
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });
    return latestCSRFToken;
  }

  compareCSRFToken(req, csrfToken) {
    if (!csrfToken) {
      throw new Error("No CSRF token provided");
    }
    const storedCSRFToken = req.cookies["csrf-token"];
    if (!storedCSRFToken) {
      throw new Error("No CSRF token persisted");
    }
    if (storedCSRFToken !== csrfToken) {
      throw new Error("CSRF token mismatch");
    }
  }

  clearCSRFToken(res) {
    res.clearCookie("csrf-token");
  }

  async cacheAccessToken(email, accessToken, expirationDate) {
    await this.#cache.set(
      `access_token:${email}`,
      accessToken,
      expirationDate.getTime(),
    );
  }

  async getAccessTokenCached(email) {
    return this.#cache.get(`access_token:${email}`);
  }

  async clearAccessTokenCached(email) {
    await this.#cache.delete(`access_token:${email}`);
  }
}

export default new MicrosoftService();
