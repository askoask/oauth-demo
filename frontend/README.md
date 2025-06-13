# Frontend Documentation

## Security Notes

- **This project is for educational and research purposes only.**
- It demonstrates a real-world JWT vulnerability: if a server uses RS256 for JWTs but accepts HS256 and exposes its public key, attackers can forge tokens using the public key as an HMAC secret.
- Do not use this code in production or for unauthorized testing.

## Overview

This React app shows how cross-site scripting (XSS) attacks can happen in web applications. You can use it to see how hackers might inject malicious code through features like chat messages. The app has real-time chat, user login, and talks to a backend server.

## Key Features

- JWT-based authentication
- Real-time chat functionality
- User avatars and profiles
- Products quick purchasing using tokenized Strapi payment methods

## Installation & Configuration

### Prerequisites

- Node.js `>=22 <23`

### Installation & Running

1. Clone the repository and navigate to the `frontend` directory:
2. Run `npm ci` to install dependencies
3. Specify `API_URL` of backend server in `src/config.index.js` or leave default
4. Run `npm run dev` to run application

### Login guide

You can log in using any of these test accounts:

- email: `test@example.com`, password: `test@example.com123`, name: `John Smith`
- email: `sarah.jones@email.com`, password: `sarah.jones@email.com123`, name: `Sarah Jones`
- email: `michael.williams@company.com`, password: `michael.williams@company.com123`, name: `Michael Williams`
- email: `emily.brown@domain.com`, password: `emily.brown@domain.com123`, name: `Emily Brown`
- email: `david.miller@test.com`, password: `david.miller@test.com123`, name: `David Miller`

The password for each account is the email address followed by "123"

### Notice

1. The chat messages refreshing is implemented using polling every 5 sec.
2. The chat uses `dangerouslySetInnerHTML()` to render user message in rich format, which demonstrates, how it can cause an XSS vulnerabilities
