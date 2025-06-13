import { Cacheable } from 'cacheable';
import * as jose from 'jose';
import jwt from 'jsonwebtoken';

// # 1. Generate a new 2048-bit private key in PKCS#8 format
// openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048

// # 2. Extract public key
// openssl rsa -pubout -in private.pem -out public.pem

// ⚠️ Simulated RSA keypair (normally you'd use a real keypair or JWKS)
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo3BNo4ZQEelQvK0m5Gkb
5vwyA5PE267YpdRy2NsWVhBb2M2Hr3yofLmOIoRurDy7YUnaocL758IyPbcY8CA8
VhpBh8papT/J49HnPIvMob0Gy0VeYJ3zSxig59e6Yq+BPBXUlNsgvf9ckQ9H1EBS
G+5LBklntCuLmKGOxgnXi3FxXuEcL7klZGo0yogKq6spN7nl2iNz0r8oc0uYuU8i
+zqQ+5KBoPbLvCbWtHrYRweBCyT5lRpHsgoMEhQV9Xk2M/ZkVHFh17b9q68I/2oB
wJfItmEBJNLlPgtCljspyL9P4N5qSEmCDLE8ODnapveTboAXhdYFTUq9YTRnPdtN
9wIDAQAB
-----END PUBLIC KEY-----`;

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCjcE2jhlAR6VC8
rSbkaRvm/DIDk8Tbrtil1HLY2xZWEFvYzYevfKh8uY4ihG6sPLthSdqhwvvnwjI9
txjwIDxWGkGHylqlP8nj0ec8i8yhvQbLRV5gnfNLGKDn17pir4E8FdSU2yC9/1yR
D0fUQFIb7ksGSWe0K4uYoY7GCdeLcXFe4RwvuSVkajTKiAqrqyk3ueXaI3PSvyhz
S5i5TyL7OpD7koGg9su8Jta0ethHB4ELJPmVGkeyCgwSFBX1eTYz9mRUcWHXtv2r
rwj/agHAl8i2YQEk0uU+C0KWOynIv0/g3mpISYIMsTw4Odqm95NugBeF1gVNSr1h
NGc92033AgMBAAECggEAB6LZnchKuWuDQC1+4bEfgp1J4Ozoh7MVoDna29Lwqji9
cdW4fzR90sYApBA384gq4RLISkKH7n4eRs/lNGLtLsCvSx7jOVFPp3tJKIUHnI7u
YFTvYeg/U8Tkz7A+nxnAGgSTGBlc4EOsGYLzQjF3JKLvkm2fkMVwEkOKHiqbjYI+
M4UaW+IkNm/9n5C/+4FEMwJdv244AQllJ8eHNdjxy9D8YoLuePGhNQjr9Irtvd0W
NDUqs9NHfbVUqW6drow/oRJ/bu13G9/PeBwkJDLVAVxfgrZKmHkr0jVRLGWT+tYM
YqpIprT+jBF1w5SBgFLpjbNkm7CjIjorzTj7pIs9MQKBgQDdPTX91J/qc1ArHC1X
c4b8s+ILC49/xz+A/HpVMgVm2PARl5b5d4s9mDsFIUXyz0Sjk9d3ytbl7J3aKsCD
0Z+qnhWyGS8f8aRnYXETlsaM/Sj05H+XGZrPo8J9HUWh3O/16A5ISiLnjj+Z4LPI
/r5t9vUTG8mj2YYNsCrxMUhjdQKBgQC9HjcVlBNerTJyDs3HbjaXgcoUgwBacLYm
HKIx2zcJfTA6iqpaMG84o9OoUZYFrF0HKRnDQPwKPL4Y7OegbEIJjVbfQl+u+boF
KFStpZbQi826+12K66K9iMyV117XpWlq98D5RxWcPpGV4Z4Ok/TEbu+nBR2zpdKP
+N9AafiaOwKBgA88JNiq6Kw7bpzZXuHzyarjNECwdhxFe0EFoeL2A9s2Oynq93GM
YuFF92J+DRQQY9ij2KWeKThCGAirAwDQ0Z7tLe9Kvq0Ddd/MnP3NVzTkRgq/JW4h
TEDaNQ1qk5322etkJH+j401wxT5yc872g+SMqgm70yHeW9XbeMmNLD/1AoGBALTR
n+9UzhRW2wWs29mTqkTABrwH6R2P6MiV1gp/Q6ch+CvxCyICb0UjdqrXnu47uBKx
nH1Qs+sB2uwwDuMWvyks52O9rYi6Ir7tqdEBoyowkXr2/aBm3goEM0ANVRQwhpOM
4Qg2jBYAyOgaeSoNExmBzEfQH2713FZlqOeIqvajAoGBAJN8uTi+EKZrlTwoR03P
5kg3xsw1r0H5DXU5Zh9O8LXGOiq3AX5VDli3TWuUvt1zjPUvlWp7v8nAUM12BN9F
E8A1+kGpiAIvXaOijX3UpWDWx2fhG+9iGkUIlj8QQKMoP9CcyzaXjo1ye/GU9yxn
0alkGX1d7Yk5pu9rBOyii5P7
-----END PRIVATE KEY-----`;

