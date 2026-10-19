# तेज़ नज़र (Tez Nazar) - Hostinger Node.js 22.x & Firebase Deployment Guide

This guide provides step-by-step instructions for deploying the **Tez Nazar** Hindi News Portal on Hostinger using **Node.js 22.x**, **Express.js**, and **Google Firebase Cloud Firestore**.

---

## 1. Project Technology Stack

- **Runtime**: Node.js 22.x
- **Backend Framework**: Express.js (ES Modules)
- **Database**: Google Firebase Cloud Firestore
- **Authentication**: JWT & Firebase Authentication
- **Frontend**: React 19 + Vite (built to `/dist` static bundle, served by Express)
- **Hosting Platform**: Hostinger Cloud Hosting / VPS / Business Web Hosting with Node.js support
- **Package Manager**: npm

---

## 2. Preparing Files for Hostinger Deployment

1. **Build the Frontend Assets**:
   Run the build script to generate the production `/dist` folder:
   ```bash
   npm run build
   ```

2. **Files to Upload to Hostinger**:
   Upload the project files to your Hostinger application root directory (e.g., `/home/username/domains/yourdomain.com/public_html` or `/var/www/teznazar`):
   - `dist/` (compiled frontend)
   - `src/` (server and application source)
   - `server.ts` or compiled server
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `firebase-applet-config.json` (or set the environment variables)
   - `.env.example` (template for your `.env`)

---

## 3. Hostinger Node.js Setup (hPanel)

If you are using Hostinger Web/Cloud Hosting with the **Node.js Selector**:
1. Log in to **Hostinger hPanel**.
2. Navigate to **Websites** -> select your website -> **Node.js**.
3. Configure the application:
   - **Node.js Version**: Select **22.x** (e.g., 22.x or latest available LTS).
   - **Application Mode**: **Production**
   - **Application Root**: The directory where your files are uploaded (e.g., `public_html`).
   - **Application Startup File**: `server.ts` (with tsx / node 22 strip types) or `server.js`.
4. Click **Create** / **Save**.
5. Click **Run NPM Install** or run via SSH:
   ```bash
   npm install --production=false
   npm run build
   ```

---

## 4. Environment Variables on Hostinger

Configure environment variables either in the Hostinger hPanel **Environment Variables** section or in a secure `.env` file in your application root:

```env
# Application Environment
NODE_ENV=production

# Server Port (Hostinger automatically provides PORT, Express defaults to process.env.PORT)
PORT=3000

# Canonical Site URL
APP_URL=https://yourdomain.com

# Firebase Cloud Firestore Configuration
FIREBASE_PROJECT_ID=sandeep-95e91
FIREBASE_DATABASE_ID=(default)
# Optional: Set full Firebase Web SDK configuration if not using firebase-applet-config.json
# FIREBASE_API_KEY=AIzaSy...
# FIREBASE_AUTH_DOMAIN=sandeep-95e91.firebaseapp.com
# FIREBASE_STORAGE_BUCKET=sandeep-95e91.firebasestorage.app
# FIREBASE_MESSAGING_SENDER_ID=96016019438
# FIREBASE_APP_ID=1:96016019438:web:...

# JWT Secret for Editorial CMS Authentication (Generate a secure random string)
JWT_SECRET=generate_a_secure_64_character_random_string_for_production
```

> **Security Note**: Never commit your real `.env` file or secrets to public source control. Keep `.env.example` free of secrets.

---

## 5. Verification & Health Checks

Once the application is running, verify:

1. **System Health Check**:
   ```bash
   curl -s http://localhost:3000/health
   # Returns: {"status":"ok","uptime":...,"node":"v22.x","database":"firestore","connected":true}
   ```

2. **Database Diagnostic Endpoint**:
   ```bash
   curl -s http://localhost:3000/api/db-status
   # Returns connection status and Firestore project/database details
   ```

3. **Public API Endpoints**:
   - `/api/news?status=published` - Fetch published news stories
   - `/api/breaking-news` - Fetch breaking news items
   - `/api/categories` - Fetch categories
   - `/api/settings` - Fetch site settings
   - `/sitemap.xml` - SEO sitemap
   - `/rss.xml` - News RSS feed

---

## 6. Default CMS Editorial Logins

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | `admin@teznazar.com` | `admin123` | Full access, settings, user management, publishing |
| **Senior Editor** | `editor@teznazar.com` | `editor123` | Story review, edit, approve/reject, scheduling |
| **Field Reporter** | `reporter@teznazar.com` | `reporter123` | Create stories, drafts, submit for review |

*Important: Immediately update passwords from the Admin -> User Management panel after initial deployment.*

---

## 7. Automated Scheduled Publishing Cron

To automatically publish scheduled articles on Hostinger:
1. In hPanel, go to **Advanced** -> **Cron Jobs**.
2. Set the interval to every 5 minutes (`*/5 * * * *`).
3. Set the command:
   ```bash
   curl -s -X POST https://yourdomain.com/api/cron/publish-scheduled
   ```
The Express server also runs an internal 60-second background timer to publish articles automatically when `scheduled_at <= NOW()`.
