import crypto from 'node:crypto';

/**
 *  This is the length (in bytes) of the derived key (hashed password).
 *  64 bytes = 512 bits of output.
 *  It’s a balance between security and storage size.
 *  Many password hashing systems (like bcrypt) have lower output size limits (e.g., 192 bits). scrypt supports longer outputs.
 *  64 bytes ensures enough entropy and future-proofs your system for other uses (e.g., generating encryption keys).
 */
const PASSWORD_HASH_KEY_LENGTH = 64;

/**
 * CryptoService is a singleton class that provides cryptographic utilities,
 * including encryption and decryption of text, password hashing, and password verification.
 * It uses AES-256-GCM for encryption and scrypt for password hashing.
 */
class CryptoService {
  static #instance;
  /**
   * const key = crypto.randomBytes(32).toString("hex");
   */
  #key = Buffer.from(process.env.CRYPTO_KEY, 'hex');

  constructor() {
    if (CryptoService.#instance) {
      return CryptoService.#instance;
    }

    CryptoService.#instance = this;
  }

  encrypt(text) {
    // Initialization Vector (12 bytes for GCM)
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.#key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
      tag: authTag.toString('hex'),
    });
  }

  decrypt(encrypted) {
    const { iv, content, tag } = JSON.parse(encrypted);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.#key,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(content, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  hashPassword(password) {
    /**
     *  Security Purpose: Salt is meant to ensure that the same password always results in a different hash.
     *  16 bytes = 128 bits, which is considered sufficient to prevent precomputed attacks like rainbow tables.
     *  It’s industry standard (used in systems like bcrypt, scrypt, and PBKDF2) and recommended by NIST.
     */
    const salt = crypto.randomBytes(16).toString('hex');

    return new Promise((resolve, reject) => {
      crypto.scrypt(
        password,
        salt,
        PASSWORD_HASH_KEY_LENGTH,
        (err, derivedKey) => {
          if (err) return reject(err);
          const hash = derivedKey.toString('hex');
          resolve(`${salt}:${hash}`);
        }
      );
    });
  }

  verifyPassword(password, storedHash) {
    const [salt, originalHash] = storedHash.split(':');

    return new Promise((resolve, reject) => {
      crypto.scrypt(
        password,
        salt,
        PASSWORD_HASH_KEY_LENGTH,
        (err, derivedKey) => {
          if (err) return reject(err);
          const hash = derivedKey.toString('hex');
          resolve(
            crypto.timingSafeEqual(
              Buffer.from(hash, 'hex'),
              Buffer.from(originalHash, 'hex')
            )
          );
        }
      );
    });
  }
}

export default new CryptoService();
