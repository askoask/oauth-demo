import crypto from "node:crypto";

// const key = crypto.randomBytes(32).toString("hex");

class CryptoService {
  static #instance;
  #key = Buffer.from(process.env.CRYPTO_KEY, "hex");

  constructor() {
    if (CryptoService.#instance) {
      return CryptoService.#instance;
    }

    CryptoService.#instance = this;
  }

  encrypt(text) {
    // Initialization Vector (12 bytes for GCM)
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.#key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString("hex"),
      content: encrypted.toString("hex"),
      tag: authTag.toString("hex"),
    });
  }

  decrypt(encrypted) {
    const { iv, content, tag } = JSON.parse(encrypted);

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      this.#key,
      Buffer.from(iv, "hex"),
    );
    decipher.setAuthTag(Buffer.from(tag, "hex"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(content, "hex")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }
}

export default new CryptoService();
