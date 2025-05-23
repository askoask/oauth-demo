class AuthService {
  static #instance;

  constructor() {
    if (AuthService.#instance) {
      return AuthService.#instance;
    }

    AuthService.#instance = this;
  }

  setAuthCookie(
    res,
    expirationDate,
    provider,
    email,
    name,
    givenName,
    familyName,
    picture = null,
  ) {
    const data = JSON.stringify({
      provider,
      email,
      name,
      given_name: givenName,
      family_name: familyName,
      picture: picture || null,
    });
    res.cookie("session", data, {
      httpOnly: true, // JavaScript can't access this cookie
      secure: true, // Sent only over HTTPS
      sameSite: "Lax", // Cookie isn't sent on cross-site subrequests
      expires: expirationDate, // Expire with a token
    });
  }

  getAuthCookie(req) {
    return JSON.parse(req.cookies.session);
  }

  clearAuthCookie(res) {
    res.clearCookie("session");
  }
}

export default new AuthService();