class AuthService {
  static #instance;
  #useJose = false;
  #cache = new Cacheable();

  constructor() {
    if (AuthService.#instance) {
      return AuthService.#instance;
    }

    AuthService.#instance = this;
  }

  /**
   * Generates a JSON Web Token (JWT) from a payload
   * @param {Object} payload - Data to be encoded in the JWT
   * @returns {string} Complete JWT string in format: header.payload.signature
   */
  async generateJWT(payload) {
    try {
      // Create a new signing key from the JWT secret
      // const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

      const secretKey = await jose.importPKCS8(privateKey, 'RS256');

      // Sign the payload with the configured algorithm
      const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'RS256' })
        .setIssuedAt()
        .setExpirationTime(
          Math.floor(Date.now() / 1000) +
            parseInt(process.env.AUTH_EXPIRATION_DEFAULT_SEC)
        )
        .sign(secretKey);
      return token;
    } catch (err) {
      console.error('Error generating JWT:', err);
      return null;
    }
  }

  /**
   * Verifies and decodes a JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object|null} Decoded payload if token is valid, null otherwise
   */
  async verifyJWT(token) {
    try {
      const secretKey = await jose.importSPKI(publicKey, 'RS256');

      // Verify the token and get payload
      const { payload } = await jose.jwtVerify(token, secretKey, {
        algorithms: ['RS256'],
      });
      if (!payload) {
        throw new Error('No payload in token');
      }

      // Check if token has expired (jose handles this automatically, but double check)
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return null;
      }

      return payload;
    } catch (err) {
      // Return null if any errors occur during verification
      console.error('Error verifying JWT:', err);
      return null;
    }
  }

  /**
   * ❌ Insecure verification
   * CVE-2015-9235
   * In jsonwebtoken node module it is possible for an attacker to bypass verification when a token digitally signed with an asymmetric key (RS/ES family)
   * of algorithms but instead the attacker send a token digitally signed with a symmetric algorithm (HS* family).
   *
   * Here’s a list of known jsonwebtoken vulnerabilities:
   * •	CVE‑2015‑9235; RSA → HMAC “alg” confusion allowing signature bypass; published May 29, 2018; affected versions: < 4.2.2; fixed in 4.2.2 (Oct 9, 2018)  ￼.
   * •	CVE‑2022‑23540; “none” algorithm bypass due to missing algorithms and falsy key; published Dec 22, 2022; affected versions: ≤ 8.5.1; fixed in 9.0.0 (Dec 21, 2022)  ￼.
   * Additionally, note these related flaws addressed alongside CVE‑2022‑23540 in version 9.0.0:
   * •	CVE‑2022‑23539; unrestricted key type allowing legacy/unsupported algorithms; published Dec 2022; affected ≤ 8.5.1; fixed in 9.0.0  ￼.
   * •	CVE‑2022‑23541; key retrieval misconfig allowing RSA→HMAC forgery; published Dec 2022; affected ≤ 8.5.1; fixed in 9.0.0  ￼.
   */
  async verifyJWTInsecure(token) {
    try {
      //
      const payload = jwt.verify(
        token,
        publicKey
        // ❌ No algorithms restriction
      );

      if (!payload) {
        throw new Error('No payload in token');
      }

      // Check if token has expired (jose handles this automatically, but double check)
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return null;
      }

      return payload;
    } catch (err) {
      // Return null if any errors occur during verification
      console.error('Error verifying JWT:', err);
      return null;
    }
  }

  /**
   * Just demonstration code sample, not used in the project
   */
  async verifyAuthProviderToken(token) {
    const jwksUri =
      'https://accounts.google.com/.well-known/openid-configuration';
    // or Microsoft: 'https://login.microsoftonline.com/common/discovery/v2.0/keys'

    const JWKS = jose.createRemoteJWKSet(
      new URL('https://www.googleapis.com/oauth2/v3/certs')
    );

    try {
      const { payload } = await jose.jwtVerify(token, JWKS, {
        issuer: 'https://accounts.google.com', // or Microsoft issuer
        audience: 'YOUR_CLIENT_ID', // from your OAuth2 config
      });

      console.log('Token is valid:', payload);
    } catch (e) {
      console.error('Invalid token:', e);
    }
  }
}

export default new AuthService();
