# Admin Dashboard

Admin dashboard for the Art Print Platform, built with React, TypeScript, and Vite.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Access to Firebase project
- Access to Cloudinary account
- Backend server running (art-print-backend)

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual credentials:
   - **Cloudinary**: Get credentials from your [Cloudinary Dashboard](https://cloudinary.com/console)
   - **Firebase**: Get credentials from your [Firebase Console](https://console.firebase.google.com/)
   - **API URL**: Ensure it matches your backend server URL (default: `http://localhost:8080`)


### Firebase Configuration
The dashboard uses Firebase for:
- User authentication
- Session management
- Real-time data synchronization

## Installation

```bash
npm install
```

## Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

