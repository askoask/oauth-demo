# 🚀 OAuth API Server

A modern, secure authentication server built with Express.js that supports multiple OAuth providers including Google and
Microsoft.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![OAuth 2.0](https://img.shields.io/badge/OAuth_2.0-4285F4?style=for-the-badge&logo=oauth&logoColor=white)

## ✨ Features

- 🔐 Secure authentication with multiple OAuth providers
- 👤 User profile management
- 🔒 JWT-based session handling
- 🛡️ Input validation with Zod
- 🌐 CORS protection
- 🍪 Secure cookie implementation

## 🛠️ Quick Start

### Prerequisites

- Node.js (14.x or higher)
- npm or yarn
- Google/Microsoft developer account for OAuth credentials

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd <project-folder>/backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   ```bash
   cp example.env .env
   ```

4. Update the `.env` file with your credentials

5. Start the development server
   ```bash
   npm run dev
   ```

## 🔧 Environment Configuration

| Variable               | Description               | Example                                     |
|------------------------|---------------------------|---------------------------------------------|
| `PORT`                 | Server port               | `3000`                                      |
| `NODE_ENV`             | Environment               | `development`                               |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID    | `your-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret       | `your-secret`                               |
| `MICROSOFT_CLIENT_ID`  | Microsoft OAuth app ID    | `your-microsoft-app-id`                     |
| `JWT_SECRET`           | Secret for JWT tokens     | `a-strong-secret-key`                       |
| `COOKIE_SECRET`        | Secret for cookie signing | `another-strong-secret-key`                 |

## 📚 API Documentation

### Authentication Endpoints

| Endpoint                       | Method | Description                   | Authentication |
|--------------------------------|--------|-------------------------------|----------------|
| `/api/auth/google`             | GET    | Initiate Google OAuth flow    | None           |
| `/api/auth/google/callback`    | GET    | Google OAuth callback         | None           |
| `/api/auth/microsoft`          | GET    | Initiate Microsoft OAuth flow | None           |
| `/api/auth/microsoft/callback` | GET    | Microsoft OAuth callback      | None           |
| `/api/auth/logout`             | POST   | Log out current user          | Required       |

### User Endpoints

| Endpoint       | Method | Description         | Authentication |
|----------------|--------|---------------------|----------------|
| `/api/profile` | GET    | Get user profile    | Required       |
| `/api/profile` | PUT    | Update user profile | Required       |

## 🧪 Testing

Run the test suite with:
