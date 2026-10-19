# तेज़ नज़र (Tez Nazar) - Advanced Hindi Digital News Portal

**तेज़ नज़र (Tez Nazar)** is a high-performance, mobile-first, production-ready Hindi digital news portal inspired by Black Lens Media & Entertainment (https://blacklens.mahasudditv.com/).

---

## 🌟 Key Features

1. **Brand Identity & Reference-Matching Aesthetic**:
   - Signature camera aperture emblem with ruby-red rings and cyan highlights inspired by the Black Lens brand.
   - Professional Hindi typography powered by **Mukta** and **Tiro Devanagari Hindi**.
   - Zero-pill metadata discipline with clean typographic separators (`·`).

2. **Public Website Header & Navigation**:
   - **Top Information Bar**: Live formatted date in Hindi (e.g. *शुक्रवार, 16 अक्टूबर 2026*), edition indicator (*गाजियाबाद / दिल्ली एनसीआर*), quick links, and CMS login button.
   - **Main Branding Bar**: Tez Nazar camera lens emblem, website tagline (*सटीक खबर, पैनी नज़र*), 728x90 Header Ad slot, and search toggle.
   - **Navigation Bar**: Responsive category links (गाजियाबाद, दिल्ली एनसीआर, उत्तर प्रदेश, देश, राजनीति, अपराध, शिक्षा, स्वास्थ्य, व्यापार, खेल, मनोरंजन, धर्म एवं अध्यात्म, सरकारी योजनाएं).
   - **Popular Trending Tags**: Clickable pills (`#ब्रेकिंगन्यूज`, `#गाजियाबाद_अपडेट`, `#दिल्ली_एनसीआर`, `#उत्तर_प्रदेश_सरकार`, etc.).
   - **Breaking News Ticker**: Animated urgent headline ticker with pause/resume controls and direct article links.

3. **Homepage Layout**:
   - **Hero Section**: 1 primary lead story with large imagery, 3 secondary featured cards, and right-column live minute-by-minute updates feed.
   - **Local News Spotlight**: Ghaziabad & Trans-Hindon news with local markers (इंदिरापुरम, राजनगर, वैशाली, आदि).
   - **State & National News**: Uttar Pradesh & Delhi NCR regional governance and policy coverage.
   - **Video News Desk**: Dark cinematic video grid with interactive modal player.
   - **Specialty Sections**: Crime & law enforcement, Religion & spirituality, Sports, and Business.
   - **In-Feed Advertisements**: Responsive banner placements without empty containers.

4. **News Article Detail View**:
   - Breadcrumb navigation (`होम > श्रेणी > शीर्षक`).
   - Reporter byline with location and publication timestamp.
   - High-resolution featured image with caption and photo credit.
   - Full formatted article body with safe HTML rendering.
   - Photo gallery (up to 10 photos) with lightbox image viewer.
   - Social sharing controls: **WhatsApp** (one-click direct share), **Twitter/X**, **Facebook**, and **Copy Link** with instant feedback tooltip.
   - Related stories grid and live view counters.

5. **Full Admin CMS & Role-Based Workflows**:
   - Role-based accounts:
     - **Super Admin** (`admin@teznazar.com` / `admin123`)
     - **Senior Editor** (`editor@teznazar.com` / `editor123`)
     - **Field Reporter** (`reporter@teznazar.com` / `reporter123`)
     - **Supporting Admin** (`subadmin@teznazar.com` / `subadmin123`)
     - **Advertising Manager** (`ads@teznazar.com` / `ads123`)
   - **Add / Edit News**: Full news creation studio with headline, slug generator, categories, excerpts, rich body, image caption/credit, gallery, video URLs, and breaking/featured toggles.
   - **Editorial Review Desk**: Editors can review pending articles, approve for publication, or reject with feedback notes.
   - **Breaking News Manager**: Add, reorder, and delete live ticker headlines.
   - **Categories & Tags Management**: Add and organize categories and trending tags.
   - **Advertising Management**: Manage header, in-feed, and sidebar banner campaigns.
   - **Reports & CSV Export**: One-click export of article analytics to CSV.

6. **Google Firebase Cloud Firestore & Hostinger Node.js 22.x Deployment**:
   - Pure Firebase Cloud Firestore architecture (`articles`, `categories`, `tags`, `breaking_news`, `advertisements`, `users`, `settings`).
   - Fast, resilient client & server-side Firestore Lite integration.
   - Production health check endpoint at `/health` and diagnostic endpoint at `/api/db-status`.
   - Fully configured for Hostinger Node.js 22.x deployment with Express.js.
   - Scheduled auto-publisher cron endpoint: `/api/cron/publish-scheduled` and background 60-second timer.

---

## 🚀 Running & Deploying the Project

```bash
# Install dependencies
npm install

# Start Express & Vite full-stack server (Development)
npm run dev

# Build for Hostinger production deployment
npm run build

# Start in production mode with Node 22
npm start
```

---

## 📋 Implementation & Acceptance Checklist

| Feature | Status | Notes |
|---------|--------|-------|
| 1. Public Homepage (Mobile & Desktop) | ✅ Complete | Fully responsive from 360px to 1440px+ |
| 2. Black Lens Reference Aesthetic | ✅ Complete | Dark header, camera aperture motif, red/cyan accents |
| 3. Hindi Date, Header, Ticker & Footer | ✅ Complete | Live Hindi date, breaking news ticker, comprehensive footer |
| 4. Firebase Cloud Firestore Database | ✅ Complete | Multi-region, secure `firestore.rules`, zero MySQL code |
| 5. Hostinger Node.js 22.x Compatibility | ✅ Complete | Native Node 22 runtime, Express.js, `/health` endpoint |
| 6. Publishing Workflow (Draft / Review / Publish) | ✅ Complete | Reporter submission & Editor approval flow |
| 7. Dynamic Categories & Tags | ✅ Complete | Loaded dynamically from Firestore |
| 8. Search, Filtering & Pagination | ✅ Complete | Search by keyword, filter by category/tag |
| 9. Video News Desk with Modal Player | ✅ Complete | Embedded video reports |
| 10. Social Sharing (WhatsApp, X, FB, Copy Link) | ✅ Complete | One-click sharing with formatted titles |
| 11. Role-Based Admin CMS | ✅ Complete | Super Admin, Editor, Reporter, Supporting Admin, Ad Manager |
| 12. Hostinger Setup Guide | ✅ Complete | Complete guide in `database/HOSTINGER_SETUP_GUIDE.md` |
| 13. Contact Us Form | ✅ Complete | Saves reader inquiries directly to Firestore |
| 14. SEO, XML Sitemap & RSS | ✅ Complete | `/sitemap.xml`, `/rss.xml`, `/robots.txt` endpoints |
