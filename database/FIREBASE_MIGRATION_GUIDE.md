# Google Firebase Ecosystem Migration & Architecture Guide
**Website:** BLACK LENS (Media & Entertainment) / तेज़ नज़र (Tez Nazar)

---

## 1. Executive Summary & Architecture
The digital news platform has completed migration exclusively to **Google Firebase Cloud Firestore** and **Firebase Authentication**.

The frontend design, branding (**BLACK LENS - Media & Entertainment / तेज़ नज़र**), typography (Mukta & Noto Sans), layouts, breaking news ticker, video player modals, and the full multi-tier Admin/Reporter CMS have been 100% strictly preserved.

---

## 2. Infrastructure Overview

| Component | Implementation |
|---|---|
| **Database** | Google Cloud Firestore (Document DB, Multi-region, Highly Available) |
| **Backend Runtime** | Node.js 22.x + Express.js |
| **Configuration** | Environment variables + `firebase-applet-config.json` |
| **Security** | Declarative `firestore.rules` with ABAC (Attribute-Based Access Control) |
| **Data Synchronization** | Live Firestore collections + resilient cache |
| **Target Deployment** | Hostinger Node.js Hosting / Cloud / VPS |

---

## 3. Firestore Collections Architecture

1. `/articles/{articleId}`:
   - Full news articles, headlines, categories, slugs, reading counts, and status (`draft`, `pending_review`, `approved`, `scheduled`, `published`, `rejected`).
2. `/categories/{categoryId}`:
   - Ghaziabad, Delhi NCR, Uttar Pradesh, Politics, Crime, Sports, Business, etc.
3. `/tags/{tagId}`:
   - Trending hashtags and search tags.
4. `/breaking_news/{breakingNewsId}`:
   - Live continuous breaking news ticker items.
5. `/advertisements/{adId}`:
   - Header, sidebar, and in-feed advertisement placements with impression/click counters.
6. `/settings/{settingId}`:
   - Portal branding, office address, editorial contacts, and social URLs.
7. `/contact_messages/{messageId}`:
   - Reader feedback and editorial inquiries.
8. `/users/{userId}`:
   - Editorial desk accounts (Super Admin, Editor, Reporter, Ad Manager).
9. `/admins/{adminId}`:
   - Verified administrative security lookup documents.

---

## 4. Security Rules Architecture (`firestore.rules`)
- **Global Safety Net**: Catch-all default deny `match /{document=**} { allow read, write: if false; }`.
- **Public Reads**: Published news articles, active categories, tags, breaking news, and site settings are open for public consumption.
- **ABAC Gates**: Draft, pending, or scheduled articles are restricted to authenticated staff and administrators.
- **Payload Validation**: Explicit `.size()` constraints on all strings (titles <= 500, content <= 50,000 chars) to prevent Denial-of-Wallet attacks.
- **Bootstrapped Admin**: Verified token check for `sandeeprana4139@gmail.com` and `/admins` lookup.
