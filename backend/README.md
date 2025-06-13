# Backend Documentation

## Security Notes

- **This project is for educational and research purposes only.**
- It demonstrates a real-world JWT vulnerability: if a server uses RS256 for JWTs but accepts HS256 and exposes its public key, attackers can forge tokens using the public key as an HMAC secret.
- Do not use this code in production or for unauthorized testing.

## Overview

This Express.js backend API demonstrates common security vulnerabilities in web applications, particularly focusing on Cross-Site Scripting (XSS) attacks. It provides authentication, real-time chat functionality, and a products API to showcase how malicious code can be injected through various entry points.

## Key Features

- JWT-based authentication system
- Real-time chat messaging API
- Predefined user profiles
- Predefined initial chat messages
- Predefined products to buy
- Products API with payment processing connected to Strapi Sandbox
- Intentionally vulnerable XSS endpoints for educational purposes

## Installation & Configuration

### Prerequisites

- Node.js `>=22 <23`

### Installation Steps

1. Clone the repository and navigate to the `backend` directory
2. Run `npm ci` to install dependencies
3. Configure environment variables (see below)

#### Environment Variables

Create a `.env` file with the following variables:
| Variable | Description |
|----------|-------------|
| PORT | The port number the server will listen on (default: 4000) |
| FRONTEND_BASE_URL | Base URL of the frontend application for CORS configuration (e.g. http://localhost:5173) |
| AUTH_EXPIRATION_DEFAULT_SEC | JWT token expiration time in seconds (default: 300) |
| STRIPE_SECRET_KEY | Stripe API secret key for payment processing |
| PRODUCT_KEY_HASH_SECRET | Secret key used for hashing product keys |

Use `example.env` as example.

### Running server

Run `npm run dev` to start development server

### Important notices

#### Token verification

The `middlewares/auth.middleware.js` can use secure `verifyJWT()` or insecure `verifyJWTInsecure()` methods from `services/auth.service.js`. The insecure method exposes `CVE‑2015‑9235` vulnerability (RSA → HMAC “alg” confusion allowing signature bypass).

You can comment out one of the following lines of code in the middleware:

```javascript
// Secure code (uses secure jose library)
const payload = await authService.verifyJWT(token);

// Insecure code (uses vulnerable version of jsonwebtoken library)
const payload = await authService.verifyJWTInsecure(token);
```

#### JWT signing RSA keys

The server is being configured to use `RSA256` JWT signing alhorithm so the `auth.service.js` contains corresponding `public` and `private` keys inside (they must be moved to a secure place like KMS in production environment). The private key is considered to be exposed to the internet, so the attacker can copy it and use in exploit.

#### Strapi

The project's predefined users were prepared to work with Strapi:

- Users were registered in Strapi using `StrapiService.registerCustomers()` - their Strapi Customer IDs were added to the users list `data/users.data.js` as `stripeCustomerId`
- For each user its own payment method was registered in Strapi using `StrapiService.registerPaymentMethodToCustomers()` – their Strapi payment methods were added to the users list `data/users.data.js` as `paymentMethodId`

Don't do this in your code, because this data must be securely encrypted and stored.

Read the [https://docs.stripe.com/testing](https://docs.stripe.com/testing) for more details

### Useful references

- JSON Web Token (JWT) Debugger: https://jwt.io/ and recommended libraries https://jwt.io/libraries?filter=node-js
- Jose library: https://www.npmjs.com/package/jose
- Microsoft OpenID configuration: https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration
- Microsoft JWKS: https://login.microsoftonline.com/common/discovery/v2.0/keys
- Google OpenID configuration: https://accounts.google.com/.well-known/openid-configuration
- Google JWKS: https://www.googleapis.com/oauth2/v3/certs
- Vulnerability CVE-2022-23540: https://github.com/advisories/GHSA-qwph-4952-7xr6
- Vulnerability CVE-2022-23539: https://github.com/advisories/GHSA-8cf7-32gw-wr33
