# 🚀 Deployment, Configuration & Setup Guide

This guide walks through configuring, running, and deploying CampusRide across development, staging, and production environments.

---

## 1. Prerequisites

Before setting up CampusRide, ensure you have the following installed on your machine:
- **Node.js**: v20 LTS or v22 LTS
- **Package Manager**: `npm` (v10+), `yarn`, or `bun`
- **Git**
- **Modern Web Browser** with Geolocation support enabled

---

## 2. Local Development Setup

### Step 1: Clone the Project
```bash
git clone <repo-url>
cd rideon-campus
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Edit `.env` to include your configuration:
```env
# Google Maps Platform Key (Used by @vis.gl/react-google-maps)
GOOGLE_MAPS_PLATFORM_KEY=your_google_maps_api_key_here

# Gemini API Key (For vision ID OCR and matching)
GEMINI_API_KEY=your_gemini_api_key_here

# App URL (Defaults to localhost:3000 in local dev)
APP_URL=http://localhost:3000
```

### Step 4: Start the Fullstack Server
```bash
npm run dev
```
The server will boot on port `3000`. Open `http://localhost:3000` to preview the landing page.

---

## 3. Configuring External Services

### 3.1 Google Maps Platform API Setup
To enable interactive map views, custom markers, and campus route visualization:
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create your Cloud Project.
3. Enable the **Maps JavaScript API**.
4. Create an API Key in **APIs & Services > Credentials**.
5. Restrict the API key:
   - **Application restrictions**: Set to your domain (e.g., `ais-*.run.app` or `localhost:3000`).
   - **API restrictions**: Select **Maps JavaScript API**.
6. Set the key as `GOOGLE_MAPS_PLATFORM_KEY` in your environment or AI Studio Secrets panel.

### 3.2 Firebase Configuration
The application connects to Firebase Firestore and Firebase Authentication.
The project config is defined in `firebase-applet-config.json` and loaded via `src/lib/firebase.ts`.

#### Required Firebase Settings:
1. **Firestore Database**:
   - Create a Firestore Database in native mode.
   - Deploy security rules via AI Studio or the Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```
2. **Authentication Providers**:
   - Enable **Google Sign-In** in the Firebase Console under **Authentication > Sign-in method**.
   - (Recommended for demo mode) Enable **Anonymous Authentication** to allow instantaneous one-click testing without external Google accounts.

---

## 4. Production Build & Deployment

### 4.1 Production Compilation
To build the optimized client bundle:
```bash
npm run build
```
This compiles the React 19 application into `dist/`.

### 4.2 Starting the Production Server
The Express application mounts the static build in production:
```bash
npm start
```
`server.ts` automatically detects `process.env.NODE_ENV === "production"`, serving static assets from `dist/` with fallback to `index.html` for client-side routing.

### 4.3 Containerization & Cloud Run
CampusRide is fully container-ready for Google Cloud Run:
- Exposes port `3000`.
- Supports graceful shutdown on `SIGTERM`.
- Express handles incoming requests and delegates client routes cleanly to the Vite SPA build.

---

## 5. Troubleshooting & FAQ

### Issue: "Google Maps API Key Required" placeholder appears
- **Cause**: `GOOGLE_MAPS_PLATFORM_KEY` is not defined or is set to empty.
- **Fix**: Open the Settings/Secrets panel, add `GOOGLE_MAPS_PLATFORM_KEY` with a valid Google Maps JavaScript API key, and restart the server.

### Issue: "Anonymous Auth is disabled in Firebase Console"
- **Cause**: You clicked a mock test account, but Anonymous Sign-In is disabled on your Firebase project.
- **Fix**: Enable Anonymous Auth in the Firebase Console under **Authentication > Sign-in method > Anonymous**, or sign in using a real Google Account.

### Issue: "Access Denied. Admins only" on `/app/admin`
- **Cause**: The signed-in user does not have the `role: 'admin'` attribute in Firestore.
- **Fix**: The default administrator email is `iyanuolalegan@gmail.com`. Alternatively, change your user's role to `'admin'` directly in the Firestore `/users` collection or click **Campus Admin** in the quick demo accounts.
