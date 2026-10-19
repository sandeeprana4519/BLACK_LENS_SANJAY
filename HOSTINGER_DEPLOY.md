# Hostinger Deployment Guide - Black Lens Hindi News Portal

यह गाइड आपकी **Black Lens (ब्लैक लेंस)** न्यूज़ वेबसाइट को **Hostinger (Node.js 22.x + Express)** पर **GitHub** के माध्यम से सीधे डिप्लॉय करने के लिए तैयार की गई है।

---

## 1. प्रोजेक्ट विशेषताएँ (Project Specifications)

- **Runtime:** Node.js (Version **22.x**)
- **Backend Framework:** Express.js (ES Modules)
- **Frontend:** React 19 + Tailwind CSS + Vite (Single Page Application)
- **Database:** Google Cloud Firestore (Firebase)
- **Startup File:** `server.js` (Compiled ESM bundle)
- **Build Command:** `npm run build`
- **Start Command:** `npm start` (या Startup file: `server.js`)

---

## 2. Hostinger hPanel पर डिप्लॉयमेंट के चरण (Step-by-Step)

### चरण 1: GitHub पर रिपॉजिटरी पुश करें
1. यदि आपने अभी तक कोड गिटहब पर पुश नहीं किया है:
   ```bash
   git add .
   git commit -m "Production release for Hostinger"
   git push origin main
   ```

---

### चरण 2: Hostinger hPanel में Node.js सेटअप करें
1. अपने **Hostinger hPanel** में लॉगिन करें।
2. अपने डोमेन के डैशबोर्ड पर जाएं और बाएँ मेनू से **"Advanced" -> "Node.js"** (या **"Websites" -> "Node.js"**) पर क्लिक करें।
3. **"Create Application"** पर क्लिक करें और निम्न सेटिंग्स चुनें:
   - **Node.js Version:** `22.x` (उदा. `22.14` या जो भी 22.x उपलब्ध हो)
   - **Application Mode:** `Production`
   - **Application Root:** `/` (या `/public_html` जहाँ आपकी रिपॉजिटरी क्लोन हो)
   - **Application Startup File:** `server.js`
4. **"Save"** या **"Create"** पर क्लिक करें।

---

### चरण 3: GitHub से ऑटो डिप्लॉयमेंट (Git Integration)
1. hPanel में **"Advanced" -> "Git"** पर जाएं।
2. **"Create a New Repository"**:
   - **Repository URL:** अपनी GitHub रिपॉजिटरी का लिंक डालें (उदा. `https://github.com/your-username/blacklens-news.git`)
   - **Branch:** `main` (या `master`)
   - **Install directory:** `/public_html` (या Node.js ऐप की रूट डायरेक्टरी)
3. **"Create"** पर क्लिक करके कोड क्लोन करें।
4. **Auto-Deployment Webhook:**
   - Hostinger द्वारा दिया गया Webhook URL कॉपी करें और अपनी GitHub रिपॉजिटरी की **Settings -> Webhooks** में जोड़ें।
   - इससे जब भी आप GitHub पर नया कोड पुश करेंगे, Hostinger पर स्वतः अपडेट हो जाएगा।

---

### चरण 4: डिपेंडेंसी इंस्टॉल एवं प्रोडक्शन बिल्ड (Build)
Hostinger में **SSH / Terminal** खोलें (या Node.js पैनल में **"Run Script"** उपयोग करें):
```bash
# प्रोजेक्ट डायरेक्टरी में जाएं
cd public_html

# 1. सभी पैकेजेस इंस्टॉल करें
npm install

# 2. प्रोडक्शन बिल्ड तैयार करें (React dist + server.js)
npm run build
```

---

### चरण 5: पर्यावरण चर (Environment Variables - `.env`)
Hostinger File Manager में जाएं और रूट डायरेक्टरी में एक नई फ़ाइल `.env` बनाएं (यदि पहले से नहीं है), और निम्न मान दर्ज करें:

```ini
PORT=3000
NODE_ENV=production
APP_URL=https://yourdomain.com
JWT_SECRET=blacklens_super_secure_jwt_key_2026

# Firebase Firestore Credentials (पहले से firebase-applet-config.json में भी मौजूद हैं)
FIREBASE_PROJECT_ID=eloquent-hope-4v4kj
FIREBASE_DATABASE_ID=ai-studio-teznazarhindinew-e999e430-5364-4d3b-ae3d-cb2dcea20f81
FIREBASE_API_KEY=AIzaSyABZmDPmWOZG5dbq9STnwqrChFacJ25WmQ
FIREBASE_AUTH_DOMAIN=eloquent-hope-4v4kj.firebaseapp.com
FIREBASE_STORAGE_BUCKET=eloquent-hope-4v4kj.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=96016019438
FIREBASE_APP_ID=1:96016019438:web:e76b867ed8e0932274a8ff
```

> **नोट:** `firebase-applet-config.json` फ़ाइल पहले से प्रोजेक्ट के रूट में मौजूद है। यदि आप `.env` में अलग से फायरबेस कीज़ नहीं भी डालेंगे तो भी यह फ़ाइल स्वतः फायरबेस से कनेक्ट कर लेगी।

---

### चरण 6: एप्लिकेशन रीस्टार्ट व टेस्ट (Restart & Verify)
1. Hostinger के **Node.js** डैशबोर्ड में जाकर **"Restart Application"** बटन पर क्लिक करें।
2. अपना डोमेन खोलकर चेक करें।
3. हेल्थ चेक के लिए ब्राउज़र में खोलें:
   - `https://yourdomain.com/health` (यह `{"status":"ok","database":"firestore","connected":true}` दिखाएगा)
   - `https://yourdomain.com/api/db-status` (फायरबेस कनेक्शन की पुष्टि करेगा)

---

## 3. अक्सर पूछे जाने वाले प्रश्न (Troubleshooting)

1. **पोर्ट संबंधी समस्या (Port configuration):**
   Hostinger का रिवर्स प्रॉक्सी स्वतः `process.env.PORT` असाइन करता है। एक्सप्रेस सर्वर इस पोर्ट को स्वतः स्वीकार करता है।
2. **क्लाउडफ्लेयर या फ्री SSL:**
   hPanel में **"Security" -> "SSL"** में जाकर फ्री Let's Encrypt SSL एक क्लिक में एक्टिवेट करें।
3. **अपलोड्स फोल्डर परमिशन:**
   सर्वर पर `uploads/` डायरेक्टरी को राइट परमिशन दें (`chmod 755 uploads`).
