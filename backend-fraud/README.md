# Attacker server

## Security Notes

- **This project is for educational and research purposes only.**
- It demonstrates a real-world JWT vulnerability: if a server uses RS256 for JWTs but accepts HS256 and exposes its public key, attackers can forge tokens using the public key as an HMAC secret.
- Do not use this code in production or for unauthorized testing.

## Overview

This is a demonstration backend service that simulates fraudulent activity using stolen JWT tokens. It is designed for educational and security research purposes, showing how improper JWT key management and algorithm validation can be exploited by attackers. The service attempts to use stolen tokens to perform unauthorized actions such as making payments and sending messages, highlighting the risks of insecure JWT implementations.

## Features

- Receives stolen JWT tokens and user info via a REST API
- Decodes and inspects JWT tokens
- Attempts fraudulent payments using stolen tokens
- Sends fraudulent messages to a victim API
- Demonstrates a real-world JWT attack: using a public RSA key as an HMAC secret (HS256/RS256 confusion)
- Fully configurable via environment variables

## Setup

### Prerequisites

- Node.js `>=22 <23`

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd backend-fraud
   ```
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Copy the example environment file and edit as needed:
   ```bash
   cp example.env .env
   # Edit .env to match your environment
   ```

#### Environment Variables

Set these in your `.env` file:

| Variable              | Description                               | Example                 |
| --------------------- | ----------------------------------------- | ----------------------- |
| `PORT`                | Port for the server to listen on          | `4500`                  |
| `VICTIM_API_BASE_URL` | Base URL of the victim's API              | `http://localhost:4000` |
| `VICTIM_PRODUCT_ID`   | Product ID to use for fraudulent payments | `prod_premium_003`      |

### Running the Server

- For development (with auto-reload):
  ```bash
  npm run dev
  ```

The server will start on the port specified in your `.env` file (default: 4500).

## Usage

Send a GET request to the `/steal` endpoint with the required query parameters:

```
GET /steal?token=<JWT>&email=<email>&name=<name>
```

- `token`: The stolen JWT token
- `email`: (Optional) Victim's email
- `name`: (Optional) Victim's name

The backend will:

- Log the received information
- Decode and inspect the JWT
- Attempt a fraudulent payment using the token
- Build a new fraudulent JWT (exploiting HS256/RS256 confusion)
- Send several fraudulent messages using the new token

## API

### `GET /steal`

**Query Parameters:**

- `token` (string, required): The stolen JWT token
- `email` (string, optional): Victim's email
- `name` (string, optional): Victim's name

**Response:**

- `204 No Content` on success
